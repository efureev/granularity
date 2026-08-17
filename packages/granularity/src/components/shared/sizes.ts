import type { GrComponentSize } from '../GrConfigProvider/context'

export type { GrComponentSize } from '../GrConfigProvider/context'
export { GR_COMPONENT_SIZES } from '../GrConfigProvider/context'

/**
 * Каноническая шкала размеров контролов — `GrComponentSize` (`xs|sm|md|lg`).
 *
 * До сведе́ния шкал в пакете было пять несовместимых: `xs sm md lg`, `sm md lg`,
 * `sm md lg xl full`, `sm md lg full`, `md lg xl`, `sm md` и отдельно
 * `GrAvatar.size: number`. Практическое следствие: `<GrConfigProvider size="xs">`
 * физически не мог примениться к половине пакета, а `size="xl"` компилировался у
 * одного компонента и падал у соседнего.
 */

/**
 * Шкала **ширины оверлея** — отдельный тип, а не размер контрола.
 *
 * У модалки «размер» означает ширину окна, а не высоту строки и не кегль, и
 * шкала у неё своя: `full` осмыслен, `xs` — нет. Смешивать их в одном типе
 * значило бы разрешить `<GrModal size="xs">` и `<GrInput size="full">`.
 */
export const GR_OVERLAY_SIZES = ['sm', 'md', 'lg', 'xl', 'full'] as const

export type GrOverlaySize = typeof GR_OVERLAY_SIZES[number]

/**
 * Визуальное состояние форм-контрола. Было объявлено четырьмя независимыми
 * копиями (`GrTextareaState`, `GrInputTagState`, `GrNumberInputState`,
 * `GrTreeSelectState`) — расхождение обнаружилось бы только рантаймом.
 */
export const GR_CONTROL_STATES = ['default', 'success', 'warning', 'danger'] as const

export type GrControlState = typeof GR_CONTROL_STATES[number]

/**
 * Размер с escape-hatch в пиксели. Берут его трое: `GrAvatar` и `GrIcon`
 * (исторический произвольный диаметр) и `GrFilePreview` (ширина плитки: лента
 * вложений в четыре ступени не укладывается).
 */
export type GrSizeWithPx = GrComponentSize | number
