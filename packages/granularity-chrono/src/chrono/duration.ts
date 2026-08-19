import type { NameWidth } from './chronoFormat'

/**
 * «2 ч 30 мин» — длина промежутка, а не момент на часах.
 *
 * Модуль отвечает на два вопроса: какими единицами разложить промежуток и как
 * назвать их в текущей локали. Названия и склонение числительного берёт
 * платформа — `Intl.DurationFormat`, а где его ещё нет, тот же результат
 * собирается из `Intl.NumberFormat` со `style: 'unit'`.
 *
 * Единиц ровно четыре — сутки, часы, минуты, секунды, — и крупнее не будет.
 * Месяц и год календарные: в феврале и в июле они разной длины, и вывести их
 * из числа секунд нельзя, не соврав. Разрыв между двумя датами календарём
 * меряет `selectRelativeAmount`.
 */

export type DurationUnit = 'day' | 'hour' | 'minute' | 'second'

export type DurationParts = Partial<Record<DurationUnit, number>>

const SECONDS_IN: Record<DurationUnit, number> = {
  day: 86_400,
  hour: 3600,
  minute: 60,
  second: 1,
}

/** От крупной к мелкой: порядок задаёт и разложение, и порядок слов в строке. */
const UNIT_ORDER: readonly DurationUnit[] = ['day', 'hour', 'minute', 'second']

/** Множественные имена, которых ждёт `Intl.DurationFormat`. */
const INTL_UNIT: Record<DurationUnit, 'days' | 'hours' | 'minutes' | 'seconds'> = {
  day: 'days',
  hour: 'hours',
  minute: 'minutes',
  second: 'seconds',
}

export interface SelectDurationPartsOptions {
  /**
   * Сколько единиц показывать подряд, считая от первой ненулевой. `2` даёт
   * «2 ч 30 мин»; хвост отбрасывается.
   */
  maxUnits?: number
  /** Крупнее этой единицы не дробить: остаток копится в ней. */
  largestUnit?: DurationUnit
  /** Мельче этой не спускаться. */
  smallestUnit?: DurationUnit
}

function unitRange(largest: DurationUnit, smallest: DurationUnit): readonly DurationUnit[] {
  const from = UNIT_ORDER.indexOf(largest)
  const to = UNIT_ORDER.indexOf(smallest)

  return from <= to ? UNIT_ORDER.slice(from, to + 1) : [largest]
}

/**
 * Разложение промежутка на единицы.
 *
 * Знака у результата нет: длительность — это длина, а направление её не
 * касается. Отсчёт единиц начинается с первой ненулевой, поэтому получасовой
 * промежуток при `maxUnits: 2` читается как «30 мин 0 с», а не «0 дн 0 ч».
 *
 * Младшие части **отбрасываются, а не округляются**: «2 ч 59 мин 30 с» при
 * двух единицах остаётся «2 ч 59 мин». Округление подняло бы показ выше
 * реально прошедшего времени, а этим значением обычно меряют именно его.
 */
export function selectDurationParts(totalSeconds: number, options: SelectDurationPartsOptions = {}): DurationParts {
  const maxUnits = Math.max(1, Math.trunc(options.maxUnits ?? 2))
  const smallest = options.smallestUnit ?? 'second'
  const units = unitRange(options.largestUnit ?? 'day', smallest)

  const parts: DurationParts = {}
  let rest = Math.floor(Math.abs(Number.isFinite(totalSeconds) ? totalSeconds : 0))
  let taken = 0

  for (const unit of units) {
    const size = SECONDS_IN[unit]
    const value = Math.floor(rest / size)

    // Ведущие нули не занимают места в выдаче: счётчик начинает считать с
    // первой единицы, которая действительно набралась.
    if (value === 0 && taken === 0) continue

    parts[unit] = value
    rest -= value * size
    taken += 1

    if (taken === maxUnits) break
  }

  // Пустой промежуток — это «0 с», а не пустая строка: пустота читается как
  // «нет данных», а ноль означает другое.
  if (taken === 0) return { [smallest]: 0 }

  // Хвостовой ноль не несёт информации: ровно два часа — это «2 ч», а не
  // «2 ч 0 мин». `maxUnits` задаёт потолок, а не квоту, которую надо добрать.
  // Первая часть по построению ненулевая, поэтому цикл не съест всё.
  for (const unit of units.filter(item => parts[item] !== undefined).reverse()) {
    if (parts[unit] !== 0) break

    delete parts[unit]
  }

  return parts
}

/**
 * Машинная форма для `<time datetime>` — ISO 8601.
 *
 * Считается по полному значению, а не по показанным единицам: `maxUnits`
 * сокращает текст для человека, но разметка обязана остаться точной.
 */
export function durationToIso(totalSeconds: number): string {
  const total = Math.floor(Math.abs(Number.isFinite(totalSeconds) ? totalSeconds : 0))

  const days = Math.floor(total / SECONDS_IN.day)
  const hours = Math.floor((total % SECONDS_IN.day) / SECONDS_IN.hour)
  const minutes = Math.floor((total % SECONDS_IN.hour) / SECONDS_IN.minute)
  const seconds = total % SECONDS_IN.minute

  const time = [
    hours ? `${hours}H` : '',
    minutes ? `${minutes}M` : '',
    seconds || (!days && !hours && !minutes) ? `${seconds}S` : '',
  ].join('')

  return `P${days ? `${days}D` : ''}${time ? `T${time}` : ''}`
}

export interface FormatDurationOptions extends SelectDurationPartsOptions {
  /** Длина имён единиц: «2 часа 30 минут» против «2 ч 30 мин». */
  style?: NameWidth
}

const durationFormats = new Map<string, Intl.DurationFormat>()
const unitFormats = new Map<string, Intl.NumberFormat>()
const listFormats = new Map<string, Intl.ListFormat>()

/**
 * Поддержка платформы проверяется лениво и запоминается: `typeof` на каждый
 * такт живой метки — лишняя работа, а на импорте модуля проверка стала бы
 * непроверяемой. Сбрасывается вместе с кэшем форматтеров.
 */
let supportsDurationFormat: boolean | null = null

function hasDurationFormat(): boolean {
  supportsDurationFormat ??= typeof Intl.DurationFormat === 'function'

  return supportsDurationFormat
}

/**
 * Локаль приходит из настроек приложения, и опечатка в теге не имеет права
 * уронить рендер — как и в соседних модулях, падаем на `en`.
 */
function take<T>(cache: Map<string, T>, key: string, create: (locale: string) => T, locale: string): T {
  let value = cache.get(key)

  if (!value) {
    try {
      value = create(locale)
    }
    catch {
      value = create('en')
    }

    cache.set(key, value)
  }

  return value
}

function formatWithUnits(locale: string, style: NameWidth, parts: DurationParts): string {
  const words = UNIT_ORDER
    .filter(unit => parts[unit] !== undefined)
    .map(unit => take(
      unitFormats,
      `${locale} ${style} ${unit}`,
      loc => new Intl.NumberFormat(loc, { style: 'unit', unit, unitDisplay: style }),
      locale,
    ).format(parts[unit]!))

  return take(
    listFormats,
    `${locale} ${style}`,
    loc => new Intl.ListFormat(loc, { style, type: 'unit' }),
    locale,
  ).format(words)
}

/**
 * Длительность словами текущей локали.
 *
 * Путей два, и результат у них совпадает: на `ru` оба дают «2 ч 30 мин».
 * Второй нужен не ради экзотики — `Intl.DurationFormat` появился недавно, а
 * пакет заявляет Node `>=22`, где его нет вовсе. Без запасного пути серверный
 * рендер падал бы, а разметка расходилась бы с клиентской.
 */
export function formatDuration(locale: string, totalSeconds: number, options: FormatDurationOptions = {}): string {
  const style = options.style ?? 'short'
  const parts = selectDurationParts(totalSeconds, options)

  // Вырожденный случай идёт запасным путём всегда: `Intl.DurationFormat`
  // опускает нулевые поля, и «0 с» превратилось бы в пустую строку — то есть
  // в «нет данных» вместо «нисколько».
  const isZero = Object.values(parts).every(value => value === 0)

  if (isZero || !hasDurationFormat()) return formatWithUnits(locale, style, parts)

  const duration: Partial<Record<'days' | 'hours' | 'minutes' | 'seconds', number>> = {}
  for (const unit of UNIT_ORDER) {
    if (parts[unit] !== undefined) duration[INTL_UNIT[unit]] = parts[unit]
  }

  return take(
    durationFormats,
    `${locale} ${style}`,
    loc => new Intl.DurationFormat(loc, { style }),
    locale,
  ).format(duration)
}

/** Для тестов и для смены локали приложением на лету. */
export function resetDurationFormatCache(): void {
  durationFormats.clear()
  unitFormats.clear()
  listFormats.clear()
  supportsDurationFormat = null
}
