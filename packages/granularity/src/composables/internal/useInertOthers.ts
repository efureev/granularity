import type { Ref } from 'vue'
import { onScopeDispose, watch } from 'vue'

import { inertableSiblings, markInert } from './inert'

/**
 * Пока слой активен, всё остальное содержимое его контейнера (для
 * телепортированного оверлея это соседи в `body`) помечено `inert`.
 *
 * Это вторая половина модальности: `z-index` перекрывает страницу глазами,
 * `inert` — клавиатурой и скринридером.
 */
export function useInertOthers(root: Ref<HTMLElement | null>, active: () => boolean): void {
  let release: (() => void) | undefined

  function apply(): void {
    release?.()
    release = markInert(inertableSiblings(root.value))
  }

  function clear(): void {
    release?.()
    release = undefined
  }

  watch(
    () => Boolean(active()) && Boolean(root.value),
    (isActive) => {
      if (isActive) apply()
      else clear()
    },
    { immediate: true, flush: 'post' },
  )

  onScopeDispose(clear)
}
