import type { Ref, ShallowRef } from 'vue'
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'

import type { GrAutocompleteOption, GrAutocompleteValue } from '../GrAutocomplete.vue'

/**
 * Дебаунснутая удалённая загрузка опций.
 *
 * Три вещи, каждая из которых по отдельности выглядит необязательной, а вместе
 * составляют весь смысл модуля: запрос откладывается на `debounce`, летящий
 * отменяется новым, а ответ, стартовавший раньше и пришедший позже, обязан
 * проиграть последнему — иначе список показывает результат старого запроса.
 *
 * От DOM не зависит вовсе, поэтому проверяется без монтирования компонента.
 *
 * Единственный потребитель сегодня — `GrAutocomplete`. Появится второй
 * (открытая строка аудита: `GrTransfer` отдаёт `search` наружу, а подгрузку
 * делает потребитель) — модулю место в `composables/internal/`.
 */
export interface UseRemoteOptionsOptions<TValue extends GrAutocompleteValue> {
  fetchOptions: () => ((query: string, signal: AbortSignal) => Promise<GrAutocompleteOption<TValue>[]>) | undefined
  /** Стартовый список: его смена сбрасывает ответ сервера. */
  options: () => GrAutocompleteOption<TValue>[] | undefined
  debounce: () => number
  minQueryLength: () => number
  onSearch: (query: string) => void
  onSearchError: (error: unknown) => void
}

export interface RemoteOptions<TValue extends GrAutocompleteValue> {
  remoteOptions: ShallowRef<GrAutocompleteOption<TValue>[]>
  remoteAnswered: Ref<boolean>
  remoteLoading: Ref<boolean>
  scheduleSearch: (value: string) => void
  cancelSearch: () => void
}

export function useRemoteOptions<TValue extends GrAutocompleteValue>(
  options: UseRemoteOptionsOptions<TValue>,
): RemoteOptions<TValue> {
  // Ответ последнего `fetchOptions`. До первого ответа показываем `options` —
  // с ними компонент рисует стартовый список, не дожидаясь сервера.
  const remoteOptions = shallowRef<GrAutocompleteOption<TValue>[]>([])
  const remoteAnswered = ref(false)
  const remoteLoading = ref(false)

  let searchTimer: ReturnType<typeof setTimeout> | null = null
  // Счётчик запросов: ответ, стартовавший раньше, но пришедший позже, обязан
  // проиграть последнему — иначе список показывает результат старого запроса.
  let searchSeq = 0
  let inflight: AbortController | null = null

  function isAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === 'AbortError'
  }

  async function runFetch(query: string): Promise<void> {
    const fetchOptions = options.fetchOptions()
    if (!fetchOptions)
      return

    inflight?.abort()
    const controller = new AbortController()
    inflight = controller
    const seq = ++searchSeq
    remoteLoading.value = true

    try {
      const result = await fetchOptions(query, controller.signal)
      if (seq !== searchSeq)
        return
      remoteOptions.value = result
      remoteAnswered.value = true
    }
    catch (error) {
      if (seq !== searchSeq || isAbortError(error))
        return
      remoteOptions.value = []
      remoteAnswered.value = true
      options.onSearchError(error)
    }
    finally {
      if (seq === searchSeq)
        remoteLoading.value = false
    }
  }

  function scheduleSearch(value: string): void {
    if (searchTimer)
      clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      if (options.minQueryLength() > 0 && value.trim().length < options.minQueryLength())
        return
      options.onSearch(value.trim())
      void runFetch(value.trim())
    }, options.debounce())
  }

  /**
   * Снять запланированный и летящий запрос. Инкремент `searchSeq` обязателен
   * вместе со снятием `remoteLoading`: после него `finally` в `runFetch` считает
   * себя устаревшим и флаг не тронет — спиннер остался бы навсегда.
   */
  function cancelSearch(): void {
    if (searchTimer)
      clearTimeout(searchTimer)
    searchTimer = null
    inflight?.abort()
    inflight = null
    searchSeq += 1
    remoteLoading.value = false
  }

  /**
   * Подпись состава стартового списка. Сравнивать идентичность массива нельзя:
   * инлайн-литерал `:options="[...]"` пересоздаётся каждым ререндером родителя —
   * в том числе тем, который вызвал сам компонент своим `update:modelValue`, —
   * и remote-результаты исчезали бы прямо посреди выбора.
   */
  function optionsSignature(list: GrAutocompleteOption<TValue>[] | undefined): string {
    return (list ?? []).map(o => `${String(o.value)}\u0000${o.label}`).join('\u0001')
  }

  // Родитель сменил стартовый список — он снова источник до следующего ответа
  // сервера, а летящий запрос относится к прежнему набору данных и отменяется.
  watch(() => optionsSignature(options.options()), () => {
    if (!options.fetchOptions())
      return
    cancelSearch()
    remoteAnswered.value = false
    remoteOptions.value = []
  })

  onBeforeUnmount(cancelSearch)

  return { remoteOptions, remoteAnswered, remoteLoading, scheduleSearch, cancelSearch }
}
