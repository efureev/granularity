import type { AppContext, Component, Directive } from 'vue'
import { createVNode, render } from 'vue'

import GrLoading from '../components/GrLoading/GrLoading.vue'

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
  animated?: boolean
  background?: string
  zIndex?: number
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
  const target = fullscreen ? document.body : initialTarget

  const appContext = options.appContext

  const restorePosition = ensurePositionedContainer(target, fullscreen)
  const mountEl = document.createElement('div')
  mountEl.setAttribute('data-ds-loading-host', '')
  target.appendChild(mountEl)
  target.setAttribute('aria-busy', 'true')

  let current: LoadingOptions = { ...options }
  let disposed = false

  function doRender(): void {
    if (disposed) return

    const vnode = createVNode(GrLoading as any, {
      text: current.text,
      spinner: current.spinner,
      spinnerClass: current.spinnerClass,
      animated: current.animated,
      background: current.background,
      customClass: current.customClass,
      zIndex: current.zIndex,
      fullscreen,
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
    restorePosition()
    target.removeAttribute('aria-busy')
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
  const normalizedTarget = fullscreen ? document.body : target

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
