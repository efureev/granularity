import type { Directive } from 'vue'

export type ClickOutsideHandler = (event: MouseEvent | TouchEvent | PointerEvent) => void

export type ClickOutsideExclude = HTMLElement | string | (() => HTMLElement | null | undefined)

export type ClickOutsideBindingValue =
  | ClickOutsideHandler
  | {
      handler: ClickOutsideHandler
      /** По умолчанию `true`. */
      enabled?: boolean
      /** По умолчанию `true` (слушаем в capture, чтобы stopPropagation внутри не ломал закрытие). */
      capture?: boolean
      /** Список событий. По умолчанию `['click']`. */
      events?: Array<'click' | 'mousedown' | 'touchstart' | 'pointerdown'>
      /** Элементы/селекторы, клики по которым считаются "внутри". */
      exclude?: ClickOutsideExclude[]
    }

type NormalizedOptions = {
  enabled: boolean
  capture: boolean
  events: Array<'click' | 'mousedown' | 'touchstart' | 'pointerdown'>
  handler: ClickOutsideHandler | undefined
  exclude: ClickOutsideExclude[]
}

function normalize(value: ClickOutsideBindingValue | undefined): NormalizedOptions {
  if (typeof value === 'function') {
    return { enabled: true, capture: true, events: ['click'], handler: value, exclude: [] }
  }

  if (value && typeof value === 'object') {
    return {
      enabled: value.enabled ?? true,
      capture: value.capture ?? true,
      events: value.events?.length ? value.events : ['click'],
      handler: value.handler,
      exclude: value.exclude ?? [],
    }
  }

  return { enabled: false, capture: true, events: ['click'], handler: undefined, exclude: [] }
}

function isEventInside(el: HTMLElement, event: Event): boolean {
  const target = event.target as Node | null
  if (!target) return false

  const composedPath = (event as any).composedPath?.() as EventTarget[] | undefined
  if (Array.isArray(composedPath)) {
    return composedPath.includes(el)
  }

  return el.contains(target)
}

function resolveExclude(doc: Document, exclude: ClickOutsideExclude[]): HTMLElement[] {
  const resolved: HTMLElement[] = []

  for (const item of exclude) {
    if (typeof item === 'string') {
      const found = doc.querySelector(item)
      if (found instanceof HTMLElement) resolved.push(found)
      continue
    }

    if (typeof item === 'function') {
      const found = item()
      if (found instanceof HTMLElement) resolved.push(found)
      continue
    }

    if (item instanceof HTMLElement) {
      resolved.push(item)
    }
  }

  return resolved
}

type InternalState = {
  options: NormalizedOptions
  doc: Document
  listener: (event: Event) => void
}

const states = new WeakMap<HTMLElement, InternalState>()

function unbind(el: HTMLElement) {
  const state = states.get(el)
  if (!state) return

  for (const event of state.options.events) {
    state.doc.removeEventListener(event, state.listener, state.options.capture)
  }

  states.delete(el)
}

function bind(el: HTMLElement, value: ClickOutsideBindingValue | undefined) {
  const options = normalize(value)
  const doc = el.ownerDocument

  const listener = (event: Event) => {
    const current = states.get(el)
    if (!current) return

    const { enabled, handler, exclude } = current.options
    if (!enabled || !handler) return

    if ('button' in (event as any) && typeof (event as any).button === 'number' && (event as any).button !== 0) {
      return
    }

    if (!el.isConnected) return

    if (isEventInside(el, event)) return

    const excluded = resolveExclude(current.doc, exclude)
    for (const ex of excluded) {
      if (isEventInside(ex, event)) return
    }

    handler(event as any)
  }

  const nextState: InternalState = { options, doc, listener }
  states.set(el, nextState)

  if (!options.enabled || !options.handler) return

  for (const event of options.events) {
    doc.addEventListener(event, listener, options.capture)
  }
}

/**
 * `v-click-outside` — обработчик клика вне элемента (например, закрытие дропдауна/модалки).
 */
export const vClickOutside: Directive<HTMLElement, ClickOutsideBindingValue> = {
  mounted(el, binding) {
    bind(el, binding.value)
  },
  updated(el, binding) {
    unbind(el)
    bind(el, binding.value)
  },
  unmounted(el) {
    unbind(el)
  },
}
