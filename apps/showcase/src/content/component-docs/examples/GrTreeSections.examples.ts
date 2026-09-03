import type { ShowcaseComponentExampleDoc } from '../types'

export const grTreeSectionsExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tree-sections-basic',
    title: 'Рубрики вместо корневых узлов',
    description: 'Корни данных стали заголовками со счётчиком, их дети — отдельными деревьями. Внутри это не одно дерево с заголовками между строк: `role="tree"` требует, чтобы его детьми были `treeitem`, а заголовки между деревьями законны.',
    status: 'ready',
    previewKey: 'gr-tree-sections-basic',
  },
  {
    id: 'tree-sections-permissions',
    title: 'Права доступа по разделам',
    description: 'Чекбоксы работают внутри каждой группы своим наследованием, а наружу ключи собираются объединением: общего родителя у групп нет, поэтому списки складываются без потерь.',
    status: 'ready',
    previewKey: 'gr-tree-sections-permissions',
  },
]
