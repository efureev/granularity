import type { PlainDate } from './plainDate'
import { plainDateKey } from './plainDate'
import type { PlainTime } from './plainTime'

/**
 * Граница между кортежами пакета и `Date` потребителя.
 *
 * Здесь — и только здесь — появляется `Date`. Всё остальное считает на
 * `PlainDate`/`PlainTime`, и именно поэтому перевод часов не задевает сетку:
 * до этой границы понятия «час» в арифметике просто нет.
 *
 * Разбор берёт **локальные** поля `Date`, сборка кладёт локальную полночь.
 * Это осознанно: пользователь выбирает дату в своём календаре, а не в UTC, и
 * «12 августа» обязано остаться 12 августа независимо от смещения зоны.
 */

/** Значение `v-model` одиночного выбора. */
export type GrChronoValue = Date | null

/** Значение `v-model` диапазона: обе границы или ничего. */
export type GrChronoRangeValue = [Date, Date] | null

export function toPlainDate(date: Date): PlainDate {
  return { y: date.getFullYear(), m: date.getMonth(), d: date.getDate() }
}

/**
 * Сегодняшняя дата по часам среды — единственное место, где пакет их читает.
 *
 * Отдельной функцией, чтобы место было ровно одно: часы в пути отрисовки дают
 * расхождение серверного рендера с клиентским, и компонент обязан звать это
 * осознанно, один раз на экземпляр.
 */
export function clockDate(): PlainDate {
  return toPlainDate(new Date())
}

export function toPlainTime(date: Date): PlainTime {
  return { h: date.getHours(), min: date.getMinutes(), s: date.getSeconds() }
}

/**
 * Кортежи обратно в `Date`. Без времени — локальная полночь.
 *
 * `new Date(y, m, d)` с однозначными годами трактует их как 19xx
 * (`new Date(50, 0, 1)` — это 1950 год), поэтому год выставляется отдельно.
 */
export function fromPlainParts(date: PlainDate, time?: PlainTime): Date {
  const result = new Date(2000, date.m, date.d, time?.h ?? 0, time?.min ?? 0, time?.s ?? 0, 0)
  result.setFullYear(date.y, date.m, date.d)

  return result
}

/** Дата валидна и пригодна к разбору. */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

/**
 * Как значение уходит наружу и приходит обратно.
 *
 * Отдельным пропом, а не подменой типа модели: у предшественника `modelValue`
 * был `Date | string | number`, а фактический тип задавала строка `modelType`,
 * и вывести его из типов было невозможно.
 */
export interface GrChronoAdapter<T> {
  /** Из значения потребителя в `Date`. Невалидное — `null`, а не исключение. */
  parse: (raw: T) => Date | null
  serialize: (date: Date) => T
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0')
}

/** Значение уже `Date` — адаптер тождественный. */
export const dateAdapter: GrChronoAdapter<Date | null> = {
  parse: raw => (isValidDate(raw) ? raw : null),
  serialize: date => date,
}

/** `2026-08-12` — календарная дата без времени и без зоны. */
export const isoDateAdapter: GrChronoAdapter<string | null> = {
  parse: (raw) => {
    if (typeof raw !== 'string') return null

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
    if (!match) return null

    const [, y, m, d] = match as unknown as [string, string, string, string]
    const date = fromPlainParts({ y: Number(y), m: Number(m) - 1, d: Number(d) })

    // `2026-02-31` разобралось бы в 3 марта: сверяем, что дата пережила
    // обратную сборку без сдвига.
    return plainDateKey(toPlainDate(date)) === raw ? date : null
  },
  serialize: date => plainDateKey(toPlainDate(date)),
}

/**
 * `2026-08-12T14:30:00` — локальное время без смещения.
 *
 * Смещения нет намеренно: значение описывает то, что человек видит на часах,
 * а не момент на мировой линии. Кому нужен момент — сериализует `Date` сам.
 */
export const isoDateTimeAdapter: GrChronoAdapter<string | null> = {
  parse: (raw) => {
    if (typeof raw !== 'string') return null

    const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(raw)
    if (!match) return null

    const [, y, m, d, h, min, s] = match as unknown as [string, string, string, string, string, string, string?]
    const date = fromPlainParts(
      { y: Number(y), m: Number(m) - 1, d: Number(d) },
      { h: Number(h), min: Number(min), s: Number(s ?? 0) },
    )

    const plain = toPlainDate(date)
    return plainDateKey(plain) === `${y}-${m}-${d}` && date.getHours() === Number(h) ? date : null
  },
  serialize: (date) => {
    const plain = toPlainDate(date)
    const time = toPlainTime(date)
    return `${plainDateKey(plain)}T${pad(time.h)}:${pad(time.min)}:${pad(time.s)}`
  },
}

/** Миллисекунды эпохи. */
export const timestampAdapter: GrChronoAdapter<number | null> = {
  parse: (raw) => {
    if (typeof raw !== 'number' || !Number.isFinite(raw)) return null

    const date = new Date(raw)
    return isValidDate(date) ? date : null
  },
  serialize: date => date.getTime(),
}

const ADAPTERS = {
  date: dateAdapter,
  isoDate: isoDateAdapter,
  isoDateTime: isoDateTimeAdapter,
  timestamp: timestampAdapter,
} as const

/**
 * Имена готовых адаптеров — то, что потребитель пишет пропом.
 *
 * Тип выводится из самой мапы, а не объявляется рядом: иначе имя без
 * реализации (или реализация без имени) прошли бы компиляцию.
 */
export type GrChronoAdapterName = keyof typeof ADAPTERS

/** Имя готового адаптера либо свой. */
export function resolveChronoAdapter<T>(
  adapter: GrChronoAdapterName | GrChronoAdapter<T> | undefined,
): GrChronoAdapter<T> {
  if (!adapter) return ADAPTERS.date as unknown as GrChronoAdapter<T>
  if (typeof adapter === 'string') return ADAPTERS[adapter] as unknown as GrChronoAdapter<T>

  return adapter
}
