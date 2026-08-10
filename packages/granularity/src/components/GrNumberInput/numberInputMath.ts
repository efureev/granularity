/**
 * Арифметика спинбаттона.
 *
 * Живёт отдельно от SFC, потому что это чистые функции с непростыми краями
 * (двоичная дробь, экспоненциальная запись) — их дешевле проверять напрямую,
 * чем через монтирование поля.
 */

/**
 * Сколько знаков после запятой у числа.
 *
 * Экспоненциальная запись разбирается отдельно: `String(1e-7)` — это `"1e-7"`,
 * и наивный поиск точки насчитал бы ноль знаков, после чего округление съело бы
 * всё значение целиком.
 */
export function decimalsOf(value: number): number {
  if (!Number.isFinite(value)) return 0

  const text = String(Math.abs(value))

  const exponential = text.match(/^\d+(?:\.(\d+))?e-(\d+)$/)
  if (exponential) {
    const [, fraction = '', exponent] = exponential
    return fraction.length + Number(exponent)
  }

  const dot = text.indexOf('.')
  return dot === -1 ? 0 : text.length - dot - 1
}

/**
 * Шаг с округлением до разрядности операндов.
 *
 * Без него `0.1 + 0.1 + 0.1` показывалось пользователю как
 * `0.30000000000000004`: двоичная дробь копит ошибку, а поле печатало результат
 * с точностью до 20 знаков. Разрядность берётся по большему из операндов —
 * шаг `0.5` от значения `1.25` обязан дать `1.75`, а не `1.8`.
 */
export function addStep(current: number, step: number): number {
  const decimals = Math.max(decimalsOf(current), decimalsOf(step))
  const sum = current + step

  // `toFixed` за пределами 100 знаков бросает, да и смысла там уже нет.
  return decimals > 100 ? sum : Number(sum.toFixed(decimals))
}

/**
 * Крупный шаг `PageUp`/`PageDown`.
 *
 * Правило то же, что у `GrSlider` (`bigStep` в `GrSlider.vue`): десять шагов
 * либо десятая часть диапазона — что крупнее. Разница в том, что у поля границы
 * необязательны: без них диапазона не существует, и остаются десять шагов.
 */
export function bigStep(step: number, min?: number, max?: number): number {
  const base = step * 10
  if (min === undefined || max === undefined) return base

  const span = max - min
  const tenth = Math.round((span / 10) / step) * step

  return Math.max(base, tenth || step)
}
