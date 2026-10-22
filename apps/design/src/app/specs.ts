import { type Component, defineAsyncComponent } from 'vue'

import ButtonPreview from './button/ButtonPreview.vue'

/** Вкладки страницы компонента — на настоящих компонентах пакета, в теме адреса. */
export interface ComponentViews {
  /** Образец в карточке выбора темы: виден сразу, поэтому не асинхронный. */
  preview: Component
  /** Песочница и спецификация. */
  overview: Component
  /** Тема адреса: пропсы от темы, острова режимов, решения из документа дизайна. */
  style: Component
  /** Один шаблон в каждой теме каталога и таблица отличий. */
  themes: Component
  /** Значения токенов компонента в теме адреса по режимам. */
  tokens: Component
}

export const componentViews: Record<string, ComponentViews> = {
  button: {
    preview: ButtonPreview,
    overview: defineAsyncComponent(() => import('./button/ButtonOverview.vue')),
    style: defineAsyncComponent(() => import('./button/ButtonThemeStyle.vue')),
    themes: defineAsyncComponent(() => import('./button/ButtonThemes.vue')),
    tokens: defineAsyncComponent(() => import('./button/ButtonTokens.vue')),
  },
}
