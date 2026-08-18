import type { GrComponentSize } from '../shared/sizes'

export type GrFileUploadSize = GrComponentSize

/** Поля дроп-зоны в дефолтном UI (в custom-UI зону рисует слот). */
export const zonePaddings: Record<GrFileUploadSize, string> = {
  xs: 'px-3 py-3',
  sm: 'px-4 py-4',
  md: 'px-5 py-6',
  lg: 'px-6 py-8',
}

/** Плитка с иконкой слева от подписи. */
export const iconTileSizes: Record<GrFileUploadSize, string> = {
  xs: 'h-8 w-8 rounded-[var(--gr-radius-md)]',
  sm: 'h-10 w-10 rounded-[var(--gr-radius-md)]',
  md: 'h-12 w-12 rounded-[var(--gr-radius-lg)]',
  lg: 'h-14 w-14 rounded-[var(--gr-radius-lg)]',
}

/**
 * Глиф в плитке задаётся пикселями, а не шкалой `GrIcon`: та упирается в 20px,
 * а плитке нужны 24px на `md`. Явное значение обязательно — без него иконка
 * читала бы размер прямо из `GrConfigProvider` и разъезжалась с самой зоной,
 * когда размер задан точечно через `componentDefaults`.
 */
export const iconGlyphSizes: Record<GrFileUploadSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
}

/**
 * Ступени кегля берутся из шкалы и потому местами совпадают: разница в 1px не
 * воспринимается, а размер компонента несут падинги, гапы и глиф — они остаются
 * четырёхступенчатыми.
 */
export const labelSizes: Record<GrFileUploadSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  md: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
}

/** Подсказка, список файлов и текст прогресса — мельче основной подписи. */
export const hintSizes: Record<GrFileUploadSize, string> = {
  xs: 'text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)]',
  sm: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  md: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  lg: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
}

export const progressTextSizes: Record<GrFileUploadSize, string> = {
  xs: 'text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)]',
  sm: 'text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)]',
  md: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  lg: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
}

export const zoneGaps: Record<GrFileUploadSize, string> = {
  xs: 'gap-2',
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-5',
}

/** Полоса прогресса берёт толщину из шкалы `GrProgressBar`. */
export const progressBarSizes: Record<GrFileUploadSize, GrComponentSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

export const zoneBaseClass = 'relative w-full rounded-[var(--gr-radius-lg)] border border-dashed border-[var(--gr-brd)] outline-none transition'

/**
 * Недоступная зона гасится фоном, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста и роняет контраст.
 */
export const zoneDisabledClass = 'bg-[var(--gr-muted)] cursor-not-allowed'

/**
 * `readonly` — не `disabled`: набор виден и уходит в форму, поэтому контраст
 * остаётся обычным. Меняется только приглашение к вводу — курсор и ховер.
 */
export const zoneReadonlyClass = 'bg-[var(--gr-card)] cursor-default focus-within:ring-2 focus-within:ring-[var(--gr-ring)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--gr-bg)]'

export const zoneIdleClass = 'bg-[var(--gr-card)] cursor-pointer hover:bg-[var(--gr-muted)] focus-within:ring-2 focus-within:ring-[var(--gr-ring)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--gr-bg)]'

/** Файл над зоной: подсветка появляется только там, где drop реально примут. */
export const zoneOverClass = 'border-[var(--gr-ring)] bg-[var(--gr-muted)]'

export function grFileUploadZoneClass(options: {
  size: GrFileUploadSize
  disabled: boolean
  readonly: boolean
  over: boolean
}): string {
  const state = options.disabled
    ? zoneDisabledClass
    : options.readonly ? zoneReadonlyClass : zoneIdleClass

  return [
    zoneBaseClass,
    zonePaddings[options.size],
    state,
    options.over && !options.disabled && !options.readonly ? zoneOverClass : '',
  ].filter(Boolean).join(' ')
}
