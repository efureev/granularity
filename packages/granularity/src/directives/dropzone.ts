import type { Directive } from 'vue'

import type { FileValidator } from '../fileValidation'

import { FileValidationError, runFileValidators } from '../fileValidation'

export type DropzoneOnFiles = (files: File[], event: DragEvent) => void | Promise<void>

export type DropzoneBindingValue =
  | DropzoneOnFiles
  | {
      onFiles: DropzoneOnFiles
      /** По умолчанию `true`. */
      enabled?: boolean
      /** По умолчанию `true`. */
      multiple?: boolean

      /** Валидаторы, которые будут запущены перед `onFiles`. */
      validators?: FileValidator[]
      /** По умолчанию `true` (предотвращаем дефолтное поведение браузера при drop). */
      preventDefault?: boolean
      /** По умолчанию `false`. */
      stopPropagation?: boolean
      /** Вызывается, если валидация файлов не прошла. */
      onError?: (error: unknown) => void
      /** Вызывается при изменении состояния drag-over. */
      onStateChange?: (state: { isOver: boolean }) => void
      /** CSS-класс, который навешивается на элемент, пока курсор с файлами над зоной. */
      overClass?: string
    }

type NormalizedOptions = {
  enabled: boolean
  multiple: boolean
  validators: FileValidator[] | undefined
  preventDefault: boolean
  stopPropagation: boolean
  onFiles: DropzoneOnFiles | undefined
  onError: ((error: unknown) => void) | undefined
  onStateChange: ((state: { isOver: boolean }) => void) | undefined
  overClass: string
}

function normalize(value: DropzoneBindingValue | undefined): NormalizedOptions {
  if (typeof value === 'function') {
    return {
      enabled: true,
      multiple: true,
      validators: undefined,
      preventDefault: true,
      stopPropagation: false,
      onFiles: value,
      onError: undefined,
      onStateChange: undefined,
      overClass: 'gr-dropzone--over',
    }
  }

  if (value && typeof value === 'object') {
    return {
      enabled: value.enabled ?? true,
      multiple: value.multiple ?? true,
      validators: value.validators,
      preventDefault: value.preventDefault ?? true,
      stopPropagation: value.stopPropagation ?? false,
      onFiles: value.onFiles,
      onError: value.onError,
      onStateChange: value.onStateChange,
      overClass: value.overClass ?? 'gr-dropzone--over',
    }
  }

  return {
    enabled: false,
    multiple: true,
    validators: undefined,
    preventDefault: true,
    stopPropagation: false,
    onFiles: undefined,
    onError: undefined,
    onStateChange: undefined,
    overClass: 'gr-dropzone--over',
  }
}

type InternalState = {
  options: NormalizedOptions
  overCounter: number
  isOver: boolean
  onDragEnter: (event: DragEvent) => void
  onDragOver: (event: DragEvent) => void
  onDragLeave: (event: DragEvent) => void
  onDrop: (event: DragEvent) => void
}

const states = new WeakMap<HTMLElement, InternalState>()

/**
 * `classList.add/remove` не принимают строки с пробелами/пустые токены —
 * иначе DOM кидает `InvalidCharacterError`. Поэтому всегда токенизируем
 * `overClass` (поддерживая Tailwind-подобные multi-class значения).
 */
function tokenizeClass(value: string): string[] {
  return value.split(/\s+/).filter(token => token.length > 0)
}

function setOver(el: HTMLElement, next: boolean) {
  const state = states.get(el)
  if (!state) return

  // `state.isOver` может рассинхронизироваться с DOM (например, при обновлениях
  // компонента/директивы во время drag-over). Поэтому DOM-состояние всегда
  // приводим к `next`, а коллбек вызываем только при фактическом изменении.
  const wasDomOver = el.dataset.grDropzoneOver === 'true'
  const prev = state.isOver

  state.isOver = next

  const tokens = tokenizeClass(state.options.overClass)
  if (next) {
    if (tokens.length) el.classList.add(...tokens)
    el.dataset.grDropzoneOver = 'true'
  } else {
    if (tokens.length) el.classList.remove(...tokens)
    delete el.dataset.grDropzoneOver
  }

  if (prev !== next || wasDomOver !== next) {
    state.options.onStateChange?.({ isOver: next })
  }
}

function unbind(el: HTMLElement) {
  const state = states.get(el)
  if (!state) return

  // Гарантированно очищаем визуальное состояние и счётчики.
  // Это важно, если директива обновлялась/перебиндилась во время DnD.
  state.overCounter = 0
  setOver(el, false)

  delete el.dataset.grDropzone

  el.removeEventListener('dragenter', state.onDragEnter)
  el.removeEventListener('dragover', state.onDragOver)
  el.removeEventListener('dragleave', state.onDragLeave)
  el.removeEventListener('drop', state.onDrop)

  states.delete(el)
}

function bind(el: HTMLElement, value: DropzoneBindingValue | undefined) {
  const options = normalize(value)

  const state: InternalState = {
    options,
    overCounter: 0,
    isOver: false,
    onDragEnter(event) {
      const current = states.get(el)
      if (!current?.options.enabled) return

      if (current.options.preventDefault) event.preventDefault()
      if (current.options.stopPropagation) event.stopPropagation()

      current.overCounter += 1
      setOver(el, true)
    },
    onDragOver(event) {
      const current = states.get(el)
      if (!current?.options.enabled) return

      if (current.options.preventDefault) event.preventDefault()
      if (current.options.stopPropagation) event.stopPropagation()

      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
    },
    onDragLeave(event) {
      const current = states.get(el)
      if (!current?.options.enabled) return

      if (current.options.preventDefault) event.preventDefault()
      if (current.options.stopPropagation) event.stopPropagation()

      current.overCounter = Math.max(0, current.overCounter - 1)
      if (current.overCounter === 0) setOver(el, false)
    },
    onDrop(event) {
      const current = states.get(el)
      if (!current?.options.enabled) return

      if (current.options.preventDefault) event.preventDefault()
      if (current.options.stopPropagation) event.stopPropagation()

      current.overCounter = 0
      setOver(el, false)

      const dt = event.dataTransfer
      const files = dt?.files ? Array.prototype.slice.call(dt.files) as File[] : []
      if (!files.length) return

      void (async () => {
        try {
          const validators = current.options.validators ?? []

          const { files: picked, issues } = await runFileValidators(files, validators, {
            source: 'drop',
            multiple: current.options.multiple,
          })

          if (issues.length > 0) {
            current.options.onError?.(new FileValidationError(issues, picked))
            return
          }

          if (!picked.length) return
          await current.options.onFiles?.(picked, event)
        } catch (error) {
          current.options.onError?.(error)
        }
      })()
    },
  }

  states.set(el, state)

  // Base marker.
  el.dataset.grDropzone = 'true'

  el.addEventListener('dragenter', state.onDragEnter)
  el.addEventListener('dragover', state.onDragOver)
  el.addEventListener('dragleave', state.onDragLeave)
  el.addEventListener('drop', state.onDrop)
}

function update(el: HTMLElement, value: DropzoneBindingValue | undefined) {
  const state = states.get(el)
  if (!state) {
    bind(el, value)
    return
  }

  const prevOverClass = state.options.overClass
  const nextOptions = normalize(value)

  state.options = nextOptions

  // Если поменялся `overClass`, синхронизируем DOM (учитывая multi-token значения).
  if (prevOverClass !== nextOptions.overClass) {
    const prevTokens = tokenizeClass(prevOverClass)
    if (prevTokens.length) el.classList.remove(...prevTokens)
    if (state.isOver) {
      const nextTokens = tokenizeClass(nextOptions.overClass)
      if (nextTokens.length) el.classList.add(...nextTokens)
    }
  }

  // Если директива выключена — сбрасываем состояние.
  if (!nextOptions.enabled) {
    state.overCounter = 0
    setOver(el, false)
  }
}

/**
 * `v-dropzone` — декларативная DnD-зона для файлов (перетаскивание + drop).
 *
 * Директива не делает загрузку сама — только нормализует события и отдаёт `File[]`.
 */
export const vDropzone: Directive<HTMLElement, DropzoneBindingValue> = {
  mounted(el, binding) {
    bind(el, binding.value)
  },
  updated(el, binding) {
    update(el, binding.value)
  },
  unmounted(el) {
    unbind(el)
  },
}
