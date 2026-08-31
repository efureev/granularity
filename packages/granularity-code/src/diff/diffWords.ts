import { myersSteps } from './diffLines'

/**
 * Пословный дифф внутри изменённой строки.
 *
 * Без него правка одного слова в середине строки читается как «строка целиком
 * другая», и дифф перестаёт отвечать на свой вопрос. Считается тем же Майерсом,
 * что и построчный, — по токенам вместо строк.
 */

export interface GrDiffWord {
  text: string
  /** Отличается от парной стороны. Неизменённое остаётся фоном строки. */
  changed: boolean
}

export interface DiffWordsOptions {
  /**
   * Предел длины строки, за которым пословный разбор отключается.
   *
   * Строка без пробелов — длинный base64, минифицированный JSON — токенизируется
   * посимвольно, и разбор вырождается: подсвечивается каждый второй символ,
   * читать это невозможно, а стоит дорого. Такую строку честнее показать
   * изменённой целиком.
   */
  maxLength?: number
}

export const GR_DIFF_WORD_MAX_LENGTH = 400

/**
 * Токены строки: слово, пробельный промежуток или одиночный знак.
 *
 * Знаки препинания режутся поштучно намеренно: `foo(bar)` против `foo(baz)`
 * должно подсветить `bar`, а не всю хвостовую скобку вместе с ним.
 *
 * Слово — `\p{L}\p{N}_`, а не `[A-Za-z0-9_]`: код в админке содержит и русские
 * подписи, и любые другие. Диапазоном по кириллице этого не решить — языков
 * больше, чем алфавитов, которые мы успеем перечислить.
 */
export function splitWords(line: string): string[] {
  return line.match(/\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) ?? []
}

/** Вся строка одним изменённым куском — режим отказа от пословного разбора. */
function whole(before: string, after: string): { before: GrDiffWord[], after: GrDiffWord[] } {
  return {
    before: before ? [{ text: before, changed: true }] : [],
    after: after ? [{ text: after, changed: true }] : [],
  }
}

/** Соседние куски одного вида склеиваются: иначе разметка дробится на каждом токене. */
function merge(words: GrDiffWord[]): GrDiffWord[] {
  const merged: GrDiffWord[] = []

  for (const word of words) {
    const last = merged[merged.length - 1]

    if (last && last.changed === word.changed)
      last.text += word.text
    else
      merged.push({ ...word })
  }

  return merged
}

/**
 * Разбор пары «удалено / добавлено» на изменённые куски.
 *
 * Возвращает обе стороны: у левой отмечено удалённое, у правой — добавленное.
 * Общее остаётся `changed: false` и рисуется фоном строки.
 */
export function diffWords(
  before: string,
  after: string,
  options: DiffWordsOptions = {},
): { before: GrDiffWord[], after: GrDiffWord[] } {
  const maxLength = options.maxLength ?? GR_DIFF_WORD_MAX_LENGTH

  if (before.length > maxLength || after.length > maxLength)
    return whole(before, after)

  const a = splitWords(before)
  const b = splitWords(after)
  const steps = myersSteps(a, b, a.length + b.length)

  if (!steps)
    return whole(before, after)

  const left: GrDiffWord[] = []
  const right: GrDiffWord[] = []

  for (const step of steps) {
    if (step.op === 'equal') {
      left.push({ text: a[step.aIndex!]!, changed: false })
      right.push({ text: b[step.bIndex!]!, changed: false })
      continue
    }

    if (step.op === 'remove') {
      left.push({ text: a[step.aIndex!]!, changed: true })
      continue
    }

    right.push({ text: b[step.bIndex!]!, changed: true })
  }

  return { before: merge(left), after: merge(right) }
}
