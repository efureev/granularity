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
  previewKey: string
  code: string
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

export const companionPackages: CompanionPackage[] = [
  {
    id: 'granularity-datepicker',
    npmName: '@feugene/granularity-datepicker',
    label: 'Datepicker',
    description: 'Date / time / range picker для дизайн-системы: тонкая GR-owned обёртка над `@vuepic/vue-datepicker`. Ставится опционально — ядро `@feugene/granularity` остаётся lean.',
    version: '0.1.0',
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
            previewKey: 'extra-datepicker-modes',
            code: `<script setup lang="ts">
import { ref } from 'vue'
import { GrDateTimePicker } from '@feugene/granularity-datepicker'
import type { GrDateTimeModel, GrDateTimePickerMode } from '@feugene/granularity-datepicker'

const mode = ref<GrDateTimePickerMode>('datetime')
const value = ref<GrDateTimeModel>(null)
</script>

<template>
  <GrDateTimePicker v-model="value" :mode="mode" locale="en" placeholder="Pick a value" />
</template>`,
            note: 'Значение (де)сериализуется по `modelType`; по умолчанию — `Date`.',
          },
          {
            id: 'datetime-localized',
            title: 'Localized datetime with seconds',
            description: 'Русская локаль, выбор времени с секундами и подтверждением выбора (`auto-apply=false`).',
            previewKey: 'extra-datepicker-localized',
            code: `<script setup lang="ts">
import { ref } from 'vue'
import { GrDateTimePicker } from '@feugene/granularity-datepicker'
import type { GrDateTimeModel } from '@feugene/granularity-datepicker'

const value = ref<GrDateTimeModel>(null)
</script>

<template>
  <GrDateTimePicker
    v-model="value"
    mode="datetime"
    locale="ru"
    enable-seconds
    :auto-apply="false"
    placeholder="Выберите дату и время"
  />
</template>`,
          },
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
            previewKey: 'extra-date-basic',
            code: `<script setup lang="ts">
import { ref } from 'vue'
import { GrDatePicker } from '@feugene/granularity-datepicker'
import type { GrDateTimeModel } from '@feugene/granularity-datepicker'

const value = ref<GrDateTimeModel>(null)
</script>

<template>
  <GrDatePicker v-model="value" locale="en" clearable placeholder="Pick a date" />
</template>`,
          },
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
            previewKey: 'extra-time-basic',
            code: `<script setup lang="ts">
import { ref } from 'vue'
import { GrTimePicker } from '@feugene/granularity-datepicker'
import type { GrDateTimeModel } from '@feugene/granularity-datepicker'

const value = ref<GrDateTimeModel>(null)
</script>

<template>
  <GrTimePicker v-model="value" enable-seconds placeholder="Pick a time" />
</template>`,
          },
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
            previewKey: 'extra-date-range',
            code: `<script setup lang="ts">
import { ref } from 'vue'
import { GrDateRangePicker } from '@feugene/granularity-datepicker'
import type { GrDateRangeValue } from '@feugene/granularity-datepicker'

const value = ref<GrDateRangeValue>(null)
</script>

<template>
  <GrDateRangePicker v-model="value" locale="en" placeholder="Pick a date range" />
</template>`,
          },
        ],
        apiSections: [presetProps('`mode="date"` + `range`'), ...pickerEventsAndSlots()],
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
