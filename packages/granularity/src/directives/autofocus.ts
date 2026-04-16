import type { Directive } from 'vue'
import { nextTick } from 'vue'

export type AutofocusBindingValue =
  | boolean
  | string
  | {
      selector?: string
      preventScroll?: boolean
      disabled?: boolean
    }

function resolveOptions(value: AutofocusBindingValue | undefined) {
  if (value === false) {
    return { enabled: false, selector: '', preventScroll: true }
  }

  if (typeof value === 'string') {
    return { enabled: true, selector: value, preventScroll: true }
  }

  if (value && typeof value === 'object') {
    return {
      enabled: value.disabled !== true,
      selector: value.selector,
      preventScroll: value.preventScroll ?? true,
    }
  }

  return { enabled: true, selector: undefined as string | undefined, preventScroll: true }
}

function tryFocus(target: Element | null | undefined, preventScroll: boolean) {
  if (!target) return

  const focusable = target as unknown as { focus?: (options?: any) => void }
  if (typeof focusable.focus !== 'function') return

  try {
    focusable.focus({ preventScroll })
  } catch {
    // Fallback for browsers that don't support FocusOptions.
    focusable.focus()
  }
}

/**
 * `v-autofocus` — универсальный автофокус.
 * Работает как на нативных элементах, так и на компонентах-обёртках (фокусирует вложенный `input/textarea/...`).
 */
export const vAutofocus: Directive<HTMLElement, AutofocusBindingValue> = {
  mounted(el, binding) {
    const { enabled, selector, preventScroll } = resolveOptions(binding.value)
    if (!enabled) return

    void nextTick().then(() => {
      // Небольшая задержка помогает, когда внутренний input появляется после обновления/анимаций.
      requestAnimationFrame(() => {
        const defaultSelector = 'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
        const finalSelector = selector || defaultSelector

        if ((el as any).matches?.(finalSelector)) {
          tryFocus(el, preventScroll)
          return
        }

        const inner = el.querySelector?.(finalSelector)
        tryFocus(inner, preventScroll)
      })
    })
  },
}
