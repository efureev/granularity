import chartsPkg from '@feugene/granularity-charts/package.json'
import dashboardPkg from '@feugene/granularity-dashboard/package.json'
import datasourcePkg from '@feugene/granularity-datasource/package.json'
import editorPkg from '@feugene/granularity-editor/package.json'
import formsSchemaPkg from '@feugene/granularity-forms-schema/package.json'
import chronoPkg from '@feugene/granularity-chrono/package.json'

import type { ShowcaseApiSectionMeta } from '../model.ts'
import type { ShowcaseComponentOverviewDoc } from '../component-docs/types'

/**
 * Реестр компонентов из **сопутствующих (companion) пакетов** — опциональных
 * пакетов экосистемы granularity, которые устанавливаются отдельно (собственная
 * зависимость, собственный релизный цикл). В отличие от ядра `@feugene/granularity`,
 * их API описывается здесь вручную: у них нет автогенерации из
 * `granularityComponentConfigs`, а публичный контракт принадлежит GR-обёртке.
 */

export type CompanionExample = {
  id: string
  title: string
  description: string
  /** Ключ демо в `src/demos/registry.ts`: и превью, и сниппет читаются из него. */
  previewKey: string
  note?: string
}

export type CompanionComponent = {
  /**
   * Чем запись является. Умолчание — компонент; композабл отличается тем, что
   * страница не вправе называть его компонентом, а секции API у него другие
   * (`parameters` и `returns` вместо пропов и событий).
   */
  kind?: 'component' | 'composable'
  /** Имя компонента, напр. `GrDateTimePicker`. */
  name: string
  /** Kebab-slug для route (`/extras/<slug>`), напр. `gr-date-time-picker`. */
  slug: string
  title: string
  summary: string
  /** Публичный import path. */
  importPath: string
  /**
   * Что это за компонент и где проходит его зона ответственности.
   *
   * `summary` отвечает на «что это» одной фразой — её читают в каталоге. Здесь
   * место второму вопросу: за что компонент отвечает, а что оставляет соседям.
   * У пакета из нескольких компонентов без этого не разобрать, кто чем занят.
   */
  overview?: ShowcaseComponentOverviewDoc
  /**
   * Публичные типы, которые нужны, чтобы работать с компонентом на своей
   * стороне: модель `v-model`, объединения пропов, форма элемента коллекции.
   *
   * Здесь **не** место всему, что пакет экспортирует: внутренние структуры и
   * типы соседних компонентов только зашумят страницу. Мерило простое —
   * попадёт ли этот тип в сигнатуру кода потребителя.
   */
  typeDeclarations?: string
  examples: CompanionExample[]
  apiSections: ShowcaseApiSectionMeta[]
}

export type CompanionPackage = {
  /** Идентификатор пакета для группировки/route, напр. `granularity-chrono`. */
  id: string
  /** Имя npm-пакета. */
  npmName: string
  /** Короткая метка для UI. */
  label: string
  description: string
  version: string
  /** Внешние (собственные) зависимости пакета — показываем, за что «платит» consumer. */
  dependencies: string[]
  components: CompanionComponent[]
}

/** Публичная поверхность линейного графика. */
/** Публичная поверхность площади: линия плюс заливка и стек. */
function chartAreaApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'series', type: 'GrChartSeries[] | (number | null)[]', description: 'Серии либо голый ряд чисел — тогда `x` становится порядковым номером. У серии свои `color` и `fillColor`: линия обязана читаться на фоне, а заливка под ней — не спорить с сеткой, и это разные роли.' },
        { name: 'stacked', type: 'boolean', default: 'false', description: 'Складывать серии: каждая полоса ложится на сумму предыдущих. Ось при этом считается по вершинам полос и всегда отсчитывается от нуля.' },
        { name: 'fill', type: `'auto' | 'gradient' | 'solid'`, default: `'auto'`, description: '`auto` — градиент у наложения (ряды обязаны просвечивать) и плотная заливка у стека (полосы стоят встык, и градиент размыл бы границу между ними).' },
        { name: 'xScale', type: `'linear' | 'time' | 'band'`, description: 'Тип оси X. Не задан — выводится из данных.' },
        { name: 'curve', type: `'linear' | 'smooth' | 'step'`, default: `'linear'`, description: '`smooth` — монотонная кубика: она не выбрасывает кривую за диапазон соседних значений.' },
        { name: 'height', type: 'number', default: '256', description: 'Высота холста в пикселях. Раскладка обязана быть детерминированной до первого замера.' },
        { name: 'width', type: 'number', default: '640', description: 'Объявленная ширина: от неё идёт серверный рендер, клиентская уточняется замером.' },
        { name: 'yDomain / includeZero', type: '[number | null, number | null] · boolean', description: 'Границы оси значений. У стека ноль включается сам.' },
        { name: 'showPoints', type: `'auto' | 'always' | 'never'`, default: `'auto'`, description: '`auto` — марки при ряде до 60 точек. В стеке марка садится на верх полосы.' },
        { name: 'showGrid', type: `'both' | 'x' | 'y' | 'none'`, default: `'y'`, description: 'Какие линии сетки рисовать.' },
        { name: 'showLegend / legendPosition', type: `boolean | 'auto' · 'top' | 'bottom'`, default: `'auto' · 'bottom'`, description: '`auto` — легенда появляется от второй серии.' },
        { name: 'tooltip', type: 'boolean', default: 'true', description: 'Тултип от координаты указателя. В стеке показывает своё значение серии, а не сумму под ней.' },
        { name: 'hiddenSeries', type: 'readonly string[]', description: '`v-model:hiddenSeries` — скрытые серии по id. Скрытая серия из стека выпадает, соседи опускаются.' },
        { name: 'activeIndex', type: 'number | null', description: '`v-model:activeIndex` — курсор. Синхронизирует пару графиков.' },
        { name: 'loading / empty / emptyText', type: 'boolean · boolean · string', description: 'Состояния.' },
        { name: 'dataTable', type: `'hidden' | 'visible' | 'off'`, default: `'hidden'`, description: 'Полные данные таблицей. `hidden` — только для скринридера, но в дереве доступности.' },
        { name: 'dataTableMaxRows', type: `number | 'auto'`, default: `'auto'`, description: 'Потолок строк таблицы: столько, сколько можно прочитать. У длинных рядов это бюджет рисунка — таблица печатает ровно нарисованные точки; иначе фиксированный потолок с равномерной выборкой, и в обоих случаях пометка в подвале. Поточечная полнота остаётся за клавиатурой. Число задаёт свой потолок, `Infinity` снимает его совсем.' },
        { name: 'interactive', type: 'boolean', default: 'true', description: '`false` превращает график в картинку: `role="img"` с именем, без фокуса, тултипа и клавиатуры.' },
        { name: 'valueFormat / xTickFormat / yTickFormat', type: 'GrChartNumberFormat · (value) => string', description: 'Форматирование значений и подписей делений.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Кегль подписей и размер марок. Не задан — из `GrConfigProvider`.' },
        { name: 'decimate', type: `'auto' | 'always' | 'never'`, default: `'auto'`, description: 'Прореживание рисунка по LTTB. В стопке набор абсцисс общий на группу — разойдись он, заливка разошлась бы швами. Сокращается **рисунок**: курсор, клавиатура, тултип и скрытая таблица знают полный ряд.' },
        { name: 'maxPoints', type: 'number', description: 'Бюджет вершин на серию. Не задан — две на пиксель ширины области, но не меньше 64.' },
        { name: 'zoom', type: `false | 'brush' | 'wheel' | 'both'`, default: 'false', description: 'Какими **жестами указателя** пользователь меняет видимое окно: протяжкой по холсту, колесом или обоими. Клавиатура (`+`/`-`, `Shift`+стрелки, `0`) работает всегда, когда приближение включено, и отдельным режимом не выключается.' },
        { name: 'xWindow', type: '[GrChartXValue, GrChartXValue] | null', description: '`v-model:xWindow` — видимое окно по абсциссе; `null` — весь ряд. Окно **выбирает данные**: по нему считаются позиции, курсор, клавиатура, скрытая таблица и размах оси значений, а стек — суммы по видимым точкам.' },
        { name: 'canvasThreshold', type: 'number', default: '2000', description: 'Порог, выше которого марки не рисуются даже при `showPoints: \'always\'`. На `auto` при дефолтах не влияет: тот отсекает марки раньше, на шестидесяти точках.' },
      ],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'update:hiddenSeries', type: '(value: string[]) => void', description: 'Легенда переключила серию.' },
        { name: 'update:activeIndex', type: '(value: number | null) => void', description: 'Курсор сменился — указателем или клавиатурой.' },
        { name: 'pointClick', type: '(value: GrChartActivePoint) => void', description: 'Клик или `Enter` на активной точке.' },
        { name: 'pointHover', type: '(value: GrChartActivePoint | null) => void', description: 'Активная точка сменилась. `null` — курсор ушёл.' },
        { name: 'legendToggle', type: '(value: { seriesId: string, hidden: boolean }) => void', description: 'Намерение скрыть или показать серию. Применяет его потребитель — состояние его.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'tooltip', type: '{ active: GrChartActivePoint, formatValue }', description: 'Своя панель тултипа.' },
        { name: 'legend', type: '{ series, toggle }', description: 'Своя легенда.' },
        { name: 'empty', type: '—', description: 'Своё пустое состояние вместо `GrEmptyState`.' },
        { name: 'header', type: '—', description: 'Строка над графиком: заголовок, действия.' },
      ],
    },
  ]
}

/** Публичная поверхность столбцов: группировка, стопка и режим ста процентов. */
function chartBarApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'series', type: 'GrChartSeries[] | (number | null)[]', description: 'Серии либо голый ряд чисел — тогда категорией становится порядковый номер.' },
        { name: 'stacked', type: `boolean | '100%'`, default: 'false', description: '`false` — серии стоят рядом внутри категории, `true` — стопкой, `\'100%\'` — стопкой с нормировкой столбца к единице: остаётся только структура, абсолютные числа уходят с оси.' },
        { name: 'groupPadding', type: 'number', default: '0.1', description: 'Доля ширины слота, уходящая в зазор между сериями внутри категории. Центры полос при этом не двигаются.' },
        { name: 'barRadius', type: 'number', default: '4', description: 'Скругление дальнего от базовой линии конца полосы в пикселях. Числом, а не токеном: радиус идёт в геометрию пути, а прочитать CSS-переменную из JS нечем.' },
        { name: 'dimInactive', type: 'boolean', default: 'true', description: 'Гасить полосы неактивных категорий при наведении. `false` — активная категория ничем не выделяется, о ней говорит только тултип: это осмысленно там, где график стоит рядом с таблицей и лишнее движение цвета мешает читать соседей.' },
        { name: 'xScale', type: `'linear' | 'time' | 'band'`, description: 'Тип оси X. Не задан — выводится из данных. У непрерывной оси ширина полосы считается от числа позиций, иначе столбцы по датам вышли бы нулевой ширины.' },
        { name: 'height', type: 'number', default: '256', description: 'Высота холста в пикселях. Раскладка обязана быть детерминированной до первого замера.' },
        { name: 'width', type: 'number', default: '640', description: 'Объявленная ширина: от неё идёт серверный рендер, клиентская уточняется замером.' },
        { name: 'yDomain', type: '[number | null, number | null]', description: 'Границы оси значений. Ноль включается всегда и без спроса: столбец от обрезанной оси врёт о величине.' },
        { name: 'showGrid', type: `'both' | 'x' | 'y' | 'none'`, default: `'y'`, description: 'Какие линии сетки рисовать.' },
        { name: 'showLegend / legendPosition', type: `boolean | 'auto' · 'top' | 'bottom'`, default: `'auto' · 'bottom'`, description: '`auto` — легенда появляется от второй серии.' },
        { name: 'tooltip', type: 'boolean', default: 'true', description: 'Тултип от координаты указателя. Вместо вертикали подсвечивается вся категория: вертикаль прошла бы сквозь полосу и читалась бы как её граница.' },
        { name: 'hiddenSeries', type: 'readonly string[]', description: '`v-model:hiddenSeries` — скрытые серии по id. Скрытая серия освобождает место оставшимся и выпадает из стопки.' },
        { name: 'activeIndex', type: 'number | null', description: '`v-model:activeIndex` — активная категория. Синхронизирует пару графиков.' },
        { name: 'loading / empty / emptyText', type: 'boolean · boolean · string', description: 'Состояния.' },
        { name: 'dataTable', type: `'hidden' | 'visible' | 'off'`, default: `'hidden'`, description: 'Полные данные таблицей. Во всех режимах показывает исходное значение серии, а не долю и не сумму под сегментом.' },
        { name: 'dataTableMaxRows', type: `number | 'auto'`, default: `'auto'`, description: 'Потолок строк таблицы: столько, сколько можно прочитать. У длинных рядов это бюджет рисунка — таблица печатает ровно нарисованные точки; иначе фиксированный потолок с равномерной выборкой, и в обоих случаях пометка в подвале. Поточечная полнота остаётся за клавиатурой. Число задаёт свой потолок, `Infinity` снимает его совсем.' },
        { name: 'interactive', type: 'boolean', default: 'true', description: '`false` превращает график в картинку: `role="img"` с именем, без фокуса, тултипа и клавиатуры.' },
        { name: 'valueFormat / xTickFormat / yTickFormat', type: 'GrChartNumberFormat · (value) => string', description: 'Форматирование значений и подписей делений. В режиме ста процентов ось сама подписывается долями.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Кегль подписей. Не задан — из `GrConfigProvider`.' },
      ],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'update:hiddenSeries', type: '(value: string[]) => void', description: 'Легенда переключила серию.' },
        { name: 'update:activeIndex', type: '(value: number | null) => void', description: 'Активная категория сменилась — указателем или клавиатурой.' },
        { name: 'pointClick', type: '(value: GrChartActivePoint) => void', description: 'Клик или `Enter` на активной категории.' },
        { name: 'pointHover', type: '(value: GrChartActivePoint | null) => void', description: 'Активная категория сменилась. `null` — курсор ушёл.' },
        { name: 'legendToggle', type: '(value: { seriesId: string, hidden: boolean }) => void', description: 'Намерение скрыть или показать серию. Применяет его потребитель — состояние его.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'tooltip', type: '{ active: GrChartActivePoint, formatValue }', description: 'Своя панель тултипа.' },
        { name: 'legend', type: '{ series, toggle }', description: 'Своя легенда.' },
        { name: 'empty', type: '—', description: 'Своё пустое состояние вместо `GrEmptyState`.' },
        { name: 'header', type: '—', description: 'Строка над графиком: заголовок, действия.' },
      ],
    },
  ]
}

function chartLineApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'series', type: 'GrChartSeries[] | (number | null)[]', description: 'Серии либо голый ряд чисел — тогда `x` становится порядковым номером. Внутри серии два вида входа: объектный `data` и колоночная пара `x`/`y`. Свой цвет задаётся полем `color` — ролью темы, а не hex.' },
        { name: 'xScale', type: `'linear' | 'time' | 'band'`, description: 'Тип оси X. Не задан — выводится из данных: `Date` даёт время, строка даёт категории.' },
        { name: 'height', type: 'number', default: '256', description: 'Высота холста в пикселях. Раскладка обязана быть детерминированной до первого замера — отсюда число, а не CSS-строка.' },
        { name: 'width', type: 'number', default: '640', description: 'Объявленная ширина: от неё идёт серверный рендер, клиентская уточняется замером.' },
        { name: 'yDomain', type: '[number | null, number | null]', description: 'Границы оси значений. `null` в позиции — считать эту сторону по данным.' },
        { name: 'includeZero', type: 'boolean', default: 'false', description: 'Притянуть ось значений к нулю.' },
        { name: 'curve', type: `'linear' | 'smooth' | 'step'`, default: `'linear'`, description: '`smooth` — монотонная кубика: она не выбрасывает кривую за диапазон соседних значений, то есть не рисует максимум, которого в данных нет.' },
        { name: 'gaps', type: `'hidden' | 'shadow' | 'dashed'`, default: `'hidden'`, description: 'Чем закрыть разрыв ряда. `hidden` — ничем, линия рвётся. `shadow` и `dashed` рисуют перемычку, заметно отличную от линии: она показывает, куда ряд ушёл за время без замеров, но данными не притворяется. Перемычка всегда прямая, даже при `curve: \'smooth\'` — кривая придумала бы ход значения. На таблицу и тултип не влияет: там по-прежнему «нет значения».' },
        { name: 'showPoints', type: `'auto' | 'always' | 'never'`, default: `'auto'`, description: '`auto` — маркеры при ряде до 60 точек; выше они сливаются в полосу и только мешают.' },
        { name: 'showGrid', type: `'both' | 'x' | 'y' | 'none'`, default: `'y'`, description: 'Какие линии сетки рисовать.' },
        { name: 'showLegend', type: `boolean | 'auto'`, default: `'auto'`, description: '`auto` — легенда появляется от второй серии.' },
        { name: 'legendPosition', type: `'top' | 'bottom'`, default: `'bottom'`, description: 'Где стоит легенда.' },
        { name: 'tooltip', type: 'boolean', default: 'true', description: 'Тултип от координаты указателя, а не от попадания в марку: по линии в два пикселя мышью не попасть.' },
        { name: 'hiddenSeries', type: 'readonly string[]', description: '`v-model:hiddenSeries` — скрытые серии по id. Скрытая серия не растягивает ось.' },
        { name: 'activeIndex', type: 'number | null', description: '`v-model:activeIndex` — курсор. Синхронизирует пару графиков.' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'Скелет и `aria-busy` на корне.' },
        { name: 'empty', type: 'boolean', description: 'Принудительное пустое состояние. Не задано — выводится из данных.' },
        { name: 'dataTable', type: `'hidden' | 'visible' | 'off'`, default: `'hidden'`, description: 'Полные данные таблицей. `hidden` — только для скринридера, но в дереве доступности; `off` убирает её совсем.' },
        { name: 'dataTableMaxRows', type: `number | 'auto'`, default: `'auto'`, description: 'Потолок строк таблицы: столько, сколько можно прочитать. У длинных рядов это бюджет рисунка — таблица печатает ровно нарисованные точки; иначе фиксированный потолок с равномерной выборкой, и в обоих случаях пометка в подвале. Поточечная полнота остаётся за клавиатурой. Число задаёт свой потолок, `Infinity` снимает его совсем.' },
        { name: 'interactive', type: 'boolean', default: 'true', description: '`false` превращает график в картинку: `role="img"` с именем, без фокуса, тултипа и клавиатуры.' },
        { name: 'valueFormat', type: 'GrChartNumberFormat', description: 'Точность и разделители значений. Локаль берётся из адаптера i18n.' },
        { name: 'xTickFormat / yTickFormat', type: '(value: number, kind?) => string', description: 'Свой формат подписей делений.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Кегль подписей и размер маркеров. Не задан — из `GrConfigProvider`.' },
        { name: 'decimate', type: `'auto' | 'always' | 'never'`, default: `'auto'`, description: 'Прореживание рисунка по LTTB. `auto` включается, только когда точек больше бюджета: выше двух вершин на пиксель SVG всё равно ничего не покажет. Сокращается **рисунок** — курсор, клавиатура, тултип и скрытая таблица знают полный ряд.' },
        { name: 'maxPoints', type: 'number', description: 'Бюджет вершин на серию. Не задан — две на пиксель ширины области, но не меньше 64.' },
        { name: 'zoom', type: `false | 'brush' | 'wheel' | 'both'`, default: 'false', description: 'Какими **жестами указателя** пользователь меняет видимое окно: протяжкой по холсту, колесом или обоими. Клавиатура (`+`/`-`, `Shift`+стрелки, `0`) работает всегда, когда приближение включено, и отдельным режимом не выключается.' },
        { name: 'xWindow', type: '[GrChartXValue, GrChartXValue] | null', description: '`v-model:xWindow` — видимое окно по абсциссе; `null` — весь ряд. Окно **выбирает данные**: по нему считаются позиции, курсор, клавиатура, скрытая таблица и размах оси значений, а `activeIndex` адресует окно, а не весь ряд.' },
        { name: 'canvasThreshold', type: 'number', default: '2000', description: 'Порог, выше которого маркеры не рисуются даже при `showPoints: \'always\'`. На `auto` при дефолтах не влияет: тот отсекает марки раньше, на шестидесяти точках.' },
      ],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'update:hiddenSeries', type: '(value: string[]) => void', description: 'Легенда переключила серию.' },
        { name: 'update:activeIndex', type: '(value: number | null) => void', description: 'Курсор сменился — указателем или клавиатурой.' },
        { name: 'pointClick', type: '(value: GrChartActivePoint) => void', description: 'Клик или `Enter` на активной точке.' },
        { name: 'pointHover', type: '(value: GrChartActivePoint | null) => void', description: 'Активная точка сменилась. `null` — курсор ушёл.' },
        { name: 'legendToggle', type: '(value: { seriesId: string, hidden: boolean }) => void', description: 'Намерение скрыть или показать серию. Применяет его потребитель — состояние его.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'tooltip', type: '{ active: GrChartActivePoint, formatValue }', description: 'Своя панель тултипа.' },
        { name: 'legend', type: '{ series, toggle }', description: 'Своя легенда.' },
        { name: 'empty', type: '—', description: 'Своё пустое состояние вместо `GrEmptyState`.' },
        { name: 'header', type: '—', description: 'Строка над графиком: заголовок, действия.' },
      ],
    },
  ]
}

/** Публичная поверхность круга: у него полярные координаты, поэтому и события про доли. */
function chartPieApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'data', type: 'GrChartPieSlice[] | (number | null)[]', description: 'Доли `{ label, value, color? }` либо голый ряд чисел — тогда подписью становится порядковый номер. Пропуски, нули и отрицательные значения доли не дают: «минус три» части круга не бывает.' },
        { name: 'variant', type: `'pie' | 'donut'`, default: `'pie'`, description: 'Сектор или кольцо. У кольца середина свободна — туда садится итог.' },
        { name: 'donutRatio', type: 'number', default: '0.62', description: 'Радиус дырки долей внешнего радиуса.' },
        { name: 'startAngle', type: 'number', default: '0', description: 'Угол первой доли в градусах от двенадцати часов, по часовой.' },
        { name: 'labels', type: `'none' | 'share' | 'value'`, default: `'none'`, description: 'Подписи на выносках **снаружи** кольца. Внутри доли текст не проходит AA ни на одной из пяти ролей палитры — ни белым, ни тёмным.' },
        { name: 'labelMinShare', type: 'number', default: '0.05', description: 'Наименьшая доля, которую подписывают: ниже порога подпись перекрыла бы соседнюю.' },
        { name: 'height', type: 'number', default: '256', description: 'Высота холста в пикселях. Раскладка обязана быть детерминированной до первого замера.' },
        { name: 'width', type: 'number', default: '640', description: 'Объявленная ширина: от неё идёт серверный рендер, клиентская уточняется замером.' },
        { name: 'showLegend', type: 'boolean', default: 'true', description: 'Легенда с подписью, значением и долей. У круга это ключ к рисунку, а не украшение, поэтому она включена по умолчанию.' },
        { name: 'legendPosition', type: `'top' | 'bottom'`, default: `'bottom'`, description: 'Где стоит легенда.' },
        { name: 'tooltip', type: 'boolean', default: 'true', description: 'Тултип от координаты указателя. Попадание считается по углу, а не по абсциссе.' },
        { name: 'activeIndex', type: 'number | null', description: '`v-model:activeIndex` — выделенная доля. Остальные при этом приглушаются: вертикали, которой линейный график показывает «вот эта точка», у круга нет.' },
        { name: 'totalLabel', type: 'string', description: 'Подпись под итогом в середине кольца. Сам итог — сумма нарисованных долей.' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'Скелет и `aria-busy` на корне.' },
        { name: 'empty', type: 'boolean', description: 'Принудительное пустое состояние. Не задано — выводится из данных: круг из одних нулей это тот же пустой холст.' },
        { name: 'dataTable', type: `'hidden' | 'visible' | 'off'`, default: `'hidden'`, description: 'Таблица долей: подпись, значение, доля. `hidden` — только для скринридера, но в дереве доступности.' },
        { name: 'dataTableMaxRows', type: `number | 'auto'`, default: `'auto'`, description: 'Потолок строк таблицы: столько, сколько можно прочитать. У длинных рядов это бюджет рисунка — таблица печатает ровно нарисованные точки; иначе фиксированный потолок с равномерной выборкой, и в обоих случаях пометка в подвале. Поточечная полнота остаётся за клавиатурой. Число задаёт свой потолок, `Infinity` снимает его совсем.' },
        { name: 'interactive', type: 'boolean', default: 'true', description: '`false` превращает круг в картинку: `role="img"` с именем, без фокуса, тултипа и клавиатуры.' },
        { name: 'valueFormat', type: 'GrChartNumberFormat', description: 'Точность и разделители значений. Локаль берётся из адаптера i18n.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Кегль подписей. Не задан — из `GrConfigProvider`.' },
      ],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'update:activeIndex', type: '(value: number | null) => void', description: 'Выделенная доля сменилась — указателем или клавиатурой.' },
        { name: 'sliceClick', type: '(value: GrChartPieActiveSlice) => void', description: 'Клик или `Enter` на доле. В нагрузке подпись, значение, доля и цвет.' },
        { name: 'sliceHover', type: '(value: GrChartPieActiveSlice | null) => void', description: 'Доля под курсором сменилась. `null` — курсор ушёл с круга.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'center', type: '{ total, formattedTotal }', description: 'Середина кольца. Содержимое рисуется внутри холста, поэтому это SVG, а не HTML.' },
        { name: 'tooltip', type: '{ active, slice, formatValue }', description: 'Своя панель тултипа.' },
        { name: 'legend', type: '{ slices, formatValue }', description: 'Своя легенда.' },
        { name: 'empty', type: '—', description: 'Своё пустое состояние вместо `GrEmptyState`.' },
        { name: 'header', type: '—', description: 'Строка над диаграммой: заголовок, действия.' },
      ],
    },
  ]
}

/** Публичная поверхность паутины: две шкалы осей и своя геометрия. */
function chartRadarApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'series', type: 'GrChartSeries[] | (number | null)[]', description: 'Серии по общему набору осей. Своего `xScale` у радара нет — ось всегда категориальная. Серия, не знающая какой-то оси, получает на ней пропуск: спицы не исчезают при скрытии ряда.' },
        { name: 'axisScale', type: `'shared' | 'per-axis'`, default: `'shared'`, description: '`shared` — одна шкала на все оси: площадь фигуры сравнима, форма честна. `per-axis` — каждая ось нормирована своим максимумом; единственный способ показать разнородные метрики, но площади при этом сравнивать нельзя.' },
        { name: 'axisMax', type: 'Record&lt;string, number&gt;', description: 'Верхние границы осей при `per-axis`, ключ — имя оси. Без них максимум берётся из данных, и лучший результат садится на внешнее кольцо — что читается как «предел достигнут».' },
        { name: 'rings', type: 'number', default: '4', description: 'Желаемое число колец. Фактическое следует лестнице «красивых» чисел: кольцо обязано стоять на круглом значении. При `per-axis` круглых значений нет, и колец ровно столько, сколько запрошено.' },
        { name: 'shape', type: `'polygon' | 'circle'`, default: `'polygon'`, description: 'Форма колец сетки.' },
        { name: 'startAngle', type: 'number', default: '0', description: 'Угол первой оси в градусах от двенадцати часов, по часовой.' },
        { name: 'fill', type: 'boolean', default: 'true', description: 'Полупрозрачная заливка контура. На трёх и более сериях её выключают: заливки наслаиваются и прячут друг друга.' },
        { name: 'showPoints', type: `'auto' | 'always' | 'never'`, default: `'auto'`, description: 'Марки вершин. Форма марки — второй различитель серии помимо цвета.' },
        { name: 'yDomain', type: '[number | null, number | null]', description: 'Границы оси значений при `shared`. Ноль в домене остаётся всегда: длина луча и есть величина.' },
        { name: 'height', type: 'number', default: '280', description: 'Высота холста в пикселях.' },
        { name: 'width', type: 'number', default: '640', description: 'Объявленная ширина: от неё идёт серверный рендер, клиентская уточняется замером.' },
        { name: 'showLegend / legendPosition', type: `boolean | 'auto' · 'top' | 'bottom'`, default: `'auto' · 'bottom'`, description: '`auto` — легенда появляется от второй серии.' },
        { name: 'tooltip', type: 'boolean', default: 'true', description: 'Тултип от координаты указателя. Попадание угловое — ближайшая спица.' },
        { name: 'hiddenSeries', type: 'readonly string[]', description: '`v-model:hiddenSeries` — скрытые серии по id. Оси при этом остаются на месте.' },
        { name: 'activeIndex', type: 'number | null', description: '`v-model:activeIndex` — индекс активной оси.' },
        { name: 'loading / empty / emptyText', type: 'boolean · boolean · string', description: 'Состояния. Ряд из нулей — не пустое состояние, а законная картинка.' },
        { name: 'dataTable', type: `'hidden' | 'visible' | 'off'`, default: `'hidden'`, description: 'Полные данные таблицей. При `per-axis` в неё добавляется столбец с максимумом оси — без него форма фигуры из таблицы не восстанавливается.' },
        { name: 'dataTableMaxRows', type: `number | 'auto'`, default: `'auto'`, description: 'Потолок строк таблицы: столько, сколько можно прочитать. У длинных рядов это бюджет рисунка — таблица печатает ровно нарисованные точки; иначе фиксированный потолок с равномерной выборкой, и в обоих случаях пометка в подвале. Поточечная полнота остаётся за клавиатурой. Число задаёт свой потолок, `Infinity` снимает его совсем.' },
        { name: 'interactive', type: 'boolean', default: 'true', description: '`false` превращает график в картинку: `role="img"` с именем, без фокуса, тултипа и клавиатуры.' },
        { name: 'valueFormat', type: 'GrChartNumberFormat', description: 'Точность и разделители значений.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Кегль подписей и размер марок. Не задан — из `GrConfigProvider`.' },
      ],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'update:hiddenSeries', type: '(value: string[]) => void', description: 'Легенда переключила серию.' },
        { name: 'update:activeIndex', type: '(value: number | null) => void', description: 'Активная ось сменилась — указателем или клавиатурой.' },
        { name: 'pointClick', type: '(value: GrChartActivePoint) => void', description: 'Клик или `Enter` на активной оси.' },
        { name: 'pointHover', type: '(value: GrChartActivePoint | null) => void', description: 'Активная ось сменилась. `null` — курсор ушёл с паутины.' },
        { name: 'legendToggle', type: '(value: { seriesId: string, hidden: boolean }) => void', description: 'Намерение скрыть или показать серию. Применяет его потребитель — состояние его.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'tooltip', type: '{ active: GrChartActivePoint, formatValue }', description: 'Своя панель тултипа.' },
        { name: 'legend', type: '{ series, toggle }', description: 'Своя легенда.' },
        { name: 'empty', type: '—', description: 'Своё пустое состояние вместо `GrEmptyState`.' },
        { name: 'header', type: '—', description: 'Строка над графиком: заголовок, действия.' },
      ],
    },
  ]
}

/** Публичная поверхность спарклайна: он неинтерактивен, поэтому эмитов нет. */
function sparklineApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'data', type: '(number | null)[] | GrChartPoint[]', description: 'Ряд значений. `null` — пропуск: линия рвётся.' },
        { name: 'variant', type: `'line' | 'area'`, default: `'line'`, description: 'С заливкой под линией или без.' },
        { name: 'color', type: 'string', description: 'Цвет линии. Не задан — токен `--gr-sparkline-color`, то есть первая роль палитры серий.' },
        { name: 'summary', type: 'boolean', default: 'true', description: 'Автоматическая текстовая сводка: направление, края, размах. Она и становится именем картинки.' },
        { name: 'ariaLabel', type: 'string', description: 'Своё имя вместо сводки.' },
        { name: 'valueFormat', type: 'GrChartNumberFormat', description: 'Формат чисел в сводке.' },
      ],
    },
  ]
}

/** Публичная поверхность моста: шаги, накопление и итог. */
function chartWaterfallApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'steps', type: 'GrChartWaterfallStep[]', description: 'Шаги моста: `{ label, value, kind?, color?, meta? }`. `kind: \'total\'` — абсолютное значение: столбец от нуля, накопление сбрасывается на него.' },
        { name: 'baseline', type: 'number', default: '0', description: 'Начальное накопление. Первый шаг-дельта отсчитывается от него.' },
        { name: 'showTotal', type: 'boolean | string', default: 'false', description: 'Дорисовать итоговый столбец справа. Строка задаёт его подпись. Накопления он не меняет — только показывает.' },
        { name: 'showConnectors', type: 'boolean', default: 'true', description: 'Линии от вершины предыдущего столбца к основанию следующего. К шагу `total` соединитель не ведёт: он объявляет накопление, а не продолжает его.' },
        { name: 'barRadius', type: 'number', default: '2', description: 'Скругление дальнего конца столбца в пикселях. Числом, а не токеном: радиус идёт в геометрию пути.' },
        { name: 'orientation', type: `'vertical' | 'horizontal'`, default: `'vertical'`, description: 'Горизонталь берут, когда подписи шагов длиннее ширины категории. Оси в этом режиме рисует сам компонент.' },
        { name: 'height / width', type: 'number', default: '256 · 640', description: 'Высота холста и объявленная ширина для серверного рендера.' },
        { name: 'yDomain', type: '[number | null, number | null]', description: 'Границы оси значений. Ноль включается всегда: мост, оторванный от нуля, врёт о величинах.' },
        { name: 'showGrid', type: `'both' | 'x' | 'y' | 'none'`, default: `'y'`, description: 'Оси названы по данным: при горизонтали стороны меняются местами сами.' },
        { name: 'tooltip', type: 'boolean', default: 'true', description: 'Тултип от координаты указателя: шаг, его значение и накопление после.' },
        { name: 'activeIndex', type: 'number | null', description: '`v-model:activeIndex` — активный шаг.' },
        { name: 'dataTable', type: `'hidden' | 'visible' | 'off'`, default: `'hidden'`, description: 'Три колонки значений: изменение, накопление до и после. По одной дельте мост не восстановить.' },
        { name: 'dataTableMaxRows', type: `number | 'auto'`, default: `'auto'`, description: 'Потолок строк таблицы: столько, сколько можно прочитать. У длинных рядов это бюджет рисунка — таблица печатает ровно нарисованные точки; иначе фиксированный потолок с равномерной выборкой, и в обоих случаях пометка в подвале. Поточечная полнота остаётся за клавиатурой. Число задаёт свой потолок, `Infinity` снимает его совсем.' },
        { name: 'interactive', type: 'boolean', default: 'true', description: '`false` превращает график в картинку: `role="img"` с именем, без фокуса и клавиатуры.' },
        { name: 'valueFormat / yTickFormat', type: 'GrChartNumberFormat · (value) => string', description: 'Форматирование значений и подписей оси.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Кегль подписей. Не задан — из `GrConfigProvider`.' },
      ],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'update:activeIndex', type: '(value: number | null) => void', description: 'Активный шаг сменился — указателем или клавиатурой.' },
        { name: 'stepClick', type: '(value: GrChartWaterfallActiveStep) => void', description: 'Клик или `Enter` на шаге. В полезной нагрузке накопление до и после.' },
        { name: 'stepHover', type: '(value: GrChartWaterfallActiveStep | null) => void', description: 'Шаг под курсором. `null` — курсор ушёл.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'tooltip', type: '{ active, step, formatValue }', description: 'Своя панель тултипа.' },
        { name: 'header / empty', type: '—', description: 'Строка над графиком и своё пустое состояние.' },
      ],
    },
  ]
}

/** Публичная поверхность bullet: величина, цель и качественные диапазоны. */
function chartBulletApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'value', type: 'number | null', description: 'Измеряемая величина. `null` — величины нет: полосы нет, цель остаётся, в таблице прочерк. Это не ноль.' },
        { name: 'target', type: 'number', description: 'Целевое значение — засечка поперёк дорожки. Цель за пределами шкалы засечки не даёт.' },
        { name: 'ranges', type: 'readonly number[]', description: 'Границы качественных диапазонов: `[0.9, 1]` при `max: 1.2` даёт три полосы. Порядок не важен, граница за краем шкалы зажимается, а не выбрасывается.' },
        { name: 'min / max', type: 'number', default: '0 · по данным', description: 'Границы шкалы. Верх не задан — максимум из величины, цели и границ с запасом.' },
        { name: 'rangeColors', type: 'readonly string[]', description: 'Цвета полос от «хорошо» к «плохо». Длина на единицу больше `ranges`.' },
        { name: 'color', type: 'string', description: 'Тон полосы значения. Не задан — первая роль палитры серий.' },
        { name: 'orientation', type: `'horizontal' | 'vertical'`, default: `'horizontal'`, description: 'Направление дорожки.' },
        { name: 'label', type: 'string', description: 'Имя метрики: заголовок строки в таблице и в тултипе.' },
        { name: 'height / width', type: 'number', default: '48 · 640', description: 'Высота дорожки и объявленная ширина.' },
        { name: 'dataTable', type: `'hidden' | 'visible' | 'off'`, default: `'hidden'`, description: 'Метрика, значение и цель таблицей; диапазоны уходят примечанием в `tfoot`.' },
        { name: 'dataTableMaxRows', type: `number | 'auto'`, default: `'auto'`, description: 'Потолок строк таблицы: столько, сколько можно прочитать. У длинных рядов это бюджет рисунка — таблица печатает ровно нарисованные точки; иначе фиксированный потолок с равномерной выборкой, и в обоих случаях пометка в подвале. Поточечная полнота остаётся за клавиатурой. Число задаёт свой потолок, `Infinity` снимает его совсем.' },
        { name: 'interactive', type: 'boolean', default: 'true', description: '`false` превращает график в картинку.' },
        { name: 'valueFormat', type: 'GrChartNumberFormat', description: 'Формат значений в тултипе, таблице и `aria-valuetext`.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Кегль подписей. Не задан — из `GrConfigProvider`.' },
      ],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'valueClick', type: '(value: number | null) => void', description: 'Клик или `Enter` на дорожке. Приходит настоящая величина, а не зажатая по шкале.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'tooltip', type: '{ active, formatValue }', description: 'Своя панель тултипа.' },
        { name: 'header / empty', type: '—', description: 'Строка над графиком и своё пустое состояние.' },
      ],
    },
  ]
}

/** Публичная поверхность теплокарты: матрица, шкала цвета и двумерный курсор. */
function chartHeatmapApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'values', type: '(number | null)[][]', description: 'Значения построчно: `values[y][x]`. `null` — ячейки нет, а не «ноль»: она не заливается, в таблице прочерк, в домен не входит. Короткие строки дополняются `null` справа.' },
        { name: 'xLabels / yLabels', type: 'readonly string[]', description: 'Подписи колонок и строк. Их число и задаёт размер матрицы.' },
        { name: 'domain', type: '[number, number]', description: 'Границы шкалы. Не заданы — считаются по данным без учёта отсутствующих ячеек.' },
        { name: 'scale / midpoint', type: `'sequential' | 'diverging' · number`, default: `'sequential' · 0`, description: 'Расходящаяся шкала красит недобор и перебор разными ролями и нормируется на больший из отступов от середины — так она симметрична по построению.' },
        { name: 'lowColor / highColor / midColor', type: 'string', description: 'Полюса шкалы ролями темы. Цвет ячейки — `color-mix` по роли, а не палитра из пяти литералов.' },
        { name: 'steps', type: 'number', default: '5', description: 'Число ступеней шкалы; `0` — непрерывный градиент. Края в обоих режимах совпадают, различаются середины.' },
        { name: 'cellGap', type: 'number', default: '2', description: 'Зазор между ячейками в пикселях. Съедается изнутри ячейки: сетка остаётся упёртой в края области.' },
        { name: 'showValues', type: `boolean | 'auto'`, default: `'auto'`, description: '`auto` рисует значения только там, где они помещаются. Контраст подписи считается от доли примеси: измерить итоговый цвет без DOM нечем.' },
        { name: 'showLegend', type: 'boolean', default: 'true', description: 'Легенда — шкала с подписями границ, а не список категорий: у матрицы нет оси значений.' },
        { name: 'activeCell', type: '{ x: number, y: number } | null', description: '`v-model:activeCell` — активная ячейка обеими координатами.' },
        { name: 'height / width', type: 'number', default: '256 · 640', description: 'Высота холста и объявленная ширина.' },
        { name: 'dataTable', type: `'hidden' | 'visible' | 'off'`, default: `'hidden'`, description: 'Настоящая таблица с заголовками строк и колонок. Без неё теплокарта нечитаема вовсе, а не менее удобна.' },
        { name: 'dataTableMaxRows', type: `number | 'auto'`, default: `'auto'`, description: 'Потолок строк таблицы: столько, сколько можно прочитать. У длинных рядов это бюджет рисунка — таблица печатает ровно нарисованные точки; иначе фиксированный потолок с равномерной выборкой, и в обоих случаях пометка в подвале. Поточечная полнота остаётся за клавиатурой. Число задаёт свой потолок, `Infinity` снимает его совсем.' },
        { name: 'interactive', type: 'boolean', default: 'true', description: '`false` превращает график в картинку.' },
        { name: 'valueFormat', type: 'GrChartNumberFormat', description: 'Формат значений в ячейках, тултипе и таблице.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Кегль подписей. Не задан — из `GrConfigProvider`.' },
      ],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'update:activeCell', type: '(value: { x, y } | null) => void', description: 'Курсор сменил ячейку — указателем или стрелками.' },
        { name: 'cellClick', type: '(value: GrChartHeatmapCell) => void', description: 'Клик или `Enter` на ячейке: индексы, подписи и значение.' },
        { name: 'cellHover', type: '(value: GrChartHeatmapCell | null) => void', description: 'Ячейка под курсором. `null` — курсор ушёл.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'legend', type: '{ thresholds, colorAt }', description: 'Своя легенда шкалы.' },
        { name: 'tooltip', type: '{ active, cell }', description: 'Своя панель тултипа.' },
        { name: 'header / empty', type: '—', description: 'Строка над графиком и своё пустое состояние.' },
      ],
    },
  ]
}

/** Публичная поверхность воронки: ступени и обе доли. */
function chartFunnelApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'stages', type: 'GrChartFunnelStage[]', description: 'Ступени: `{ label, value, color?, meta? }`. Ширина пропорциональна значению, а не порядку: убывание рисуется потому, что оно есть в данных.' },
        { name: 'labels', type: `'value' | 'share-first' | 'share-prev' | 'none'`, default: `'value'`, description: 'Что писать на самой ступени. Обе доли остаются доступными рядом — в тултипе, таблице и объявлении.' },
        { name: 'orientation', type: `'vertical' | 'horizontal'`, default: `'vertical'`, description: 'Направление воронки.' },
        { name: 'shape', type: `'trapezoid' | 'bar'`, default: `'trapezoid'`, description: 'Сужающаяся лента или прямоугольники. Значения и таблица при этом совпадают до знака: форма здесь вопрос вкуса.' },
        { name: 'gap', type: 'number', default: '4', description: 'Зазор между ступенями в пикселях.' },
        { name: 'height / width', type: 'number', default: '256 · 640', description: 'Высота холста и объявленная ширина.' },
        { name: 'activeIndex', type: 'number | null', description: '`v-model:activeIndex` — активная ступень.' },
        { name: 'dataTable', type: `'hidden' | 'visible' | 'off'`, default: `'hidden'`, description: 'Ступень, значение и обе доли отдельными колонками.' },
        { name: 'dataTableMaxRows', type: `number | 'auto'`, default: `'auto'`, description: 'Потолок строк таблицы: столько, сколько можно прочитать. У длинных рядов это бюджет рисунка — таблица печатает ровно нарисованные точки; иначе фиксированный потолок с равномерной выборкой, и в обоих случаях пометка в подвале. Поточечная полнота остаётся за клавиатурой. Число задаёт свой потолок, `Infinity` снимает его совсем.' },
        { name: 'interactive', type: 'boolean', default: 'true', description: '`false` превращает график в картинку.' },
        { name: 'valueFormat', type: 'GrChartNumberFormat', description: 'Формат значений.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Кегль подписей. Не задан — из `GrConfigProvider`.' },
      ],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'update:activeIndex', type: '(value: number | null) => void', description: 'Активная ступень сменилась.' },
        { name: 'stageClick', type: '(value: GrChartFunnelActiveStage) => void', description: 'Клик или `Enter` на ступени. В полезной нагрузке обе доли.' },
        { name: 'stageHover', type: '(value: GrChartFunnelActiveStage | null) => void', description: 'Ступень под курсором. `null` — курсор ушёл.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'tooltip', type: '{ active, stage }', description: 'Своя панель тултипа.' },
        { name: 'header / empty', type: '—', description: 'Строка над графиком и своё пустое состояние.' },
      ],
    },
  ]
}

/** Пропы сетки: то, что относится к показу месяца и выбору дня. */
function calendarApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'modelValue', type: 'PlainDate | null', default: 'null', description: '`v-model`. Кортеж `{ y, m, d }`, месяц с нуля. `Date` появляется только на границе пикера.' },
        { name: 'viewDate', type: 'PlainDate', description: 'Показываемый месяц. Без пропа календарь ведёт его сам, отталкиваясь от выбора.' },
        { name: 'min', type: 'PlainDate', description: 'Нижняя граница: дни за ней получают `aria-disabled` и не выбираются.' },
        { name: 'max', type: 'PlainDate', description: 'Верхняя граница.' },
        { name: 'disabledDates', type: 'readonly PlainDate[] | ((date: PlainDate) => boolean)', description: 'Запрещённые дни: список нормализуется в `Set` один раз, предикат зовётся на ячейку при смене месяца.' },
        { name: 'weekStart', type: '1 | 2 | 3 | 4 | 5 | 6 | 7', description: 'Первый день недели по ISO. Не задан — из локали через `Intl`.' },
        { name: 'showWeekNumbers', type: 'boolean', default: 'false', description: 'Колонка с номерами недель по ISO.' },
        { name: 'today', type: 'PlainDate', description: 'Что считать сегодняшним днём. Нужен ради воспроизводимых тестов и снимков.' },
        { name: 'locale', type: 'string', description: 'Локаль показа. Не задана — из адаптера i18n приложения.' },
        { name: 'mode', type: `'day' | 'month' | 'year'`, default: `'day'`, description: 'Что выбирается. В режимах периода сетка показывает двенадцать ячеек в три колонки, а выбор отдаёт первое число периода.' },
        { name: 'rangeStart', type: 'PlainDate | null', description: 'Начало показываемого диапазона. Сетка про диапазон ничего не решает — только рисует его.' },
        { name: 'rangeEnd', type: 'PlainDate | null', description: 'Конец диапазона.' },
        { name: 'rangePreview', type: 'PlainDate | null', description: 'Второй край предпросмотра, пока диапазон не закрыт.' },
        { name: 'announceSelection', type: 'boolean', default: 'true', description: 'Объявлять выбор в живом регионе. Выключается, когда объявляет оболочка: у диапазона осмысленно состояние периода, а не отдельный день.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Размер ячейки. Не задан — из `GrConfigProvider`.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Ни выбора, ни листания.' },
        { name: 'readonly', type: 'boolean', default: 'false', description: 'Значение видно, выбор не меняется.' },
        { name: 'ariaLabel', type: 'string', description: 'Доступное имя сетки, когда рядом нет подписи.' },
      ],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'update:modelValue', type: '(value: PlainDate) => void', description: 'Выбран день.' },
        { name: 'change', type: '(value: PlainDate) => void', description: 'Синоним для не-`v-model` сценариев.' },
        { name: 'update:viewDate', type: '(value: PlainDate) => void', description: 'Сменился показываемый период.' },
        { name: 'periodChange', type: '(value: PlainDate) => void', description: 'Листание — стрелками, клавиатурой или выбором из добора. Шаг зависит от режима: месяц, год или десятилетие.' },
        { name: 'dayHover', type: '(value: PlainDate | null) => void', description: 'День под курсором сменился. `null` — курсор ушёл из сетки.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'day', type: '{ cell: CalendarCell, selected: boolean }', description: 'Содержимое ячейки дня. Число рисует потребитель.' },
        { name: 'header', type: '{ title: string, goToPeriod: (delta: number) => void }', description: 'Своя шапка вместо заголовка и стрелок.' },
        { name: 'weekday', type: '{ label: string, full: string, isoWeekday: IsoWeekday }', description: 'Ячейка шапки недели. `isoWeekday` — номер дня по ISO, по нему отличают выходные, не гадая, с какого дня начата неделя в локали.' },
        { name: 'footer', type: '—', description: 'Подвал панели: кнопки «сегодня», «очистить».' },
      ],
    },
    {
      key: 'expose',
      title: 'Expose',
      origin: 'manual',
      items: [
        { name: 'focus', type: '() => void', description: 'Фокус на текущую остановку `Tab`.' },
        { name: 'goToPeriod', type: '(delta: number) => void', description: 'Листание относительно показываемого периода: месяц, год или десятилетие.' },
        { name: 'focusDate', type: '(date: PlainDate) => void', description: 'Перевести показ на месяц с этой датой и поставить на неё фокус.' },
      ],
    },
  ]
}

/** Метка относительного времени: показ, а не выбор — и поверхность здесь другая. */
function durationApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'value', type: 'number | Date | readonly [Date, Date] | null', description: 'Число — секунды, пара дат — промежуток между ними, одна дата — время до «сейчас»: такая метка живая.' },
        { name: 'base', type: 'Date', description: 'С чем сравнивать вместо «сейчас» — для формы с одной датой. Задан — часы не читаются вовсе.' },
        { name: 'live', type: 'boolean', default: 'true', description: 'Обновляться живьём. Такт выбирается по младшей показанной единице.' },
        { name: 'maxUnits', type: 'number', default: '2', description: 'Потолок числа единиц, а не квота: ровно два часа — это «2 ч», а не «2 ч 0 мин».' },
        { name: 'largestUnit', type: `'day' | 'hour' | 'minute' | 'second'`, default: `'day'`, description: 'Крупнее не дробить: остаток копится в этой единице.' },
        { name: 'smallestUnit', type: `'day' | 'hour' | 'minute' | 'second'`, default: `'second'`, description: 'Мельче не спускаться.' },
        { name: 'width', type: `'long' | 'short' | 'narrow'`, default: `'short'`, description: '«2 часа 30 минут» против «2 ч 30 мин».' },
        { name: 'locale', type: 'string', description: 'Локаль показа. Не задана — из адаптера i18n приложения.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'default', type: '{ text: string, datetime: string, seconds: number }', description: 'Своя разметка вместо текста: значения те же, что компонент рисует сам.' },
      ],
    },
  ]
}

function relativeTimeApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'value', type: 'Date | T | null', description: 'Момент, о котором речь. Пустое значение рисует пустую метку.' },
        { name: 'valueAdapter', type: `'date' | 'isoDate' | 'isoDateTime' | 'timestamp' | GrChronoAdapter<T>`, default: `'date'`, description: 'Как значение приходит от потребителя. Тот же контракт, что у пикеров.' },
        { name: 'base', type: 'Date', description: 'С чем сравнивать вместо «сейчас». Задан — часы не читаются вовсе: ни таймера, ни расхождения серверного рендера с клиентским.' },
        { name: 'live', type: 'boolean', default: 'true', description: 'Обновляться живьём. Такт компонент выбирает сам по текущей единице: секунды пересчитываются часто, месяцы редко.' },
        { name: 'cutoff', type: 'number', default: '0', description: 'Начиная со скольких дней показывать обычную дату вместо относительной. `0` — никогда.' },
        { name: 'format', type: 'Intl.DateTimeFormatOptions', default: `{ dateStyle: 'long' }`, description: 'Вид абсолютной даты — её же показывает подсказка `title`.' },
        { name: 'width', type: `'long' | 'short' | 'narrow'`, default: `'long'`, description: '«3 месяца назад» против «3 мес. назад».' },
        { name: 'numeric', type: `'auto' | 'always'`, default: `'auto'`, description: '`auto` даёт «вчера», `always` — «1 день назад».' },
        { name: 'locale', type: 'string', description: 'Локаль показа. Не задана — из адаптера i18n приложения.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'default', type: '{ text: string, absolute: string, datetime: string }', description: 'Своя разметка вместо текста: значения те же, что компонент рисует сам.' },
      ],
    },
  ]
}

/** Пропы пикера: сетка плюс всё, что относится к полю. */
function datePickerApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'mode', type: `'day' | 'month' | 'year'`, default: `'day'`, description: 'Что выбирается. Режим меняет и панель, и вид значения в поле.' },
        { name: 'modelValue', type: 'Date | null | T', default: 'null', description: '`v-model`. Тип задаёт `valueAdapter`, а не строковый проп: у `isoDate` модель — `string`.' },
        { name: 'valueAdapter', type: `'date' | 'isoDate' | 'isoDateTime' | 'timestamp' | GrChronoAdapter<T>`, default: `'date'`, description: 'Как значение уходит наружу и приходит обратно. Свой адаптер — пара `parse`/`serialize`.' },
        { name: 'min', type: 'Date', description: 'Нижняя граница выбора.' },
        { name: 'max', type: 'Date', description: 'Верхняя граница выбора.' },
        { name: 'disabledDates', type: 'readonly Date[] | ((date: Date) => boolean)', description: 'Запрещённые даты — в `Date`, а не во внутренних кортежах.' },
        { name: 'format', type: 'Intl.DateTimeFormatOptions', default: `{ dateStyle: 'medium' }`, description: 'Вид значения в поле — опциями `Intl`, а не строкой-паттерном: паттерн не знает порядка частей в чужой локали.' },
        { name: 'placeholder', type: 'string', description: 'Плейсхолдер пустого поля. У редактируемого по умолчанию — подсказка формата локали.' },
        { name: 'editable', type: 'boolean', default: 'false', description: 'Значение можно набрать руками. Порядок частей и разделитель — из локали; в режимах периода не включается.' },
        { name: 'applyOnBlur', type: 'boolean', default: 'true', description: 'Разобранный текст уходит наружу на уходе фокуса, а не только по `Enter`.' },
        { name: 'clearable', type: 'boolean', default: 'false', description: 'Кнопка очистки. Не задан — из `GrConfigProvider`.' },
        { name: 'open', type: 'boolean', description: 'Контролируемое состояние панели (`v-model:open`).' },
        { name: 'inline', type: 'boolean', default: 'false', description: 'Панель рисуется на месте: ни поля, ни поповера. Модель, адаптер и `name` остаются пикеровскими — этим `inline` и отличается от голого `GrCalendar`.' },
        { name: 'placement', type: 'UseFloatingPlacement', default: `'bottom-start'`, description: 'Сторона раскрытия панели.' },
        { name: 'teleportTo', type: 'string | HTMLElement', description: 'Точка монтирования панели. По умолчанию — общий портал оверлеев.' },
        { name: 'id', type: 'string', description: 'Собственный `id` поля. Не задан — берётся из `GrFormField`.' },
        { name: 'name', type: 'string', description: 'Имя для нативной формы: сериализованное значение уходит скрытым полем.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Размер поля и панели. Не задан — из `GrConfigProvider`.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Панель не открывается.' },
        { name: 'readonly', type: 'boolean', default: 'false', description: 'Панель открывается, выбор не меняется.' },
        { name: 'invalid', type: 'boolean', default: 'false', description: 'Состояние ошибки. Складывается по «или» с вердиктом `GrFormField`.' },
        { name: 'required', type: 'boolean', default: 'false', description: 'Обязательное поле.' },
        { name: 'loading', type: 'boolean', default: 'false', description: 'Спиннер в поле и `aria-busy`.' },
        { name: 'ariaLabel', type: 'string', description: 'Доступное имя вне `GrFormField`.' },
        { name: '…GrCalendar', type: 'see GrCalendar', description: '`weekStart`, `showWeekNumbers`, `today`, `locale` уходят в сетку как есть.' },
      ],
    },
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'update:modelValue', type: '(value: T | null) => void', description: 'Значение выбрано или очищено.' },
        { name: 'change', type: '(value: T | null) => void', description: 'Синоним для не-`v-model` сценариев.' },
        { name: 'update:open', type: '(value: boolean) => void', description: 'Панель открылась или закрылась.' },
        { name: 'clear', type: '() => void', description: 'Нажата кнопка очистки.' },
        { name: 'focus', type: '(event: FocusEvent) => void', description: 'Фокус на поле.' },
        { name: 'blur', type: '(event: FocusEvent) => void', description: 'Фокус ушёл с поля.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'day', type: '{ cell: CalendarCell, selected: boolean }', description: 'Пробрасывается в `GrCalendar`.' },
        { name: 'header', type: '{ title: string, goToPeriod: (delta: number) => void }', description: 'Пробрасывается в `GrCalendar`.' },
        { name: 'weekday', type: '{ label: string, full: string, isoWeekday: IsoWeekday }', description: 'Пробрасывается в `GrCalendar`.' },
        { name: 'footer', type: '—', description: 'Пробрасывается в `GrCalendar`.' },
      ],
    },
    {
      key: 'expose',
      title: 'Expose',
      origin: 'manual',
      items: [
        { name: 'focus', type: '() => void', description: 'Фокус на поле.' },
        { name: 'blur', type: '() => void', description: 'Снять фокус с поля.' },
        { name: 'open', type: '() => void', description: 'Открыть панель и увести фокус в сетку.' },
        { name: 'close', type: '() => void', description: 'Закрыть панель.' },
      ],
    },
  ]
}

/**
 * Пропы оболочки — поля и панели. Одинаковы у всех четырёх пикеров, потому что
 * в коде их держит один композабл (`usePickerShell`); повторять их таблицей
 * четыре раза значит гарантированно разъехаться.
 */
function shellPropItems(): ShowcaseApiSectionMeta['items'] {
  return [
    { name: 'placeholder', type: 'string', description: 'Плейсхолдер пустого поля.' },
    { name: 'clearable', type: 'boolean', default: 'false', description: 'Кнопка очистки. Не задан — из `GrConfigProvider`.' },
    { name: 'open', type: 'boolean', description: 'Контролируемое состояние панели (`v-model:open`).' },
    { name: 'inline', type: 'boolean', default: 'false', description: 'Панель рисуется на месте: ни поля, ни поповера. Модель, адаптер и `name` остаются пикеровскими.' },
    { name: 'placement', type: 'UseFloatingPlacement', default: `'bottom-start'`, description: 'Сторона раскрытия панели.' },
    { name: 'teleportTo', type: 'string | HTMLElement', description: 'Точка монтирования панели. По умолчанию — общий портал оверлеев.' },
    { name: 'id', type: 'string', description: 'Собственный `id` поля. Не задан — берётся из `GrFormField`.' },
    { name: 'name', type: 'string', description: 'Имя для нативной формы: сериализованное значение уходит скрытым полем.' },
    { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Размер поля и панели. Не задан — из `GrConfigProvider`.' },
    { name: 'locale', type: 'string', description: 'Локаль показа. Не задана — из адаптера i18n приложения.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Панель не открывается.' },
    { name: 'readonly', type: 'boolean', default: 'false', description: 'Панель открывается, выбор не меняется.' },
    { name: 'invalid', type: 'boolean', default: 'false', description: 'Состояние ошибки. Складывается по «или» с вердиктом `GrFormField`.' },
    { name: 'required', type: 'boolean', default: 'false', description: 'Обязательное поле.' },
    { name: 'loading', type: 'boolean', default: 'false', description: 'Спиннер в поле и `aria-busy`.' },
    { name: 'ariaLabel', type: 'string', description: 'Доступное имя вне `GrFormField`.' },
  ]
}

/** События формного контрола: одинаковы у всех пикеров. */
function pickerEventItems(valueType: string): ShowcaseApiSectionMeta['items'] {
  return [
    { name: 'update:modelValue', type: `(value: ${valueType}) => void`, description: 'Значение выбрано или очищено.' },
    { name: 'change', type: `(value: ${valueType}) => void`, description: 'Синоним для не-`v-model` сценариев.' },
    { name: 'update:open', type: '(value: boolean) => void', description: 'Панель открылась или закрылась.' },
    { name: 'clear', type: '() => void', description: 'Нажата кнопка очистки.' },
    { name: 'focus', type: '(event: FocusEvent) => void', description: 'Фокус на поле.' },
    { name: 'blur', type: '(event: FocusEvent) => void', description: 'Фокус ушёл с поля.' },
  ]
}

function pickerExposeSection(): ShowcaseApiSectionMeta {
  return {
    key: 'expose',
    title: 'Expose',
    origin: 'manual',
    items: [
      { name: 'focus', type: '() => void', description: 'Фокус на поле.' },
      { name: 'blur', type: '() => void', description: 'Снять фокус с поля.' },
      { name: 'open', type: '() => void', description: 'Открыть панель и увести фокус внутрь неё.' },
      { name: 'close', type: '() => void', description: 'Закрыть панель.' },
    ],
  }
}

/** Колонки времени: `GrTimePicker` и `GrDateTimePicker` делят их целиком. */
function timePropItems(): ShowcaseApiSectionMeta['items'] {
  return [
    { name: 'minuteStep', type: 'number', default: '1', description: 'Шаг колонки минут в минутах.' },
    { name: 'secondStep', type: 'number', default: '1', description: 'Шаг колонки секунд в секундах.' },
    { name: 'enableSeconds', type: 'boolean', default: 'false', description: 'Третья колонка и секунды в показе.' },
    { name: 'use12Hours', type: 'boolean', description: '12-часовой вид с колонкой AM/PM. Не задан — из локали через `Intl`.' },
    { name: 'today', type: 'Date', description: 'Дата, к которой привязывается время, когда значения ещё нет.' },
  ]
}

function timePickerApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'modelValue', type: 'Date | null | T', default: 'null', description: '`v-model`. Дата значения сохраняется — меняется только время.' },
        { name: 'valueAdapter', type: `'date' | 'isoDate' | 'isoDateTime' | 'timestamp' | GrChronoAdapter<T>`, default: `'date'`, description: 'Как значение уходит наружу и приходит обратно.' },
        { name: 'min', type: 'Date', description: 'Нижняя граница. Учитывается только время суток.' },
        { name: 'max', type: 'Date', description: 'Верхняя граница. Учитывается только время суток.' },
        ...timePropItems(),
        { name: 'format', type: 'Intl.DateTimeFormatOptions', description: 'Вид значения в поле. По умолчанию собирается из `use12Hours` и `enableSeconds`.' },
        ...shellPropItems(),
      ],
    },
    { key: 'events', title: 'Events', origin: 'manual', items: pickerEventItems('T | null') },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'footer', type: '—', description: 'Подвал панели под колонками.' },
      ],
    },
    pickerExposeSection(),
  ]
}

function dateTimePickerApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'modelValue', type: 'Date | null | T', default: 'null', description: '`v-model`. Смена дня сохраняет время, смена времени сохраняет день.' },
        { name: 'valueAdapter', type: `'date' | 'isoDate' | 'isoDateTime' | 'timestamp' | GrChronoAdapter<T>`, default: `'date'`, description: 'Как значение уходит наружу и приходит обратно.' },
        { name: 'autoApply', type: 'boolean', default: 'true', description: 'Каждый шаг уходит наружу сразу. `false` — панель правит черновик, а модель меняется кнопкой подтверждения.' },
        { name: 'min', type: 'Date', description: 'Нижняя граница. Время учитывается только внутри граничного дня.' },
        { name: 'max', type: 'Date', description: 'Верхняя граница.' },
        { name: 'disabledDates', type: 'readonly Date[] | ((date: Date) => boolean)', description: 'Запрещённые даты — в `Date`, а не во внутренних кортежах.' },
        { name: 'weekStart', type: '1 | 2 | 3 | 4 | 5 | 6 | 7', description: 'Первый день недели по ISO. Не задан — из локали.' },
        { name: 'showWeekNumbers', type: 'boolean', default: 'false', description: 'Колонка с номерами недель.' },
        ...timePropItems(),
        { name: 'format', type: 'Intl.DateTimeFormatOptions', description: 'Вид значения в поле. По умолчанию — дата и время через запятую.' },
        ...shellPropItems(),
      ],
    },
    { key: 'events', title: 'Events', origin: 'manual', items: pickerEventItems('T | null') },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'day', type: '{ cell: CalendarCell, selected: boolean }', description: 'Пробрасывается в `GrCalendar`.' },
        { name: 'header', type: '{ title: string, goToPeriod: (delta: number) => void }', description: 'Пробрасывается в `GrCalendar`.' },
        { name: 'weekday', type: '{ label: string, full: string, isoWeekday: IsoWeekday }', description: 'Пробрасывается в `GrCalendar`.' },
        { name: 'footer', type: '{ apply: () => void, cancel: () => void }', description: 'Свой подвал вместо кнопок подтверждения.' },
      ],
    },
    pickerExposeSection(),
  ]
}

function dateRangePickerApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'modelValue', type: 'readonly [T, T] | null', default: 'null', description: '`v-model`. Обе границы или ничего: полупустой диапазон значением не считается.' },
        { name: 'valueAdapter', type: `'date' | 'isoDate' | 'isoDateTime' | 'timestamp' | GrChronoAdapter<T>`, default: `'date'`, description: 'Применяется к каждой границе отдельно, поэтому модель — пара.' },
        { name: 'min', type: 'Date', description: 'Нижняя граница выбора.' },
        { name: 'max', type: 'Date', description: 'Верхняя граница выбора.' },
        { name: 'minRange', type: 'number', description: 'Наименьшая длина периода в днях, считая обе границы.' },
        { name: 'maxRange', type: 'number', description: 'Наибольшая длина периода в днях, считая обе границы.' },
        { name: 'disabledDates', type: 'readonly Date[] | ((date: Date) => boolean)', description: 'Запрещённые даты — в `Date`.' },
        { name: 'weekStart', type: '1 | 2 | 3 | 4 | 5 | 6 | 7', description: 'Первый день недели по ISO. Не задан — из локали.' },
        { name: 'showWeekNumbers', type: 'boolean', default: 'false', description: 'Колонка с номерами недель.' },
        { name: 'today', type: 'Date', description: 'Что считать сегодняшним днём.' },
        { name: 'format', type: 'Intl.DateTimeFormatOptions', default: `{ dateStyle: 'medium' }`, description: 'Вид границ в поле.' },
        { name: 'separator', type: 'string', default: `' — '`, description: 'Разделитель границ в поле.' },
        ...shellPropItems(),
      ],
    },
    { key: 'events', title: 'Events', origin: 'manual', items: pickerEventItems('readonly [T, T] | null') },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'day', type: '{ cell: CalendarCell, selected: boolean }', description: 'Пробрасывается в `GrCalendar`.' },
        { name: 'header', type: '{ title: string, goToPeriod: (delta: number) => void }', description: 'Пробрасывается в `GrCalendar`.' },
        { name: 'weekday', type: '{ label: string, full: string, isoWeekday: IsoWeekday }', description: 'Пробрасывается в `GrCalendar`.' },
        { name: 'footer', type: '—', description: 'Пробрасывается в `GrCalendar`.' },
      ],
    },
    pickerExposeSection(),
  ]
}


/** Публичная поверхность сетки виджетов. */
function dashboardApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'layout', type: 'GrDashboardResponsiveLayout', description: '`v-model:layout` — раскладка на каждый брейкпоинт. Недостающий выводится из ближайшего более широкого.' },
        { name: 'cols', type: 'Record<string, number> | number', default: '{ lg: 12, md: 10, sm: 6, xs: 2 }', description: 'Число колонок по брейкпоинтам либо одно на всё.' },
        { name: 'breakpoints', type: 'Record<string, number>', default: '{ lg: 1200, md: 996, sm: 768, xs: 480 }', description: 'Пороги ширины контейнера. Нулевая ширина брейкпоинт не переключает: скрытая вкладка — это «не отрисовано», а не «узкий экран».' },
        { name: 'initialBreakpoint', type: 'string', default: `'lg'`, description: 'Брейкпоинт первого рендера. Ширины контейнера на сервере нет, и от него идёт серверная раскладка.' },
        { name: 'rowHeight / gap', type: 'number · number', default: '64 · 12', description: 'Высота строки и зазор в пикселях. Настраиваются через `GrConfigProvider`.' },
        { name: 'mode', type: `'view' | 'edit'`, default: `'view'`, description: 'В режиме просмотра ручек нет вовсе — не скрыты, а не отрисованы.' },
        { name: 'draggable / resizable', type: 'boolean · boolean', default: 'true · true', description: 'Что разрешено в режиме редактирования.' },
        { name: 'compact', type: `'vertical' | 'horizontal' | 'both' | 'none'`, default: `'vertical'`, description: 'Куда тянет уплотнение: вверх, влево, в обе стороны или никуда. Сдвинуть виджет в пустоту по оси уплотнения нельзя — он уедет обратно.' },
        { name: 'preventCollision', type: 'boolean', default: 'false', description: 'Столкновение отменяет перемещение целиком вместо того, чтобы толкать соседей.' },
        { name: 'lazy', type: 'boolean', default: 'false', description: 'Содержимое виджета монтируется по попаданию в окно. Выключает серверный рендер содержимого — см. `docs/ssr.md` пакета.' },
        { name: 'droppable', type: 'boolean', default: 'true', description: 'Сетка принимает виджеты, перетаскиваемые из каталога. Работает только в `mode="edit"`; нужен там, где сеток на странице несколько, а принимать должна одна.' },
        { name: 'ariaLabel', type: 'string', description: 'Имя сетки для скринридера. Не задано — берётся из локали.' },
      ],
    },
    {
      key: 'emits',
      title: 'Emits',
      origin: 'manual',
      items: [
        { name: 'update:layout', type: '(value: GrDashboardResponsiveLayout) => void', description: 'Раскладка изменилась: перенос, растягивание или отмена.' },
        { name: 'layoutChange', type: '(value: GrDashboardLayout, breakpoint: string) => void', description: 'То же, но раскладкой текущего брейкпоинта.' },
        { name: 'itemMove / itemResize', type: '(id, from, to) => void', description: 'Что именно и куда переехало — до и после.' },
        { name: 'breakpointChange', type: '(breakpoint: string, cols: number) => void', description: 'Сетка перешла на другой брейкпоинт.' },
        { name: 'itemDrop', type: '(event: GrDashboardDropEvent) => void', description: 'В сетку бросили виджет из каталога. В событии — что несли, ячейка, брейкпоинт и опции раскладки: с ними `addItem` повторит ровно то место, которое показывала подложка. Кладёт приложение.' },
        { name: 'itemSettings', type: '(id: string) => void', description: 'Нажата встроенная кнопка настроек у виджета. Подписка одна на сетку, а не по одной на виджет.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'default', type: '—', description: 'Виджеты — `GrDashboardItem`.' },
        { name: 'empty', type: '—', description: 'Пустая сетка. По умолчанию объясняет себя строкой из локали.' },
      ],
    },
  ]
}

/** Публичная поверхность виджета. */
function dashboardItemApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'itemId', type: 'string', description: 'Связывает разметку с записью раскладки. Обязателен.' },
        { name: 'title', type: 'string', description: 'Заголовок виджета. Он же — имя в ручках и в объявлениях.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, default: `'md'`, description: 'Плотность шапки и кегль заголовка — **не** размер в сетке: тот задаётся `w` и `h`.' },
        { name: 'padding', type: `'none' | 'xs' | 'sm' | 'md' | 'lg'`, default: 'от `size`', description: 'Отступы содержимого. `none` отдаёт виджет содержимому целиком, край в край, — то, что нужно таблице. Подвал этому не подчиняется: он служебная полоса.' },
        { name: 'overflow', type: `'auto' | 'hidden'`, default: `'auto'`, description: '`hidden` снимает и полосу прокрутки, и остановку `Tab` у тела: в таб-порядок оно встаёт по факту переполнения, а непрокручиваемому телу это ни к чему.' },
        { name: 'minW / minH / maxW / maxH', type: 'number', description: 'Границы размера. Раскладка их может не содержать — знает их виджет.' },
        { name: 'draggable / resizable', type: 'boolean · boolean', default: 'правило сетки', description: 'Сужают общее правило для одного виджета: `:resizable="false"` убирает уголок растягивания, оставляя перенос, `:draggable="false"` — наоборот. Запрет проверяет сама сетка, а не только прячет ручку.' },
        { name: 'static', type: 'boolean', default: 'false', description: 'Не двигается сам и не двигается соседями; перемещение, упёршееся в него, отменяется. Сильнее `draggable` и `resizable`: те про интерфейс, а `static` про раскладку.' },
        { name: 'showSettings', type: 'boolean', default: 'false', description: 'Кнопка-шестерёнка среди действий режима редактирования. Шапку, в отличие от `#actions`, не включает: иначе вход в режим сдвигал бы содержимое на её высоту.' },
        { name: 'ariaLabel', type: 'string', description: 'Имя виджета, если заголовка нет.' },
      ],
    },
    {
      key: 'emits',
      title: 'Emits',
      origin: 'manual',
      items: [
        { name: 'settings', type: '(id: string) => void', description: 'Нажата кнопка настроек. Сетка пересылает это наружу как `itemSettings` — подписаться можно один раз на всю сетку.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'default', type: '—', description: 'Содержимое виджета.' },
        { name: 'header', type: '—', description: 'Замена заголовка целиком.' },
        { name: 'actions', type: '—', description: 'Продуктовые кнопки в правой части шапки. Видны всегда — и своим наличием включают шапку.' },
        { name: 'editActions', type: '—', description: 'Действия режима редактирования: убрать виджет, открыть настройки. Показываются только в `mode="edit"` — в шапке, если она есть, и в выезжающей панели, если шапки нет.' },
        { name: 'footer', type: '—', description: 'Подвал карточки.' },
        { name: 'skeleton', type: '—', description: 'Что показать до монтирования содержимого при `lazy`.' },
      ],
    },
  ]
}

/** Публичная поверхность окна настроек виджета. */
function dashboardItemSettingsApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'modelValue', type: 'boolean', description: '`v-model` — окно открыто.' },
        { name: 'itemId', type: 'string | null', description: 'Какой виджет настраиваем. `null` — окну нечего читать.' },
        { name: 'title', type: 'string', description: 'Заголовок окна. Не задан — строка локали.' },
        { name: 'size', type: `'sm' | 'md' | 'lg' | 'xl' | 'full'`, default: `'md'`, description: 'Ширина окна: прокидывается в `GrDialog`.' },
        { name: 'hideSize', type: 'boolean', default: 'false', description: 'Убрать встроенный редактор размера: у приложения свои поля и только они.' },
      ],
    },
    {
      key: 'emits',
      title: 'Emits',
      origin: 'manual',
      items: [
        { name: 'update:modelValue', type: '(value: boolean) => void', description: 'Окно открылось или закрылось.' },
        { name: 'apply', type: '(id: string, span: { w: number, h: number }) => void', description: 'Нажали «Применить». Размер к этому моменту уже закоммичен сеткой — приложению остаётся сохранить своё.' },
        { name: 'cancel', type: '(id: string) => void', description: 'Закрыли без применения: кнопка, `Esc`, клик по подложке.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'default', type: '{ item }', description: 'Поля приложения. Идут над размером: продуктовое важнее служебного. `item` не задан, когда окно стоит вне сетки.' },
        { name: 'footer', type: '{ apply, cancel }', description: 'Замена подвала целиком, когда «Отмена / Применить» не подходят.' },
      ],
    },
  ]
}

/** Публичная поверхность каталога виджетов. */
function dashboardPaletteApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'items', type: 'GrDashboardPaletteItem[]', description: 'Каталог: `id`, `title`, `description`, `defaultSize`, границы размера, `disabled`.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, default: `'md'`, description: 'Кегль строк каталога.' },
        { name: 'draggable', type: 'boolean', default: 'true', description: 'Плитку можно перетащить на сетку. Кнопка «Добавить» остаётся при любом значении: она и есть клавиатурный путь. Сетка, не слушающая `itemDrop`, покажет подложку и ничего не сделает.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Гасит весь каталог.' },
        { name: 'ariaLabel', type: 'string', description: 'Имя списка. Не задано — берётся из локали.' },
      ],
    },
    {
      key: 'emits',
      title: 'Emits',
      origin: 'manual',
      items: [
        { name: 'add', type: '(item: GrDashboardPaletteItem) => void', description: 'Виджет выбран кнопкой. Куда его класть, решает приложение — например функцией `addItem` из `./layout`. Про бросок сообщает сетка, а не каталог.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'item', type: '{ item, dragging, transferProps }', description: 'Своя плитка. `transferProps` навешивается на её корень через `v-bind` — без этого перетащить свою разметку нечем.' },
        { name: 'ghost', type: '{ item }', description: 'Что рисуется под курсором во время переноса.' },
        { name: 'empty', type: '—', description: 'Пустой каталог.' },
      ],
    },
  ]
}

/** Публичная поверхность панели управления. */
function dashboardToolbarApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'toolbar-props',
      title: 'GrDashboardToolbar · Props',
      origin: 'manual',
      items: [
        { name: 'mode', type: `'view' | 'edit'`, description: '`v-model:mode`. Не задан — берётся у сетки, если тулбар внутри неё.' },
        { name: 'resettable', type: 'boolean', default: 'false', description: 'Показать кнопку сброса раскладки.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, default: `'md'`, description: 'Размер кнопок.' },
        { name: 'disabled', type: 'boolean', default: 'false', description: 'Гасит обе кнопки.' },
      ],
    },
    {
      key: 'toolbar-emits',
      title: 'GrDashboardToolbar · Emits',
      origin: 'manual',
      items: [
        { name: 'update:mode', type: `(value: 'view' | 'edit') => void`, description: 'Режим переключён.' },
        { name: 'reset', type: '() => void', description: 'Нажат сброс. Что считать исходной раскладкой, решает приложение.' },
      ],
    },
    {
      key: 'toolbar-slots',
      title: 'GrDashboardToolbar · Slots',
      origin: 'manual',
      items: [
        { name: 'start', type: '—', description: 'Левая часть панели: заголовок дашборда, период, фильтр.' },
        { name: 'default', type: '—', description: 'Середина, растягивается по ширине.' },
        { name: 'end', type: '—', description: 'Правая часть, после кнопок режима и сброса.' },
      ],
    },
  ]
}

export const companionPackages: CompanionPackage[] = [
  {
    id: 'granularity-charts',
    npmName: '@feugene/granularity-charts',
    label: 'Charts',
    version: chartsPkg.version,
    description: 'Графики без чужой библиотеки: свой SVG, ноль зависимостей, рисунок собирается токенами темы. Переключение light/dark ничего не пересоздаёт — цвет серии это роль `--gr-chart-*`, а не палитра вендора.',
    dependencies: [],
    components: [
      {
        name: 'GrChartArea',
        slug: 'gr-chart-area',
        title: 'GrChartArea',
        summary: 'Тот же ряд, что у линии, но с заливкой до базовой линии — и складываемый в стек. Целое и вклад каждой части в него одним рисунком.',
        importPath: '@feugene/granularity-charts/components/GrChartArea',
        examples: [
          {
            id: 'charts-area-basic',
            title: 'Volume, not just level',
            description: 'Площадь берут там, где важен не только уровень, но и объём: «сколько всего набежало». Заливка гаснет к базовой линии — сплошная плашка утяжелила бы низ графика, где смотреть не на что.',
            previewKey: 'extra-charts-area-basic',
            note: 'Линия и заливка красятся ролями темы независимо: `color` и `fillColor` у серии. Роль, а не hex, — потому что при переключении light/dark значение меняет себя само, без пересоздания графика.',
          },
          {
            id: 'charts-area-stacked',
            title: 'Stack or overlay',
            description: 'Два режима отвечают на разные вопросы. Стек показывает целое и вклад каждого канала: верхний край полос — выручка компании. Наложение показывает каналы сами по себе — на стеке их не сравнить, второй ряд едет по горбам первого.',
            previewKey: 'extra-charts-area-stacked',
            note: 'Тултип и таблица в обоих режимах говорят «партнёры — 190», а не «партнёры — 650, потому что снизу лежит розница».',
          },
          {
            id: 'charts-area-share',
            title: 'Share over time',
            description: 'Доля во времени — типичная задача именно для площадей: лента показывает, как менялось распределение, когда абсолютные числа растут у всех сразу и потому ничего не объясняют.',
            previewKey: 'extra-charts-area-share',
            note: 'Нормируется рисунок, а не данные: тултип и таблица под графиком по-прежнему называют абсолютные величины. Заливка при ста процентах плотная — ленты стоят встык, и градиент внутри каждой размыл бы границу между ними.',
          },
          {
            id: 'charts-area-zero',
            title: 'Above and below zero',
            description: 'Базовая линия — ноль, а не низ холста. Заливай мы всегда до нижнего края, убыток в минус сто нарисовался бы той же высотой, что и прибыль в плюс сто, только чуть ниже.',
            previewKey: 'extra-charts-area-zero',
          },
        ],
        apiSections: chartAreaApiSections(),
      },
      {
        name: 'GrChartBar',
        slug: 'gr-chart-bar',
        title: 'GrChartBar',
        summary: 'Величины по категориям — рядом, стопкой или долями до ста процентов. Ось всегда от нуля: высота полосы это и есть величина.',
        importPath: '@feugene/granularity-charts/components/GrChartBar',
        examples: [
          {
            id: 'charts-bar-basic',
            title: 'How much, not where to',
            description: 'Столбцы отвечают на вопрос «сколько», а не «куда движется»: величину читают высотой полосы. Поэтому ось у них всегда от нуля — обрежь её, и разница в три процента нарисуется разницей в три раза.',
            previewKey: 'extra-charts-bar-basic',
            note: 'Вертикали под точкой у столбцов нет: она прошла бы сквозь полосу и читалась бы как её граница. Выделение работает наоборот — активная категория остаётся в полном цвете, соседние гаснут. Переключатель выключает это одним пропом.',
          },
          {
            id: 'charts-bar-stacked',
            title: 'Side by side, stacked, 100%',
            description: 'Три режима одного набора — три разных вопроса. Рядом сравнивают сегменты между собой, стопка показывает целое и вклад, сто процентов — только структуру, когда абсолютные числа растут у всех сразу и потому ничего не объясняют.',
            previewKey: 'extra-charts-bar-stacked',
            note: 'Скругляется только верхний сегмент столбца: скругли каждый, и стопка распадётся на отдельные пилюли вместо одного целого.',
          },
          {
            id: 'charts-bar-horizontal',
            title: 'Long labels go sideways',
            description: 'Названия отделов по нижней оси встают наклонным хвостом и обрезаются. Положи полосы вбок — и подпись читается строкой, а категорий помещается втрое больше: горизонталь тратит высоту страницы, а её всегда можно прокрутить.',
            previewKey: 'extra-charts-bar-horizontal',
            note: 'Оси называются по данным, а не по экрану: порог задан как `axis: \'y\'` в обеих раскладках — это всегда ось значений, и при горизонтали она рисует вертикальный пунктир. Клавиатура следует за глазами: стрелки вниз и вверх идут по отделам, вправо и влево меняют читаемую серию.',
          },
          {
            id: 'charts-bar-zero',
            title: 'Below the axis',
            description: 'Полоса вниз от нуля — это минус, а не «столбец пониже». Скругление переезжает на другой конец, и столбец остаётся приклеенным к оси, а не висит над ней.',
            previewKey: 'extra-charts-bar-zero',
          },
        ],
        apiSections: chartBarApiSections(),
      },
      {
        name: 'GrChartLine',
        slug: 'gr-chart-line',
        title: 'GrChartLine',
        summary: 'Ряд во времени, по числовой оси или по категориям: оси, сетка, легенда-переключатель, тултип от координаты курсора, клавиатура по точкам и скрытая таблица данных для скринридера.',
        importPath: '@feugene/granularity-charts/components/GrChartLine',
        examples: [
          {
            id: 'charts-line-basic',
            title: 'Time series',
            description: 'Тип оси выводится из данных: первый `x` — `Date`, значит шкала времени, а деления шагаются календарём, а не числом миллисекунд.',
            previewKey: 'extra-charts-line-basic',
            note: 'Цвет серии — роль темы (`color: \'var(--gr-success)\'`), а не hex: при переключении light/dark значение меняет себя само. У графика одна остановка `Tab`, дальше стрелки по точкам, `Home`/`End` по краям, `Esc` снимает выбор.',
          },
          {
            id: 'charts-line-series',
            title: 'Six series on five colours',
            description: 'Палитра ядра — пять ролей, поэтому шестая серия повторяет цвет первой и отличается формой точки. Цвет никогда не единственный различитель.',
            previewKey: 'extra-charts-line-series',
            note: 'Клик по пункту легенды скрывает серию и объявляет результат в живом регионе.',
          },
          {
            id: 'charts-line-states',
            title: 'Gaps, loading, empty',
            description: 'Три состояния одного графика глазами пользователя: данные, загрузка и пустой период. Ряд — почасовая температура в серверной, где датчик два часа был отключён на обслуживание.',
            previewKey: 'extra-charts-line-states',
            note: 'Переключатель `gaps` решает, чем закрыть провал визуально; на данные он не влияет — в таблице у пропущенных часов по-прежнему «нет значения», а не ноль.',
          },
          {
            id: 'charts-line-references',
            title: 'Thresholds are not a series',
            description: 'Порог, нарисованный серией из константы, врёт трижды: попадает в легенду равноправным рядом, растягивает домен оси и уезжает в скрытую таблицу как данные. Опора не делает ничего из этого.',
            previewKey: 'extra-charts-line-references',
            note: 'Домен по умолчанию опора не растягивает, и переключатель показывает почему: договорный потолок `0.12` втрое выше любого значения ряда, и вместить его в ось значит отдать порогу четыре пятых холста, а данным — оставшуюся пятую. Опора за краем не рисуется — прижать её к рамке значило бы показать порог там, где его нет, — но остаётся в описании графика и в примечании таблицы: «порог не виден» и «порога нет» это разные утверждения.',
          },
          {
            id: 'charts-line-decimate',
            title: 'Ten thousand points, hundreds of vertices',
            description: 'Экран не покажет больше двух вершин на пиксель, поэтому длинный ряд прореживается по LTTB прямо в пути. Счётчик читает ту самую строку, которую браузер получает на отрисовку: форма и одиночный всплеск остаются, длина падает на порядок.',
            previewKey: 'extra-charts-line-decimate',
            note: 'Сокращается рисунок, а не данные: `End` ставит курсор на десятитысячную точку в обоих режимах, тултип называет исходное значение, скрытая таблица печатает все строки. На шумном участке активная марка может отойти от линии — линия здесь сводка, а марка и тултип правда.',
          },
          {
            id: 'charts-line-canvas',
            title: 'Same picture, cheaper frame',
            description: 'Двадцать рядов одним переключателем рисуются то в SVG, то на холсте. Картинки обязаны совпадать: второй рендерер заведён ради цены кадра, а не ради другого вида.',
            previewKey: 'extra-charts-line-canvas',
            note: 'Порог считается в **нарисованных вершинах**, а не в точках: прореживание режет каждый ряд до предела экрана по отдельности, поэтому один ряд в сто тысяч точек стоит миллисекунды, а двадцать по 2400 — целого кадра. По замеру SVG растёт линейно (~0,8 мс на ряд), холст почти не растёт. Доступность от смены рендерера не меняется вовсе: курсор, клавиатура и скрытая таблица живут на оверлее и на полных рядах, а холст для них `aria-hidden` и не ловит указатель.',
          },
          {
            id: 'charts-line-zoom',
            title: 'Zoom into ten thousand points',
            description: 'Протяжка по холсту и колесо сужают окно по абсциссе. В узком окне мелкая рябь из сплошной штриховки становится различимой формой: бюджет прореживания считается от ширины области, а точек в окне меньше, и на каждую приходится больше вершин.',
            previewKey: 'extra-charts-line-zoom',
            note: 'Окно выбирает **данные**, а не обрезает рисунок: по нему идут курсор, клавиатура, скрытая таблица и размах оси значений. Клавиатура приближения не отключается: union пропа `zoom` перечисляет только жесты указателя, а `+`/`-`, `Shift`+стрелки и `0` работают всегда, когда включён `zoom` — иначе приближение можно было бы собрать недоступным с клавиатуры, просто не дописав строку.',
          },
          {
            id: 'charts-line-dual-axis',
            title: 'Money and counts on one chart',
            description: 'Деньги и штуки одна ось не выдерживает: ряд меньшего порядка схлопывается в линию у нуля, и вопрос «как связаны выручка и движение» приходится рассматривать по двум картинкам.',
            previewKey: 'extra-charts-line-dual-axis',
            note: 'Вторая ось включается пропом `dualAxis`, а не полем в данных: две оси позволяют подогнать любые два ряда под видимую корреляцию, и это должно быть решением автора графика. Делений у осей поровну, чтобы сетка не двоилась, и рисуется она только по левой.',
          },
        ],
        apiSections: chartLineApiSections(),
      },
      {
        name: 'GrChartWaterfall',
        slug: 'gr-chart-waterfall',
        title: 'GrChartWaterfall',
        summary: 'Мост от начала периода к его концу: каждый столбец стоит там, где кончился предыдущий. Отвечает не «сколько пришло и ушло», а «как одно превратилось в другое».',
        importPath: '@feugene/granularity-charts/components/GrChartWaterfall',
        examples: [
          {
            id: 'charts-waterfall-basic',
            title: 'How the month added up',
            description: 'Расходящиеся столбцы отвечают «сколько пришло и сколько ушло». Мост отвечает «как из начала месяца получился конец» — и показывает, сходится ли сумма движений с заявленным остатком.',
            previewKey: 'extra-charts-waterfall-basic',
            note: 'Шаг `kind: \'total\'` объявляет накопление, а не прибавляется к нему: реальные остатки с бэкенда встают в тот же график, и расхождение видно глазом. Соединитель к такому шагу не ведёт — он не продолжает мост.',
          },
          {
            id: 'charts-waterfall-horizontal',
            title: 'Long labels go sideways',
            description: 'Горизонталь берут, когда подписи шагов длиннее ширины категории: под вертикальной осью они налезли бы друг на друга. Оси в этом режиме рисует сам компонент — ось значений рамы вертикальна по построению.',
            previewKey: 'extra-charts-waterfall-horizontal',
            note: 'Нулевой шаг рисуется чертой на уровне накопления, а не пропадает: «движения не было» это факт, а не отсутствие данных.',
          },
        ],
        apiSections: chartWaterfallApiSections(),
      },
      {
        name: 'GrChartBullet',
        slug: 'gr-chart-bullet',
        title: 'GrChartBullet',
        summary: 'Величина, цель и качественные диапазоны в одну строку. Отвечает не «сколько», а «насколько это хорошо и далеко ли до следующей границы».',
        importPath: '@feugene/granularity-charts/components/GrChartBullet',
        examples: [
          {
            id: 'charts-bullet-basic',
            title: 'Metrics you can scan',
            description: 'Число рядом с бейджем `warning` говорит, что плохо, но не говорит, насколько. Bullet Стивена Фью решает ту же задачу в одну строку — и сравнивается по вертикали, когда таких метрик несколько.',
            previewKey: 'extra-charts-bullet-basic',
            note: 'Циферблата в пакете нет намеренно: он тратит много места на мало данных и плохо читается количественно. Роль оверлея здесь `meter`, а `aria-valuetext` читается как «0,031 из 0,05, цель 0,04».',
          },
          {
            id: 'charts-bullet-states',
            title: 'No value, and off the scale',
            description: 'Два крайних случая, о которых обычно забывают: величины нет вовсе и величина вышла за шкалу. Ни то, ни другое нельзя показать нулём или обрезанной полосой — оба варианта нарисовали бы число, которого в данных нет.',
            previewKey: 'extra-charts-bullet-states',
            note: 'Вместе со значением исчезает и роль `meter`: она требует `aria-valuenow`, и оставленная роль дала бы нарушение уровня serious.',
          },
        ],
        apiSections: chartBulletApiSections(),
      },
      {
        name: 'GrChartHeatmap',
        slug: 'gr-chart-heatmap',
        title: 'GrChartHeatmap',
        summary: 'Матрица, где цвет кодирует величину: удержание по когортам, активность по часам и дням. Показывает форму раньше, чем читатель начнёт сравнивать цифры.',
        importPath: '@feugene/granularity-charts/components/GrChartHeatmap',
        examples: [
          {
            id: 'charts-heatmap-cohorts',
            title: 'Retention by cohort',
            description: 'Строки — когорты, колонки — месяц после регистрации. Разреженность здесь не дефект данных, а их природа: у сентябрьской когорты четвёртого месяца ещё не было.',
            previewKey: 'extra-charts-heatmap-cohorts',
            note: '`null` — не ноль и не минимум шкалы: ячейка не заливается, в таблице получает прочерк и в домен не входит. «Месяц ещё не наступил» и «удержание ноль» это разные утверждения. Клавиатура двумерная и не кольцуется ни по одной оси.',
          },
          {
            id: 'charts-heatmap-incidents',
            title: 'Thirty services, eighty days',
            description: 'Матрица такого размера — то, ради чего теплокарта и существует: тот же срез тридцатью линиями превращается в клубок. Здесь сбой виден полосой, и её направление сразу говорит, что случилось.',
            previewKey: 'extra-charts-heatmap-incidents',
            note: 'Вертикальная полоса — упала инфраструктура и задело всех; горизонтальная — сломался один сервис; плавный уход в красное — регрессия, которую замечают поздно. Числа в ячейках гаснут сами: при `showValues: \'auto\'` они появляются, только когда ячейка достаточно широка. Подписи дней прорежены до каждого десятого пустой строкой — пустая строка это отсутствие подписи, а не пустая подпись.',
          },
          {
            id: 'charts-heatmap-scale',
            title: 'Diverging, stepped or smooth',
            description: 'Расходящуюся шкалу берут, когда важно отклонение в обе стороны: недобор и перебор красятся разными ролями вокруг середины. Ступени против непрерывной — вопрос того, читают карту как зоны или как градиент.',
            previewKey: 'extra-charts-heatmap-scale',
            note: 'Шкала нормируется на больший из отступов от середины — так она симметрична по построению, а не по совпадению данных. Контраст подписи в ячейке считается от доли примеси: измерить итоговый цвет без DOM нечем.',
          },
        ],
        apiSections: chartHeatmapApiSections(),
      },
      {
        name: 'GrChartFunnel',
        slug: 'gr-chart-funnel',
        title: 'GrChartFunnel',
        summary: 'Ступени конверсии и потери между ними. Три числа отвечают «сколько дошло», воронка — «где теряем».',
        importPath: '@feugene/granularity-charts/components/GrChartFunnel',
        examples: [
          {
            id: 'charts-funnel-basic',
            title: 'Two shares, two denominators',
            description: 'Доля от первой ступени и доля от предыдущей — разные числа, и обе доступны одновременно. Смешивать их в одной подписи нельзя: «конверсия сорок процентов» без указания знаменателя не значит ничего.',
            previewKey: 'extra-charts-funnel-basic',
            note: 'Проп `labels` выбирает только то, что написано на самой ступени; тултип, скрытая таблица и объявление продолжают называть обе доли.',
          },
          {
            id: 'charts-funnel-shape',
            title: 'A step that grows',
            description: 'Ступень больше предыдущей воронка не выпрямляет: это либо ошибка данных, либо разные когорты, и решать должен читатель. Ширина пропорциональна значению, а не порядку.',
            previewKey: 'extra-charts-funnel-shape',
            note: 'Факт роста попадает в описание графика словами — иначе он существовал бы только для зрячих. Лента и полосы дают одни и те же числа в таблице: форма здесь вопрос вкуса, а не смысла.',
          },
        ],
        apiSections: chartFunnelApiSections(),
      },
      {
        name: 'GrChartPie',
        slug: 'gr-chart-pie',
        title: 'GrChartPie',
        summary: 'Доли одного целого — кругом или кольцом. Попадание курсора угловое, легенда несёт значения и проценты, а скринридер получает таблицу долей вместо ряда по оси.',
        importPath: '@feugene/granularity-charts/components/GrChartPie',
        examples: [
          {
            id: 'charts-pie-basic',
            title: 'Whole and its parts',
            description: 'Кольцо отвечает на два вопроса сразу: сколько всего — числом в середине, и из чего сложилось — долями вокруг. Один проп переключает его в сплошной круг.',
            previewKey: 'extra-charts-pie-basic',
            note: 'Стрелки ходят по долям, выделенная доля гасит соседние: вертикали, которой линейный график показывает точку, у круга нет.',
          },
          {
            id: 'charts-pie-labels',
            title: 'Callout labels',
            description: 'Проценты стоят снаружи на выносках. Внутри доли текст не проходит AA ни на одной из пяти ролей палитры — ни белым, ни тёмным, — а снаружи контраст держит обычная роль фона.',
            previewKey: 'extra-charts-pie-labels',
            note: 'Мелкие доли остаются без подписи по порогу `labelMinShare`: две подписи на трёх процентах наезжают друг на друга.',
          },
          {
            id: 'charts-pie-textures',
            title: 'Beyond five colours',
            description: 'Ролей в палитре пять, а долей бывает больше. Со второго круга палитры к цвету добавляется штриховка — на круге соседние доли стоят вплотную, и один только повтор цвета читается как «это одно и то же».',
            previewKey: 'extra-charts-pie-textures',
            note: 'Свой `color` у доли текстуру отменяет: выбор потребителя сильнее автоматики.',
          },
        ],
        apiSections: chartPieApiSections(),
      },
      {
        name: 'GrChartRadar',
        slug: 'gr-chart-radar',
        title: 'GrChartRadar',
        summary: 'Профиль по нескольким осям и сравнение профилей. Отвечает на вопрос, которого не закрывают ни столбцы, ни круг: не «сколько» и не «из чего», а какой формы.',
        importPath: '@feugene/granularity-charts/components/GrChartRadar',
        examples: [
          {
            id: 'charts-radar-basic',
            title: 'Two profiles at a glance',
            description: 'Столбцы дают те же числа, но не дают формы; круг говорит о долях одного целого, а не о профиле. Два продукта по пяти критериям сравниваются одним взглядом — там, где две таблицы пришлось бы читать.',
            previewKey: 'extra-charts-radar-basic',
            note: 'Стрелки ходят по осям от двенадцати часов по часовой, `↑`/`↓` меняют читаемый ряд. У графика одна остановка `Tab`.',
          },
          {
            id: 'charts-radar-per-axis',
            title: 'Metrics that share nothing',
            description: 'Выручка в миллионах, NPS в баллах и отклик в миллисекундах общей шкалы не имеют. `axis-scale="per-axis"` нормирует каждую спицу своим максимумом — единственный способ показать такой набор. Переключатель показывает, во что превращается та же картинка на общей шкале.',
            previewKey: 'extra-charts-radar-per-axis',
            note: 'Подписи колец при нормировке исчезают намеренно: единственного верного числа для кольца там нет, и максимум уезжает в имя оси. Тултип и таблица по-прежнему показывают исходное значение, а не долю.',
          },
          {
            id: 'charts-radar-gaps',
            title: 'A month without data',
            description: 'Пропуск на радаре — не ноль и не «соединить по прямой». Замкнуть контур через него значит нарисовать ребро, которого нет; залить рваный контур — площадь, которой нет.',
            previewKey: 'extra-charts-radar-gaps',
            note: 'Стрелки проходят по осям с пропуском: значение отсутствует, ось существует.',
          },
          {
            id: 'charts-radar-shape',
            title: 'Twelve axes, three series',
            description: 'Плотный случай: форма сетки, число колец и заливка. На трёх сериях поверх двенадцати осей заливки наслаиваются и прячут друг друга — тогда её выключают, и различителями остаются цвет, форма марки и штриховка контура.',
            previewKey: 'extra-charts-radar-shape',
          },
        ],
        apiSections: chartRadarApiSections(),
      },
      {
        name: 'GrSparkline',
        slug: 'gr-sparkline',
        title: 'GrSparkline',
        summary: 'Линия без рамы — в ячейку таблицы и в карточку показателя. Ничего не замеряет и не держит слушателей, поэтому сотня штук на странице ничего не стоит.',
        importPath: '@feugene/granularity-charts/components/GrSparkline',
        examples: [
          {
            id: 'charts-sparkline-basic',
            title: 'Next to a number',
            description: 'Спарклайн отвечает на один вопрос — куда оно движется. Точное значение даёт число рядом, форму ряда — линия; читается слева направо, правый край это «сейчас».',
            previewKey: 'extra-charts-sparkline-basic',
            note: 'Осей и подписей нет намеренно: с ними линия перестанет читаться боковым зрением за долю секунды, ради которой её и ставят. Концы периода подписывает карточка.',
          },
          {
            id: 'charts-sparkline-table',
            title: 'In table cells',
            description: 'Колонка «динамика» в таблице мониторинга: выбивающаяся строка находится глазом раньше, чем прочитаны числа. Сотня строк стоит ровно сотню коротких `<svg>` — ни замеров, ни слушателей.',
            previewKey: 'extra-charts-sparkline-table',
            note: 'Каждая линия нормирована по своему ряду: сравнивать между строками можно формы, но не уровни — 40 мс и 348 мс займут одинаковую высоту.',
          },
        ],
        apiSections: sparklineApiSections(),
      },
    ],
  },
  {
    id: 'granularity-chrono',
    npmName: '@feugene/granularity-chrono',
    label: 'Chrono',
    // Версия читается из `package.json` пакета: строкой она уже успела
    // разойтись у соседа — в витрине стояла `0.1.0` при `0.1.1` в пакете.
    version: chronoPkg.version,
    description: 'Календарь и выбор даты без сторонних виджетов и без date-библиотеки: своя арифметика на кортежах `{y, m, d}` и `Intl` для всего локале-зависимого. Перевод часов сетку не задевает — понятия «час» в ней просто нет.',
    dependencies: [],
    components: [
      {
        name: 'GrCalendar',
        slug: 'gr-calendar',
        title: 'GrCalendar',
        summary: 'Сетка месяца по паттерну `grid`: полная клавиатура, объявление смены месяца, слот на ячейку дня. Самостоятельный компонент и одновременно начинка пикеров.',
        importPath: '@feugene/granularity-chrono/components/GrCalendar',
        examples: [
          {
            id: 'chrono-calendar-basic',
            title: 'Inline calendar',
            description: 'Календарь без поля: значение — кортеж `{ y, m, d }`, границы задаются `min`/`max`, номера недель включаются пропом.',
            previewKey: 'extra-chrono-calendar-basic',
            note: 'Стрелки ходят по дням и неделям, `PageUp`/`PageDown` листают месяц, `Shift` с ними — год.',
          },
          {
            id: 'chrono-calendar-day-slot',
            title: 'Events on days',
            description: 'Слот `day` отдаёт саму ячейку — число рисует потребитель и дописывает к нему свои метки.',
            previewKey: 'extra-chrono-calendar-day-slot',
          },
          {
            id: 'chrono-calendar-modes',
            title: 'Day, week, month, quarter, year',
            description: 'Один компонент показывает пять режимов: дни, неделю, двенадцать месяцев, четыре квартала и десятилетие. Клавиатура у всех одна.',
            previewKey: 'extra-chrono-calendar-modes',
            note: 'В режимах периода значением становится первое число: месяц — это 1 августа, квартал — 1 июля, год — 1 января. Неделя кладёт своё начало и рисуется **сеткой дней**, а не сеткой периодов: двенадцать недель в три колонки были бы четвертью года без единой подписи месяца — выбирать там нечего. Клик по любому дню выбирает его неделю, подсвечивается вся строка. Первый день недели приходит из локали: у `en-US` неделя начинается с воскресенья. Кварталов четыре, и сетка у них в две колонки — три оставили бы одинокую ячейку.',
          },
        ],
        apiSections: calendarApiSections(),
      },
      {
        name: 'GrDatePicker',
        slug: 'gr-date-picker',
        title: 'GrDatePicker',
        summary: 'Поле с календарём — настоящий форм-контрол: свои `id`/`name`, связка с `GrFormField`, `aria-invalid`, размеры из `GrConfigProvider`. Панель монтируется при первом открытии.',
        importPath: '@feugene/granularity-chrono/components/GrDatePicker',
        examples: [
          {
            id: 'chrono-date-picker-basic',
            title: 'Date field',
            description: 'Одиночный выбор с очисткой. Тип модели задаёт `valueAdapter`, а вид значения — опции `Intl`, а не строка-паттерн.',
            previewKey: 'extra-chrono-date-picker-basic',
          },
          {
            id: 'chrono-date-picker-form',
            title: 'Inside a form',
            description: 'Подпись через `<label for>`, текст ошибки через `aria-describedby`, значение уходит в `FormData` по `name` — сериализованным, а не тем текстом, что видно в поле.',
            previewKey: 'extra-chrono-date-picker-form',
          },
          {
            id: 'chrono-date-picker-modes',
            title: 'Month and year',
            description: 'Режим меняет и панель, и вид значения в поле: подставлять свой `format` для этого не нужно.',
            previewKey: 'extra-chrono-date-picker-modes',
          },
          {
            id: 'chrono-date-picker-multiple',
            title: 'A set of dates, not a range',
            description: 'Расписание занятий: произвольный набор дат в одном поле. Панель не закрывается, клик по выбранной снимает её, а список рядом показывает, что уехало в модель.',
            previewKey: 'extra-chrono-date-picker-multiple',
            note: 'Отличие от `GrDateRangePicker` — в существе: там непрерывный отрезок с двумя краями и правилами длины, здесь множество, где соседство ничего не значит. Клик по выбранной дате её снимает: набор это переключатель, а не накопитель. Порядок в модели всегда по возрастанию — иначе перестановка читалась бы как изменение. Ручной ввод в этом режиме выключен: одна строка, описывающая N дат, это отдельный парсер. Сетка при этом про набор ничего не решает, только рисует его — складывать и сортировать дело пикера.',
          },
          {
            id: 'chrono-date-picker-dialog',
            title: 'Inside a dialog',
            description: 'Панель встаёт в общий стек слоёв поверх окна: Esc закрывает сначала её, и только следующий — само окно.',
            previewKey: 'extra-chrono-date-picker-dialog',
          },
          {
            id: 'chrono-date-picker-typed',
            title: 'Typed by hand',
            description: 'С `editable` дату можно набрать руками: порядок частей, разделитель и подсказка формата берутся из локали, а не из строки-паттерна.',
            previewKey: 'extra-chrono-date-picker-typed',
            note: 'Пока текст не разобрался, модель не трогается: `Enter` или уход фокуса коммитят, мусор откатывается к значению.',
          },
          {
            id: 'chrono-date-picker-inline',
            title: 'Inline panel',
            description: 'Панель на месте, без поля и поповера. Модель, адаптер и `name` остаются пикеровскими — этим `inline` и отличается от голого `GrCalendar`.',
            previewKey: 'extra-chrono-date-picker-inline',
          },
        ],
        apiSections: datePickerApiSections(),
      },
      {
        name: 'GrDateTimePicker',
        slug: 'gr-date-time-picker',
        title: 'GrDateTimePicker',
        summary: 'Сетка и колонки времени в одной панели. Здесь же живёт `autoApply`: выбор многошаговый, и «применить» перестаёт быть тавтологией.',
        importPath: '@feugene/granularity-chrono/components/GrDateTimePicker',
        examples: [
          {
            id: 'chrono-date-time-basic',
            title: 'Date and time',
            description: 'Смена дня сохраняет время, смена времени сохраняет день. Панель не закрывается по первому клику — выбор идёт по очереди.',
            previewKey: 'extra-chrono-date-time-basic',
          },
          {
            id: 'chrono-date-time-confirm',
            title: 'With confirmation',
            description: '`auto-apply="false"`: панель правит черновик, модель меняется кнопкой. Счётчик показывает, что до подтверждения её никто не трогал.',
            previewKey: 'extra-chrono-date-time-confirm',
            note: 'Границы времени действуют только внутри граничного дня: `min` на 12 августа ничего не говорит о 13-м.',
          },
          {
            id: 'chrono-date-time-editable',
            title: 'Typed, not clicked',
            description: '`editable` включает набор с клавиатуры: одна строка задаёт и дату, и время. Два поля рядом — две локали, чтобы было видно, что порядок частей знает не компонент.',
            previewKey: 'extra-chrono-date-time-editable',
            note: 'Разделители разбору безразличны: считаются группы цифр, а не символы между ними. Локали, где время идёт перед датой, разбираются так же. Набранная дата без времени время не сбрасывает — не набранное не меняется. Текст подтверждает сам себя, минуя `auto-apply`: проп управляет панелью, а `Enter` в поле — уже законченное действие. Запрещённая дата не принимается и текстом. Панель идёт за набором: дата целиком подсвечивается в сетке, набранный час — в колонке часов, минуты — в минутах; модель ждёт Enter.',
          },
        ],
        apiSections: dateTimePickerApiSections(),
      },
      {
        name: 'GrTimePicker',
        slug: 'gr-time-picker',
        title: 'GrTimePicker',
        summary: 'Поле со временем и панель из колонок-листбоксов: часы, минуты, по требованию секунды и период. Панель по выбору не закрывается — время набирается за несколько шагов.',
        importPath: '@feugene/granularity-chrono/components/GrTimePicker',
        examples: [
          {
            id: 'chrono-time-basic',
            title: 'Working hours',
            description: 'Шаг минут и границы рабочего дня. Границы учитывают только время суток, а запрет считается по единице: девятый час доступен, если в него попадает хоть одна допустимая минута.',
            previewKey: 'extra-chrono-time-basic',
          },
          {
            id: 'chrono-time-footer',
            title: 'Now, rounded up',
            description: 'Подвал панели раздаёт выбор внутрь: кнопка «сейчас» ставит время на следующую отметку шага и гаснет, когда граница оказывается раньше неё.',
            previewKey: 'extra-chrono-time-footer',
            note: 'Округление вверх, а не к ближайшему: время в пикере почти всегда значит «начиная с этого момента», и округлённое вниз уже прошло. Границы считаются после округления, а не до — при `max` в 14:40 и шаге 15 минут «сейчас» в 14:37 даёт 14:45, то есть за границей, и кнопка обязана погаснуть. Проверка до округления пропустила бы её. Слот получает ту же тройку `select`/`canSelect`/`close`, что и подвал пикеров дат.',
          },
          {
            id: 'chrono-time-twelve',
            title: '12-hour with seconds',
            description: '12/24 приходит из локали, но проп перебивает её; секунды добавляют третью колонку и попадают в показ.',
            previewKey: 'extra-chrono-time-twelve',
          },
        ],
        apiSections: timePickerApiSections(),
      },
      {
        name: 'GrDateRangePicker',
        slug: 'gr-date-range-picker',
        title: 'GrDateRangePicker',
        summary: 'Период двумя кликами с предпросмотром по наведению. Подсветка считается на отрисовке, поэтому движение мыши по сетке её не пересобирает.',
        importPath: '@feugene/granularity-chrono/components/GrDateRangePicker',
        examples: [
          {
            id: 'chrono-range-basic',
            title: 'Date range',
            description: 'Первый клик открывает период, второй закрывает. Границы можно вести и назад — порядок нормализуется.',
            previewKey: 'extra-chrono-range-basic',
            note: 'Форме период уходит двумя полями с одним именем — так их читает `FormData.getAll`.',
          },
          {
            id: 'chrono-range-limits',
            title: 'Length limits',
            description: '`minRange` и `maxRange` считают обе границы. Недопустимая длина не выбирается, но и не сбрасывает начало.',
            previewKey: 'extra-chrono-range-limits',
          },
          {
            id: 'chrono-range-time',
            title: 'A window, not two midnights',
            description: 'Окно обслуживания с точностью до минут: две даты плюс время каждой границы. Панель модели рядом показывает обе целиком.',
            previewKey: 'extra-chrono-range-time',
            note: 'Свежий период получает 00:00 и 23:59 — сутки целиком. Две полуночи выглядели бы симметрично, но «с 1 по 3 августа» по-человечески включает весь третий день, а период до 3-го 00:00 молча отрезал бы почти всё третье: классическая ошибка отчётов. Мастера из четырёх шагов нет намеренно — он завёл бы скрытое состояние «на каком мы шаге»; даты выбираются кликами, время правится в любом порядке. Панель не закрывается на второй дате: выбор на ней не заканчивается. Внутри одного дня порядок краёв держит только время, и переворачивающая правка не применяется.',
          },
          {
            id: 'chrono-range-editable',
            title: 'A period in one line',
            description: '`editable` включает набор периода строкой. Делит её не разделитель, а счёт групп цифр: их поровну на две границы.',
            previewKey: 'extra-chrono-range-editable',
            note: 'Списка разделителей нет намеренно — в канадской локали дата сама пишется через дефис, и такой список развалился бы на ней первой. Обратный порядок нормализуется, как и при кликах. Одна дата отклоняется: достраивать вторую границу значит придумать за пользователя то, чего он не задавал. Недопустимый период не применяется и объявляется — набрано всё правильно, и молчание выглядело бы как потерянный Enter. Панель идёт за набором: первая граница подсвечивается началом периода, вторая закрывает полосу, сетка переходит на месяц набранного.',
          },
          {
            id: 'chrono-range-presets',
            title: 'Quick ranges live inside the panel',
            description: 'Шорткат периода обязан выставить обе границы разом и уважать ограничения длины — то есть знать внутренности пикера. Ряд рядом с полем этого не умеет, поэтому готовые периоды живут в подвале панели.',
            previewKey: 'extra-chrono-range-presets',
            note: 'Период длиннее `maxRange` приходит выключенным, а не молча ничего не делает; то же с датами вне `min`/`max` и с `disabledDates`. Границы можно задать функцией — «последние 7 дней» отсчитываются от сегодняшнего дня, а не от дня, когда объявили проп.',
          },
        ],
        apiSections: dateRangePickerApiSections(),
      },
      {
        name: 'GrRelativeTime',
        slug: 'gr-relative-time',
        title: 'GrRelativeTime',
        summary: '«3 минуты назад» и «через 2 дня» — `<time>` с машинным моментом и живым текстом. Строку строит `Intl`, такт компонент выбирает сам, а таймер в приложении один на всех.',
        importPath: '@feugene/granularity-chrono/components/GrRelativeTime',
        examples: [
          {
            id: 'chrono-relative-scale',
            title: 'From seconds to years',
            description: 'Единица выбирается по разрыву: до суток — по прошедшему времени, дальше — по календарю. Поэтому месяц остаётся месяцем и в феврале, и в июле.',
            previewKey: 'extra-chrono-relative-scale',
            note: 'Момент отсчёта задан `base` — иначе пример показывал бы разное в разные дни.',
          },
          {
            id: 'chrono-relative-live',
            title: 'Live updates',
            description: 'Без `base` текст обновляется сам. Такт зависит от единицы: секунды пересчитываются раз в пять секунд, месяцы — раз в час, а на скрытой вкладке не тикает ничего.',
            previewKey: 'extra-chrono-relative-live',
            note: 'Таймер общий: сто меток с одним тактом — это один `setInterval`, а не сто.',
          },
          {
            id: 'chrono-relative-cutoff',
            title: 'Cutoff to a date',
            description: '`cutoff` переводит старое значение в обычную дату: «347 дней назад» не помогает никому.',
            previewKey: 'extra-chrono-relative-cutoff',
          },
        ],
        apiSections: relativeTimeApiSections(),
      },
      {
        name: 'GrDuration',
        slug: 'gr-duration',
        title: 'GrDuration',
        summary: 'Сколько длилось, а не когда случилось: «2 ч 30 мин» из секунд, из пары дат или живым счётом от момента начала. Имена единиц знает `Intl`, своих строк у метки нет.',
        importPath: '@feugene/granularity-chrono/components/GrDuration',
        examples: [
          {
            id: 'chrono-duration-basic',
            title: 'Seconds, a pair of dates, or a running clock',
            description: 'Три формы значения — три разных вопроса. Число это готовая длина, пара дат — промежуток между моментами, одна дата — время, которое идёт прямо сейчас и пересчитывается само.',
            previewKey: 'extra-chrono-duration-basic',
            note: 'Младшее отбрасывается, а не округляется: «2 ч 59 мин 30 с» остаётся «2 ч 59 мин», иначе показ ушёл бы вперёд реально прошедшего времени. В `datetime` при этом уезжает полное значение — сокращение сделано для человека, не для машины.',
          },
        ],
        apiSections: durationApiSections(),
      },
    ],
  },
  {
    id: 'granularity-dashboard',
    npmName: '@feugene/granularity-dashboard',
    label: 'Dashboard',
    version: dashboardPkg.version,
    description: 'Сетка виджетов, которую пользователь раскладывает под себя, и раскладка, которая переживает перезагрузку. Перенос и растягивание — мышью и с клавиатуры, отдельная раскладка на каждый брейкпоинт, ноль зависимостей.',
    dependencies: [],
    components: [
      {
        name: 'GrDashboard',
        slug: 'gr-dashboard',
        title: 'GrDashboard',
        summary: 'Сетка, в которой виджеты переносят и растягивают. Режим просмотра и режим редактирования разведены, раскладка хранится на каждый брейкпоинт.',
        importPath: '@feugene/granularity-dashboard/components/GrDashboard',
        typeDeclarations: `import type {
  GrDashboardBreakpoint,
  GrDashboardBreakpoints,
  GrDashboardCols,
  GrDashboardCompaction,
  GrDashboardItemLayout,
  GrDashboardLayout,
  GrDashboardResponsiveLayout,
} from '@feugene/granularity-dashboard/layout'
import type { GrDashboardMode } from '@feugene/granularity-dashboard/components/GrDashboard'

/** Место одного виджета в сетке. Все величины — целые ячейки, не пиксели. */
interface GrDashboardItemLayout {
  /** Совпадает с \`itemId\` у GrDashboardItem. */
  id: string
  /** Колонка и строка левого верхнего угла, от нуля. */
  x: number
  y: number
  /** Размер в ячейках. */
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  /** Не двигается сам и не двигается соседями. */
  static?: boolean
}

/** Порядок массива смысла не несёт — его несёт пара (y, x). */
type GrDashboardLayout = GrDashboardItemLayout[]

/** Ключ брейкпоинта. Набор открыт: имена задаёт приложение. */
type GrDashboardBreakpoint = string

/** Модель \`v-model:layout\`: своя раскладка на каждый брейкпоинт. */
type GrDashboardResponsiveLayout = Record<GrDashboardBreakpoint, GrDashboardLayout>

/** Пороги ширины контейнера и число колонок на них. */
type GrDashboardBreakpoints = Record<GrDashboardBreakpoint, number>
type GrDashboardCols = Record<GrDashboardBreakpoint, number>

type GrDashboardMode = 'view' | 'edit'

/** Падают ли виджеты вверх после переноса. */
type GrDashboardCompaction = 'vertical' | 'horizontal' | 'both' | 'none'

interface GrDashboardDropEvent {
  transfer: GrDashboardTransfer
  /** Ячейка левого верхнего угла — та же, что показывала подложка. */
  cell: { x: number, y: number }
  breakpoint: GrDashboardBreakpoint
  options: GrDashboardMoveOptions
}`,
        overview: {
          paragraphs: [
            'Сетка — единственный в пакете владелец раскладки. Она знает, сколько колонок на текущей ширине, где стоит каждый виджет и что происходит при переносе: кого толкать, куда подтягивать, когда движение отменить. Всё это она отдаёт наружу одним `v-model:layout` и ничего не хранит у себя.',
            'Чего сетка не знает — так это что внутри виджетов. Она не рисует содержимое, не ходит за данными и не имеет мнения о том, график там или таблица. Граница проведена ровно здесь: расстановка — её дело, содержимое — дело приложения.',
          ],
          features: [
            'Раскладка на каждый брейкпоинт: недостающая выводится из ближайшей более широкой, а не собирается заново.',
            'Перенос и растягивание — указателем и с клавиатуры; отменённый жест возвращает раскладку в исходное состояние.',
            'Режим просмотра и режим редактирования — одна и та же разметка, а не два набора.',
            'Уплотнение вверх, влево, по обеим осям или свободная сетка — пропом `compact`, без переписывания раскладки.',
            'Виджет приезжает из каталога перетаскиванием или кнопкой; куда его положить, решает приложение.',
          ],
          lists: [
            {
              title: 'За что отвечает не она',
              items: [
                '`GrDashboardItem` — оформление виджета и его собственные границы размера.',
                '`GrDashboardPalette` — каталог того, что можно добавить.',
                '`useDashboardLayout` — где раскладка хранится между сессиями.',
                'Приложение — что положено внутрь виджета и откуда взяты данные.',
              ],
            },
          ],
        },
        examples: [
          {
            id: 'dashboard-panel',
            title: 'Панель, а не сетка',
            description: 'Так это выглядит в работе: график, показатель со спарклайном, статистика, карточка дежурного и таблица кампаний. Виджет — место под содержимое, и пакет о нём ничего не знает: что положат внутрь, решает приложение.',
            previewKey: 'extra-dashboard-panel',
            note: 'Переключите режим — и та же панель станет редактируемой, без второго набора разметки.',
          },
          {
            id: 'dashboard-basic',
            title: 'Разложить под себя',
            description: 'Перетащите виджет за ручку в шапке — соседи расступятся, а раскладка подтянется вверх. То же делается с клавиатуры: `Space` берёт виджет, стрелки двигают, `Esc` отменяет.',
            previewKey: 'extra-dashboard-basic',
          },
          {
            id: 'dashboard-two-boards',
            title: 'Two boards, one widget',
            description: 'Рабочий дашборд и архивный рядом. Виджет перетаскивается из одного в другой тем же жестом за ручку — он перерастает в межсеточный, когда указатель уходит в чужую сетку.',
            previewKey: 'extra-dashboard-two-boards',
            note: 'Просто «вышел за край» переносом не считается: на длинной странице указатель покидает сетку постоянно. Виджет из исходной раскладки убирает сама сетка и сообщает об этом `itemTransferOut` — тут пакет отступает от правила «кладёт приложение», и по делу: удаление однозначно, разметки для него не нужно, в отличие от вставки. Только после успешного приземления: отпускание между сетками и `Esc` не уносят ничего. Архивный дашборд `:transferable="false"` — принимать и отдавать это разные разрешения.',
          },
          {
            id: 'dashboard-auto-height',
            title: 'Content decides the height',
            description: 'Лента событий растёт и ужимается вместе со своим содержимым, расталкивая соседей. Рядом — тот же список без авто-высоты: он остаётся в своих двух строках и прячет остальное под прокрутку.',
            previewKey: 'extra-dashboard-auto-height',
            note: 'Замеряется обёртка вокруг содержимого, а не тело виджета: высота тела задана ячейкой сетки, и `scrollHeight` у него равен `max(содержимое, контейнер)` — виджет вырос бы под содержимое, но не ужался бы обратно никогда. Высота округляется вверх до целой строки: пустота в пару пикселей внизу безобидна, обрезанная последняя строка таблицы — нет. Изменение уезжает в `update:layout`, как любое другое, но сопровождается отдельным `itemAutoResize`: без него «сохранить изменения?» всплывало бы после обычной загрузки данных.',
          },
          {
            id: 'dashboard-static',
            title: 'Закреплённый виджет и свободная сетка',
            description: 'Баннер вверху закреплён: он не двигается ни сам, ни соседями, и перемещение, упёршееся в него, отменяется целиком. Вся сетка здесь — `compact="none"`: виджет остаётся ровно там, куда его положили, вместе с дырой под ним.',
            previewKey: 'extra-dashboard-static',
          },
          {
            id: 'dashboard-compaction',
            title: 'Четыре режима уплотнения',
            description: 'Одна и та же раскладка с дырами по обеим осям. `vertical` тянет виджеты вверх, `horizontal` — влево, `both` — до упора в обе стороны, `none` оставляет всё как есть.',
            previewKey: 'extra-dashboard-compaction',
            note: 'Сдвинуть виджет в пустоту по оси уплотнения нельзя — он уедет обратно. Это определение компактизации, а не потеря жеста.',
          },
          {
            id: 'dashboard-persistence',
            title: 'Раскладка переживает перезагрузку',
            description: 'Разложите виджеты и обновите страницу — вернётся то, что вы оставили. Хранилище задаётся адаптером, поэтому раскладка так же легко уезжает на сервер, как и в `localStorage`.',
            previewKey: 'extra-dashboard-persistence',
            note: 'Композабл читает хранилище только после монтирования: на сервере и в первом клиентском рендере видна раскладка по умолчанию, поэтому гидрация не расходится.',
          },
        ],
        apiSections: dashboardApiSections(),
      },
      {
        name: 'GrDashboardItem',
        slug: 'gr-dashboard-item',
        title: 'GrDashboardItem',
        summary: 'Виджет на сетке поверх карточки ядра: заголовок, действия, подвал — и собственные границы размера.',
        importPath: '@feugene/granularity-dashboard/components/GrDashboardItem',
        typeDeclarations: `import type {
  GrDashboardItemOverflow,
  GrDashboardItemPadding,
  GrDashboardItemProps,
  GrDashboardItemSize,
} from '@feugene/granularity-dashboard/components/GrDashboardItem'
import type {
  GrDashboardItemBounds,
} from '@feugene/granularity-dashboard/components/GrDashboard'

/** Плотность шапки и кегль заголовка — НЕ размер в сетке: тот задают w и h. */
type GrDashboardItemSize = 'xs' | 'sm' | 'md' | 'lg'

/** Отступы содержимого. Не задан — ступень от size; none отдаёт виджет целиком. */
type GrDashboardItemPadding = 'none' | GrDashboardItemSize

/** hidden снимает и полосу прокрутки, и остановку Tab у тела. */
type GrDashboardItemOverflow = 'auto' | 'hidden'

/**
 * Границы, которые виджет объявляет сам. Сетка накладывает их на запись
 * раскладки: «ниже двух строк я нечитаем» знает виджет, а не модель.
 */
interface GrDashboardItemBounds {
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  static?: boolean
  /** Имя виджета для ручек и объявлений в живой регион. */
  title?: string
}

interface GrDashboardItemProps {
  /** Связывает разметку с записью раскладки по полю \`id\`. */
  itemId: string
  title?: string
  size?: GrDashboardItemSize
  padding?: GrDashboardItemPadding
  overflow?: GrDashboardItemOverflow
  /** Не заданы — действует правило сетки. */
  draggable?: boolean
  resizable?: boolean
  static?: boolean
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  ariaLabel?: string
}`,
        overview: {
          paragraphs: [
            'Виджет — это место под содержимое и всё, что вокруг него: заголовок, действия рядом с заголовком, подвал. Построен на `GrCard` ядра, поэтому выглядит и ведёт себя как остальные карточки приложения, а не как «что-то из дашборда».',
            'Его вторая обязанность — знать пределы собственной читаемости. Раскладка знает координаты, но «ниже двух строк этот график превращается в кашу» знает только сам виджет, поэтому `minW`, `minH`, `maxW` и `maxH` объявляются здесь, а не в модели раскладки. Сетка их учитывает и не даст сжать виджет дальше.',
            'Виджет не решает, где он стоит: его место — запись раскладки, которой владеет сетка. Он лишь сообщает, кем является (`itemId`) и в каких границах остаётся читаемым.',
            'Шапка у него необязательна. Она появляется, только если есть что показать — заголовок, свой `#header` или `#actions`; виджету с картой или одной большой цифрой она не нужна. В режиме редактирования такой виджет не отращивает шапку ради ручки: ручка выезжает панелью поверх верха содержимого, и переключение режима ничего не сдвигает.',
          ],
          features: [
            'Слоты `#header`, `#actions`, `#editActions`, `#footer` и `#skeleton` вокруг содержимого по умолчанию.',
            'Шапки может не быть вовсе: ручка переноса выезжает панелью поверх содержимого по наведению и по фокусу.',
            '`padding="none"` отдаёт виджет содержимому край в край; `overflow="hidden"` снимает прокрутку вместе с лишней остановкой `Tab`.',
            'Собственные границы размера — их уважают и мышь, и клавиатура.',
            '`static` — закреплённый виджет: не двигается ни сам, ни соседями.',
            '`draggable` и `resizable` сужают правило сетки для одного виджета: можно запретить растягивание, оставив перенос.',
            'Тело растягивается на остаток высоты, поэтому график или таблица получают всю доступную площадь.',
            '`size` меняет плотность шапки и кегль заголовка — но не размер в сетке: тот задают `w` и `h`.',
          ],
          lists: [
            {
              title: 'Зона ответственности',
              items: [
                'Отвечает: оформление карточки, границы размера, признак `static`, имя виджета для ручек и объявлений.',
                'Не отвечает: координаты в сетке, компактизация, брейкпоинты — это `GrDashboard`.',
                'Не отвечает: содержимое и данные — их даёт приложение слотом.',
              ],
            },
          ],
        },
        examples: [
          {
            id: 'dashboard-item-slots',
            title: 'Заголовок, действия, подвал — и свои границы',
            description: 'Четыре слота вокруг содержимого и границы размера, которые виджет объявляет сам: «ниже двух строк я нечитаем» знает он, а не раскладка. Попробуйте сжать средний виджет уголком — дальше `min-w` он не пойдёт.',
            previewKey: 'extra-dashboard-item-slots',
            note: 'Границы применяются к обеим осям: `min-h` держит высоту так же, как `min-w` — ширину. У виджета с `:resizable="false"` уголка нет вовсе, а перетащить его можно; у закреплённого нет ни того, ни другого.',
          },
          {
            id: 'dashboard-item-edge-to-edge',
            title: 'Без шапки, край в край',
            description: 'Заголовка нет — значит нет и шапки, ни в просмотре, ни в редактировании. Наведите курсор: ручка переноса выезжает сверху поверх содержимого, поэтому переключение режима ничего не сдвигает. Слева `padding="none"` отдаёт виджет таблице целиком, справа `overflow="hidden"` снимает и полосу прокрутки, и лишнюю остановку `Tab`.',
            previewKey: 'extra-dashboard-edge-to-edge',
            note: 'Там, где наведения не бывает — планшет, телефон, — панель видна всё время, пока идёт редактирование. Скрытая, она остаётся в таб-порядке: убрать её значило бы убрать ручку из обхода клавиатурой.',
          },
        ],
        apiSections: dashboardItemApiSections(),
      },
      {
        name: 'GrDashboardPalette',
        slug: 'gr-dashboard-palette',
        title: 'GrDashboardPalette',
        summary: 'Каталог виджетов, которые можно добавить: кнопкой или перетаскиванием на сетку. Кнопка остаётся на месте, поэтому клавиатурный сценарий существует по построению.',
        importPath: '@feugene/granularity-dashboard/components/GrDashboardPalette',
        typeDeclarations: `import type {
  GrDashboardPaletteItem,
  GrDashboardPaletteSize,
} from '@feugene/granularity-dashboard/components/GrDashboardPalette'
import { addItem } from '@feugene/granularity-dashboard/layout'
import type {
  GrDashboardItemLayout,
  GrDashboardLayout,
} from '@feugene/granularity-dashboard/layout'

/** Строка каталога: что предлагают добавить и с каким размером. */
interface GrDashboardPaletteItem {
  id: string
  title: string
  description?: string
  /** Размер, с которым виджет встаёт в сетку. */
  defaultSize?: { w: number, h: number }
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  disabled?: boolean
}

type GrDashboardPaletteSize = 'xs' | 'sm' | 'md' | 'lg'

/**
 * Каталог сообщает о выборе и на этом заканчивает: класть виджет в раскладку —
 * дело приложения. Ячейка не задана — виджет встаёт под низ сетки.
 */
function addItem(
  layout: GrDashboardLayout,
  item: GrDashboardItemLayout,
  options: { cols: number, compact?: 'vertical' | 'none', preventCollision?: boolean },
  cell?: { x: number, y: number },
): GrDashboardLayout`,
        overview: {
          paragraphs: [
            'Каталог отвечает на один вопрос: что ещё можно поставить на дашборд. Он показывает список доступных виджетов с названием, описанием и предполагаемым размером — и сообщает наружу, что из него выбрали.',
            'Класть выбранное в сетку — не его дело. Каталог не владеет раскладкой и даже не обязан стоять внутри `GrDashboard`: он эмитит `add`, а приложение решает, куда встанет виджет и встанет ли вообще (например, если такой уже есть). Функция `addItem` из подпути `./layout` делает это одной строкой.',
            'Плитку можно перетащить прямо на сетку, но кнопка при этом никуда не делась — и это принципиально. Сделай перетаскивание контрактом, и каталогом нельзя пользоваться с клавиатуры, а «доступность потом» в таких местах не наступает. Куда бросили, сообщает сетка эмитом `itemDrop`; кладёт по-прежнему приложение.',
          ],
          features: [
            'Список виджетов с описанием и размером по умолчанию.',
            'Добавление кнопкой — работает мышью и с клавиатуры одинаково.',
            'Перетаскивание плитки на сетку: подложка показывает место, соседи расступаются заранее.',
            'Каждое добавление объявляется в живой регион.',
            'Слот `#item` — если строка каталога должна выглядеть иначе.',
            'Работает и вне сетки: это обычный список с эмитом.',
          ],
          lists: [
            {
              title: 'Зона ответственности',
              items: [
                'Отвечает: показать, что доступно, и сообщить о выборе.',
                'Не отвечает: расстановка, коллизии, размер на сетке — это `GrDashboard` и подпуть `./layout`.',
                'Не отвечает: откуда взялся список виджетов — его даёт приложение пропом `items`.',
              ],
            },
          ],
        },
        examples: [
          {
            id: 'dashboard-palette',
            title: 'Добавить виджет',
            description: 'Каталог не владеет раскладкой: он сообщает, что выбрали, а куда положить — решает приложение. В демо это одна строка с `addItem` из подпути `./layout`.',
            previewKey: 'extra-dashboard-palette',
          },
          {
            id: 'dashboard-transfer',
            title: 'Перетащить на сетку',
            description: 'Тот же каталог, но виджет можно донести до места. Подложка показывает, куда он встанет, и соседи расступаются заранее — предпросмотр считается ровно теми же функциями, что и сам бросок.',
            previewKey: 'extra-dashboard-transfer',
            note: 'Кнопка «Добавить» осталась и работает как раньше: перетаскивание добавлено поверх неё, а не вместо. Пальцем плитка не тащится — каталог на телефоне обязан прокручиваться.',
          },

        ],
        apiSections: dashboardPaletteApiSections(),
      },
      {
        name: 'GrDashboardItemSettings',
        slug: 'gr-dashboard-item-settings',
        title: 'GrDashboardItemSettings',
        summary: 'Окно параметров одного виджета. Своё содержимое у него ровно одно — размер в ячейках; всё остальное приносит приложение слотом.',
        importPath: '@feugene/granularity-dashboard/components/GrDashboardItemSettings',
        typeDeclarations: `import type {
  GrDashboardItemSettingsProps,
  GrDashboardItemSettingsSize,
} from '@feugene/granularity-dashboard/components/GrDashboardItemSettings'

type GrDashboardItemSettingsSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface GrDashboardItemSettingsProps {
  /** Окно открыто. \`v-model\`. */
  modelValue: boolean
  /** Какой виджет настраиваем. \`null\` — окну нечего читать. */
  itemId: string | null
  title?: string
  size?: GrDashboardItemSettingsSize
  /** Убрать встроенный редактор размера. */
  hideSize?: boolean
}`,
        overview: {
          paragraphs: [
            'У виджета почти всегда есть что настроить: период, источник, порог тревоги. Окно даёт этим полям место — и заодно закрывает то, что приложение сделало бы неправильно: размер виджета в ячейках.',
            'Верхняя граница ширины тут не число колонок и не объявленный максимум, а то, что реально осталось до правого края. Изменение коммитится через сетку — с её уплотнением, её `preventCollision` и её проверкой закреплённых виджетов. Не поместилось — окно останется открытым и скажет об этом, а не закроется над несделанным.',
            'Кнопку-шестерёнку рисует сам виджет пропом `showSettings`, а сетка пересылает нажатие наружу как `itemSettings`: подписка одна на всю сетку, а не по одной на каждый виджет.',
          ],
          features: [
            'Ширина и высота в ячейках с честными границами.',
            'Слот под поля приложения — над размером: продуктовое важнее служебного.',
            'Отказ виден: «на сетке нет места» вместо тихого закрытия.',
            'Готовый подвал «Отмена / Применить», заменяемый слотом.',
            'Вне сетки работает без блока размера — слот приложения продолжает жить.',
          ],
          lists: [
            {
              title: 'Чего окно не редактирует',
              items: [
                'Заголовок виджета — он не входит в раскладку намеренно: уехав в хранилище, он протух бы при первой смене языка.',
                'Границы `minW`/`maxW` — их объявляет разметка виджета, и редактор завёл бы вторую правду о том же самом.',
                'Данные и содержимое виджета — за этим в приложение.',
              ],
            },
          ],
        },
        examples: [
          {
            id: 'dashboard-item-settings',
            title: 'Размер и период',
            description: 'Размер в ячейках даёт пакет, период — приложение. Поля стоят в одном окне, но за первым следит сетка, а за вторым никто, кроме вас.',
            previewKey: 'extra-dashboard-item-settings',
            note: 'Попробуйте увеличить «Заказы» до двенадцати колонок: правее восьмой начинается край сетки, и поле честно об этом знает.',
          },
        ],
        apiSections: dashboardItemSettingsApiSections(),
      },
      {
        name: 'GrDashboardToolbar',
        slug: 'gr-dashboard-toolbar',
        title: 'GrDashboardToolbar',
        summary: 'Панель над дашбордом: переключатель режима, сброс раскладки и три слота под своё — заголовок, период, экспорт.',
        importPath: '@feugene/granularity-dashboard/components/GrDashboardToolbar',
        overview: {
          paragraphs: [
            'Дашборд в приложении редко живёт голым: над ним стоит строка с названием, периодом и кнопкой экспорта. Тулбар — место для неё, и заодно готовый переключатель «просмотр / правка» с кнопкой сброса.',
            'Режимом он не владеет: показывает то, что дала сетка или проп, а изменение отдаёт эмитом. Владелец раскладки — приложение, и оно же решает, что считать исходным состоянием при сбросе.',
            'Контекст сетки не обязателен. Тулбар работает и сам по себе — это обычная панель, которую можно поставить над чем угодно.',
          ],
          features: [
            'Переключатель режима с `v-model:mode`.',
            'Кнопка сброса по `resettable` — событие `reset` без собственной трактовки.',
            'Слоты `start`, `default` и `end`: заголовок, период, свои действия.',
            'Роль `toolbar` и доступное имя из локали пакета.',
            'Размер кнопок общей шкалой контролов.',
          ],
        },
        examples: [
          {
            id: 'dashboard-toolbar',
            title: 'Панель со своим содержимым',
            description: 'Тулбар вне сетки: слева заголовок и период, справа экспорт, режим и сброс — встроенные. Второй экземпляр показывает погашенное состояние.',
            previewKey: 'extra-dashboard-toolbar',
          },
        ],
        apiSections: dashboardToolbarApiSections(),
      },
    ],
  },
  {
    id: 'granularity-forms-schema',
    npmName: '@feugene/granularity-forms-schema',
    label: 'Forms Schema',
    version: formsSchemaPkg.version,
    description: 'Форма из схемы бэкенда: zod или JSON Schema на входе — настоящие поля дизайн-системы на выходе, с валидацией, раскладкой и повторяемыми секциями. Ни одной зависимости: адаптеры подключаются отдельными subpath.',
    dependencies: [],
    components: [
      {
        name: 'GrSchemaForm',
        slug: 'gr-schema-form',
        title: 'GrSchemaForm',
        summary: 'Раскладывает форму по схеме: поля, правила, разделы и повторяемые секции. Виджет выбирает реестр, вид настраивает uiSchema, а любое поле можно перехватить слотом.',
        importPath: '@feugene/granularity-forms-schema/components/GrSchemaForm',
        overview: {
          paragraphs: [
            'Бэкенд уже описал контракт — zod, JSON Schema, OpenAPI. Пакет раскладывает по нему форму и переносит ограничения в валидацию, чтобы описание не пришлось повторять руками и потом сверять две расходящиеся версии.',
          ],
          features: [
            'Схема на входе, поля дизайн-системы на выходе',
            'Валидация из схемы: правила ядра плюс полная проверка',
            'Повторяемые секции для массивов объектов',
            'uiSchema: порядок, колонки, условия, подмена виджета',
            'Серверные ошибки садятся на свои поля',
          ],
        },
        typeDeclarations: `import type {
  GrSchemaAdapter,
  GrSchemaModel,
  GrSchemaNode,
  GrUiSchema,
} from '@feugene/granularity-forms-schema'`,
        examples: [
          {
            id: 'forms-schema-json',
            title: 'Форма по JSON Schema',
            description: 'Типы и форматы решают, каким контролом рисовать поле, а ограничения становятся правилами. Вид задаётся отдельно — `uiSchema` не трогает контракт данных.',
            previewKey: 'extra-forms-schema-json',
          },
          {
            id: 'forms-schema-array',
            title: 'Повторяемая секция',
            description: 'Массив объектов: добавление, удаление, перенос строк и границы длины. Ошибки не съезжают на соседнюю строку при удалении — валидация хвоста снимается до сдвига.',
            previewKey: 'extra-forms-schema-array',
          },
          {
            id: 'forms-schema-adapters',
            title: 'One contract, two schemas',
            description: 'Переключатель меняет источник: то JSON Schema из OpenAPI, то zod-объект из общего с бэкендом пакета. Панель рядом показывает схему, нейтральную модель и текущее значение.',
            previewKey: 'extra-forms-schema-adapters',
            note: 'Адаптер выбирается сам, по `supports()`, а не пропом: в `adapters` переданы оба, и каждый узнаёт свою схему. Вкладка «Модель» — то, чего обычно не показывают: разобранный контракт, по которому уже нет разницы, откуда он пришёл. Схема меняется целиком, модель и форма — нет.',
          },
          {
            id: 'forms-schema-conditions',
            title: 'A form that reacts',
            description: 'Состав полей зависит от введённого: у физлица спрашивают паспорт, у компании — ИНН, а ставку НДС только у той компании, которая его платит.',
            previewKey: 'extra-forms-schema-conditions',
            note: 'Условие живёт в `uiSchema`, а не в схеме: контракт данных от вида не зависит. `all` складывает условия, `any` — через «или», а внутри повторителя есть относительный путь `../kind`: сослаться на соседа по строке абсолютным пришлось бы через индекс, а он меняется при удалении. Скрытое поле не проверяется — иначе пользователь упирался бы в ошибку на поле, которого не видит.',
          },
          {
            id: 'forms-schema-branching',
            title: 'One key decides the rest',
            description: 'Способ доставки меняет не подпись, а состав полей: у самовывоза пункт выдачи, у курьера адрес и интервал, у почты индекс. Панель рядом показывает, что уходит на сервер.',
            previewKey: 'extra-forms-schema-branching',
            note: 'Общий ключ переживает переключение, чужой отбрасывается: оставить чужие нельзя — схема на них ругнётся, а сбросить всё значит потерять уже написанный комментарий. Дискриминатора нет среди полей: им управляет сам переключатель. Выводится он тремя путями — `z.discriminatedUnion`, `discriminator.propertyName` из OpenAPI и общий `const` у вариантов в чистой JSON Schema; не вывелся ни одним — узел уходит в полную проверку схемой с предупреждением, а не в догадку.',
          },
          {
            id: 'forms-schema-additional',
            title: 'Keys the schema does not know',
            description: 'Характеристики товара и лимиты площадок заводит контент-менеджер, а не разработчик. Имя ключа вводит пользователь, значение рисуется по схеме — строка или целое с границами.',
            previewKey: 'extra-forms-schema-additional',
            note: 'Пары рисуются хвостом объекта, а не полем среди полей: у них нет ни места в схеме, ни записи в `uiSchema`, ни порядка среди объявленных. `additionalProperties: true` без схемы значения хвоста не даёт вовсе — ключи разрешены, но чем рисовать значение, схема не сказала, и текстовое поле «на всякий случай» молча потеряло бы тип.',
          },
          {
            id: 'forms-schema-sections',
            title: 'Twelve fields, three sections',
            description: 'Порядок полей схема не задаёт и задавать не должна. Разделы с заголовками, своей сеткой у каждого и местом `*` для всего, что не перечислено.',
            previewKey: 'extra-forms-schema-sections',
            note: 'Звёздочка — не косметика: бэкенд добавит поле, и оно окажется в форме само, а не выпадет из неё молча. Заголовки разделов — настоящие `h4` с уровнем из пропа `headingLevel`, чтобы встроиться в иерархию страницы: скринридер обходит форму по заголовкам, как обходит статью.',
          },
          {
            id: 'forms-schema-validation',
            title: 'Three tiers, and the checkbox trap',
            description: 'Почему ярусов три: правило ядра успевает к нажатию клавиши, полная проверка схемой требует прогнать её целиком. Между ними — локальный валидатор для того, что в правило не укладывается.',
            previewKey: 'extra-forms-schema-validation',
            note: '`required` на чекбоксе пропускает снятый флажок — ядро не считает `false` пустым, иначе поле пряталось бы там, где форма считает его заполненным. «Согласен с условиями» задаётся значением (`z.literal(true)`), а не обязательностью. Кросс-полевые правила помечают узел `residual`, и он зовёт полную проверку схемой.',
          },
          {
            id: 'forms-schema-server-errors',
            title: 'A 422 that lands on fields',
            description: 'Занятость почты и остаток на складе знает только бэкенд. Три живых формата ответа — Laravel, JSON:API, RFC 7807 — приводятся к одному инстанс-пути без настройки.',
            previewKey: 'extra-forms-schema-server-errors',
            note: 'Ошибка садится на вторую строку позиций, а не на форму целиком: указатель `/data/attributes/items/1/qty` и `items[1].qty` — это один и тот же путь. Сообщение, которому не нашлось поля, уходит в сводку над формой: потерять его хуже всего — пользователь видел бы форму без единой пометки и кнопку, которая не срабатывает.',
          },
          {
            id: 'forms-schema-widget',
            title: 'Almost generated, two fields yours',
            description: 'Три поля из четырёх подменены разными способами: свой компонент, готовый компонент ядра и запись реестра по имени.',
            previewKey: 'extra-forms-schema-widget',
            note: 'Своему контролу хватает контракта форм-контрола ядра: принять `modelValue`, отдать `update:modelValue`, уважать `disabled`/`readonly` и уметь показать себя ошибочным. Подпись, звёздочку обязательности, вывод ошибки и связь по `aria-describedby` берёт обёртка поля — их писать не надо, и разойтись с остальной формой они не могут.',
          },
          {
            id: 'forms-schema-chrono',
            title: 'Date pickers are opt-in',
            description: 'Схема не менялась — менялся набор рендереров. Без него `format: date` это нативный инпут, с ним — `GrDatePicker` со своей панелью, клавиатурой и локалью.',
            previewKey: 'extra-forms-schema-chrono',
            note: 'Возьми пакет календарь сам — и приложение, которому нужны две строки и дата, получило бы `granularity-chrono` в бандл, ни разу об этом не попросив. Записи из `renderers` кладутся поверх дефолтных и по умолчанию сильнее: потребитель регистрирует их последними и вправе ждать, что победят они.',
          },
        ],
        apiSections: [],
      },
    ],
  },
  {
    id: 'granularity-datasource',
    npmName: '@feugene/granularity-datasource',
    label: 'Datasource',
    version: datasourcePkg.version,
    description: 'Состояние списка одним композаблом: сортировка, фильтры, страница, поиск, адресная строка и запрос без гонок. Пакет ничего не рисует — он связывает то, что уже нарисовано.',
    dependencies: [],
    components: [
      {
        kind: 'composable',
        name: 'useDataSource',
        slug: 'use-data-source',
        title: 'useDataSource',
        summary: 'Пара «таблица + фильтры + пагинация» перестаёт писаться заново: состояние, серверная и клиентская стратегии и защита от гонок живут в одном месте.',
        importPath: '@feugene/granularity-datasource',
        overview: {
          paragraphs: [
            'Композабл держит состояние списка и умеет две стратегии за одним интерфейсом: серверную (`fetcher`) и клиентскую (`rows` целиком). Наружу он отдаёт писуемые ссылки под `v-model` — `page`, `perPage`, `sortKey`, `sortDir`, `search` — и те же значения одним объектом для `v-bind`.',
            'Ядро он не импортирует ни разу. Это не экономия, а граница: состояние списка не обязано знать, чем этот список нарисован, — те же объекты раскрываются на чужой таблице и на собственной разметке.',
          ],
          features: [
            'Поздний ответ раннего запроса не побеждает: гонку закрывает номер запроса, а не только `AbortController`.',
            'Смена фильтра, поиска и размера страницы возвращает на первую страницу.',
            'Набор текста откладывается и схлопывается в один запрос; клик по странице уходит сразу.',
            'Двусторонняя сериализация в строку запроса — по требованию, с префиксом на каждый список.',
            'Пустое в адрес не пишется: ссылка на список по умолчанию выглядит как адрес страницы.',
          ],
        },
        typeDeclarations: `import type {
  DataSourceRequest,
  DataSourceResult,
  DataSourceSort,
  DataSourceState,
  FilterValue,
} from '@feugene/granularity-datasource'

import type { DataSourceUrlAdapter } from '@feugene/granularity-datasource/url'`,
        examples: [
          {
            id: 'datasource-basic',
            title: 'Server-backed list',
            description: 'Сервер-заглушка отвечает вразнобой: нечётный запрос медленнее чётного. Наберите пару букв подряд — в таблице окажется ответ на последний запрос.',
            previewKey: 'extra-datasource-basic',
            note: 'Гонку закрывает номер запроса, а не только `AbortController`: транспорт потребителя вправе не пробросить `signal`, и тогда прерванный запрос всё равно вернётся и перезапишет свежие данные. Набор в поиске откладывается на 300 мс, клик по странице и по заголовку — нет: это разовое действие, а не набор текста.',
          },
          {
            id: 'datasource-url',
            title: 'State in the query string',
            description: 'Состояние уходит в строку запроса и возвращается из неё. Адрес витрины при этом не трогается: у демо свой адаптер, пишущий в поле под таблицей.',
            previewKey: 'extra-datasource-url',
            note: 'Синхронизация включается опцией, а не сама: композабл, пишущий в адрес по умолчанию, вмешался бы в чужую навигацию и столкнул бы два списка на одной странице. Префикс разводит их — `?users.page=2&orders.page=1`. Пустое не пишется, чужие параметры не трогаются.',
          },
        ],
        apiSections: [
          {
            key: 'parameters',
            title: 'Options',
            origin: 'manual',
            items: [
              { name: 'fetcher', type: '(request, { signal }) => Promise<{ rows, total }>', description: 'Серверная стратегия. Пробрасывать `signal` в транспорт стоит, но не обязательно: от гонки защищает не только он.' },
              { name: 'rows', type: 'MaybeRefOrGetter<readonly TRow[]>', description: 'Клиентская стратегия: весь набор сразу, фильтр, порядок и срез считаются на месте.' },
              { name: 'match / filter / compare', type: '(row, …) => boolean · number', description: 'Как клиентская стратегия ищет, фильтрует и сортирует. Умолчания: подстрока по текстовым полям, равенство по имени поля, сравнение значений `sort.key`.' },
              { name: 'defaults', type: 'DataSourceDefaults', description: 'Начальные страница, размер, сортировка, фильтры и поиск. Они же задают, что не пишется в адрес, и восстанавливают тип фильтра при разборе.' },
              { name: 'debounce', type: 'number', default: '300', description: 'Задержка перед запросом при правке поиска и фильтров, мс. `0` выключает. Страница и сортировка не откладываются.' },
              { name: 'immediate', type: 'boolean', default: 'true', description: 'Запросить сразу. `false` — ждать первого `reload()`.' },
              { name: 'url', type: '{ prefix?, adapter? }', description: 'Синхронизация с адресной строкой. Не задана — состояние живёт в памяти. Адаптер по умолчанию — History API.' },
            ],
          },
          {
            key: 'returns',
            title: 'Returns',
            origin: 'manual',
            items: [
              { name: 'page / perPage / sortKey / sortDir / search', type: 'WritableComputedRef', description: 'Основной способ связки: `v-model:page`, `v-model:sort-key` и так далее. Длиннее спреда ровно на имена пропов, зато их видит `vue-tsc`.' },
              { name: 'table / pagination', type: 'ComputedRef<DataSourceTableBinding<TRow>> · ComputedRef<DataSourcePaginationBinding>', description: 'Те же значения одним объектом под `v-bind`. Цена: строгая проверка шаблонов не засчитывает спред в обязательные пропсы, и `rows`, `page`, `pageSize`, `total` придётся указать ещё и явно.' },
              { name: 'state', type: 'ComputedRef<DataSourceState>', description: 'Текущее состояние целиком: страница, размер, сортировка, фильтры, поиск.' },
              { name: 'rows / total / pageCount', type: 'ComputedRef', description: 'Строки текущей страницы, полное число совпадений и число страниц.' },
              { name: 'loading / error', type: 'Ref<boolean> · Ref<unknown>', description: 'Состояние запроса. Прерванный запрос ошибкой не считается: его прервали мы сами.' },
              { name: 'setPage / setPerPage / setSort / setSearch', type: '(value) => void', description: 'Точечные правки состояния.' },
              { name: 'setFilter / setFilters', type: '(name, value) · (filters) => void', description: 'Один фильтр или весь набор разом.' },
              { name: 'reset / reload', type: '() => void · () => Promise<void>', description: '`reset` возвращает умолчания; `reload` повторяет запрос текущего состояния — например после правки строки.' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'granularity-editor',
    npmName: '@feugene/granularity-editor',
    label: 'Editor',
    version: editorPkg.version,
    description: 'Поле форматированного текста на TipTap: тулбар из кнопок дизайн-системы, пузырьковое меню у выделения и схема вместо санитайзера.',
    dependencies: ['@tiptap/core', '@tiptap/pm', '@tiptap/starter-kit', '@tiptap/extensions'],
    components: [
      {
        name: 'GrRichText',
        slug: 'gr-rich-text',
        title: 'GrRichText',
        summary: 'Описание товара, тело письма, текст статьи: разметку хранит документ, а набор допустимого задаёт схема.',
        importPath: '@feugene/granularity-editor/components/GrRichText',
        overview: {
          paragraphs: [
            'Поле форматированного текста поверх TipTap. В отличие от `GrTextarea`, где значение — простой текст, здесь значением остаётся размеченный документ, а что в нём разрешено, решает схема.',
            'Схема же служит санитайзером: содержимое разбирается по ней, узлы и марки вне схемы отбрасываются, на выход документ сериализуется из того же дерева. Отдельного санитайзера в пакете нет — и не нужно.',
          ],
          features: [
            'Две готовые схемы: «минимум» — начертание, ссылка, список; «статья» — плюс заголовки, цитата, блок кода.',
            'Тулбар строится по схеме, а не пишется разметкой: кнопка без команды за ней невозможна.',
            'Одна остановка `Tab` на весь тулбар, внутри — стрелки; активный формат объявлен `aria-pressed`.',
            'Форма значения — проп: строка HTML или документ TipTap.',
            'Полный форменный контракт: `GrFormField`, `disabled`, `readonly`, `invalid`, скрытое поле формы.',
            'TipTap — peer-зависимость: ProseMirror обязан быть в приложении в одном экземпляре.',
          ],
        },
        typeDeclarations: `import type {
  GrRichTextAction,
  GrRichTextExtension,
  GrRichTextProps,
  GrRichTextSchemaName,
  GrRichTextSize,
} from '@feugene/granularity-editor'`,
        examples: [
          {
            id: 'editor-basic',
            title: 'Text with a toolbar',
            description: 'Поле со схемой «статья», конструктор под ним и панель модели: значение — размеченный текст, и увидеть, что уходит наружу, иначе нельзя.',
            previewKey: 'extra-editor-basic',
            note: 'Конструктор меняет `size`, `toolbar` и `output` на живом поле. `output` задаёт **форму** значения — строку разметки или документ TipTap, — а не поведение; в нативную форму значение уходит строкой в любом режиме. Тулбар — одна остановка `Tab`, внутри стрелки: у «статьи» десять кнопок, и без этого до текста пришлось бы добираться десятью нажатиями. `Tab` в самом поле уводит из него, а не вставляет отступ — иначе пользователь клавиатуры оказался бы заперт.',
          },
          {
            id: 'editor-toolbar',
            title: 'Everything the toolbar can do',
            description: 'Полный список кнопок, команд и горячих клавиш — таблицей из той же схемы, по которой собирается панель.',
            previewKey: 'extra-editor-toolbar',
            note: 'Разойтись таблица и панель не могут по построению: обе строятся из схемы. Горячие клавиши приходят от расширений TipTap, поэтому работают и при `toolbar="false"`. Сверх кнопок из коробки идут отмена и повтор, перенос строки внутри абзаца, горизонтальная черта правилом ввода `---` и марка ссылки — последние две без своей кнопки.',
          },
          {
            id: 'editor-extensions',
            title: 'Your own TipTap extensions',
            description: 'Переключатели включают расширения на живом поле: смена набора пересобирает редактор, а текст переносится разметкой. `Focus` и `Selection` вешают классы, а рисует их потребитель — в демо они оформлены рядом.',
            previewKey: 'extra-editor-extensions',
            note: 'Набор добавляется **к схеме**, а не заменяет её, и кнопку для своего расширения тулбар не покажет: он строится по схеме, и кнопка без команды за ней была бы обманом. Полный список готовых расширений — каталог TipTap (`tiptap.dev/docs/editor/extensions`), как написать своё — руководство `tiptap.dev/docs/editor/extensions/custom-extensions`. Инстанс редактора компонент отдаёт через `defineExpose`.',
          },
          {
            id: 'editor-schema',
            title: 'The schema is the sanitiser',
            description: 'Одно и то же значение в двух схемах. Вставка одинаковая, результат разный — и это не фильтр поверх, а разбор.',
            previewKey: 'extra-editor-schema',
            note: 'Скрипта и фрейма не остаётся нигде: узлы вне схемы не переживают разбора. Обратная сторона того же свойства — чего нет в схеме, того не будет и в значении: статья с картинками, вставленная в «минимум», станет текстом.',
          },
        ],
        apiSections: [
          {
            key: 'props',
            title: 'Props',
            origin: 'manual',
            items: [
              { name: 'modelValue', type: 'string | Record<string, unknown> | null', description: 'Значение: строка HTML либо документ TipTap — по `output`.' },
              { name: 'output', type: `'html' | 'json'`, default: `'html'`, description: 'В каком виде значение уходит наружу. Форму задаёт проп, а не поведение пользователя.' },
              { name: 'schema', type: `'minimal' | 'article'`, default: `'minimal'`, description: '`minimal` — начертание, ссылка, список; `article` добавляет заголовки, цитату и блок кода. Заголовка первого уровня не даёт ни одна: `h1` принадлежит странице, а не полю внутри неё.' },
              { name: 'extensions', type: 'GrRichTextExtension[]', description: 'Свои расширения TipTap **в дополнение** к схеме. Кнопку для них тулбар не покажет: он строится по схеме.' },
              { name: 'toolbar', type: `boolean | 'bubble' | 'both'`, default: 'true', description: 'Панель сверху, пузырьковое меню у выделения, оба или ничего.' },
              { name: 'placeholder', type: 'string', description: 'Подсказка в пустом поле.' },
              { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Кегль поля и ступень кнопок тулбара. Не задан — из `GrConfigProvider`.' },
              { name: 'disabled / readonly / invalid / required', type: 'boolean', description: 'Форменный контракт. `readonly` показывает значение и отдаёт его в форму, но не даёт править.' },
              { name: 'id / name / ariaLabel', type: 'string', description: '`id` уходит на область ввода — она же фокусируемый виджет. `name` включает скрытое поле формы: разметка уходит строкой в любом режиме `output`.' },
            ],
          },
          {
            key: 'events',
            title: 'Events',
            origin: 'manual',
            items: [
              { name: 'update:modelValue / change', type: '(value) => void', description: 'Правка содержимого. Форма значения — по `output`.' },
              { name: 'focus / blur', type: '() => void', description: 'Фокус области ввода.' },
            ],
          },
          {
            key: 'expose',
            title: 'Expose',
            origin: 'manual',
            items: [
              { name: 'editor', type: 'ComputedRef<Editor | null>', description: 'Инстанс TipTap: своя команда, своё расширение, свой плагин. До монтирования — `null`.' },
              { name: 'focus / blur', type: '() => void', description: 'Фокус в область ввода и из неё.' },
            ],
          },
        ],
      },
    ],
  },
]

/** Плоский список companion-компонентов со ссылкой на их пакет. */
export const companionComponents = companionPackages.flatMap(pkg =>
  pkg.components.map(component => ({
    ...component,
    packageId: pkg.id,
    packageLabel: pkg.label,
    npmName: pkg.npmName,
    version: pkg.version,
  })),
)

export type CompanionComponentWithPackage = (typeof companionComponents)[number]

export function getCompanionComponentBySlug(slug: string): CompanionComponentWithPackage | undefined {
  const normalized = slug.trim().toLowerCase()
  return companionComponents.find(component => component.slug === normalized)
}

export function getCompanionComponentByPath(path: string): CompanionComponentWithPackage | undefined {
  const match = /^\/extras\/([^/?#]+)/.exec(path)
  return match ? getCompanionComponentBySlug(match[1]) : undefined
}
