import type { Directive } from 'vue'

import { createHotkeySequenceTracker } from '../internal/hotkeySequence'
import { isAppleDevice, isComposingEvent, isEditableTarget, matchesHotkeyCombo, parseHotkeySequence } from '../internal/keyboard'
import type { ParsedHotkeyCombo } from '../internal/keyboard'

export type HotkeyHandler = (event: KeyboardEvent) => void

export type HotkeyEntry
  = | HotkeyHandler
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

export type HotkeyBindingValue
  = | HotkeyMap
    | {
      handlers: HotkeyMap
      enabled?: boolean
      scope?: HotkeyScope
    }

type ParsedHotkey = {
  original: string
  /**
   * Шаги сочетания. Аккорд — один шаг, «G, затем I» — два: обе формы идут одним
   * путём, поэтому у цепочки нет собственной ветки, которую можно забыть.
   */
  steps: ParsedHotkeyCombo[]
  entry: HotkeyEntry
}

type InternalState = {
  enabled: boolean
  hotkeys: ParsedHotkey[]
  /** Набранное для цепочек: один буфер на элемент, общий для всех его хоткеев. */
  sequence: ReturnType<typeof createHotkeySequenceTracker>
  listener: (event: KeyboardEvent) => void
  /** Цель, на которой висит слушатель (`window` для 'global', сам `el` для 'element'). */
  target: Window | HTMLElement
}

const states = new WeakMap<HTMLElement, InternalState>()

function normalizeBinding(value: HotkeyBindingValue | undefined) {
  if (!value)
    return { enabled: false, handlers: {} as HotkeyMap, scope: 'global' as HotkeyScope }
  if ('handlers' in (value as any)) {
    const v = value as { handlers: HotkeyMap, enabled?: boolean, scope?: HotkeyScope }
    return { enabled: v.enabled ?? true, handlers: v.handlers ?? {}, scope: v.scope ?? 'global' }
  }
  return { enabled: true, handlers: value as HotkeyMap, scope: 'global' as HotkeyScope }
}

function parseHotkeys(map: HotkeyMap): ParsedHotkey[] {
  const parsed: ParsedHotkey[] = []

  for (const [combo, entry] of Object.entries(map)) {
    const steps = parseHotkeySequence(combo)
    if (steps.length === 0)
      continue

    parsed.push({ original: combo, steps, entry })
  }

  return parsed
}

/** Есть ли у сочетания модификаторы: по ним решается перехват ввода и `preventDefault`. */
function hasModifier(steps: readonly ParsedHotkeyCombo[]): boolean {
  return steps.some(step => step.ctrl || step.meta || step.mod || step.alt || step.shift)
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
    if (typeof window === 'undefined')
      return

    const { enabled, handlers, scope } = normalizeBinding(binding.value)
    const target: Window | HTMLElement = scope === 'element' ? el : window

    const state: InternalState = {
      enabled,
      hotkeys: parseHotkeys(handlers),
      sequence: createHotkeySequenceTracker(),
      listener: (event: KeyboardEvent) => {
        const current = states.get(el)
        if (!current?.enabled)
          return
        if (!el.isConnected)
          return
        // Клавиша во время IME-композиции принадлежит композиции, а не хоткею.
        if (isComposingEvent(event))
          return

        /*
         * Платформа спрашивается один раз на событие, а не на каждый хоткей:
         * `navigator` в теле модуля на сервере либо отсутствует, либо отвечает не
         * за ту машину, поэтому вопрос откладывается до события — но повторять
         * его в цикле незачем.
         */
        const apple = isAppleDevice()

        // Нажатие идёт в буфер до перебора: цепочка складывается из событий, а
        // не из совпадений, и шаг, не подошедший ни одному хоткею, всё равно её часть.
        current.sequence.push(event, Date.now())

        const editable = isEditableTarget(event.target)

        for (const hk of current.hotkeys) {
          const isChain = hk.steps.length > 1
          const matched = isChain
            ? current.sequence.matches(hk.steps, apple)
            : matchesHotkeyCombo(event, hk.steps[0], apple)

          if (!matched)
            continue

          const entry = resolveEntry(hk.entry)
          const modified = hasModifier(hk.steps)

          /*
           * Простые клавиши во время ввода не перехватываются. Цепочка — тоже
           * простая: набирая текст, пользователь легко напечатает «g i», и
           * увести его со страницы посреди слова было бы худшим из возможных
           * ответов.
           */
          const isEscape = !isChain && hk.steps[0].key === 'Escape'
          if (editable && !entry.allowInEditable && !modified && !isEscape)
            continue

          const preventDefault = entry.preventDefault ?? modified
          if (preventDefault)
            event.preventDefault()
          if (entry.stopPropagation)
            event.stopPropagation()

          // Сложившаяся цепочка снимается с буфера: иначе следующее нажатие
          // достроило бы её заново и сработало бы второй раз.
          if (isChain)
            current.sequence.reset()

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
    if (!state)
      return

    const next = normalizeBinding(binding.value)
    state.enabled = next.enabled
    state.hotkeys = parseHotkeys(next.handlers)
    // Смена карты обнуляет набранное: половина цепочки от прошлого набора
    // достроилась бы клавишей из нового и сработала бы не тем хоткеем.
    state.sequence.reset()

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
    if (!state)
      return
    state.target.removeEventListener('keydown', state.listener as EventListener)
    states.delete(el)
  },
}
