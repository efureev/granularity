import { computed, ref } from 'vue'

import { useToast } from '@feugene/granularity'

const activeHostId = ref<string | null>(null)

export function useShowcaseToasterHost(hostId: string) {
  const isActiveHost = computed(() => activeHostId.value === hostId)

  /**
   * Стек `useToast` один на страницу, а тостер смонтирован ровно один — тот, чьё
   * демо нажали последним. Поэтому чистим стек при **смене** хоста: иначе тосты
   * соседнего демо всплыли бы в этом. Повторные нажатия внутри одного демо стек
   * не трогают — несколько уведомлений обязаны жить одновременно, каждое со своим
   * таймером.
   */
  function activateHost() {
    if (activeHostId.value === hostId)
      return

    useToast().clear()
    activeHostId.value = hostId
  }

  return {
    isActiveHost,
    activateHost,
  }
}
