import { loadThemeData } from '@feugene/granularity-tokens'
import { computed, type ComputedRef, shallowReactive } from 'vue'
import { useRoute } from 'vue-router'

import { type ThemeView, themeView } from './tokens'

const views = shallowReactive(new Map<string, ThemeView>())

/** Данные темы — до перехода на её адрес (`router.ts`): страница берёт их синхронно. */
export async function ensureThemeData(id: string): Promise<void> {
  if (!views.has(id))
    views.set(id, themeView(await loadThemeData(id)))
}

/** Тема из адреса — та, что включена у документа. */
export function useViewedTheme(): ComputedRef<ThemeView> {
  const route = useRoute()
  return computed(() => {
    const id = String(route.params.theme)
    const view = views.get(id)
    if (!view)
      throw new Error(`[design] данные темы «${id}» не загружены: адрес темы открывается только через роутер`)
    return view
  })
}
