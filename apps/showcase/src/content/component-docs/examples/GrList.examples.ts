import type { ShowcaseComponentExampleDoc } from '../types'

export const grListExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'list-navigation',
    title: 'Кликабельные строки',
    description: 'Пункт сам становится ссылкой или кнопкой (`href` / `as` / `clickable`), не разрывая связку `role=\"list\"` с `role=\"listitem\"`.',
    status: 'ready',
    previewKey: 'gr-list-navigation',  },
  {
    id: 'list-settings',
    title: 'Settings rows with actions',
    description: 'Базовый data-display сценарий: `GrList` + `GrListItem` собирают preference rows со secondary controls справа.',
    status: 'ready',
    previewKey: 'gr-list-settings',  },
  {
    id: 'list-queue-actions',
    title: 'Queue rows with badges and buttons',
    description: 'Показываем `GrList` как lightweight alternative для job queues и task summaries, где справа нужны badges и compact buttons.',
    status: 'ready',
    previewKey: 'gr-list-queue-actions',  },
  {
    id: 'list-empty-state',
    title: 'Пустое состояние и загрузка',
    description: 'Пустоту список определяет сам — без `v-if` вокруг него; при `loading` вместо пунктов идут скелетоны, а слот `#empty` держит богатую заглушку.',
    status: 'ready',
    previewKey: 'gr-list-empty-state',  },
  {
    id: 'list-virtual',
    title: 'Пять тысяч пунктов',
    description: 'С `items` список знает размер набора, а `virtual` оставляет в DOM только окно вокруг вьюпорта — прокрутка не тяжелеет от длины.',
    status: 'ready',
    previewKey: 'gr-list-virtual',  },
]
