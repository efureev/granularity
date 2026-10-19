import { defineGranumProvider } from '@feugene/granum/contract'
import { grThemeCatalog } from './generated'

export const GRANULARITY_TOKENS_PROVIDER_ID = '@feugene/granularity-tokens'

/**
 * Провайдер granum без компонентов — владелец каталога тем (C-32). Пути — от
 * корня раскладки `dist`: данные тем, реестр и формулы генератор кладёт
 * в `generated/`, а плагин сборки проверяет их по реестру и копирует в `dist`.
 */
export const granularityTokensProvider = defineGranumProvider({
  id: GRANULARITY_TOKENS_PROVIDER_ID,
  contractVersion: 2,
  components: [],
  theme: {
    tokensCss: 'tokens.css',
    registry: 'themes/registry.json',
    defaultTheme: 'slate',
    catalog: Object.fromEntries(grThemeCatalog.map(theme => [theme.id, {
      title: theme.title,
      ...(theme.description !== undefined ? { description: theme.description } : {}),
      ...(theme.docs !== undefined ? { docs: theme.docs } : {}),
      ...(theme.extends !== undefined ? { extends: theme.extends } : {}),
      data: `themes/${theme.id}/theme.json`,
    }])),
  },
})
