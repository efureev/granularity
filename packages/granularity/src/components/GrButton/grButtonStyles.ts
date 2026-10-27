import type { GrComponentSize } from '../shared/sizes'

import type { GrTone } from '../shared/tones'

export type GrButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'ghost-border'
/** Вид загрузки: спиннер, свет по подписи или отрезок, бегущий по нижней кромке. */
export type GrButtonLoadingIndicator = 'spinner' | 'shimmer' | 'track'
export type GrButtonTone = GrTone
export type GrButtonSize = GrComponentSize

export interface GrButtonLookOptions {
  variant: GrButtonVariant
  /** Без тона вид веса не включается: так недоступное радио-«кнопка» берёт только основу и ступень. */
  tone?: GrButtonTone
  size: GrButtonSize
  square?: boolean
  block?: boolean
  /** Вид недоступной: цвета веса снимаются, движение и отклик — тоже. */
  off?: boolean
  /** Аддон слева: отступ с его стороны меньше, чтобы глиф стоял оптически по центру. */
  prefix?: boolean
  /** Аддон справа — то же со стороны конца. */
  suffix?: boolean
  /** Префикс в ячейке у начального края: отступа с той стороны нет, его место — у ячейки. */
  prefixCell?: boolean
}

const flag = (on: boolean | undefined): '' | undefined => (on ? '' : undefined)

/** Вид кнопки — атрибуты, а не классы: вес, тон и ступень читает лист компонента (`<style>` в `GrButton.vue`). */
export function grButtonLookAttrs(options: GrButtonLookOptions): Record<string, string | undefined> {
  return {
    'data-gr-variant': options.variant,
    'data-gr-tone': options.tone,
    'data-gr-size': options.size,
    'data-gr-square': flag(options.square),
    'data-gr-block': flag(options.block),
    'data-gr-off': flag(options.off),
    'data-gr-pre': flag(options.prefix && !options.prefixCell),
    'data-gr-post': flag(options.suffix),
    'data-gr-cell': flag(options.prefixCell),
  }
}
