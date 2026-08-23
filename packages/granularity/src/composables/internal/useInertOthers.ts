import type { Ref } from 'vue'
import { onScopeDispose, watch } from 'vue'

import { inertableOutside, markInert } from './inert'

/**
 * Пока слой активен, всё вне его ветки помечено `inert`: от корня оверлея вверх
 * до `<body>`, на каждом уровне — соседи.
 *
 * Это вторая половина модальности: `z-index` перекрывает страницу глазами,
 * `inert` — клавиатурой и скринридером.
 */
export function useInertOthers(root: Ref<HTMLElement | null>, active: () => boolean): void {
  let release: (() => void) | undefined

  function apply(): void {
    release?.()
    release = markInert(inertableOutside(root.value))
  }

  function clear(): void {
    release?.()
    release = undefined
  }

  watch(
    () => Boolean(active()) && Boolean(root.value),
    (isActive) => {
      if (isActive)
        apply()
      else clear()
    },
    { immediate: true, flush: 'post' },
  )

  onScopeDispose(clear)
}
