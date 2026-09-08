import type { ShowcaseComponentExampleDoc } from '../types'

export const grEmptyStateExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'empty-state-primary-action',
    title: 'Primary CTA inside card surface',
    description: 'Классический сценарий: иконка, заголовок-heading, описание и основное действие в слоте по умолчанию.',
    status: 'ready',
    previewKey: 'gr-empty-state-primary-action',
  },
  {
    id: 'empty-state-search-flow',
    title: 'Search/filter zero-results flow',
    description: 'Ноль результатов поиска: фильтр сверху, компактный `size="sm"` и действия по сбросу или созданию объекта.',
    status: 'ready',
    previewKey: 'gr-empty-state-search-flow',
    note: '`kind="search"` меняет заголовок и иконку по умолчанию. Разница не косметическая: под фильтром «Пока пусто» дезинформирует — данные есть, просто не совпали, и следующий шаг у пользователя другой, не «создать», а «ослабить запрос».',
  },
  {
    id: 'empty-state-split-layout',
    title: 'Embedded inside split layout',
    description: '`variant="ghost"` внутри уже существующей карточки: без него получалась карточка в карточке со второй рамкой.',
    status: 'ready',
    previewKey: 'gr-empty-state-split-layout',
  },
]
