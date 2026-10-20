import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton/grButtonStyles'

/** Вид группы: обычный ряд (склеенный или с зазором) или лоток — звенья в общей подложке. */
export type GrButtonGroupAppearance = 'default' | 'tray'

/**
 * Оформление, общее для кнопок группы. Каждое поле необязательно: группа
 * задаёт только то, что задали ей, остальное кнопка решает сама.
 */
export type GrButtonGroupContext = {
  size: ComputedRef<GrButtonSize | undefined>
  variant: ComputedRef<GrButtonVariant | undefined>
  tone: ComputedRef<GrButtonTone | undefined>
  /** Необязателен: контекст строят и руками. */
  appearance?: ComputedRef<GrButtonGroupAppearance>
}

const GR_BUTTON_GROUP_KEY: InjectionKey<GrButtonGroupContext> = Symbol('grButtonGroup')

export function provideGrButtonGroup(context: GrButtonGroupContext): void {
  provide(GR_BUTTON_GROUP_KEY, context)
}

/**
 * Контекст группы для `GrButton`.
 *
 * Порядок разрешения оформления получается такой: проп кнопки → группа →
 * `GrConfigProvider` → дефолт. Группа ближе к кнопке, чем глобальный провайдер,
 * поэтому она и должна побеждать его, но не собственный проп кнопки.
 */
export function useGrButtonGroup(): GrButtonGroupContext | undefined {
  return inject(GR_BUTTON_GROUP_KEY, undefined)
}
