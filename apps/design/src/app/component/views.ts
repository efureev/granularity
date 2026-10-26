import { type Component, computed, type ComputedRef, defineAsyncComponent, h } from 'vue'
import { useRoute } from 'vue-router'

import { type CatalogComponent, findComponent } from '../catalog'
import { specimenOf } from '../specimens'
import { componentViews, type ComponentViews } from '../specs'

/** Вкладки страницы: «Стиль темы» — только у компонента с документом дизайна `docs/design/<GrX>.md`. */
export type PageViews = Omit<ComponentViews, 'style' | 'preview'> & { style?: Component, preview?: Component }

/** Компонент страницы — из адреса; страница без него показывает «не найдено» и вкладок не рендерит. */
export function useCatalogComponent(): ComputedRef<CatalogComponent> {
  const route = useRoute()
  return computed(() => findComponent(String(route.params.component))!)
}

/**
 * Одно состояние компонента: у кнопки — свой образец, у остальных — образец
 * каталога. Свой образец — ряд контролов без обёртки, как в карточке темы.
 */
export function previewOf(component: CatalogComponent): Component | undefined {
  const own = componentViews[component.id]?.preview
  if (own)
    return () => h('div', { class: 'flex flex-wrap items-center gap-2' }, [h(own)])
  const specimen = specimenOf(component.exports[0])
  return specimen ? () => h(specimen, { preview: true }) : undefined
}

const generic = {
  overview: defineAsyncComponent(() => import('./ComponentOverview.vue')),
  themes: defineAsyncComponent(() => import('./ComponentThemes.vue')),
  tokens: defineAsyncComponent(() => import('./ComponentTokens.vue')),
}

/**
 * У компонента со своей страницей (кнопка) — её песочница и спецификация, у
 * остальных — общие вкладки на образцах каталога.
 */
export function viewsOf(component: CatalogComponent): PageViews {
  return componentViews[component.id] ?? { ...generic, preview: previewOf(component) }
}
