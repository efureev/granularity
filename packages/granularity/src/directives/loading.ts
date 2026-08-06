import type { AppContext, Component, Directive } from 'vue'
import { createVNode, render } from 'vue'

import { inertableOutside, markInert } from '../composables/internal/inert'
import { ensurePortalRoot } from '../composables/internal/portalRoot'
import GrLoading from '../components/GrLoading/GrLoading.vue'
import type { GrIconSize, GrIconTone } from '../components/GrIcon/grIconStyles'

export type LoadingTarget = string | HTMLElement

export type LoadingOptions = {
  /**
   * Контейнер, куда будет вставлен оверлей.
   * - если не задано, то для директивы используется сам `el`
   * - для ручного вызова (`createLoading`) по умолчанию используется `document.body`
   */
  target?: LoadingTarget

  /**
   * Полноэкранный лоадер (рендерится в `document.body`).
   * По умолчанию включается, если `target` = `document.body`.
   */
  fullscreen?: boolean

  text?: string
  spinner?: Component
  spinnerClass?: string
  spinnerSize?: GrIconSize | number
  spinnerTone?: GrIconTone
  animated?: boolean
  background?: string
  /** Имя CSS-переменной слоя — escape-hatch мимо `--gr-z-loading`. */
  zIndexVar?: string
  /** Задержка показа в миллисекундах: короткая загрузка не мигает оверлеем. */
  delay?: number
  customClass?: string

  /**
   * Внутренний контекст Vue-приложения.
   * Нужен, чтобы кастомный `spinner` мог использовать `inject()` даже при ручном `render()`.
   */
  appContext?: AppContext
}

export type LoadingController = {
  close: () => void
  setText: (text?: string) => void
  setOptions: (next: Partial<LoadingOptions>) => void
  readonly target: HTMLElement
}

export type LoadingBindingValue =
  | boolean
  | (Omit<LoadingOptions, 'appContext'> & {
      loading?: boolean
    })

function isHTMLElement(value: unknown): value is HTMLElement {
  return typeof value === 'object' && value !== null && (value as any).nodeType === 1
}

function resolveTarget(input: LoadingTarget | undefined, fallback: HTMLElement): HTMLElement {
  if (!input) return fallback

  if (typeof input === 'string') {
    // Prefer searching within the same root (document / document fragment / shadow root)
    // to support components that are not attached to `document` yet (e.g. in unit tests).
    const root = fallback.getRootNode?.() ?? document
    const foundInRoot =
      typeof (root as any).querySelector === 'function' ? ((root as any).querySelector(input) as Element | null) : null
    if (isHTMLElement(foundInRoot)) return foundInRoot

    const foundInDocument = document.querySelector(input)
    if (isHTMLElement(foundInDocument)) return foundInDocument

    return fallback
  }

  if (isHTMLElement(input)) {
    return input
  }

  return fallback
}

function resolveFullscreen(options: LoadingOptions, target: HTMLElement): boolean {
  if (options.fullscreen != null) return options.fullscreen
  return target === document.body
}

function ensurePositionedContainer(target: HTMLElement, fullscreen: boolean): () => void {
  if (fullscreen) return () => {}

  const prevInline = target.style.position
  const computed = window.getComputedStyle(target)
  const isStatic = computed.position === 'static' || !computed.position

  if (isStatic) {
    target.style.position = 'relative'
    return () => {
      target.style.position = prevInline
    }
  }

  return () => {}
}

function ensureClippedContainer(target: HTMLElement, fullscreen: boolean): () => void {
  if (fullscreen) return () => {}

  const computed = window.getComputedStyle(target)
  // If the target has rounded corners, we must clip its content so the overlay
  // (and its blurred backdrop) never bleeds outside the visible rounded shape.
  const hasRadius = !!computed.borderRadius && computed.borderRadius !== '0px'
  if (!hasRadius) return () => {}

  const overflow = computed.overflow
  if (overflow && overflow !== 'visible') return () => {}

  const prevInline = target.style.overflow
  target.style.overflow = 'hidden'
  return () => {
    target.style.overflow = prevInline
  }
}

/**
 * Блокирует контент под оверлеем.
 *
 * Оверлей перекрывает контейнер визуально, но не для клавиатуры и не для
 * скринридера: таб уходит в форму, которую пользователь уже не видит, а диктор
 * читает её как обычную. `inert` снимает поддерево целиком — и фокус, и
 * события указателя, и дерево доступности.
 *
 * Возвращает снятие блокировки. Чужой `inert` (элемент был инертен и до нас)
 * не трогается: снять его — значит вернуть в таб-порядок то, что скрыл кто-то
 * другой.
 */
function blockContent(target: HTMLElement, overlayHost: HTMLElement, fullscreen: boolean): () => void {
  const previouslyFocused = document.activeElement

  // Занятость объявляет тот, чьё содержимое закрыто: у инлайнового лоадера это
  // его контейнер, у полноэкранного — вся страница. Сам оверлей при этом живёт
  // в портале, то есть в другой ветке.
  const busyElement = fullscreen ? document.body : target
  busyElement.setAttribute('aria-busy', 'true')

  const blocked = fullscreen
    ? inertableOutside(overlayHost)
    : Array.from(target.children).filter((child): child is HTMLElement =>
        child !== overlayHost && isHTMLElement(child),
      )

  const release = markInert(blocked)

  // Уже стоящий фокус браузер сам не забирает: Chrome оставляет его внутри
  // ставшего инертным поддерева, и пользователь продолжает печатать в поле под
  // оверлеем. Уводим фокус руками — вернём его при закрытии.
  if (isHTMLElement(previouslyFocused) && blocked.some(child => child.contains(previouslyFocused)))
    previouslyFocused.blur()

  return () => {
    busyElement.removeAttribute('aria-busy')
    release()

    // `inert` сбрасывает фокус на `body`. Возвращаем его туда, где он был, но
    // только если пользователь не увёл его сам, пока шла загрузка.
    const active = document.activeElement
    const focusLost = !active || active === document.body
    if (focusLost && isHTMLElement(previouslyFocused) && previouslyFocused.isConnected)
      previouslyFocused.focus()
  }
}

function parseBinding(value: LoadingBindingValue | undefined): { loading: boolean; options: LoadingOptions } {
  if (value === true || value === false) {
    return { loading: value, options: {} }
  }

  if (value && typeof value === 'object') {
    const { loading, ...rest } = value as any
    return { loading: loading ?? true, options: rest }
  }

  return { loading: false, options: {} }
}

type InternalLoadingState = {
  controller?: LoadingController
  target?: HTMLElement
  fullscreen?: boolean
}

const STATE_KEY: unique symbol = Symbol('grLoadingState')

function getState(el: HTMLElement): InternalLoadingState {
  return ((el as any)[STATE_KEY] ??= {}) as InternalLoadingState
}

export function createLoading(options: LoadingOptions = {}, fallbackTarget?: HTMLElement): LoadingController {
  const initialTarget = resolveTarget(options.target, fallbackTarget ?? document.body)
  const fullscreen = resolveFullscreen(options, initialTarget)
  // Полноэкранный лоадер — оверлей, значит живёт в общей ветке портала: только
  // так правило `inert` не пометит его вместе со страницей.
  const target = fullscreen ? (ensurePortalRoot() ?? document.body) : initialTarget

  const appContext = options.appContext

  const restorePosition = ensurePositionedContainer(target, fullscreen)
  const restoreOverflow = ensureClippedContainer(target, fullscreen)
  const mountEl = document.createElement('div')
  mountEl.setAttribute('data-gr-loading-host', '')
  // Маркер оверлея: чужой модальный слой не должен гасить лоадер `inert`.
  mountEl.setAttribute('data-gr-overlay-root', '')
  if (!fullscreen) {
    // Host wraps the overlay; make sure rounded corners of the target cascade
    // down to the overlay via `border-radius: inherit`.
    mountEl.style.borderRadius = 'inherit'
  }
  target.appendChild(mountEl)

  let current: LoadingOptions = { ...options }
  let disposed = false
  let unblockContent: (() => void) | undefined

  function doRender(): void {
    if (disposed) return

    const vnode = createVNode(GrLoading as any, {
      text: current.text,
      spinner: current.spinner,
      spinnerClass: current.spinnerClass,
      spinnerSize: current.spinnerSize,
      spinnerTone: current.spinnerTone,
      animated: current.animated,
      background: current.background,
      customClass: current.customClass,
      zIndexVar: current.zIndexVar,
      delay: current.delay,
      fullscreen,
      // Блокируем контент ровно тогда, когда оверлей стал видимым: с `delay`
      // это происходит позже монтирования, а до показа блокировать нечего.
      onShow: () => {
        unblockContent ??= blockContent(target, mountEl, fullscreen)
      },
    })

    if (appContext) {
      ;(vnode as any).appContext = appContext
    }

    render(vnode, mountEl)
  }

  function close(): void {
    if (disposed) return
    disposed = true

    render(null, mountEl)
    mountEl.remove()
    restoreOverflow()
    restorePosition()
    unblockContent?.()
    unblockContent = undefined
  }

  function setOptions(next: Partial<LoadingOptions>): void {
    current = {
      ...current,
      ...next,
    }
    doRender()
  }

  function setText(text?: string): void {
    setOptions({ text })
  }

  doRender()

  return {
    close,
    setOptions,
    setText,
    get target() {
      return target
    },
  }
}

function sync(el: HTMLElement, value: LoadingBindingValue | undefined, appContext?: AppContext): void {
  const { loading, options } = parseBinding(value)
  const state = getState(el)

  if (!loading) {
    state.controller?.close()
    state.controller = undefined
    state.target = undefined
    state.fullscreen = undefined
    return
  }

  const target = resolveTarget(options.target, el)
  const fullscreen = resolveFullscreen(options, target)
  const normalizedTarget = fullscreen ? (ensurePortalRoot() ?? document.body) : target

  const shouldRecreate =
    !state.controller
    || state.target !== normalizedTarget
    || state.fullscreen !== fullscreen

  if (shouldRecreate) {
    state.controller?.close()
    state.controller = createLoading({ ...options, fullscreen, target: normalizedTarget, appContext }, el)
    state.target = normalizedTarget
    state.fullscreen = fullscreen
    return
  }

  const controller = state.controller
  if (!controller) return
  controller.setOptions({ ...options, fullscreen, target: normalizedTarget })
}

export const vLoading: Directive<HTMLElement, LoadingBindingValue> = {
  mounted(el, binding) {
    const appContext = (binding.instance as any)?.$?.appContext as AppContext | undefined
    sync(el, binding.value, appContext)
  },
  updated(el, binding) {
    const appContext = (binding.instance as any)?.$?.appContext as AppContext | undefined
    sync(el, binding.value, appContext)
  },
  unmounted(el) {
    const state = getState(el)
    state.controller?.close()
    state.controller = undefined
    state.target = undefined
    state.fullscreen = undefined
  },
}
