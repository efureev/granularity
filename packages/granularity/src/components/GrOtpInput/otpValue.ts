/**
 * Чистая логика значения OTP-поля: алфавит, нормализация ввода и разбивка на
 * группы. Без Vue и без DOM — здесь дёшево перебрать края, а края тут и есть
 * весь риск.
 */

export const GR_OTP_INPUT_TYPES = ['numeric', 'alphanumeric', 'text'] as const
export type GrOtpInputType = typeof GR_OTP_INPUT_TYPES[number]

/**
 * Алфавиты по типу. `text` — любой непробельный символ: пробел в коде не несёт
 * смысла, а при вставке из мессенджера приходит вместе с ним.
 */
export const OTP_TYPE_PATTERNS: Record<GrOtpInputType, string> = {
  numeric: '[0-9]',
  alphanumeric: '[0-9A-Za-z]',
  text: '\\S',
}

/** Раскладка клавиатуры на мобильном: цифровой блок только там, где он уместен. */
export const OTP_TYPE_INPUT_MODES: Record<GrOtpInputType, 'numeric' | 'text'> = {
  numeric: 'numeric',
  alphanumeric: 'text',
  text: 'text',
}

export type OtpMatcher = (char: string) => boolean

/**
 * Матчер алфавита. Своя регулярка потребителя перекрывает тип; сломанная —
 * повод сказать об этом в dev и вернуться к типу, а не уронить рендер.
 */
export function createOtpMatcher(type: GrOtpInputType, pattern?: string): OtpMatcher {
  const source = pattern ?? OTP_TYPE_PATTERNS[type]

  let regexp: RegExp
  try {
    regexp = new RegExp(`^(?:${source})$`, 'u')
  }
  catch {
    if (__GR_DEV__) {
      console.warn(
        `[granularity] GrOtpInput: \`pattern\` «${source}» не компилируется — `
        + `алфавит взят из \`type="${type}"\`.`,
      )
    }
    regexp = new RegExp(`^(?:${OTP_TYPE_PATTERNS[type]})$`, 'u')
  }

  return char => regexp.test(char)
}

export interface NormalizeOtpOptions {
  /** Значение до правки: по нему считается, сколько символов вставлено. */
  previous: string
  /** Сырое содержимое поля после события `input`. */
  raw: string
  /** Каретка в координатах **сырой** строки. */
  caret: number
  length: number
  matcher: OtpMatcher
  /** Приводить ли к верхнему регистру: коды печатают капсом. */
  uppercase: boolean
}

export interface NormalizedOtp {
  value: string
  caret: number
}

/**
 * Свести сырое содержимое поля к коду фиксированной длины.
 *
 * Одна функция на все источники ввода — символ с клавиатуры, вставка из буфера,
 * подстановка кода из SMS, — потому что различить их по событию нельзя:
 * мобильные клавиатуры и автозаполнение присылают целую строку одним `input`.
 *
 * Три шага, и каждый закрывает свой отказ:
 *
 * 1. **Отсев чужих символов с переносом каретки.** Индексы после отсева
 *    съезжают, и каретку надо считать в новых координатах, иначе вставка
 *    `123-456` поставит её на два символа правее конца.
 * 2. **Печать заменяет, а не сдвигает.** Ячейка держит ровно один символ, и
 *    напечатанное в неё занимает её место, а хвост кода остаётся где стоял.
 *    Правило безусловное, а не «когда поле заполнено»: иначе одно и то же
 *    нажатие в начале кода то заменяло бы символ, то двигало весь остаток —
 *    в зависимости от того, сколько ячеек занято.
 * 3. **Обрезка по длине.** Вставка длиннее поля режется со стороны каретки:
 *    выкусывать за ней уже нечего, а сдвигать набранное нельзя.
 */
export function normalizeOtpInput(options: NormalizeOtpOptions): NormalizedOtp {
  const { previous, raw, caret, length, matcher, uppercase } = options

  let kept = ''
  let keptCaret = -1

  for (let index = 0; index < raw.length; index += 1) {
    if (index === caret)
      keptCaret = kept.length

    const char = raw[index]
    if (matcher(char))
      kept += uppercase ? char.toUpperCase() : char
  }

  if (keptCaret === -1)
    keptCaret = kept.length

  const inserted = kept.length - previous.length
  let value = inserted > 0
    ? kept.slice(0, keptCaret) + kept.slice(keptCaret + inserted)
    : kept

  if (value.length <= length)
    return { value, caret: Math.min(keptCaret, value.length) }

  const excess = value.length - length
  const cut = Math.max(0, keptCaret - excess)
  value = value.slice(0, cut) + value.slice(keptCaret)

  return { value: value.slice(0, length), caret: Math.min(cut, length) }
}

/** Отсев без каретки — для значения, пришедшего из `v-model`. */
export function sanitizeOtpValue(
  value: string,
  options: { length: number, matcher: OtpMatcher, uppercase: boolean },
): string {
  return normalizeOtpInput({
    previous: '',
    raw: value,
    caret: value.length,
    length: options.length,
    matcher: options.matcher,
    uppercase: options.uppercase,
  }).value
}

/**
 * Индексы ячеек, **перед** которыми стоит разделитель.
 *
 * Разбивка, не сходящаяся с длиной, — ошибка потребителя, а не повод рисовать
 * половину: группы игнорируются целиком, о чём говорит предупреждение в вызове.
 */
export function otpSeparatorIndexes(length: number, groups?: number[]): Set<number> {
  const indexes = new Set<number>()
  if (!groups?.length)
    return indexes

  const total = groups.reduce((sum, size) => sum + size, 0)
  if (total !== length || groups.some(size => size <= 0))
    return indexes

  let offset = 0
  for (const size of groups.slice(0, -1)) {
    offset += size
    indexes.add(offset)
  }

  return indexes
}

export function isOtpGroupsValid(length: number, groups?: number[]): boolean {
  if (!groups?.length)
    return true

  return groups.every(size => size > 0) && groups.reduce((sum, size) => sum + size, 0) === length
}
