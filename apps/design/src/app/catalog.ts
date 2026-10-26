import { type CatalogGroup, catalogGroups, catalogPages, componentSlug } from './catalogData'
import { componentDoc, plainText } from './docs'

export { type CatalogGroup, catalogGroups, componentSlug, OWN_PAGES } from './catalogData'

/**
 * Каталог компонентов: страница на каждый компонент пакета, тексты — из
 * `docs/components/<GrX>.md` пакета (`docs.ts`); полноту каталога по манифесту
 * пакета держит `src/__tests__/catalog.test.ts`.
 */
export interface CatalogComponent {
  id: string
  name: string
  /** Компоненты пакета, которые описывает страница: их токены и хуки — на вкладках. Первый — главный. */
  exports: string[]
  group: string
  importPath: string
  summary: string
}

/** Первый абзац документа компонента — строка «зачем» для карточки и шапки. */
function summaryOf(name: string): string {
  const intro = componentDoc(name)?.intro ?? ''
  return plainText(intro.split(/\n\s*\n/)[0] ?? '')
}

export const catalog: CatalogComponent[] = catalogPages().map(page => ({
  id: componentSlug(page.name),
  name: page.name.replace(/^Gr/, ''),
  exports: page.exports,
  group: page.group,
  importPath: `@feugene/granularity/components/${page.name}`,
  summary: summaryOf(page.name),
}))

export function findComponent(id: string): CatalogComponent | undefined {
  return catalog.find(item => item.id === id)
}

export function findGroup(id: string): CatalogGroup | undefined {
  return catalogGroups.find(group => group.id === id)
}
