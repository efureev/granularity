/**
 * Мост: как из начала периода получился конец.
 *
 * Вся суть компонента здесь, а не в шаблоне. Расходящиеся столбцы отвечают
 * «сколько пришло и сколько ушло», мост — «как одно превратилось в другое», и
 * отличает их ровно накопление: столбец начинается там, где кончился
 * предыдущий. Считается это без рендера и здесь же проверяется.
 */

export interface GrChartWaterfallStep {
  label: string
  value: number
  /**
   * `delta` — шаг от текущего накопления (дефолт).
   * `total` — абсолютное значение: столбец от нуля, накопление сбрасывается на него.
   */
  kind?: 'delta' | 'total'
  color?: string
  meta?: unknown
}

export interface WaterfallSegment {
  /** Индекс шага во входе; у дорисованного итога — `steps.length`. */
  index: number
  label: string
  kind: 'delta' | 'total'
  /** Значение как его передали: у `total` оно же и есть накопление. */
  value: number
  /** Накопление до и после шага — две колонки скрытой таблицы. */
  before: number
  after: number
  /** Основание и вершина столбца в значениях оси. */
  from: number
  to: number
  /** `0` — движения не было: столбец рисуется чертой, а не пустотой. */
  sign: -1 | 0 | 1
  /**
   * Уровень соединителя к следующему столбцу. `null` — соединителя нет.
   *
   * К шагу `total` соединитель не ведёт: тот не продолжает накопление, а
   * объявляет его, и линия «отсюда сюда» соврала бы о преемственности.
   */
  connector: number | null
}

export interface WaterfallOptions {
  /** Начальное накопление. */
  baseline?: number
  /** Дорисовать итоговый столбец. Накопление он не меняет, только показывает. */
  total?: false | { label: string }
}

export interface WaterfallModel {
  segments: WaterfallSegment[]
  /**
   * Границы оси по основаниям и вершинам, а не по значениям шагов: столбец,
   * стоящий на накоплении в тысячу, выше своей дельты в десять.
   */
  domain: [number, number]
  /** Накопление после последнего шага. */
  total: number
}

function signOf(delta: number): -1 | 0 | 1 {
  if (delta > 0)
    return 1

  return delta < 0 ? -1 : 0
}

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0
}

/**
 * Шаги — в отрезки моста.
 *
 * Итоговый столбец считается здесь же, а не отдельной функцией: он идёт от нуля
 * к тому самому накоплению, которое накопили шаги, и посчитанный где-то ещё
 * однажды разошёлся бы с ними.
 */
export function waterfallSegments(
  steps: readonly GrChartWaterfallStep[],
  options: WaterfallOptions = {},
): WaterfallModel {
  const baseline = finite(options.baseline ?? 0)
  const segments: WaterfallSegment[] = []
  let running = baseline

  steps.forEach((step, index) => {
    const value = finite(step.value)
    const kind = step.kind ?? 'delta'
    const before = running
    const after = kind === 'total' ? value : before + value

    segments.push({
      index,
      label: step.label,
      kind,
      value,
      before,
      after,
      // Столбец `total` объявляет величину и потому меряется от нуля; дельта
      // меряется от накопления — иначе видна была бы не она, а сумма под ней.
      from: kind === 'total' ? 0 : before,
      to: after,
      sign: signOf(kind === 'total' ? value : after - before),
      connector: null,
    })

    running = after
  })

  if (options.total) {
    segments.push({
      index: steps.length,
      label: options.total.label,
      kind: 'total',
      value: running,
      before: running,
      after: running,
      from: 0,
      to: running,
      sign: signOf(running),
      connector: null,
    })
  }

  // Соединитель ведёт от вершины предыдущего к основанию следующего, то есть
  // стоит на общем для них уровне накопления.
  for (let index = 0; index < segments.length - 1; index++) {
    const current = segments[index]!
    const next = segments[index + 1]!

    current.connector = next.kind === 'total' ? null : current.after
  }

  const bounds = segments.flatMap(segment => [segment.from, segment.to])

  return {
    segments,
    // Ноль в домене всегда: мост, оторванный от нуля, врёт о величинах — ровно
    // как столбцы, из которых он и состоит. Начальное накопление отдельно не
    // закрепляется: оно уже стоит основанием первого шага, а при первом шаге
    // `total` его на рисунке нет вовсе.
    domain: [Math.min(0, ...bounds), Math.max(0, ...bounds)],
    total: running,
  }
}
