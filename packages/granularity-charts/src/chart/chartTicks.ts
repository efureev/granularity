/**
 * Деления осей.
 *
 * Алгоритм для чисел — Heckbert «nice numbers» (loose labeling): мантиссы
 * 1/2/5/10, `O(1)`, детерминирован. То же семейство, что у `d3.ticks`, то есть
 * привычный потребителю рисунок.
 *
 * Wilkinson extended отклонён осознанно: скоринг по simplicity/coverage/density
 * это двести строк, поведение которых задаётся эмпирическими весами, а
 * обосновать их в ревью нечем. Цена нашего выбора известна и невелика: на
 * неудобном диапазоне счёт делений может уйти от запрошенного — на это есть
 * ровно один повтор с половинным или удвоенным шагом, не поиск.
 */

export type GrTimeTickUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

export interface LinearTicks {
  values: number[]
  step: number
  /** Домен, расширенный наружу до кратных шагу границ. */
  niceDomain: [number, number]
}

export interface TimeTicks {
  values: number[]
  unit: GrTimeTickUnit
  step: number
}

/**
 * Ближайшее «красивое» число: 1, 2, 5 или 10 на своём порядке.
 *
 * `round: false` — не меньше `span` (для полного размаха), `round: true` —
 * ближайшее (для шага).
 */
export function niceNumber(span: number, round: boolean): number {
  if (!(span > 0) || !Number.isFinite(span))
    return 0

  const exponent = Math.floor(Math.log10(span))
  const fraction = span / 10 ** exponent
  let nice: number

  if (round)
    nice = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10
  else
    nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10

  return nice * 10 ** exponent
}

export function linearTicks(domain: readonly [number, number], count: number): LinearTicks {
  const [min, max] = domain

  if (!Number.isFinite(min) || !Number.isFinite(max))
    return { values: [], step: 0, niceDomain: [0, 0] }

  const desired = Math.max(2, Math.floor(count))

  if (min === max) {
    // Вырожденный домен: одно деление и симметричные границы. Три деления
    // (`v−0.5`, `v`, `v+0.5`) врали бы о разбросе, которого нет.
    return { values: [min], step: 0, niceDomain: [min - 0.5, max + 0.5] }
  }

  let step = niceNumber(niceNumber(max - min, false) / (desired - 1), true)
  let ticks = buildTicks(min, max, step)

  // Один повтор — и только он. Если счёт уехал больше чем вдвое, шаг явно не
  // того порядка; дальше это уже поиск, за которым идут к Wilkinson.
  if (Math.abs(ticks.values.length - desired) > desired / 2) {
    const retryStep = ticks.values.length > desired ? step * 2 : step / 2
    const retry = buildTicks(min, max, retryStep)

    if (Math.abs(retry.values.length - desired) < Math.abs(ticks.values.length - desired)) {
      step = retryStep
      ticks = retry
    }
  }

  return { ...ticks, step }
}

/**
 * Деления с числом, заданным снаружи.
 *
 * Нужны второй оси значений: у неё свои данные, но своё число делений она
 * выбирать не вправе. Две «красивые» лестницы дают разное количество линий,
 * сетка от этого двоится, и читать её становится нечем — поэтому счёт
 * приходит от левой оси, а шаг подбирается под него с той же лестницы 1/2/5/10.
 *
 * Домен расширяется наружу ровно до `count − 1` интервалов: данные остаются
 * внутри, а верхнее деление совпадает с верхней линией сетки.
 */
export function alignedTicks(domain: readonly [number, number], count: number): LinearTicks {
  const [min, max] = domain
  const intervals = Math.max(1, Math.floor(count) - 1)

  if (!Number.isFinite(min) || !Number.isFinite(max))
    return { values: [], step: 0, niceDomain: [0, 0] }

  if (min === max)
    return { values: [min], step: 0, niceDomain: [min - 0.5, max + 0.5] }

  const step = niceNumber((max - min) / intervals, false)

  if (!(step > 0))
    return { values: [min], step: 0, niceDomain: [min, max] }

  const start = Math.floor(min / step) * step
  const decimals = Math.max(0, -Math.floor(Math.log10(step)))
  const values = Array.from(
    { length: intervals + 1 },
    (_, index) => Number((start + step * index).toFixed(decimals)),
  )

  return { values, step, niceDomain: [values[0]!, values[values.length - 1]!] }
}

function buildTicks(min: number, max: number, step: number): Omit<LinearTicks, 'step'> {
  if (!(step > 0))
    return { values: [], niceDomain: [min, max] }

  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  // Знаков ровно столько, сколько несёт шаг: без этого 0.1 + 0.2 приезжает на
  // ось как `0.30000000000000004`.
  const decimals = Math.max(0, -Math.floor(Math.log10(step)))
  const total = Math.round((end - start) / step)
  const values: number[] = []

  for (let i = 0; i <= total; i++)
    values.push(Number((start + step * i).toFixed(decimals)))

  return {
    values,
    niceDomain: [Number(start.toFixed(decimals)), Number(end.toFixed(decimals))],
  }
}

/** Ступени лестницы времени и их приблизительная длительность — для выбора. */
const TIME_LADDER: { unit: GrTimeTickUnit, step: number, approxMs: number }[] = [
  { unit: 'second', step: 1, approxMs: 1e3 },
  { unit: 'second', step: 5, approxMs: 5e3 },
  { unit: 'second', step: 15, approxMs: 15e3 },
  { unit: 'second', step: 30, approxMs: 30e3 },
  { unit: 'minute', step: 1, approxMs: 6e4 },
  { unit: 'minute', step: 5, approxMs: 3e5 },
  { unit: 'minute', step: 15, approxMs: 9e5 },
  { unit: 'minute', step: 30, approxMs: 18e5 },
  { unit: 'hour', step: 1, approxMs: 36e5 },
  { unit: 'hour', step: 3, approxMs: 108e5 },
  { unit: 'hour', step: 6, approxMs: 216e5 },
  { unit: 'hour', step: 12, approxMs: 432e5 },
  { unit: 'day', step: 1, approxMs: 864e5 },
  { unit: 'day', step: 2, approxMs: 1728e5 },
  { unit: 'week', step: 1, approxMs: 6048e5 },
  { unit: 'month', step: 1, approxMs: 2.6298e9 },
  { unit: 'month', step: 3, approxMs: 7.8894e9 },
  { unit: 'year', step: 1, approxMs: 3.1557e10 },
]

const MAX_TICKS = 500

/**
 * Деления оси времени.
 *
 * Месяцы и годы шагаются конструктором `Date`, а не фиксированным числом
 * миллисекунд: 31-дневные месяцы и високосные годы иначе уползают, а на
 * переводе часов появляется дубль деления либо пропадает одно. Тесты идут в
 * зоне с DST — в UTC этот класс ошибок не воспроизводится вовсе.
 */
export function timeTicks(domain: readonly [number, number], count: number): TimeTicks {
  const [from, to] = domain

  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from)
    return { values: [], unit: 'day', step: 1 }

  const desired = Math.max(2, Math.floor(count))
  const span = to - from
  const chosen = TIME_LADDER.find(entry => span / entry.approxMs <= desired - 1)
    ?? TIME_LADDER[TIME_LADDER.length - 1]!

  // Годовой шаг растягивается сам: на диапазоне в век годовых делений было бы
  // сто, а лестница выше уже кончилась.
  const step = chosen.unit === 'year'
    ? Math.max(1, niceNumber(span / chosen.approxMs / (desired - 1), true))
    : chosen.step

  const values: number[] = []
  let cursor = alignUp(new Date(from), chosen.unit, step)

  while (cursor.getTime() <= to && values.length < MAX_TICKS) {
    values.push(cursor.getTime())
    cursor = addUnit(cursor, chosen.unit, step)
  }

  return { values, unit: chosen.unit, step }
}

function alignUp(date: Date, unit: GrTimeTickUnit, step: number): Date {
  const aligned = floorTo(date, unit)

  snapField(aligned, unit, step)

  if (aligned.getTime() < date.getTime())
    return addUnit(aligned, unit, step)

  return aligned
}

function floorTo(date: Date, unit: GrTimeTickUnit): Date {
  const next = new Date(date.getTime())

  next.setMilliseconds(0)
  if (unit === 'second')
    return next

  next.setSeconds(0)
  if (unit === 'minute')
    return next

  next.setMinutes(0)
  if (unit === 'hour')
    return next

  next.setHours(0)
  if (unit === 'day')
    return next

  if (unit === 'week') {
    // Неделя начинается с понедельника: это то, что видит в календаре
    // европейский и российский пользователь, а `Intl` тут ничего не решает.
    const weekday = (next.getDay() + 6) % 7

    next.setDate(next.getDate() - weekday)

    return next
  }

  next.setDate(1)
  if (unit === 'month')
    return next

  next.setMonth(0)

  return next
}

/** Привязка к кратному шагу внутри единицы: 15 минут — это :00, :15, :30, :45. */
function snapField(date: Date, unit: GrTimeTickUnit, step: number): void {
  if (step <= 1)
    return

  if (unit === 'second')
    date.setSeconds(Math.floor(date.getSeconds() / step) * step)
  else if (unit === 'minute')
    date.setMinutes(Math.floor(date.getMinutes() / step) * step)
  else if (unit === 'hour')
    date.setHours(Math.floor(date.getHours() / step) * step)
  else if (unit === 'month')
    date.setMonth(Math.floor(date.getMonth() / step) * step)
}

function addUnit(date: Date, unit: GrTimeTickUnit, step: number): Date {
  const next = new Date(date.getTime())

  switch (unit) {
    case 'second': next.setSeconds(next.getSeconds() + step); break
    case 'minute': next.setMinutes(next.getMinutes() + step); break
    case 'hour': next.setHours(next.getHours() + step); break
    case 'day': next.setDate(next.getDate() + step); break
    case 'week': next.setDate(next.getDate() + 7 * step); break
    case 'month': next.setMonth(next.getMonth() + step); break
    case 'year': next.setFullYear(next.getFullYear() + step); break
  }

  return next
}

/**
 * Прореживание категорий: не больше `max` подписей.
 *
 * Первая и последняя категории показываются всегда — по ним читается охват
 * оси, и без них ось выглядит обрезанной.
 */
export function bandTicks(count: number, max: number): number[] {
  const n = Math.max(0, Math.floor(count))

  if (n === 0)
    return []

  const limit = Math.max(2, Math.floor(max))

  if (n <= limit)
    return Array.from({ length: n }, (_, i) => i)

  const stride = Math.ceil(n / limit)
  const indices = new Set<number>()

  for (let i = 0; i < n; i += stride)
    indices.add(i)

  indices.add(n - 1)

  return [...indices].sort((a, b) => a - b)
}
