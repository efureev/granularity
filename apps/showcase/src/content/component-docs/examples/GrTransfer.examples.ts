import type { ShowcaseComponentExampleDoc } from '../types'

export const grTransferExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'transfer-basic',
    title: 'Состав рабочей группы',
    description: 'Слева справочник, справа отобранное — обе стороны видны сразу. Отметьте несколько строк (`Ctrl` по одной, `Shift` диапазоном) и перенесите их стрелкой; двойной клик по строке переносит её сразу.',
    status: 'ready',
    previewKey: 'gr-transfer-basic',
  },
  {
    id: 'transfer-ordered',
    title: 'Колонки отчёта: порядок и есть значение',
    description: 'Правая панель переставляется кнопками в её шапке, перетаскиванием и `Alt` + стрелкой — и её порядок уезжает в `v-model`. Именно этим компонент отличается от мультиселекта, где выбранное сжато в строку и порядка не имеет.',
    status: 'ready',
    previewKey: 'gr-transfer-ordered',
  },
  {
    id: 'transfer-custom',
    title: 'Своя строка и запреты',
    description: 'Слот `#item` рисует строку целиком, а `itemDisabled` помечает то, что переносить нельзя. Запрещённая строка остаётся видимой и достижимой с клавиатуры — иначе скринридер не узнает, что она есть.',
    status: 'ready',
    previewKey: 'gr-transfer-custom',
  },
]
