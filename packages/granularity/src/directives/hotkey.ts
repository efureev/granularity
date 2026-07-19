import type { Directive } from 'vue'

export type HotkeyHandler = (event: KeyboardEvent) => void

export type HotkeyEntry =
  | HotkeyHandler
  | {
      handler: HotkeyHandler
      /** По умолчанию: `true` для комбинаций с Ctrl/Meta/Alt, иначе `false`. */
      preventDefault?: boolean
      /** По умолчанию `false`. */
      stopPropagation?: boolean
      /** Разрешить срабатывать, когда фокус в `input/textarea/[contenteditable]`. */
      allowInEditable?: boolean
    }

export type HotkeyMap = Record<string, HotkeyEntry>

/**
 * Где слушать клавиатуру:
 * - `'global'` (по умолчанию) — слушатель на `window`; хоткеи работают из любого места страницы.
 * - `'element'` — слушатель на самом элементе; хоткеи срабатывают только когда фокус внутри
 *   элемента (событие всплывает до него). Элемент должен быть фокусируемым (`tabindex`).
 */
export type HotkeyScope = 'global' | 'element'

export type HotkeyBindingValue =
  | HotkeyMap
  | {
      handlers: HotkeyMap
      enabled?: boolean
      scope?: HotkeyScope
    }

type ParsedHotkey = {
  original: string
  key: string
  ctrl: boolean
  meta: boolean
  alt: boolean
  shift: boolean
  entry: HotkeyEntry
}

type InternalState = {
  enabled: boolean
  hotkeys: ParsedHotkey[]
  listener: (event: KeyboardEvent) => void
  /** Цель, на которой висит слушатель (`window` для 'global', сам `el` для 'element'). */
  target: Window | HTMLElement
}

const states = new WeakMap<HTMLElement, InternalState>()

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true

  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

function normalizeBinding(value: HotkeyBindingValue | undefined) {
  if (!value) return { enabled: false, handlers: {} as HotkeyMap, scope: 'global' as HotkeyScope }
  if ('handlers' in (value as any)) {
    const v = value as { handlers: HotkeyMap; enabled?: boolean; scope?: HotkeyScope }
    return { enabled: v.enabled ?? true, handlers: v.handlers ?? {}, scope: v.scope ?? 'global' }
  }
  return { enabled: true, handlers: value as HotkeyMap, scope: 'global' as HotkeyScope }
}

function normalizeKeyToken(token: string): string {
  const t = token.trim().toLowerCase()
  if (t === 'esc') return 'Escape'
  if (t === 'escape') return 'Escape'
  if (t === 'space') return ' '
  if (t.length === 1) return t
  return token.trim()
}

function parseHotkeys(map: HotkeyMap): ParsedHotkey[] {
  const parsed: ParsedHotkey[] = []

  for (const [combo, entry] of Object.entries(map)) {
    const parts = combo
      .split('+')
      .map(p => p.trim())
      .filter(Boolean)

    if (!parts.length) continue

    let ctrl = false
    let meta = false
    let alt = false
    let shift = false

    const keyToken = parts.at(-1)
    if (!keyToken) continue
    for (const p of parts.slice(0, -1)) {
      const t = p.toLowerCase()
      if (t === 'ctrl' || t === 'control') ctrl = true
      else if (t === 'meta' || t === 'cmd' || t === 'command' || t === '⌘') meta = true
      else if (t === 'alt' || t === 'option') alt = true
      else if (t === 'shift') shift = true
    }

    const key = normalizeKeyToken(keyToken)
    parsed.push({ original: combo, key, ctrl, meta, alt, shift, entry })
  }

  return parsed
}

function matchKey(expected: string, eventKey: string): boolean {
  if (expected === ' ') return eventKey === ' ' || eventKey === 'Spacebar'
  if (expected.length === 1) return expected.toLowerCase() === eventKey.toLowerCase()
  return expected === eventKey
}

function resolveEntry(entry: HotkeyEntry) {
  if (typeof entry === 'function') {
    return {
      handler: entry,
      preventDefault: undefined as boolean | undefined,
      stopPropagation: false,
      allowInEditable: false,
    }
  }

  return {
    handler: entry.handler,
    preventDefault: entry.preventDefault,
    stopPropagation: entry.stopPropagation ?? false,
    allowInEditable: entry.allowInEditable ?? false,
  }
}

/**
 * `v-hotkey` — горячие клавиши на компонент/страницу.
 *
 * Пример:
 * ```vue
 * <div v-hotkey="{ 'Escape': close, 'Ctrl+K': openSearch }" />
 * ```
 *
 * По умолчанию слушатель глобальный (`window`). Чтобы хоткеи срабатывали только
 * когда фокус внутри элемента, используйте `scope: 'element'`:
 * ```vue
 * <div tabindex="0" v-hotkey="{ handlers: { 'j': next }, scope: 'element' }" />
 * ```
 */
export const vHotkey: Directive<HTMLElement, HotkeyBindingValue> = {
  mounted(el, binding) {
    if (typeof window === 'undefined') return

    const { enabled, handlers, scope } = normalizeBinding(binding.value)
    const target: Window | HTMLElement = scope === 'element' ? el : window

    const state: InternalState = {
      enabled,
      hotkeys: parseHotkeys(handlers),
      listener: (event: KeyboardEvent) => {
        const current = states.get(el)
        if (!current?.enabled) return
        if (!el.isConnected) return

        const editable = isEditableTarget(event.target)

        for (const hk of current.hotkeys) {
          if (hk.ctrl !== event.ctrlKey) continue
          if (hk.meta !== event.metaKey) continue
          if (hk.alt !== event.altKey) continue
          if (hk.shift !== event.shiftKey) continue
          if (!matchKey(hk.key, event.key)) continue

          const entry = resolveEntry(hk.entry)

          // По умолчанию не перехватываем "простые" клавиши во время ввода.
          const hasModifier = hk.ctrl || hk.meta || hk.alt || hk.shift
          if (editable && !entry.allowInEditable && !hasModifier && hk.key !== 'Escape') {
            continue
          }

          const preventDefault = entry.preventDefault ?? (hk.ctrl || hk.meta || hk.alt)
          if (preventDefault) event.preventDefault()
          if (entry.stopPropagation) event.stopPropagation()

          entry.handler(event)
          return
        }
      },
      target,
    }

    states.set(el, state)
    target.addEventListener('keydown', state.listener as EventListener)
  },
  updated(el, binding) {
    const state = states.get(el)
    if (!state) return

    const next = normalizeBinding(binding.value)
    state.enabled = next.enabled
    state.hotkeys = parseHotkeys(next.handlers)

    // Смена scope на лету — переносим слушатель на новую цель.
    const nextTarget: Window | HTMLElement = next.scope === 'element' ? el : window
    if (nextTarget !== state.target) {
      state.target.removeEventListener('keydown', state.listener as EventListener)
      state.target = nextTarget
      nextTarget.addEventListener('keydown', state.listener as EventListener)
    }
  },
  unmounted(el) {
    const state = states.get(el)
    if (!state) return
    state.target.removeEventListener('keydown', state.listener as EventListener)
    states.delete(el)
  },
}
