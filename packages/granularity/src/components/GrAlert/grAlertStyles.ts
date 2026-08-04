import type { GrTone } from '../shared/tones'

/**
 * Цветовая модель `GrAlert`.
 *
 * Модуль намеренно чистый: он оперирует **строками CSS-значений**, а не
 * utility-классами UnoCSS. Классы, живущие только строковыми литералами в
 * `.ts`, не сканируются `granularContent` и требуют ручного safelist — здесь
 * этой проблемы нет по построению, а логику цветов можно тестировать без
 * монтирования компонента.
 */

/**
 * `soft` — залитая тоном подложка, тональный текст. Основной вариант.
 * `outline` — фон страницы, тон несут рамка и иконка; текст нейтральный.
 *
 * `light` (устаревший) нормализуется в `soft`: раньше он существовал ровно для
 * одного тона (`warning`) и был набран hex-литералами, то есть не реагировал на

 */
export const GR_ALERT_VARIANTS = ['soft', 'outline'] as const

export type GrAlertVariant = typeof GR_ALERT_VARIANTS[number]

/** Ключ иконки тона. Сама иконка резолвится в SFC — модуль остаётся чистым. */
export type GrAlertIconKey = 'info' | 'success' | 'warning' | 'danger'

type GrAlertToneTokens = {
  /** Подложка варианта `soft`. */
  surface: string
  /** Насыщенный цвет тона: база для рамки. */
  accent: string
  /**
   * Тональный цвет текста — рассчитан на подложку `surface`.
   *
   * Именно он, а не `accent`, красит иконку и текст: на светлой теме
   * `--gr-success` (#10b981) на `--gr-success-light` (#d1fae5) даёт 2.24:1 —
   * ниже порога 3:1 даже для нетекстовой графики. `--gr-success-text`
   * (#065f46) на той же подложке даёт 6.78:1.
   */
  text: string
  icon: GrAlertIconKey
}

/**
 * Тон → тройка токенов.
 *
 * `primary` и `neutral` не имеют пары `-light`/`-text` и отображаются на
 * ближайшие семантические роли: акцентную поверхность и нейтральную muted.
 */
const TONE_TOKENS: Record<GrTone, GrAlertToneTokens> = {
  primary: { surface: 'var(--gr-accent)', accent: 'var(--gr-primary)', text: 'var(--gr-accent-fg)', icon: 'info' },
  neutral: { surface: 'var(--gr-muted)', accent: 'var(--gr-muted-fg)', text: 'var(--gr-fg)', icon: 'info' },
  success: { surface: 'var(--gr-success-light)', accent: 'var(--gr-success)', text: 'var(--gr-success-text)', icon: 'success' },
  warning: { surface: 'var(--gr-warning-light)', accent: 'var(--gr-warning)', text: 'var(--gr-warning-text)', icon: 'warning' },
  danger: { surface: 'var(--gr-danger-light)', accent: 'var(--gr-danger)', text: 'var(--gr-danger-text)', icon: 'danger' },
  info: { surface: 'var(--gr-info-light)', accent: 'var(--gr-info)', text: 'var(--gr-info-text)', icon: 'info' },
  slate: { surface: 'var(--gr-slate-light)', accent: 'var(--gr-slate)', text: 'var(--gr-slate-text)', icon: 'info' },
  azure: { surface: 'var(--gr-azure-light)', accent: 'var(--gr-azure)', text: 'var(--gr-azure-text)', icon: 'info' },
}

/** Разрешённые цвета одного алерта — ровно то, что уходит в CSS-переменные. */
export type GrAlertColors = {
  bg: string
  border: string
  icon: string
  title: string
  text: string
  close: string
  closeHover: string
  closeHoverBg: string
}

/** Пользовательские переопределения цвета (пропы-эскейпы). */
export type GrAlertColorOverrides = {
  backgroundColor?: string
  textColor?: string
  borderColor?: string
}

export function grAlertIconKey(tone: GrTone): GrAlertIconKey {
  return TONE_TOKENS[tone].icon
}

/**
 * Рамка выводится из тона формулой, а не задаётся отдельным токеном на каждый
 * тон: доля тона в смеси с `--gr-brd` — единственное, что отличает рамки между
 * собой. 22% (как было) давало 1.27–1.51:1 к собственной подложке — край
 * практически не читался; 35/45% поднимают его до 1.42–2.07:1.
 */
function border(accent: string, ratio: number): string {
  return `color-mix(in srgb, ${accent} ${ratio}%, var(--gr-brd))`
}

export function resolveGrAlertColors(tone: GrTone, variant: GrAlertVariant): GrAlertColors {
  const t = TONE_TOKENS[tone]

  if (variant === 'outline') {
    return {
      bg: 'var(--gr-bg)',
      border: border(t.accent, 45),
      icon: t.text,
      title: 'var(--gr-fg)',
      text: 'var(--gr-muted-fg)',
      close: 'var(--gr-muted-fg)',
      closeHover: 'var(--gr-fg)',
      closeHoverBg: 'var(--gr-muted)',
    }
  }

  return {
    bg: t.surface,
    border: border(t.accent, 35),
    // Иерархия «заголовок / текст» держится на размере и насыщении шрифта, а не
    // на цвете: приглушать тональный текст подмешиванием подложки нельзя —
    // на тёмной теме warning и danger проваливают 4.5:1 уже при 15% подмеса.
    icon: t.text,
    title: t.text,
    text: t.text,
    close: t.text,
    closeHover: t.text,
    closeHoverBg: `color-mix(in srgb, ${t.accent} 16%, transparent)`,
  }
}

/**
 * Пропы-эскейпы поверх тона. `textColor` красит весь текстовый слой целиком
 * (иконка, заголовок, текст, кнопка закрытия) — иначе пользовательский цвет
 * соседствовал бы с тональным и давал грязь.
 */
export function applyGrAlertOverrides(colors: GrAlertColors, overrides: GrAlertColorOverrides): GrAlertColors {
  const custom = (value?: string) => value?.trim() || undefined
  const text = custom(overrides.textColor)

  return {
    ...colors,
    bg: custom(overrides.backgroundColor) ?? colors.bg,
    border: custom(overrides.borderColor) ?? colors.border,
    icon: text ?? colors.icon,
    title: text ?? colors.title,
    text: text ?? colors.text,
    close: text ?? colors.close,
    closeHover: text ?? colors.closeHover,
    closeHoverBg: text ? `color-mix(in srgb, ${text} 12%, transparent)` : colors.closeHoverBg,
  }
}

/**
 * Публичный контракт кастомизации: переменные `--gr-alert-*` можно
 * переопределить снаружи так же, как их задаёт компонент.
 */
export function grAlertCssVars(colors: GrAlertColors): Record<string, string> {
  return {
    '--gr-alert-bg': colors.bg,
    '--gr-alert-brd': colors.border,
    '--gr-alert-icon-color': colors.icon,
    '--gr-alert-title-color': colors.title,
    '--gr-alert-text-color': colors.text,
    '--gr-alert-close-color': colors.close,
    '--gr-alert-close-hover-color': colors.closeHover,
    '--gr-alert-close-hover-bg': colors.closeHoverBg,
  }
}
