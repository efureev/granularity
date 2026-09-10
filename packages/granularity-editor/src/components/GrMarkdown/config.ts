import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grMarkdownSafelist } from './grMarkdownStyles'

/**
 * Три ребра к ядру, и все объявлены: `GrCheckbox` у списка задач, `GrAlert`
 * у алертов GitHub и `GrTable` у таблиц GFM.
 *
 * Правило прежнее — ребро подмешивает потребителю **весь** CSS и safelist
 * донора, и документ из одних абзацев не должен платить за то, чего в нём нет.
 * Поэтому таблица, ссылка и цитата остаются семантической разметкой на своих
 * токенах, а кому нужен `GrTable` — ставит его пропом `components`.
 *
 * Исключения сделаны там, где своя копия **визуального контракта** разошлась бы
 * с дизайн-системой молча: тон и иконка сообщения, вид чекбокса, скролл-область
 * и шапка таблицы задаются ядром, а не документом. Копия уже расходилась —
 * нативный `<input>` рисовался приглушённым и неквадратным. Цена посчитана:
 * 3.6, 3.5 и 3.4 КБ gzip.
 *
 * Ссылку сюда не берут по замеру, а не по вкусу: узел самый частый, и на
 * документе в 300 ссылок инстансы `GrLink` дают ×4.2 ко времени рендера.
 *
 * Собственный CSS (`tokens.css`, `styles.css`) в `cssFiles` не объявлен: он
 * импортируется из SFC и уезжает в его чанк через `libInjectCss`.
 */
export const grMarkdownConfig = defineGranularComponent(import.meta.url, {
  name: 'GrMarkdown',
  safelist: grMarkdownSafelist,
  dependencies: [
    { provider: '@feugene/granularity', components: ['GrAlert', 'GrCheckbox', 'GrTable'] },
  ],
})
