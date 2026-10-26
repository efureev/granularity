import type { GrComponentSize } from '../shared/sizes'

export type GrSwitchSize = GrComponentSize

/** Сторона подписи относительно дорожки — логическая, не физическая (RTL). */
export const GR_SWITCH_LABEL_POSITIONS = ['start', 'end'] as const
export type GrSwitchLabelPosition = typeof GR_SWITCH_LABEL_POSITIONS[number]

/**
 * Ступени, на которых подпись состояния помещается внутрь дорожки; расчёт места —
 * `docs/components/GrSwitch.md`, §«Подпись состояния живёт не на всех ступенях».
 */
export const GR_SWITCH_STATE_TEXT_SIZES = ['md', 'lg'] as const
export type GrSwitchStateTextSize = typeof GR_SWITCH_STATE_TEXT_SIZES[number]

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

/**
 * Геометрия — из темы: у каждой ступени высота и ширина дорожки
 * (`--gr-switch-track-height-<ступень>`, `--gr-switch-track-width-<ступень>`).
 * Всё остальное выводится из высоты формулой, поэтому зазоры сходятся в любой
 * теме сами: бегунок — высота минус рамка и зазор с обеих сторон, отступ подписи
 * — бегунок плюс зазор. Число, которое тема могла бы рассогласовать, — одно.
 */
export const trackSizes: Record<GrSwitchSize, string> = {
  xs: 'h-[var(--gr-switch-track-height-xs)] w-[var(--gr-switch-track-width-xs)]',
  sm: 'h-[var(--gr-switch-track-height-sm)] w-[var(--gr-switch-track-width-sm)]',
  md: 'h-[var(--gr-switch-track-height-md)] w-[var(--gr-switch-track-width-md)]',
  lg: 'h-[var(--gr-switch-track-height-lg)] w-[var(--gr-switch-track-width-lg)]',
}

/**
 * Дорожка с подписью состояния — своей ширины. Подпись — часть дорожки, и тема
 * с компактным переключателем отдаёт ей место шириной, а не мельчит кегль:
 * гейт держит, что места в каждой теме не меньше, чем в базовой.
 */
export const trackTextSizes: Record<GrSwitchStateTextSize, string> = {
  md: 'h-[var(--gr-switch-track-height-md)] w-[var(--gr-switch-text-track-width-md)]',
  lg: 'h-[var(--gr-switch-track-height-lg)] w-[var(--gr-switch-text-track-width-lg)]',
}

/**
 * Дорожка с подписью в режиме `autoWidth`: та же ширина становится **нижней
 * границей**, а ширину берёт подпись. Высота остаётся ступенью — тянется только
 * строка.
 */
export const trackAutoSizes: Record<GrSwitchStateTextSize, string> = {
  md: 'h-[var(--gr-switch-track-height-md)] min-w-[var(--gr-switch-text-track-width-md)]',
  lg: 'h-[var(--gr-switch-track-height-lg)] min-w-[var(--gr-switch-text-track-width-lg)]',
}

export const thumbBase
  = 'absolute top-[1px] inline-flex shrink-0 items-center justify-center rounded-[var(--gr-radius-full)] bg-[var(--gr-switch-thumb-bg)] shadow-[var(--gr-switch-thumb-shadow)] transition-[left,transform] duration-[var(--gr-duration-fast)]'

/** Бегунок — высота дорожки минус рамка и зазор с обеих сторон: `h − 2 · (1 + 1)`. */
export const thumbSizes: Record<GrSwitchSize, string> = {
  xs: 'h-[calc(var(--gr-switch-track-height-xs)_-_4px)] w-[calc(var(--gr-switch-track-height-xs)_-_4px)]',
  sm: 'h-[calc(var(--gr-switch-track-height-sm)_-_4px)] w-[calc(var(--gr-switch-track-height-sm)_-_4px)]',
  md: 'h-[calc(var(--gr-switch-track-height-md)_-_4px)] w-[calc(var(--gr-switch-track-height-md)_-_4px)]',
  lg: 'h-[calc(var(--gr-switch-track-height-lg)_-_4px)] w-[calc(var(--gr-switch-track-height-lg)_-_4px)]',
}

/**
 * Содержимое бегунка — спиннер загрузки или иконка действия — мельче его на
 * ступень: иначе знак упирается в края круга и теряет форму. Потолок — бегунок
 * минус 4px: у темы с бегунком мельче базового знак уменьшается вместе с ним.
 */
export const thumbContentSizes: Record<GrSwitchSize, string> = {
  xs: 'h-2 w-2 max-h-[calc(var(--gr-switch-track-height-xs)_-_8px)] max-w-[calc(var(--gr-switch-track-height-xs)_-_8px)]',
  sm: 'h-2.5 w-2.5 max-h-[calc(var(--gr-switch-track-height-sm)_-_8px)] max-w-[calc(var(--gr-switch-track-height-sm)_-_8px)]',
  md: 'h-3 w-3 max-h-[calc(var(--gr-switch-track-height-md)_-_8px)] max-w-[calc(var(--gr-switch-track-height-md)_-_8px)]',
  lg: 'h-4 w-4 max-h-[calc(var(--gr-switch-track-height-lg)_-_8px)] max-w-[calc(var(--gr-switch-track-height-lg)_-_8px)]',
}

/**
 * Цвет содержимого бегунка — один на спиннер и иконку.
 *
 * Хук с фолбэком в самом классе, а не инлайн-значение: инлайн победил бы CSS
 * потребителя, и переопределить цвет было бы нечем.
 *
 * По состоянию цвет не ветвится и в `disabled` не тускнеет: гасится дорожка, а
 * бегунок остаётся `--gr-switch-thumb-bg` в любом состоянии — содержимое, меняющее цвет,
 * разошлось бы со своей же подложкой.
 */
export const thumbContentColorClass = 'text-[var(--gr-switch-thumb-fg,var(--gr-muted-fg))]'

export const thumbSpinnerBase = `animate-spin ${thumbContentColorClass}`

/** Обёртка иконки держит размер, содержимое слота тянется до неё `h-full w-full`. */
export const thumbIconBase = `inline-flex shrink-0 items-center justify-center ${thumbContentColorClass}`

/**
 * Зазор бегунка со всех сторон, px.
 *
 * Дорожка — `border-box` с рамкой 1px, и по вертикали зазор задан геометрией:
 * `(content-height − thumb) / 2` даёт ровно 1 на всех ступенях. Значит и по
 * горизонтали он обязан быть тем же: иначе бегунок в покое выглядит вдавленным
 * внутрь, а в крайнем положении прижатым к краю — именно так и было, зазоры
 * расходились на 1–2px у `xs`, `sm` и `lg`.
 *
 * Бегунок выведен из высоты дорожки формулой (`thumbSizes`), поэтому зазор
 * сходится в любой теме; гейт `__tests__/GrSwitch.test.ts` держит формулу и
 * место под подпись в каждой теме каталога.
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

export function grSwitchTrackClass(size: GrSwitchSize, stateText?: { size: GrSwitchStateTextSize, autoWidth: boolean }): string {
  if (!stateText)
    return [trackBase, trackSizes[size]].join(' ')

  return [trackBase, (stateText.autoWidth ? trackAutoSizes : trackTextSizes)[stateText.size]].join(' ')
}

export function grSwitchThumbClass(options: GrSwitchThumbClassOptions): string {
  return [
    thumbBase,
    thumbSizes[options.size],
    thumbPositions[options.checked ? 'checked' : 'unchecked'],
  ].join(' ')
}

export function grSwitchSpinnerClass(size: GrSwitchSize): string {
  return [thumbSpinnerBase, thumbContentSizes[size]].join(' ')
}

export function grSwitchThumbIconClass(size: GrSwitchSize): string {
  return [thumbIconBase, thumbContentSizes[size]].join(' ')
}

export function grSwitchLabelClass(size: GrSwitchSize, disabled = false): string {
  return [disabled ? labelDisabledClass : labelBase, labelSizes[size]].join(' ')
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

/** Отступ со стороны бегунка — `бегунок + зазор`, то есть `h − 3px`; остаток и есть место подписи. */
export const stateTextPaddings: Record<GrSwitchStateTextSize, { checked: string, unchecked: string }> = {
  md: {
    checked: 'pr-[calc(var(--gr-switch-track-height-md)_-_3px)]',
    unchecked: 'pl-[calc(var(--gr-switch-track-height-md)_-_3px)]',
  },
  lg: {
    checked: 'pr-[calc(var(--gr-switch-track-height-lg)_-_3px)]',
    unchecked: 'pl-[calc(var(--gr-switch-track-height-lg)_-_3px)]',
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
    checked: 'pl-[8px] pr-[calc(var(--gr-switch-track-height-md)_+_5px)]',
    unchecked: 'pl-[calc(var(--gr-switch-track-height-md)_+_5px)] pr-[8px]',
  },
  lg: {
    checked: 'pl-[10px] pr-[calc(var(--gr-switch-track-height-lg)_+_7px)]',
    unchecked: 'pl-[calc(var(--gr-switch-track-height-lg)_+_7px)] pr-[10px]',
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
  checked: 'text-[var(--gr-switch-state-text-fg,var(--gr-selected-fg))]',
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
