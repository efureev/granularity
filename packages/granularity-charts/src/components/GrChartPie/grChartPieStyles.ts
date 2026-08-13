import type { GrChartSize } from '../GrChartFrame/chartFrameStyles'

export type { GrChartSize as GrChartPieSize }

/**
 * Оформление круга: заливки, разделители, подписи.
 *
 * Всё, что попадает на `<path>` и `<text>`, задаётся **атрибутами** — SVG
 * красится `fill`/`stroke`, а не `color`, и утилита вида `text-[var(…)]` на
 * доле не даёт ничего (гейт `svgPaint.test.ts`).
 */

/** Разделитель между долями: цветом фона, а не тёмной линией — иначе круг выглядит расчерченным. */
export const pieGapStroke = 'var(--gr-chart-pie-gap-color,var(--gr-bg))'
export const pieGapWidth = 'var(--gr-chart-pie-gap,2px)'

/**
 * Приглушение неактивных долей — вторая половина выделения.
 *
 * У круга нет вертикали, которой линейный график показывает «вот эта точка»:
 * работают выступ активной доли (`ACTIVE_GROW`) и приглушение соседей. По
 * отдельности каждое читается вяло, вместе — однозначно.
 */
export const pieDimOpacity = 'var(--gr-chart-pie-dim,0.45)'

/**
 * Подпись доли и её выноска.
 *
 * Подписи стоят **снаружи** кольца, а не на самой доле, и это не про вкус.
 * Палитра `--gr-chart-1..5` насыщенная в обеих темах: белый текст на `#10b981`
 * даёт около 2.5:1, тёмный на `#fb923c` — не лучше. Ни один фиксированный цвет
 * поверх пяти заливок AA не проходит, поэтому текст уезжает на фон страницы,
 * где контраст держит обычная роль.
 */
export const pieLabelFill = 'var(--gr-chart-pie-label,var(--gr-muted-fg))'
export const pieLeaderStroke = 'var(--gr-chart-pie-label,var(--gr-muted-fg))'

export const pieTotalFill = 'var(--gr-chart-pie-total,var(--gr-fg))'
export const pieTotalLabelFill = 'var(--gr-chart-pie-total-label,var(--gr-muted-fg))'

/** Штриховка поверх заливки: та же роль, что и у разделителя, — цвет фона. */
export const pieTextureStroke = 'var(--gr-chart-pie-texture,var(--gr-bg))'

export const pieLegendClass = 'flex flex-wrap items-center gap-x-4 gap-y-1'

export const pieLegendItemClass
  = 'inline-flex items-center gap-2 text-[length:var(--gr-control-text-sm)] '
    + 'leading-[var(--gr-leading-normal)] text-[var(--gr-fg)]'

export const pieLegendValueClass
  = 'text-[var(--gr-muted-fg)] [font-variant-numeric:tabular-nums]'

export const pieLegendSwatchClass = 'inline-block h-3 w-3 shrink-0'

/**
 * Отступ круга от краёв области построения: разделитель плюс выступ активной
 * доли. Обводка рисуется по центру контура, и без отступа половина её ширины
 * срезалась бы границей холста, а выступ упёрся бы в неё целиком.
 */
export const PIE_INSET = 2

/**
 * Насколько активная доля вылезает за общий радиус.
 *
 * Приглушения соседей мало: оно читается как «эти потускнели», а не «выбрана
 * эта». Обводка контрастным цветом читалась бы, но выглядит подрисованной от
 * руки — на пяти насыщенных заливках любая такая линия спорит с рисунком.
 *
 * Хит-тест при этом считается по **выросшему** радиусу всегда, а не только для
 * активной доли. Иначе выходило бы так: курсор заходит на выступ, доля уже
 * активна, но геометрия попадания её там не ждёт — и получается «мимо круга»,
 * доля схлопывается, курсор снова над ней, она вырастает. Классическое мигание
 * круговых диаграмм с раздвижкой секторов.
 */
export const ACTIVE_GROW = 4

/** Доля радиуса, которую занимает дырка бублика. */
export const DONUT_RATIO = 0.62

/** Ниже этой доли подпись не ставится: на трёх процентах она перекроет соседнюю. */
export const LABEL_MIN_SHARE = 0.05

/** Длина выноски и зазор до текста — в кеглях подписи, а не в пикселях. */
export const LEADER_LENGTH_EM = 1
export const LEADER_GAP_EM = 0.4

/**
 * Место, которое подписи забирают у радиуса.
 *
 * Считается по самой длинной подписи, а не по кеглю: «100 %» и «1 234 567»
 * требуют разного гуттера, а замерить текст нечем (`chart/chartLayout.ts`).
 */
export const LABEL_CHAR_EM = 0.58

/** Кегль итога в середине бублика — от радиуса дырки: иначе он либо теряется, либо не влезает. */
export const TOTAL_VALUE_RATIO = 0.34
export const TOTAL_LABEL_RATIO = 0.16

/**
 * Текстуры заливки — второй различитель поверх цвета.
 *
 * Цветов в палитре пять; шестая доля повторила бы первую, а на круге соседние
 * доли стоят вплотную, и повтор читается как «это одно и то же». Период
 * текстуры разведён с периодом цвета — та же арифметика, что у `seriesStyle`
 * с формой точки, и тот же принцип: цвет никогда не единственный различитель.
 */
export const GR_CHART_PIE_TEXTURES = ['solid', 'hatch', 'hatch-reverse', 'grid'] as const

export type GrChartPieTexture = typeof GR_CHART_PIE_TEXTURES[number]

const PALETTE_PERIOD = 5

export function pieTextureFor(index: number): GrChartPieTexture {
  const i = Math.max(0, Math.floor(index))

  return GR_CHART_PIE_TEXTURES[Math.floor(i / PALETTE_PERIOD) % GR_CHART_PIE_TEXTURES.length]!
}

/** Сторона плитки текстуры в пользовательских единицах SVG. */
export const TEXTURE_TILE = 6

export const TEXTURE_WIDTH = 1.25

/** Штриховка приглушена: она различает доли, а не спорит с их цветом. */
export const TEXTURE_OPACITY = 0.55

/**
 * Штрихи текстуры для плитки со стороной `tile`.
 *
 * Диагональ дублируется у обоих углов и вылезает за плитку на единицу: без
 * этого стык соседних плиток даёт разрыв штриха, и вместо ровной штриховки
 * получается пунктир по сетке. Метка легенды рисует те же штрихи, только по
 * своей стороне, — поэтому функция принимает размер, а не берёт его из
 * константы.
 */
export function pieTexturePaths(texture: GrChartPieTexture, tile: number = TEXTURE_TILE): string[] {
  const forward = [
    `M -1 1 L 1 -1`,
    `M 0 ${tile} L ${tile} 0`,
    `M ${tile - 1} ${tile + 1} L ${tile + 1} ${tile - 1}`,
  ]
  const backward = [
    `M -1 ${tile - 1} L 1 ${tile + 1}`,
    `M 0 0 L ${tile} ${tile}`,
    `M ${tile - 1} -1 L ${tile + 1} 1`,
  ]

  switch (texture) {
    case 'hatch':
      return forward
    case 'hatch-reverse':
      return backward
    case 'grid':
      return [...forward, ...backward]
    case 'solid':
      return []
  }
}

/** Кегль подписи доли — на ступень мельче подписи оси: она не заголовок. */
export const pieLabelFontPx: Record<GrChartSize, number> = {
  xs: 9,
  sm: 10,
  md: 11,
  lg: 12,
}
