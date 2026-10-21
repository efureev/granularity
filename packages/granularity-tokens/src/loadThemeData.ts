import type { GrThemeData } from './types'
import { grThemeCatalog } from './generated'
import { grThemeDataLoaders } from './themeData.generated'

/**
 * Полные данные темы каталога — для страниц, которые показывают значения той
 * темы, что выбрана сейчас. Каждая тема — свой чанк, и загружается только
 * запрошенная. Тему, известную заранее, проще импортировать статически:
 * `@feugene/granularity-tokens/themes/<id>/theme.json`.
 */
export async function loadThemeData(id: string): Promise<GrThemeData> {
  if (!Object.hasOwn(grThemeDataLoaders, id))
    throw new Error(`loadThemeData: темы "${id}" нет в каталоге — есть ${grThemeCatalog.map(theme => theme.id).join(', ')}`)
  return (await grThemeDataLoaders[id]()).default
}
