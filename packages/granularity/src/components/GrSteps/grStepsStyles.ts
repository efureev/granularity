import type { GrComponentSize } from '../shared/sizes'

import type { GrStepStatus } from './stepsModel'

export type GrStepsSize = GrComponentSize
export type GrStepsOrientation = 'horizontal' | 'vertical'
export type GrStepsVariant = 'steps' | 'compact'

export const stepsRootClass = 'w-full min-w-0'

export const stepsListClass: Record<GrStepsOrientation, string> = {
  // Горизонтальная лента делит ширину поровну: шаги — равноправные этапы, и
  // разная ширина читалась бы как разный вес.
  // `[list-style:none]`, а не `list-none`: утилита не входит в документированный
  // пресет и CSS не даёт (гейт `documentedConfig`). Так же живёт `GrBreadcrumbs`.
  horizontal: 'm-0 flex [list-style:none] items-start p-0',
  vertical: 'm-0 flex [list-style:none] flex-col p-0',
}

/**
 * Пункт растёт по горизонтали и прижимается влево по вертикали.
 *
 * В горизонтальной ленте маркер стоит **над** подписью, а не слева от неё:
 * соединитель идёт от маркера к маркеру на их высоте, и подпись сбоку он бы
 * перечёркивал. В вертикальной колонке места по ширине хватает, там подпись
 * справа, а линия спускается вниз.
 */
export const stepsItemClass: Record<GrStepsOrientation, string> = {
  horizontal: 'relative min-w-0 flex-1',
  vertical: 'relative min-w-0',
}

/** Отступ снизу у вертикального пункта — место, по которому идёт соединитель. */
export const stepsItemConnectedClass: Record<GrStepsOrientation, string> = {
  horizontal: '',
  vertical: 'pb-6',
}

/**
 * Кегль и метрика маркера на ступени.
 *
 * Шкала контрольная (`--gr-control-text-*`): шаги стоят в шапке мастера рядом с
 * кнопками «Назад»/«Далее», и подпись обязана совпасть с ними, а не с меткой.
 * Диаметр маркера — покомпонентный токен, потому что ступени в общей шкале для
 * него нет: это не кегль и не радиус, а собственная метрика компонента.
 */
export const stepsSizeClassBySize: Record<GrStepsSize, string> = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)] [--gr-steps-marker-size:1.25rem]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)] [--gr-steps-marker-size:1.5rem]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)] [--gr-steps-marker-size:1.75rem]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)] [--gr-steps-marker-size:2rem]',
}

export const stepsTriggerClass = 'min-w-0 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gr-bg)] rounded-[var(--gr-radius-md)]'

export const stepsTriggerClassByOrientation: Record<GrStepsOrientation, string> = {
  horizontal: 'flex w-full flex-col items-center gap-1.5 text-center',
  vertical: 'flex w-full items-start gap-3 text-left',
}

/** Кликабельный шаг обязан выглядеть кликабельным — иначе о нём не догадаются. */
export const stepsTriggerEnabledClass = 'cursor-pointer'

export const stepsMarkerClass = 'inline-flex shrink-0 items-center justify-center rounded-[var(--gr-radius-full)] border font-600 leading-none h-[var(--gr-steps-marker-size)] w-[var(--gr-steps-marker-size)] text-[length:var(--gr-control-text-2xs)]'

/**
 * Маркер по статусу.
 *
 * Пройденный — сплошная заливка, текущий — обводка тем же тоном, будущий —
 * приглушённый. Различие идёт по светлоте, а не по оттенку: три соседних цвета
 * одного тона на одной ленте не читаются, а сплошное/полое — читается и в
 * монохроме. `error` — единственный, кто меняет тон, и меняет его осмысленно.
 */
export const stepsMarkerClassByStatus: Record<GrStepStatus, string> = {
  complete: 'border-[var(--gr-primary-solid)] bg-[var(--gr-primary-solid)] text-[var(--gr-primary-solid-fg)]',
  current: 'border-[var(--gr-primary-solid)] bg-[var(--gr-bg)] text-[var(--gr-primary-text)]',
  upcoming: 'border-[var(--gr-brd)] bg-[var(--gr-bg)] text-[var(--gr-muted-fg)]',
  error: 'border-[var(--gr-danger-solid)] bg-[var(--gr-danger-solid)] text-[var(--gr-danger-solid-fg)]',
}

export const stepsLabelClass = 'block min-w-0 font-600'

export const stepsLabelClassByStatus: Record<GrStepStatus, string> = {
  complete: 'text-[var(--gr-fg)]',
  current: 'text-[var(--gr-fg)]',
  upcoming: 'text-[var(--gr-muted-fg)]',
  error: 'text-[var(--gr-danger-text)]',
}

export const stepsDescriptionClass = 'block mt-0.5 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)] text-[var(--gr-muted-fg)]'

/**
 * Соединитель между шагами.
 *
 * Позиция считается от диаметра маркера, а не от жёсткой высоты: маркер растёт
 * со ступенью размера, и линия обязана оставаться на его оси. По горизонтали
 * пункты делят ширину поровну, поэтому маркер стоит ровно по центру пункта —
 * отсюда `50%` слева и `-50%` справа: линия идёт от края одного маркера до
 * края соседнего.
 */
export const stepsConnectorClass: Record<GrStepsOrientation, string> = {
  horizontal: 'absolute top-[calc(var(--gr-steps-marker-size)/2)] h-[var(--gr-steps-connector-size,2px)] -translate-y-1/2 left-[calc(50%+var(--gr-steps-marker-size)/2+0.5rem)] right-[calc(-50%+var(--gr-steps-marker-size)/2+0.5rem)]',
  vertical: 'absolute left-[calc(var(--gr-steps-marker-size)/2)] w-[var(--gr-steps-connector-size,2px)] -translate-x-1/2 top-[calc(var(--gr-steps-marker-size)+0.375rem)] bottom-1',
}

export const stepsConnectorDoneClass = 'bg-[var(--gr-steps-connector-done,var(--gr-primary-solid))]'
export const stepsConnectorPendingClass = 'bg-[var(--gr-steps-connector-pending,var(--gr-brd))]'

/** Компактный вариант: подпись и полоса вместо ленты. */
export const stepsCompactRowClass = 'flex items-baseline justify-between gap-3'
export const stepsCompactCounterClass = 'shrink-0 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)] text-[var(--gr-muted-fg)]'
export const stepsCompactLabelClass = 'min-w-0 truncate font-600 text-[var(--gr-fg)]'
export const stepsCompactBarClass = 'mt-2'

export function grStepsMarkerClass(status: GrStepStatus): string {
  return `${stepsMarkerClass} ${stepsMarkerClassByStatus[status]}`
}

export function grStepsLabelClass(status: GrStepStatus): string {
  return `${stepsLabelClass} ${stepsLabelClassByStatus[status]}`
}
