import chartsPkg from '@feugene/granularity-charts/package.json'
import chronoPkg from '@feugene/granularity-chrono/package.json'

import type { ShowcaseApiSectionMeta } from '../model.ts'

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
  /** Имя компонента, напр. `GrDateTimePicker`. */
  name: string
  /** Kebab-slug для route (`/extras/<slug>`), напр. `gr-date-time-picker`. */
  slug: string
  title: string
  summary: string
  /** Публичный import path. */
  importPath: string
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
function chartLineApiSections(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'props',
      title: 'Props',
      origin: 'manual',
      items: [
        { name: 'series', type: 'GrChartSeries[] | (number | null)[]', description: 'Серии либо голый ряд чисел — тогда `x` становится порядковым номером. Внутри серии два вида входа: объектный `data` и колоночная пара `x`/`y`.' },
        { name: 'xScale', type: `'linear' | 'time' | 'band'`, description: 'Тип оси X. Не задан — выводится из данных: `Date` даёт время, строка даёт категории.' },
        { name: 'height', type: 'number', default: '256', description: 'Высота холста в пикселях. Раскладка обязана быть детерминированной до первого замера — отсюда число, а не CSS-строка.' },
        { name: 'width', type: 'number', default: '640', description: 'Объявленная ширина: от неё идёт серверный рендер, клиентская уточняется замером.' },
        { name: 'yDomain', type: '[number | null, number | null]', description: 'Границы оси значений. `null` в позиции — считать эту сторону по данным.' },
        { name: 'includeZero', type: 'boolean', default: 'false', description: 'Притянуть ось значений к нулю.' },
        { name: 'curve', type: `'linear' | 'smooth' | 'step'`, default: `'linear'`, description: '`smooth` — монотонная кубика: она не выбрасывает кривую за диапазон соседних значений, то есть не рисует максимум, которого в данных нет.' },
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
        { name: 'interactive', type: 'boolean', default: 'true', description: '`false` превращает график в картинку: `role="img"` с именем, без фокуса, тултипа и клавиатуры.' },
        { name: 'valueFormat', type: 'GrChartNumberFormat', description: 'Точность и разделители значений. Локаль берётся из адаптера i18n.' },
        { name: 'xTickFormat / yTickFormat', type: '(value: number, kind?) => string', description: 'Свой формат подписей делений.' },
        { name: 'size', type: `'xs' | 'sm' | 'md' | 'lg'`, description: 'Кегль подписей и размер маркеров. Не задан — из `GrConfigProvider`.' },
        { name: 'canvasThreshold', type: 'number', default: '2000', description: 'Порог, выше которого маркеры не рисуются даже при `auto`. Работает уже сейчас, хотя canvas-путь придёт второй фазой.' },
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
            note: 'У графика одна остановка `Tab`. Дальше — стрелки по точкам, `Home`/`End` по краям, `Esc` снимает выбор.',
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
            description: 'Пропуск в ряду рвёт линию, а не соединяет её через ноль: значения там не было. В таблице данных на его месте прочерк.',
            previewKey: 'extra-charts-line-states',
          },
        ],
        apiSections: chartLineApiSections(),
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
            title: 'Day, month, year',
            description: 'Один компонент показывает три сетки: дни, двенадцать месяцев и десятилетие. Клавиатура у всех одна, меняется только ширина ряда.',
            previewKey: 'extra-chrono-calendar-modes',
            note: 'В режимах периода значением становится первое число: месяц — это 1 августа, год — 1 января.',
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
    ],
  },
]

/** Плоский список companion-компонентов со ссылкой на их пакет. */
export const companionComponents = companionPackages.flatMap(pkg =>
  pkg.components.map(component => ({ ...component, packageId: pkg.id, packageLabel: pkg.label, npmName: pkg.npmName })),
)

export type CompanionComponentWithPackage = (typeof companionComponents)[number]

export function getCompanionComponentBySlug(slug: string): CompanionComponentWithPackage | undefined {
  const normalized = slug.trim().toLowerCase()
  return companionComponents.find(component => component.slug === normalized)
}

export function getCompanionComponentByPath(path: string): CompanionComponentWithPackage | undefined {
  const match = /^\/extras\/([^/?#]+)/.exec(path)
  return match ? getCompanionComponentBySlug(match[1] as string) : undefined
}
