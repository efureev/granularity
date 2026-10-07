import type { GrJsonNodeKind } from './jsonToNodes'

/**
 * Классы `GrJsonViewer`.
 *
 * Роли перечислены целиком, по литералу на ветку: экстрактор находит в коде
 * только целые литералы, а имя, собранное шаблонной строкой, в CSS не попало
 * бы — его пришлось бы объявлять в safelist.
 */

/**
 * `min-w-0` и клип — не украшение: глубокая ветка шире контейнера, и без них
 * панель растягивает раскладку страницы, вместо того чтобы прокручиваться
 * внутри себя. Горизонтальный скролл остаётся у самого дерева.
 */
export const jsonViewerRootClass = 'min-w-0 overflow-hidden rounded-[var(--gr-radius-md)] bg-[var(--gr-json-viewer-bg,var(--gr-muted))] text-[var(--gr-fg)]'

/** Шапка с поиском и кнопками свёртки. Отбивается от дерева, а не от края. */
export const jsonViewerToolbarClass = 'flex items-center gap-2 border-b border-[var(--gr-brd)] p-2'

export const jsonViewerSearchClass = 'min-w-0 flex-1'

/** Строка узла моноширинная: значения выравниваются по разрядам, как в блоке кода. */
export const jsonViewerRowClass = 'relative flex min-w-0 items-center gap-1 font-[var(--gr-font-mono)]'

/** Область узла не даёт значению растянуть строку шире панели. */
export const jsonViewerContentClass = 'min-w-0'

/**
 * Ключ уступает ширину вместе со значением. Несжимаемый ключ в узкой панели
 * (232px, глубокий узел) забирал всю строку, и значение обрезалось до нуля —
 * у `amount_paid` не было видно ничего. Теперь сжимаются обе части, ключ —
 * охотнее (`shrink-[3]`), а у значения остаётся минимум в 5 знаков. Минимума у
 * ключа нет нарочно: `min-width` раздвигал бы короткие ключи вроде `$` и `id`.
 */
export const jsonViewerKeyClass = 'min-w-0 shrink-[3] truncate text-[var(--gr-json-viewer-key,var(--gr-primary-text))]'

export const jsonViewerPunctuationClass = 'shrink-0 text-[var(--gr-json-viewer-punctuation,var(--gr-fg))]'

/**
 * Значение обрезается по ширине строки, а не переносится: перенос превратил бы
 * дерево в простыню и сломал бы оценку высоты строки у виртуализации.
 */
export const jsonViewerValueClass = 'min-w-[5ch] truncate'

/** Счётчик у свёрнутой ветки и служебные подписи — тише значения. */
export const jsonViewerMutedClass = 'shrink-0 text-[var(--gr-json-viewer-muted,var(--gr-muted-fg))]'

/**
 * Кнопка копирования узла: появляется по наведению и по фокусу внутри строки.
 *
 * Стоит в потоке сразу за значением, а не прижата к правому краю строки:
 * прижать её не к чему — область узла у `GrTree` сжата по содержимому
 * (`flex: 0 1 auto`) собственным scoped-правилом, а утилитой снаружи оно не
 * перебивается: оба класса равной специфичности, и победителя выбирает порядок
 * правил в CSS. Цена потока — 4 px высоты строки, и она дешевле этой лотереи.
 */
export const jsonViewerCopyClass = 'ml-2 shrink-0 opacity-0 focus-visible:opacity-100 group-hover:opacity-100'

/**
 * Зацепка варианта `group-hover` у кнопки копирования. В safelist не идёт: CSS
 * из неё не порождается — правило пишет сам вариант, а гейт справедливо считал
 * бы такую запись мёртвой.
 */
export const jsonViewerGroupClass = 'group'

/**
 * Цвет значения по виду.
 *
 * Дефолты — ссылки на `-text`-роли темы, те же, что у `GrCodeBlock`: роли
 * переключаются вместе с темой, поэтому подсветка работает в обеих без своего
 * theme-слоя, а два компонента остаются согласованными через роль, а не через
 * общую константу — импорт чужой мапы притащил бы потребителю весь CSS донора.
 *
 * Число взято от `azure`, а не от `info`: `info` — синий в двух шагах от индиго
 * `primary`, и пара «ключ ↔ число» стояла бы в одной строке неразличимой.
 */
export const jsonValueClass: Record<GrJsonNodeKind, string> = {
  string: 'text-[var(--gr-json-viewer-string,var(--gr-success-text))]',
  number: 'text-[var(--gr-json-viewer-number,var(--gr-azure-text))]',
  boolean: 'text-[var(--gr-json-viewer-literal,var(--gr-warning-text))]',
  null: 'text-[var(--gr-json-viewer-literal,var(--gr-warning-text))]',
  object: 'text-[var(--gr-json-viewer-muted,var(--gr-muted-fg))]',
  array: 'text-[var(--gr-json-viewer-muted,var(--gr-muted-fg))]',
  unsupported: 'text-[var(--gr-json-viewer-muted,var(--gr-muted-fg))]',
  truncation: 'text-[var(--gr-json-viewer-muted,var(--gr-muted-fg))]',
}
