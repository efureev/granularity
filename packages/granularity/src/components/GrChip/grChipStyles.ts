import type { GrBadgeRadius, GrBadgeTone } from '../GrBadge/grBadgeStyles'
import { radiusClass, toneClass } from '../GrBadge/grBadgeStyles'

import type { GrComponentSize } from '../shared/sizes'

export type GrChipTone = GrBadgeTone
export type GrChipSize = GrComponentSize
export type GrChipRadius = GrBadgeRadius

/**
 * Размеры у чипа свои, а не бейджевые.
 *
 * Шкал кегля в пакете две: контрольная `xs…lg` (12/13/14/16) у полей и мельче
 * `3xs…md` (10/11/12/14) у метки — `GrBadge`, `GrTooltip`. Чип берёт
 * контрольную: по нему кликают, и цель нажатия обязана совпадать с соседним
 * контролом, а не с подписью. Отсюда же явная высота — у метки её нет вовсе,
 * а у цели нажатия она и есть главное.
 *
 * Тона и радиусы при этом переиспользуются у `GrBadge` без изменений: чип
 * должен стоять с бейджем в одном ряду и не расходиться с ним по цвету.
 */
export const chipSizeClassBySize: Record<GrChipSize, string> = {
  xs: 'h-6 gap-1 px-2 text-[length:var(--gr-control-text-xs)]',
  sm: 'h-7 gap-1 px-2.5 text-[length:var(--gr-control-text-sm)]',
  md: 'h-8 gap-1.5 px-3 text-[length:var(--gr-control-text-md)]',
  lg: 'h-9 gap-1.5 px-3.5 text-[length:var(--gr-control-text-lg)]',
}

/** Крестик и иконка не растут вместе с кеглем один в один — плитка бы разъехалась. */
export const chipIconSizeClassBySize: Record<GrChipSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4 w-4',
}

/**
 * `leading-none` осознанно: у контрольной шкалы парных ступеней межстрочного
 * нет, и без явного значения плитка поехала бы за `line-height` приложения.
 * Тот же приём у `GrBadge` и `GrKbd`.
 */
export const chipRootClass = 'inline-flex max-w-full items-center border align-middle leading-none whitespace-nowrap'

/** Подпись жмётся, а не ломает ряд: чип с длинным тегом не должен рвать раскладку. */
export const chipLabelClass = 'min-w-0 truncate'

export const chipInteractiveClass = 'cursor-pointer transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--gr-bg)]'

/**
 * Disabled гасится токеном фона, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста и роняет контраст (`library-conventions.md`).
 */
export const chipDisabledClass = 'cursor-not-allowed bg-[var(--gr-chip-disabled-bg,var(--gr-muted))] text-[var(--gr-chip-disabled-fg,var(--gr-disabled-fg))] border-[var(--gr-chip-disabled-brd,var(--gr-brd))]'

/**
 * Выбранный чип берёт **плотный** вариант своего тона, а не оттенок соседнего.
 *
 * Тон остаётся тем же — иначе набор фильтров превратился бы в радугу, — но
 * меняется вес заливки: светлая подложка сменяется насыщенной, как у
 * filled-бейджа. Это перепад светлоты, а не оттенка, поэтому различие
 * переживает и монохром, и дальтонизм.
 *
 * Одной заливки всё же мало: **`font-600` остаётся вторым, нецветовым
 * каналом** (WCAG 1.4.1). Он же вытягивает случай, когда потребитель поставил
 * `dark` всему набору и заливка у выбранного и невыбранного совпадает.
 */
export const chipSelectedClass = 'font-600'

/** Крестик наследует цвет тона: своей роли у него нет, он часть плитки. */
export const chipCloseClass = 'shrink-0 inline-flex items-center justify-center rounded-[var(--gr-radius-full)] text-current transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)] hover:bg-[color-mix(in_srgb,currentColor_18%,transparent)]'

/**
 * Крестик-кнопка стоит в таб-порядке и обязана показывать фокус сама: она
 * появляется только там, где чип не виджет, то есть кольца на корне нет.
 */
export const chipCloseButtonClass = `${chipCloseClass} cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]`

export const chipIconClass = 'shrink-0'

export function grChipClass(options: {
  tone: GrChipTone
  dark: boolean
  size: GrChipSize
  radius: GrChipRadius
  interactive: boolean
  selected: boolean
  disabled: boolean
}): string {
  return [
    chipRootClass,
    radiusClass(options.radius, options.size),
    chipSizeClassBySize[options.size],
    // Выбор поднимает вес заливки до плотного варианта того же тона.
    options.disabled ? chipDisabledClass : toneClass(options.tone, options.dark || options.selected),
    options.interactive && !options.disabled ? chipInteractiveClass : '',
    options.selected ? chipSelectedClass : '',
  ].filter(Boolean).join(' ')
}
