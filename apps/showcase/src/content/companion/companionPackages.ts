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
  /** Идентификатор пакета для группировки/route, напр. `granularity-datepicker`. */
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

function commonPickerProps(): ShowcaseApiSectionMeta {
  return {
    key: 'props',
    title: 'Props',
    origin: 'manual',
    items: [
      { name: 'modelValue', type: 'GrDateTimeModel', default: 'null', description: '`v-model`. Форма зависит от `mode`/`range`/`modelType`.' },
      { name: 'mode', type: `'date' | 'datetime' | 'time' | 'month' | 'year'`, default: `'date'`, description: 'Что выбирает пользователь.' },
      { name: 'range', type: 'boolean', default: 'false', description: 'Выбор диапазона (модель становится массивом границ).' },
      { name: 'locale', type: `'en' | 'ru'`, description: 'Локаль-шорткат (маппится на локаль `date-fns`). Произвольная локаль — через `datepickerProps.locale`.' },
      { name: 'placeholder', type: 'string', description: 'Плейсхолдер поля.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Блокирует ввод.' },
      { name: 'clearable', type: 'boolean', default: 'true', description: 'Показывать кнопку очистки.' },
      { name: 'autoApply', type: 'boolean', default: 'true', description: 'Применять выбор сразу, без кнопки подтверждения.' },
      { name: 'enableSeconds', type: 'boolean', default: 'false', description: 'Секунды в режимах со временем.' },
      { name: 'minDate', type: 'GrDateValue', description: 'Нижняя граница допустимых дат.' },
      { name: 'maxDate', type: 'GrDateValue', description: 'Верхняя граница допустимых дат.' },
      { name: 'format', type: 'string', description: 'Формат отображения (паттерн `@vuepic/vue-datepicker`).' },
      { name: 'modelType', type: 'string', description: 'Как значение сериализуется в модель (`timestamp`, `yyyy-MM-dd`, …).' },
      { name: 'teleport', type: 'boolean | string', default: 'true', description: 'Куда телепортировать меню; `false` — без телепорта.' },
      { name: 'ui', type: 'Record<string, unknown>', description: 'Escape-hatch: классы, домешиваемые в `ui` подлежащего пикера.' },
      { name: 'datepickerProps', type: 'Record<string, unknown>', description: 'Escape-hatch: любые пропсы `@vuepic/vue-datepicker` (last-wins).' },
    ],
  }
}

function pickerEventsAndSlots(): ShowcaseApiSectionMeta[] {
  return [
    {
      key: 'events',
      title: 'Events',
      origin: 'manual',
      items: [
        { name: 'update:modelValue', type: '(value: GrDateTimeModel) => void', description: 'Изменение значения (`v-model`).' },
        { name: 'change', type: '(value: GrDateTimeModel) => void', description: 'Синоним изменения значения для не-`v-model` сценариев.' },
        { name: 'cleared', type: '() => void', description: 'Значение очищено (кнопка clear или пустой выбор).' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: '*', type: 'passthrough', description: 'Все слоты `@feugene`-обёртки прозрачно пробрасываются в `@vuepic/vue-datepicker` (кастомный `trigger`, `action-row`, `day` и т.д.).' },
      ],
    },
  ]
}

function presetProps(fixed: string): ShowcaseApiSectionMeta {
  return {
    key: 'props',
    title: 'Props',
    origin: 'manual',
    items: [
      { name: 'modelValue', type: 'GrDateTimeModel', default: 'null', description: '`v-model` значения.' },
      { name: '…GrDateTimePicker', type: 'see GrDateTimePicker', description: `Пресет фиксирует ${fixed} и прозрачно пробрасывает остальные пропсы/слоты/события в \`GrDateTimePicker\`.` },
    ],
  }
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
        { name: 'update:viewDate', type: '(value: PlainDate) => void', description: 'Сменился показываемый месяц.' },
        { name: 'monthChange', type: '(value: PlainDate) => void', description: 'Листание месяцами — стрелками, клавиатурой или выбором дня из добора.' },
      ],
    },
    {
      key: 'slots',
      title: 'Slots',
      origin: 'manual',
      items: [
        { name: 'day', type: '{ cell: CalendarCell, selected: boolean }', description: 'Содержимое ячейки дня. Число рисует потребитель.' },
        { name: 'header', type: '{ title: string, goToMonth: (delta: number) => void }', description: 'Своя шапка вместо заголовка и стрелок.' },
        { name: 'footer', type: '—', description: 'Подвал панели: кнопки «сегодня», «очистить».' },
      ],
    },
    {
      key: 'expose',
      title: 'Expose',
      origin: 'manual',
      items: [
        { name: 'focus', type: '() => void', description: 'Фокус на текущую остановку `Tab`.' },
        { name: 'goToMonth', type: '(delta: number) => void', description: 'Листание относительно показываемого месяца.' },
        { name: 'focusDate', type: '(date: PlainDate) => void', description: 'Перевести показ на месяц с этой датой и поставить на неё фокус.' },
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
        { name: 'modelValue', type: 'Date | null | T', default: 'null', description: '`v-model`. Тип задаёт `valueAdapter`, а не строковый проп: у `isoDate` модель — `string`.' },
        { name: 'valueAdapter', type: `'date' | 'isoDate' | 'isoDateTime' | 'timestamp' | GrChronoAdapter<T>`, default: `'date'`, description: 'Как значение уходит наружу и приходит обратно. Свой адаптер — пара `parse`/`serialize`.' },
        { name: 'min', type: 'Date', description: 'Нижняя граница выбора.' },
        { name: 'max', type: 'Date', description: 'Верхняя граница выбора.' },
        { name: 'disabledDates', type: 'readonly Date[] | ((date: Date) => boolean)', description: 'Запрещённые даты — в `Date`, а не во внутренних кортежах.' },
        { name: 'format', type: 'Intl.DateTimeFormatOptions', default: `{ dateStyle: 'medium' }`, description: 'Вид значения в поле — опциями `Intl`, а не строкой-паттерном: паттерн не знает порядка частей в чужой локали.' },
        { name: 'placeholder', type: 'string', description: 'Плейсхолдер пустого поля.' },
        { name: 'clearable', type: 'boolean', default: 'false', description: 'Кнопка очистки. Не задан — из `GrConfigProvider`.' },
        { name: 'open', type: 'boolean', description: 'Контролируемое состояние панели (`v-model:open`).' },
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
        { name: 'header', type: '{ title: string, goToMonth: (delta: number) => void }', description: 'Пробрасывается в `GrCalendar`.' },
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

export const companionPackages: CompanionPackage[] = [
  {
    id: 'granularity-datepicker',
    npmName: '@feugene/granularity-datepicker',
    label: 'Datepicker',
    description: 'Date / time / range picker для дизайн-системы: тонкая GR-owned обёртка над `@vuepic/vue-datepicker`. Ставится опционально — ядро `@feugene/granularity` остаётся lean.',
    // Литералом, потому что пакет не отдаёт свой `package.json` через `exports`;
    // добавлять туда субпуть ради пакета, который уходит, незачем.
    version: '0.1.1',
    dependencies: ['@vuepic/vue-datepicker', 'date-fns'],
    components: [
      {
        name: 'GrDateTimePicker',
        slug: 'gr-date-time-picker',
        title: 'GrDateTimePicker',
        summary: 'Базовый гибкий пикер: `mode` (`date` · `datetime` · `time` · `month` · `year`) и `range`. Публичный контракт принадлежит GR, реализация (vuepic) скрыта.',
        importPath: '@feugene/granularity-datepicker',
        examples: [
          {
            id: 'datetime-modes',
            title: 'Modes playground',
            description: 'Один компонент покрывает date / datetime / time / month / year — режим переключается пропом `mode`.',
            previewKey: 'extra-datepicker-modes',            note: 'Значение (де)сериализуется по `modelType`; по умолчанию — `Date`.',
          },
          {
            id: 'datetime-localized',
            title: 'Localized datetime with seconds',
            description: 'Русская локаль, выбор времени с секундами и подтверждением выбора (`auto-apply=false`).',
            previewKey: 'extra-datepicker-localized',          },
        ],
        apiSections: [commonPickerProps(), ...pickerEventsAndSlots()],
      },
      {
        name: 'GrDatePicker',
        slug: 'gr-date-picker',
        title: 'GrDatePicker',
        summary: 'Пресет `GrDateTimePicker` с зафиксированным `mode="date"` — календарь без времени.',
        importPath: '@feugene/granularity-datepicker',
        examples: [
          {
            id: 'date-basic',
            title: 'Basic date',
            description: 'Одиночный выбор даты с кнопкой очистки.',
            previewKey: 'extra-date-basic',          },
        ],
        apiSections: [presetProps('`mode="date"`'), ...pickerEventsAndSlots()],
      },
      {
        name: 'GrTimePicker',
        slug: 'gr-time-picker',
        title: 'GrTimePicker',
        summary: 'Пресет `GrDateTimePicker` с зафиксированным `mode="time"` — только выбор времени.',
        importPath: '@feugene/granularity-datepicker',
        examples: [
          {
            id: 'time-basic',
            title: 'Basic time',
            description: 'Выбор времени с секундами.',
            previewKey: 'extra-time-basic',          },
        ],
        apiSections: [presetProps('`mode="time"`'), ...pickerEventsAndSlots()],
      },
      {
        name: 'GrDateRangePicker',
        slug: 'gr-date-range-picker',
        title: 'GrDateRangePicker',
        summary: 'Пресет `GrDateTimePicker` с `mode="date"` и `range` — выбор диапазона дат (модель — массив из двух границ).',
        importPath: '@feugene/granularity-datepicker',
        examples: [
          {
            id: 'date-range',
            title: 'Date range',
            description: 'Выбор диапазона дат; модель — `GrDateRangeValue` (массив границ).',
            previewKey: 'extra-date-range',          },
        ],
        apiSections: [presetProps('`mode="date"` + `range`'), ...pickerEventsAndSlots()],
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
        slug: 'chrono-calendar',
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
        ],
        apiSections: calendarApiSections(),
      },
      {
        name: 'GrDatePicker',
        slug: 'chrono-date-picker',
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
        ],
        apiSections: datePickerApiSections(),
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
