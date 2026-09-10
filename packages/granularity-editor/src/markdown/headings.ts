import type { GrMdBlock, GrMdHeading } from './types'

/**
 * Слаг заголовка — из его текста, а не из `useId()`.
 *
 * Осознанное отступление от правила репозитория: `useId` выдал бы разные
 * идентификаторы двум рендерам одного документа, и ссылка `#раздел` из адресной
 * строки или письма перестала бы работать. Столкновение двух документов на
 * одной странице разводит `idPrefix`.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Уникализатор слагов в пределах одного разбора.
 *
 * Счётчик, а не проверка занятости: два одинаковых заголовка обязаны получить
 * разные `id`, иначе якорь ведёт всегда на первый.
 */
export function createSlugRegistry(prefix = '') {
  const seen = new Map<string, number>()

  return function unique(text: string): string {
    const base = slugify(text) || 'section'
    const used = seen.get(base) ?? 0
    seen.set(base, used + 1)
    return `${prefix}${used === 0 ? base : `${base}-${used}`}`
  }
}

/** Оглавление документа. Форма совпадает с `GrScrollSpySection` ядра намеренно. */
export function markdownHeadings(blocks: GrMdBlock[]): GrMdHeading[] {
  const headings: GrMdHeading[] = []
  for (const block of blocks) {
    if (block.node.type === 'heading')
      headings.push({ id: block.node.id, level: block.node.depth, text: block.node.text })
  }
  return headings
}
