import { loadThemeData } from '@feugene/granularity-tokens'
import { computed, type ComputedRef, type Ref, ref, shallowReactive, watch } from 'vue'
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

const message = (reason: unknown): string => (reason instanceof Error ? reason.message : String(reason))

/** Данные темы каталога, не обязательно темы адреса: грузятся по требованию, до загрузки — `undefined`. */
export function useThemeView(id: () => string): { view: ComputedRef<ThemeView | undefined>, error: Ref<string | undefined> } {
  const error = ref<string>()
  watch(id, (next) => {
    error.value = undefined
    ensureThemeData(next).catch((reason: unknown) => {
      error.value = message(reason)
    })
  }, { immediate: true })
  return { view: computed(() => views.get(id())), error }
}

/** Данные нескольких тем разом — для сравнения: карта заполняется по мере загрузки. */
export function useThemeViews(ids: readonly string[]): { views: ComputedRef<ReadonlyMap<string, ThemeView>>, error: Ref<string | undefined> } {
  const error = ref<string>()
  Promise.all(ids.map(ensureThemeData)).catch((reason: unknown) => {
    error.value = message(reason)
  })
  return { views: computed(() => new Map(ids.flatMap(id => (views.has(id) ? [[id, views.get(id)!] as const] : [])))), error }
}
