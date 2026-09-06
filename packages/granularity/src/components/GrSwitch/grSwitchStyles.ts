import type { GrComponentSize } from '../shared/sizes'

export type GrSwitchSize = GrComponentSize

/** Сторона подписи относительно дорожки — логическая, не физическая (RTL). */
export const GR_SWITCH_LABEL_POSITIONS = ['start', 'end'] as const
export type GrSwitchLabelPosition = typeof GR_SWITCH_LABEL_POSITIONS[number]

type GrSwitchThumbClassOptions = {
  checked: boolean
  size: GrSwitchSize
}

export const rootBase = 'inline-flex items-center gap-2 select-none disabled:cursor-not-allowed'

/** `start` разворачивает ряд, а не меняет порядок узлов: DOM-порядок читает диктор. */
export const rootLabelPositions: Record<GrSwitchLabelPosition, string> = {
  start: 'flex-row-reverse',
  end: '',
}

export const trackBase
  = 'relative inline-flex shrink-0 items-center rounded-[var(--gr-radius-full)] border border-[var(--gr-switch-track-brd)] transition-colors duration-[var(--gr-duration-fast)]'

export const trackSizes: Record<GrSwitchSize, string> = {
  xs: 'h-4 w-7',
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
  lg: 'h-7 w-14',
}

/**
 * Дорожка в режиме `autoWidth`: та же ступень становится **нижней границей**,
 * а ширину берёт подпись. Высота остаётся фиксированной — тянется только строка.
 */
export const trackAutoSizes: Record<GrSwitchSize, string> = {
  xs: 'h-4 min-w-7',
  sm: 'h-5 min-w-9',
  md: 'h-6 min-w-11',
  lg: 'h-7 min-w-14',
}

export const thumbBase
  = 'absolute top-[1px] inline-flex shrink-0 items-center justify-center rounded-[var(--gr-radius-full)] bg-[var(--gr-card)] shadow-[var(--gr-shadow-1)] transition-[left,transform] duration-[var(--gr-duration-fast)]'

export const thumbSizes: Record<GrSwitchSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

/** Спиннер загрузки живёт в бегунке, поэтому мельче его на ступень. */
export const thumbSpinnerSizes: Record<GrSwitchSize, string> = {
  xs: 'h-2 w-2',
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
}

export const thumbSpinnerBase = 'animate-spin text-[var(--gr-muted-fg)]'

/**
 * Зазор бегунка со всех сторон, px.
 *
 * Дорожка — `border-box` с рамкой 1px, и по вертикали зазор задан геометрией:
 * `(content-height − thumb) / 2` даёт ровно 1 на всех ступенях. Значит и по
 * горизонтали он обязан быть тем же: иначе бегунок в покое выглядит вдавленным
 * внутрь, а в крайнем положении прижатым к краю — именно так и было, зазоры
 * расходились на 1–2px у `xs`, `sm` и `lg`.
 *
 * Гейт живёт в `__tests__/GrSwitch.test.ts` и считает вертикаль заново из
 * `trackSizes`/`thumbSizes`, поэтому смена любой ступени размера сразу покажет
 * разъехавшийся зазор.
 */
export const SWITCH_THUMB_GAP = 1

/**
 * Положение бегунка — **без единого числа, зависящего от ширины дорожки**.
 *
 * Крайнее положение выражено парой `left: calc(100% − зазор)` и
 * `translateX(-100%)`: процент в `left` считается от padding-box дорожки,
 * процент в `transform` — от самого бегунка. В сумме левый край встаёт на
 * `ширина − бегунок − зазор`, какой бы ширина ни была.
 *
 * Обе величины анимируются, и композиция даёт строго линейный ход: в момент `t`
 * смещение равно `t · (ширина − бегунок)`. Поэтому режим `autoWidth` не требует
 * ни измерений, ни ResizeObserver — только эти два класса.
 */
export const thumbPositions: Record<'checked' | 'unchecked', string> = {
  checked: 'left-[calc(100%_-_1px)] -translate-x-full',
  unchecked: 'left-[1px] translate-x-0',
}

export const labelBase = 'text-[var(--gr-muted-fg)]'

/**
 * Недоступность гасится токеном, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста и роняет контраст подписи.
 */
export const labelDisabledClass = 'text-[var(--gr-disabled-fg)]'

export const labelSizes: Record<GrSwitchSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  md: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
}

export function grSwitchRootClass(labelPosition: GrSwitchLabelPosition): string {
  return [rootBase, rootLabelPositions[labelPosition]].filter(Boolean).join(' ')
}

export function grSwitchTrackClass(size: GrSwitchSize, autoWidth = false): string {
  return [trackBase, (autoWidth ? trackAutoSizes : trackSizes)[size]].join(' ')
}

export function grSwitchThumbClass(options: GrSwitchThumbClassOptions): string {
  return [
    thumbBase,
    thumbSizes[options.size],
    thumbPositions[options.checked ? 'checked' : 'unchecked'],
  ].join(' ')
}

export function grSwitchSpinnerClass(size: GrSwitchSize): string {
  return [thumbSpinnerBase, thumbSpinnerSizes[size]].join(' ')
}

export function grSwitchLabelClass(size: GrSwitchSize, disabled = false): string {
  return [disabled ? labelDisabledClass : labelBase, labelSizes[size]].join(' ')
}

/**
 * Ступени, на которых подпись состояния помещается внутрь дорожки.
 *
 * Свободное место рядом с бегунком — `content − (бегунок + зазор)`, то есть
 * 13 / 17 / 21 / 29px на `xs` / `sm` / `md` / `lg`. Минимальная ступень
 * типографики пакета — `--gr-text-xs` (12px), и «OFF» на ней занимает ~25px;
 * собственные 10px дают ~20px. В 13 и 17 не встаёт и это, а ужимать шрифт
 * дальше значит сделать подпись нечитаемой ради того, чтобы она была.
 */
export const GR_SWITCH_STATE_TEXT_SIZES = ['md', 'lg'] as const
export type GrSwitchStateTextSize = typeof GR_SWITCH_STATE_TEXT_SIZES[number]

/** Свободное место в дорожке рядом с бегунком, px. Считается гейтом заново. */
export const stateTextRoom: Record<GrSwitchSize, number> = {
  xs: 13,
  sm: 17,
  md: 21,
  lg: 29,
}

export function isGrSwitchStateTextSize(size: GrSwitchSize): size is GrSwitchStateTextSize {
  return (GR_SWITCH_STATE_TEXT_SIZES as readonly GrSwitchSize[]).includes(size)
}

/**
 * Ячейка подписи. Грид, а не флекс, ради второго режима: в `autoWidth` в ту же
 * клетку кладётся невидимый дубль противоположного текста, и ширина ячейки
 * становится максимумом из двух — иначе дорожка дёргалась бы на каждом щелчке
 * («ON» 15.6px против «OFF» 19.9px).
 */
export const stateTextBase
  = 'pointer-events-none grid items-center justify-items-center overflow-hidden font-semibold uppercase leading-none'

/**
 * Где ячейка живёт. При фиксированной ширине она накрывает дорожку и на её
 * размер не влияет; в `autoWidth` встаёт в поток и ширину как раз задаёт.
 */
export const stateTextLayouts: Record<'fixed' | 'auto', string> = {
  fixed: 'absolute inset-0',
  auto: '',
}

/** Оба текста ложатся в одну клетку грида — отсюда максимум по ширине. */
export const stateTextStackClass = 'col-start-1 row-start-1'

/** Дубль занимает место, но не рисуется: `visibility`, а не `display`. */
export const stateTextGhostClass = `${stateTextStackClass} invisible`

/**
 * Кегль подписи — свой, а не ступень шкалы пакета: минимальный `--gr-text-xs`
 * это 12px, и трёхбуквенное слово на нём занимает ~24px при 21px места.
 *
 * Значения меряны, а не выведены (Inter 600, uppercase). На `md` в 21px:
 * «OFF» 17.9, «НЕТ» 18.8, «ВКЛ» 19.4 — то есть 9px берёт трёхбуквенные слова
 * во всех трёх локалях с запасом; 10px оставлял «НЕТ» 0.1px до обреза.
 * На `lg` места 29px, и 11px там читается лучше, не рискуя ничем.
 *
 * Четырёхбуквенное «ВЫКЛ» не встаёт ни на одной ступени и ни при каком кегле
 * (31px на 10px кегля) — поэтому русский дефолт «ДА»/«НЕТ», а не «ВКЛ»/«ВЫКЛ».
 */
export const stateTextSizes: Record<GrSwitchStateTextSize, string> = {
  md: 'text-[length:var(--gr-switch-state-text-size,9px)]',
  lg: 'text-[length:var(--gr-switch-state-text-size,11px)]',
}

/** Отступ со стороны бегунка — `бегунок + зазор`; остаток и есть место подписи. */
export const stateTextPaddings: Record<GrSwitchStateTextSize, { checked: string, unchecked: string }> = {
  md: {
    checked: 'pr-[21px]',
    unchecked: 'pl-[21px]',
  },
  lg: {
    checked: 'pr-[25px]',
    unchecked: 'pl-[25px]',
  },
}

/**
 * Отступы в `autoWidth` — те же, плюс воздух с **обеих** сторон.
 *
 * При фиксированной ширине текст центруется в остатке и сам ни во что не
 * упирается. Здесь остатка нет: ширину задаёт сам текст, и без воздуха он
 * прилипает к бегунку с одной стороны и к закруглению с другой — проверено
 * глазами, «ОНЛАЙН» вплотную к бегунку читается как дефект вёрстки.
 *
 * Поэтому со стороны бегунка отступ равен `бегунок + зазор + воздух`, а со
 * свободной — просто воздуху. Воздух: 8px на `md`, 10px на `lg`.
 */
export const stateTextAutoPaddings: Record<GrSwitchStateTextSize, { checked: string, unchecked: string }> = {
  md: {
    checked: 'pl-[8px] pr-[29px]',
    unchecked: 'pl-[29px] pr-[8px]',
  },
  lg: {
    checked: 'pl-[10px] pr-[35px]',
    unchecked: 'pl-[35px] pr-[10px]',
  },
}

/**
 * Цвет подписи — роль `-fg` той заливки, на которой она лежит.
 *
 * Хук стоит фолбэком в самом классе, а не инлайн-значением: инлайн победил бы
 * CSS потребителя, и переопределить токен было бы нечем. Заливку дорожки задают
 * произвольным цветом (`activeBackgroundColor`), и безопасный цвет текста на
 * ней библиотека не вычислит — его называет тот же, кто задал фон.
 */
export const stateTextColors = {
  checked: 'text-[var(--gr-switch-state-text-fg,var(--gr-primary-fg))]',
  unchecked: 'text-[var(--gr-switch-state-text-fg,var(--gr-muted-fg))]',
  disabled: 'text-[var(--gr-switch-state-text-fg,var(--gr-disabled-fg))]',
} as const

type GrSwitchStateTextClassOptions = {
  size: GrSwitchStateTextSize
  checked: boolean
  disabled: boolean
  autoWidth: boolean
}

export function grSwitchStateTextClass(options: GrSwitchStateTextClassOptions): string {
  const state = options.disabled
    ? 'disabled'
    : options.checked ? 'checked' : 'unchecked'

  const side = options.checked ? 'checked' : 'unchecked'
  const paddings = options.autoWidth ? stateTextAutoPaddings : stateTextPaddings

  return [
    stateTextBase,
    stateTextLayouts[options.autoWidth ? 'auto' : 'fixed'],
    stateTextSizes[options.size],
    stateTextColors[state],
    paddings[options.size][side],
  ].filter(Boolean).join(' ')
}
