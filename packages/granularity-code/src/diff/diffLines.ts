/**
 * Построчное сравнение — алгоритм Майерса с бюджетом.
 *
 * Бюджет обязателен, и это не перестраховка: сложность Майерса зависит от
 * **дистанции редактирования**, а не от длины входа. Два файла по десять тысяч
 * строк, отличающиеся целиком, дают D порядка двадцати тысяч — это замерший
 * таб, и увидит его пользователь, а не разработчик.
 *
 * За бюджетом разбор уходит на огрублённый проход: общий префикс и суффикс
 * остаются, середина целиком считается заменённой. Дифф остаётся **верным** —
 * просто менее подробным. Это лучше зависшей вкладки и честнее молчания,
 * поэтому о переходе сообщается флагом `degraded`, а не умалчивается.
 */

export type GrDiffOp = 'equal' | 'add' | 'remove'

export interface GrDiffLine {
  op: GrDiffOp
  text: string
  /** Номер в `before`, начиная с единицы. У добавленной строки — `null`. */
  beforeNumber: number | null
  /** Номер в `after`. У удалённой строки — `null`. */
  afterNumber: number | null
}

export interface GrDiffResult {
  lines: GrDiffLine[]
  added: number
  removed: number
  /** Бюджет исчерпан, разбор огрублён. */
  degraded: boolean
}

export interface DiffLinesOptions {
  /**
   * Предел дистанции редактирования. Дефолт выбран так, чтобы обычная правка
   * конфига или записи прошла точным разбором, а «два разных файла» ушли на
   * огрублённый до того, как вкладка перестанет отвечать.
   */
  budget?: number
}

export const GR_DIFF_DEFAULT_BUDGET = 2000

/** Шаг разбора: индексы взяты из входных массивов, поэтому годятся и строкам, и словам. */
export interface MyersStep {
  op: GrDiffOp
  aIndex: number | null
  bIndex: number | null
}

/**
 * Общий Майерс по массивам. Возвращает `null`, если дистанция превысила бюджет.
 *
 * Вынесен и обобщён потому, что тем же алгоритмом считается пословный дифф
 * внутри строки (`diffWords.ts`): две реализации одного алгоритма расходятся
 * молча, а проявляется расхождение «немного не тем» рисунком.
 */
export function myersSteps<T>(a: readonly T[], b: readonly T[], budget: number): MyersStep[] | null {
  const n = a.length
  const m = b.length
  const limit = Math.min(budget, n + m)
  const offset = limit + 1
  const v = new Int32Array(2 * limit + 3)
  const trace: Int32Array[] = []

  for (let d = 0; d <= limit; d += 1) {
    trace.push(v.slice())

    for (let k = -d; k <= d; k += 2) {
      const goDown = k === -d || (k !== d && v[offset + k - 1]! < v[offset + k + 1]!)
      let x = goDown ? v[offset + k + 1]! : v[offset + k - 1]! + 1
      let y = x - k

      while (x < n && y < m && a[x] === b[y]) {
        x += 1
        y += 1
      }

      v[offset + k] = x

      if (x >= n && y >= m)
        return backtrack(trace, offset, n, m)
    }
  }

  return null
}

function backtrack(trace: Int32Array[], offset: number, n: number, m: number): MyersStep[] {
  const steps: MyersStep[] = []
  let x = n
  let y = m

  for (let d = trace.length - 1; d >= 0; d -= 1) {
    const v = trace[d]!
    const k = x - y
    const goDown = k === -d || (k !== d && v[offset + k - 1]! < v[offset + k + 1]!)
    const prevK = goDown ? k + 1 : k - 1
    const prevX = v[offset + prevK]!
    const prevY = prevX - prevK

    while (x > prevX && y > prevY) {
      x -= 1
      y -= 1
      steps.push({ op: 'equal', aIndex: x, bIndex: y })
    }

    if (d === 0)
      break

    if (x > prevX) {
      x -= 1
      steps.push({ op: 'remove', aIndex: x, bIndex: null })
    }
    else {
      y -= 1
      steps.push({ op: 'add', aIndex: null, bIndex: y })
    }
  }

  return steps.reverse()
}

/** Длина общего префикса — дешёвая срезка до запуска алгоритма. */
function commonPrefix(a: readonly string[], b: readonly string[]): number {
  const max = Math.min(a.length, b.length)
  let index = 0

  while (index < max && a[index] === b[index])
    index += 1

  return index
}

/** Длина общего суффикса, не заходя в уже отрезанный префикс. */
function commonSuffix(a: readonly string[], b: readonly string[], prefix: number): number {
  const max = Math.min(a.length, b.length) - prefix
  let index = 0

  while (index < max && a[a.length - 1 - index] === b[b.length - 1 - index])
    index += 1

  return index
}

function toLines(source: string): string[] {
  return source.split('\n')
}

/**
 * Сравнение двух текстов построчно.
 *
 * Срезка общего префикса и суффикса идёт до алгоритма: правка одной строки в
 * середине тысячи одинаковых даёт после срезки вход из одной строки, и Майерсу
 * достаётся работа на единицы операций вместо тысяч.
 */
export function diffLines(
  before: string,
  after: string,
  options: DiffLinesOptions = {},
): GrDiffResult {
  const budget = options.budget ?? GR_DIFF_DEFAULT_BUDGET
  const a = toLines(before)
  const b = toLines(after)

  const prefix = commonPrefix(a, b)
  const suffix = commonSuffix(a, b, prefix)
  const aMiddle = a.slice(prefix, a.length - suffix)
  const bMiddle = b.slice(prefix, b.length - suffix)

  const steps = myersSteps(aMiddle, bMiddle, budget)
  const degraded = steps === null

  const middle: MyersStep[] = steps ?? coarseSteps(aMiddle.length, bMiddle.length)

  const lines: GrDiffLine[] = []
  let added = 0
  let removed = 0
  let beforeNumber = 0
  let afterNumber = 0

  const pushEqual = (text: string): void => {
    beforeNumber += 1
    afterNumber += 1
    lines.push({ op: 'equal', text, beforeNumber, afterNumber })
  }

  for (let index = 0; index < prefix; index += 1)
    pushEqual(a[index]!)

  for (const step of middle) {
    if (step.op === 'equal') {
      pushEqual(aMiddle[step.aIndex!]!)
      continue
    }

    if (step.op === 'remove') {
      beforeNumber += 1
      removed += 1
      lines.push({ op: 'remove', text: aMiddle[step.aIndex!]!, beforeNumber, afterNumber: null })
      continue
    }

    afterNumber += 1
    added += 1
    lines.push({ op: 'add', text: bMiddle[step.bIndex!]!, beforeNumber: null, afterNumber })
  }

  for (let index = a.length - suffix; index < a.length; index += 1)
    pushEqual(a[index]!)

  return { lines, added, removed, degraded }
}

/**
 * Огрублённый проход: всё удалено, всё добавлено.
 *
 * Именно в таком порядке — удаления раньше добавлений: в unified-виде читается
 * как «было / стало», а не чересполосицей.
 */
function coarseSteps(aLength: number, bLength: number): MyersStep[] {
  const steps: MyersStep[] = []

  for (let index = 0; index < aLength; index += 1)
    steps.push({ op: 'remove', aIndex: index, bIndex: null })

  for (let index = 0; index < bLength; index += 1)
    steps.push({ op: 'add', aIndex: null, bIndex: index })

  return steps
}
