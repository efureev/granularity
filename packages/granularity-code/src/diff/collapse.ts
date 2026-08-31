import type { GrDiffLine } from './diffLines'

/**
 * Схлопывание неизменных участков.
 *
 * Дифф конфига на тысячу строк с одной правкой обязан открываться показом этой
 * правки, а не тысячи одинаковых строк. Вокруг каждого изменения остаётся
 * `context` строк, остальное сворачивается в раскрываемый пропуск.
 */

export interface GrDiffGap {
  kind: 'gap'
  /**
   * Идентификатор пропуска — позиция **первой строки участка** в `before`.
   *
   * Позиция, а не порядковый номер: раскрытие соседнего пропуска порядковые
   * номера сдвинуло бы, и открытым оказался бы не тот.
   *
   * Именно первой строки участка, а не первой скрытой: скрытые края съезжают на
   * каждом шаге раскрытия, и идентификатор, считанный по ним, менялся бы вместе
   * с ними — состояние раскрытия теряло бы свой же пропуск после первого клика.
   */
  id: string
  /** Сколько строк скрыто. */
  hidden: number
  beforeStart: number | null
  afterStart: number | null
}

export interface GrDiffLineRow {
  kind: 'line'
  line: GrDiffLine
}

export type GrDiffRow = GrDiffLineRow | GrDiffGap

/** Край пропуска: у начала (примыкает к тексту сверху) или у конца. */
export type GrDiffGapEdge = 'top' | 'bottom'

/**
 * Сколько строк пропуска уже раскрыто с каждого края.
 *
 * Два числа, а не флаг «раскрыт»: пропуск на пятьсот строк раскрывают шагами и
 * с той стороны, которая нужна, — как в обзоре кода. Флаг означал бы «показать
 * всё», то есть выкинуть в поток ровно то, ради сокрытия чего пропуск и нужен.
 */
export interface GrDiffGapExpansion {
  top: number
  bottom: number
}

export interface CollapseOptions {
  /** Сколько неизменных строк оставлять по краям изменения. */
  context?: number
  /** Раскрытые края пропусков по идентификатору. */
  expanded?: ReadonlyMap<string, GrDiffGapExpansion>
}

export const GR_DIFF_DEFAULT_CONTEXT = 3

/** Сколько строк открывает одно нажатие. */
export const GR_DIFF_DEFAULT_EXPAND_STEP = 10

const NOTHING_EXPANDED: GrDiffGapExpansion = { top: 0, bottom: 0 }

/**
 * Следующее состояние раскрытия после нажатия.
 *
 * Остаток меньше шага дораскрывается целиком: показать «ещё 3 строки из 3» и
 * оставить кнопку, которая больше ничего не откроет, — тупик, в который
 * пользователь упирается ровно один раз и больше кнопке не верит.
 */
export function expandGap(
  current: GrDiffGapExpansion | undefined,
  edge: GrDiffGapEdge,
  hidden: number,
  step: number,
): GrDiffGapExpansion {
  const from = current ?? NOTHING_EXPANDED

  if (hidden <= 0)
    return from

  if (hidden <= step)
    return { top: from.top + hidden, bottom: from.bottom }

  return edge === 'top'
    ? { top: from.top + step, bottom: from.bottom }
    : { top: from.top, bottom: from.bottom + step }
}

/** Минимальный выигрыш, ради которого стоит сворачивать. */
const MIN_HIDDEN = 1

/**
 * Строки в ряды с пропусками.
 *
 * `context: Infinity` не сворачивает ничего — режим «показать всё». `context: 0`
 * оставляет только изменения.
 */
export function collapseUnchanged(
  lines: readonly GrDiffLine[],
  options: CollapseOptions = {},
): GrDiffRow[] {
  const context = options.context ?? GR_DIFF_DEFAULT_CONTEXT
  const expanded = options.expanded

  if (!Number.isFinite(context))
    return lines.map(line => ({ kind: 'line', line }))

  // Дифф без единого изменения сворачивать не во что: пропуск существует
  // **между** изменениями, а тут их нет. Иначе совпавшие входы показали бы
  // «скрыто N строк» вместо содержимого.
  if (!lines.some(line => line.op !== 'equal'))
    return lines.map(line => ({ kind: 'line', line }))

  const rows: GrDiffRow[] = []
  let index = 0

  while (index < lines.length) {
    if (lines[index]!.op !== 'equal') {
      rows.push({ kind: 'line', line: lines[index]! })
      index += 1
      continue
    }

    // Длина непрерывного участка равных строк.
    let end = index
    while (end < lines.length && lines[end]!.op === 'equal')
      end += 1

    const run = lines.slice(index, end)
    // Хвост в начале и в конце файла контекстом не считается: показывать
    // `context` строк перед первым изменением нужно, а до них — нечего.
    const gapId = `gap-${lines[index]!.beforeNumber ?? lines[index]!.afterNumber ?? index}`
    const revealed = expanded?.get(gapId) ?? NOTHING_EXPANDED
    const head = (index === 0 ? 0 : context) + revealed.top
    const tail = (end === lines.length ? 0 : context) + revealed.bottom
    const hidden = run.length - head - tail

    if (hidden < MIN_HIDDEN) {
      for (const line of run)
        rows.push({ kind: 'line', line })

      index = end
      continue
    }

    for (const line of run.slice(0, head))
      rows.push({ kind: 'line', line })

    const first = run[head]!

    rows.push({
      kind: 'gap',
      id: gapId,
      hidden,
      beforeStart: first.beforeNumber,
      afterStart: first.afterNumber,
    })

    for (const line of run.slice(run.length - tail))
      rows.push({ kind: 'line', line })

    index = end
  }

  return rows
}

/** Пара «левая / правая» для режима `split`. Пропуск занимает обе стороны. */
export interface GrDiffSplitRow {
  kind: 'pair'
  left: GrDiffLine | null
  right: GrDiffLine | null
}

export type GrDiffSplitEntry = GrDiffSplitRow | GrDiffGap

/**
 * Ряды в две колонки.
 *
 * Замена сводится в **одну** пару: именно так она читается, и только так
 * пословная подсветка встаёт друг напротив друга.
 *
 * Считать парой «удаление и следующий за ним ряд» нельзя: `diffLines` выдаёт
 * блок правки целиком удалениями, а потом целиком добавлениями
 * (`-a -b -c +A +B +C`). При таком счёте в пару попадали бы только `-c` и `+A`,
 * то есть строки, друг к другу не относящиеся: колонки съезжали бы лесенкой, а
 * пословная подсветка красила бы всю строку целиком — «изменилось всё».
 * Поэтому блок собирается сначала целиком, и k-е удаление встаёт против
 * k-го добавления.
 */
export function toSplitRows(rows: readonly GrDiffRow[]): GrDiffSplitEntry[] {
  const result: GrDiffSplitEntry[] = []
  let index = 0

  while (index < rows.length) {
    const row = rows[index]!

    if (row.kind === 'gap') {
      result.push(row)
      index += 1
      continue
    }

    if (row.line.op === 'equal') {
      result.push({ kind: 'pair', left: row.line, right: row.line })
      index += 1
      continue
    }

    // Блок правки целиком: подряд идущие удаления, затем подряд идущие
    // добавления. Пропуск блок обрывает — за ним другое место файла.
    const removed: GrDiffLine[] = []
    const added: GrDiffLine[] = []

    while (index < rows.length) {
      const next = rows[index]!

      if (next.kind !== 'line' || next.line.op === 'equal')
        break

      if (next.line.op === 'remove' && added.length > 0)
        break

      if (next.line.op === 'remove')
        removed.push(next.line)
      else
        added.push(next.line)

      index += 1
    }

    for (let offset = 0; offset < Math.max(removed.length, added.length); offset += 1) {
      result.push({
        kind: 'pair',
        left: removed[offset] ?? null,
        right: added[offset] ?? null,
      })
    }
  }

  return result
}
