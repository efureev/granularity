import { computed, ref } from 'vue'

const activeHostId = ref<string | null>(null)

export function useShowcaseToasterHost(hostId: string) {
  const isActiveHost = computed(() => activeHostId.value === hostId)

  function activateHost() {
    activeHostId.value = hostId
  }

  return {
    isActiveHost,
    activateHost,
  }
}