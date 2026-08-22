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

type ElementState = {
  options: NormalizedOptions
  doc: Document
  /** Ключи подписок, которые этот элемент держит на своём документе. */
  keys: string[]
}

const states = new WeakMap<HTMLElement, ElementState>()

/**
 * Слушатель — один на документ и вид события, а не на элемент.
 *
 * Каждый элемент со своим слушателем — это десяток подписок на документе у
 * страницы с десятком оверлеев, и полное переподключение на каждом обновлении
 * хозяина: хук `updated` срабатывает на любой ререндер, а набор событий при
 * этом обычно тот же. Здесь подписка живёт по счётчику потребителей, а элементы
 * обходятся общим обработчиком.
 */
const documentElements = new WeakMap<Document, Set<HTMLElement>>()
const documentSubscriptions = new WeakMap<Document, Map<string, { listener: (event: Event) => void, count: number }>>()

function subscriptionKey(type: string, capture: boolean): string {
  return `${type}|${capture ? 'capture' : 'bubble'}`
}

function keysOf(options: NormalizedOptions): string[] {
  if (!options.enabled || !options.handler) return []

  return options.events.map(type => subscriptionKey(type, options.capture))
}

function dispatch(doc: Document, event: Event, capture: boolean): void {
  const elements = documentElements.get(doc)
  if (!elements) return

  // Копия: обработчик закрывает оверлей, а тот на размонтировании правит набор.
  for (const el of [...elements]) {
    const state = states.get(el)
    if (!state) continue

    const { enabled, handler, exclude, events } = state.options
    if (!enabled || !handler) continue
    if (state.options.capture !== capture) continue
    if (!events.includes(event.type as NormalizedOptions['events'][number])) continue

    if ('button' in (event as any) && typeof (event as any).button === 'number' && (event as any).button !== 0) {
      continue
    }

    if (!el.isConnected) continue
    if (isEventInside(el, event)) continue

    const excluded = resolveExclude(state.doc, exclude)
    if (excluded.some(item => isEventInside(item, event))) continue

    handler(event as any)
  }
}

function subscribe(doc: Document, key: string): void {
  let subscriptions = documentSubscriptions.get(doc)
  if (!subscriptions) {
    subscriptions = new Map()
    documentSubscriptions.set(doc, subscriptions)
  }

  const existing = subscriptions.get(key)
  if (existing) {
    existing.count += 1
    return
  }

  const [type, mode] = key.split('|')
  const capture = mode === 'capture'
  const listener = (event: Event) => dispatch(doc, event, capture)

  subscriptions.set(key, { listener, count: 1 })
  doc.addEventListener(type, listener, capture)
}

function unsubscribe(doc: Document, key: string): void {
  const subscriptions = documentSubscriptions.get(doc)
  const existing = subscriptions?.get(key)
  if (!subscriptions || !existing) return

  existing.count -= 1
  if (existing.count > 0) return

  const [type, mode] = key.split('|')
  doc.removeEventListener(type, existing.listener, mode === 'capture')
  subscriptions.delete(key)
}

function unbind(el: HTMLElement) {
  const state = states.get(el)
  if (!state) return

  for (const key of state.keys) unsubscribe(state.doc, key)

  documentElements.get(state.doc)?.delete(el)
  states.delete(el)
}

function bind(el: HTMLElement, value: ClickOutsideBindingValue | undefined) {
  const doc = el.ownerDocument
  const previous = states.get(el)

  // Элемент, переехавший в другой документ (портал в отдельное окно), обязан
  // отпустить подписки прежнего: там его больше нет.
  if (previous && previous.doc !== doc) unbind(el)

  const options = normalize(value)
  const nextKeys = keysOf(options)
  const prevKeys = states.get(el)?.keys ?? []

  states.set(el, { options, doc, keys: nextKeys })

  let elements = documentElements.get(doc)
  if (!elements) {
    elements = new Set()
    documentElements.set(doc, elements)
  }
  elements.add(el)

  for (const key of nextKeys) if (!prevKeys.includes(key)) subscribe(doc, key)
  for (const key of prevKeys) if (!nextKeys.includes(key)) unsubscribe(doc, key)
}

/**
 * `v-click-outside` — обработчик клика вне элемента (например, закрытие дропдауна/модалки).
 */
export const vClickOutside: Directive<HTMLElement, ClickOutsideBindingValue> = {
  mounted(el, binding) {
    bind(el, binding.value)
  },
  updated(el, binding) {
    // Не `unbind` + `bind`: разницу подписок считает сам `bind`, а снятие с
    // последующей постановкой того же слушателя — лишняя работа на каждый
    // ререндер хозяина.
    bind(el, binding.value)
  },
  unmounted(el) {
    unbind(el)
  },
}
