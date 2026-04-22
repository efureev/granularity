import type { Directive } from 'vue'
import { nextTick } from 'vue'

export type AutosizeBindingValue =
  | boolean
  | {
      enabled?: boolean
    }

type InternalState = {
  textarea: HTMLTextAreaElement | null
  onInput: (() => void) | null
  prevOverflowY: string | null
}

const states = new WeakMap<HTMLElement, InternalState>()

function normalize(value: AutosizeBindingValue | undefined) {
  if (value === false) return { enabled: false }
  if (value && typeof value === 'object') return { enabled: value.enabled ?? true }
  return { enabled: true }
}

function resolveTextarea(el: HTMLElement): HTMLTextAreaElement | null {
  if (el instanceof HTMLTextAreaElement) return el
  return el.querySelector('textarea')
}

function toNumber(input: string): number {
  const n = Number.parseFloat(input)
  return Number.isFinite(n) ? n : 0
}

function autosize(textarea: HTMLTextAreaElement) {
  // Важно сбросить, чтобы textarea могла уменьшаться при удалении текста.
  textarea.style.height = 'auto'

  const style = getComputedStyle(textarea)
  const border = toNumber(style.borderTopWidth) + toNumber(style.borderBottomWidth)
  const height = style.boxSizing === 'border-box' ? textarea.scrollHeight + border : textarea.scrollHeight

  textarea.style.height = `${height}px`
}

function scheduleAutosize(textarea: HTMLTextAreaElement) {
  void nextTick().then(() => {
    requestAnimationFrame(() => autosize(textarea))
  })
}

/**
 * `v-autosize` — автоподстройка высоты `textarea`.
 *
 * Пример:
 * ```vue
 * <textarea v-autosize />
 * ```
 */
export const vAutosize: Directive<HTMLElement, AutosizeBindingValue> = {
  mounted(el, binding) {
    const { enabled } = normalize(binding.value)
    const textarea = resolveTextarea(el)

    const state: InternalState = {
      textarea,
      onInput: null,
      prevOverflowY: textarea ? textarea.style.overflowY : null,
    }
    states.set(el, state)

    if (!enabled || !textarea) return

    textarea.style.overflowY = 'hidden'
    autosize(textarea)
    scheduleAutosize(textarea)

    const onInput = () => {
      const current = states.get(el)
      if (!current?.textarea) return
      autosize(current.textarea)
    }

    state.onInput = onInput
    textarea.addEventListener('input', onInput)
  },
  updated(el, binding) {
    const { enabled } = normalize(binding.value)
    const state = states.get(el)
    if (!state) return

    const nextTextarea = resolveTextarea(el)
    if (state.textarea !== nextTextarea) {
      if (state.textarea && state.onInput) {
        state.textarea.removeEventListener('input', state.onInput)
      }

      state.textarea = nextTextarea
      state.prevOverflowY = nextTextarea ? nextTextarea.style.overflowY : null
      state.onInput = null

      if (enabled && nextTextarea) {
        nextTextarea.style.overflowY = 'hidden'
        autosize(nextTextarea)
        scheduleAutosize(nextTextarea)

        const onInput = () => {
          const current = states.get(el)
          if (!current?.textarea) return
          autosize(current.textarea)
        }
        state.onInput = onInput
        nextTextarea.addEventListener('input', onInput)
      }

      return
    }

    if (!state.textarea) return

    if (!enabled) {
      // Disabled in-flight: detach listener and restore previous overflow.
      if (state.onInput) {
        state.textarea.removeEventListener('input', state.onInput)
        state.onInput = null
      }
      if (state.prevOverflowY !== null) {
        state.textarea.style.overflowY = state.prevOverflowY
      }
      return
    }

    // Re-enable after being disabled: reattach listener and re-apply overflow.
    if (!state.onInput) {
      state.prevOverflowY = state.textarea.style.overflowY
      state.textarea.style.overflowY = 'hidden'

      const onInput = () => {
        const current = states.get(el)
        if (!current?.textarea) return
        autosize(current.textarea)
      }
      state.onInput = onInput
      state.textarea.addEventListener('input', onInput)
    }

    autosize(state.textarea)
    scheduleAutosize(state.textarea)
  },
  unmounted(el) {
    const state = states.get(el)
    if (!state) return

    if (state.textarea && state.onInput) {
      state.textarea.removeEventListener('input', state.onInput)
      if (state.prevOverflowY !== null) state.textarea.style.overflowY = state.prevOverflowY
    }

    states.delete(el)
  },
}
