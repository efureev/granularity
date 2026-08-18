import { computed, type ComputedRef, ref, type Ref } from 'vue'

import { joinPath, splitPath } from '../model'

import type { ToFieldErrorMapOptions } from './normalize'
import { toFieldErrorMap } from './normalize'

export interface GrServerErrorOrphan {
  path: string
  messages: string[]
}

export interface UseServerFieldErrorsOptions extends ToFieldErrorMapOptions {
  /** Пути, которые форма реально рисует, — определитель сирот. */
  knownPaths?: () => Iterable<string>
}

export interface GrServerFieldErrors {
  errors: Ref<Record<string, string[]>>
  /** Ошибки на поля, которых форма не рисует. Показываются сводкой. */
  orphans: ComputedRef<GrServerErrorOrphan[]>
  formErrors: ComputedRef<string[]>
  has: (path: string) => boolean
  get: (path: string) => string[] | undefined
  set: (source: unknown) => void
  setField: (path: string, messages: string | string[]) => void
  clear: (paths?: string | string[]) => void
  /** Снять ошибку поля — зовётся правкой значения. */
  dismiss: (path: string) => void
  /** Сдвиг индексов после добавления или удаления строки повторителя. */
  shiftAfter: (arrayPath: string, index: number, delta: number) => void
  /** Перестановка строк повторителя. */
  reindex: (arrayPath: string, from: number, to: number) => void
}

function indexAfter(path: string, arrayPath: string): number | undefined {
  if (!path.startsWith(`${arrayPath}.`)) return undefined

  const rest = splitPath(path.slice(arrayPath.length + 1))
  const first = rest[0]
  if (first === undefined || !/^\d+$/.test(first)) return undefined

  return Number(first)
}

function withIndex(path: string, arrayPath: string, index: number): string {
  const rest = splitPath(path.slice(arrayPath.length + 1)).slice(1)
  return joinPath(arrayPath, index, ...rest)
}

/**
 * Слой серверных ошибок.
 *
 * Живёт в пакете, а не в ядре: `GrForm` не даёт способа положить ошибку в
 * форму, и добавлять его ради одного потребителя незачем. Показ идёт через
 * проп `error` у `GrFormField`, который по контракту ядра сильнее ошибки формы
 * и принимает список — этим одним приёмом закрываются сразу три случая: поле
 * без правил, несколько сообщений на поле и сообщение, до которого клиентская
 * валидация не дошла.
 */
export function useServerFieldErrors(options: UseServerFieldErrorsOptions = {}): GrServerFieldErrors {
  const errors = ref<Record<string, string[]>>({})
  const formLevel = ref<string[]>([])

  const known = (): Set<string> => new Set(options.knownPaths?.() ?? [])

  const orphans = computed<GrServerErrorOrphan[]>(() => {
    const paths = known()
    if (paths.size === 0) return []

    return Object.entries(errors.value)
      .filter(([path]) => !paths.has(path))
      .map(([path, messages]) => ({ path, messages }))
  })

  const formErrors = computed(() => [
    ...formLevel.value,
    // Сирота не пропадает: «сохранение не прошло, а почему — нигде» —
    // худший из возможных исходов.
    ...orphans.value.flatMap(orphan => orphan.messages),
  ])

  return {
    errors,
    orphans,
    formErrors,

    has: path => (errors.value[path]?.length ?? 0) > 0,
    get: path => errors.value[path],

    set(source) {
      const map = toFieldErrorMap(source, options)
      errors.value = map.fields
      formLevel.value = map.form
    },

    setField(path, messages) {
      errors.value = {
        ...errors.value,
        [path]: Array.isArray(messages) ? messages : [messages],
      }
    },

    clear(paths) {
      if (paths === undefined) {
        errors.value = {}
        formLevel.value = []
        return
      }

      const list = Array.isArray(paths) ? paths : [paths]
      const next = { ...errors.value }
      for (const path of list) delete next[path]
      errors.value = next
    },

    dismiss(path) {
      if (!(path in errors.value)) return

      const next = { ...errors.value }
      delete next[path]
      errors.value = next
    },

    shiftAfter(arrayPath, index, delta) {
      const next: Record<string, string[]> = {}

      for (const [path, messages] of Object.entries(errors.value)) {
        const current = indexAfter(path, arrayPath)

        if (current === undefined || current < index) {
          next[path] = messages
          continue
        }

        // Удалённая строка забирает свои ошибки с собой.
        if (delta < 0 && current === index) continue

        next[withIndex(path, arrayPath, current + delta)] = messages
      }

      errors.value = next
    },

    reindex(arrayPath, from, to) {
      const next: Record<string, string[]> = {}

      for (const [path, messages] of Object.entries(errors.value)) {
        const current = indexAfter(path, arrayPath)

        if (current === undefined) {
          next[path] = messages
          continue
        }

        let moved = current
        if (current === from) moved = to
        else if (from < to && current > from && current <= to) moved = current - 1
        else if (from > to && current >= to && current < from) moved = current + 1

        next[withIndex(path, arrayPath, moved)] = messages
      }

      errors.value = next
    },
  }
}
