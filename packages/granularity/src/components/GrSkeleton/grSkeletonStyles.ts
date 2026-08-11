/** Форма заглушки: строка текста, прямоугольный блок или круг. */
export const GR_SKELETON_VARIANTS = ['text', 'rect', 'circle'] as const
export type GrSkeletonVariant = typeof GR_SKELETON_VARIANTS[number]

/**
 * Радиус — единственное, что задаёт форма: размеры диктует соседний контент, а
 * не компонент. Пилюля правильна для строки текста и неправильна для блока —
 * из-за одного дефолта на всех прямоугольник просил `rounded` каждый раз.
 */
export const skeletonRoundedByVariant: Record<GrSkeletonVariant, string> = {
  text: 'var(--gr-radius-full)',
  rect: 'var(--gr-radius-md)',
  circle: 'var(--gr-radius-full)',
}
