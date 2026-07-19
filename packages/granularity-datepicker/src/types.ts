/**
 * GR-owned контракт пикера. Намеренно НЕ реэкспортирует типы
 * `@vuepic/vue-datepicker` — публичная поверхность пакета принадлежит
 * дизайн-системе, поэтому реализацию (vuepic) можно будет заменить без
 * breaking change в API компонентов.
 */

/** Одиночное значение даты/времени. `Date`, строка/число (по `modelType`) или пусто. */
export type GrDateValue = Date | string | number | null

/** Значение диапазона: массив из двух границ (форма `@vuepic/vue-datepicker`). */
export type GrDateRangeValue = GrDateValue[] | null

/** Значение `v-model` пикера — одиночное либо диапазон. */
export type GrDateTimeModel = GrDateValue | GrDateRangeValue

/**
 * Что выбирает пользователь.
 *
 * - `date`     — календарь без времени;
 * - `datetime` — календарь + время;
 * - `time`     — только время;
 * - `month`    — месяц и год;
 * - `year`     — только год.
 */
export type GrDateTimePickerMode = 'date' | 'datetime' | 'time' | 'month' | 'year'

/** Встроенные локали-шорткаты (маппятся на локали `date-fns` внутри компонента). */
export type GrDateTimePickerLocale = 'en' | 'ru'

/** Публичные пропсы `GrDateTimePicker` (без утечки типов `@vuepic/vue-datepicker`). */
export interface GrDateTimePickerProps {
  /** Значение `v-model`. Тип зависит от `mode`/`range` и `modelType`. */
  modelValue?: GrDateTimeModel
  /** Режим выбора. По умолчанию `date`. */
  mode?: GrDateTimePickerMode
  /** Выбор диапазона вместо одиночного значения. */
  range?: boolean
  /** Локаль (шорткат). Для произвольной локали используйте `datepickerProps.locale`. */
  locale?: GrDateTimePickerLocale
  placeholder?: string
  disabled?: boolean
  /** Показывать кнопку очистки. По умолчанию `true`. */
  clearable?: boolean
  /** Применять выбор сразу, без кнопки «Apply». По умолчанию `true`. */
  autoApply?: boolean
  /** Включить выбор секунд (для `datetime`/`time`). */
  enableSeconds?: boolean
  /** Нижняя граница допустимых дат. */
  minDate?: GrDateValue
  /** Верхняя граница допустимых дат. */
  maxDate?: GrDateValue
  /** Формат отображения (строка-паттерн `@vuepic/vue-datepicker`). */
  format?: string
  /**
   * Как значение (де)сериализуется в модель. См. `modelType`
   * в документации `@vuepic/vue-datepicker` (например `'timestamp'`, `'yyyy-MM-dd'`).
   */
  modelType?: string
  /** Куда телепортировать меню. По умолчанию `true` (→ `body`); `false` — без телепорта. */
  teleport?: boolean | string
  /** Escape-hatch: классы, домешиваемые в `ui` подлежащего `VueDatePicker`. */
  ui?: Record<string, unknown>
  /** Escape-hatch: любые пропсы `@vuepic/vue-datepicker` (перекрывают дефолты пакета). */
  datepickerProps?: Record<string, unknown>
}
