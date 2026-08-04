import type { GrComponentSize } from '../shared/sizes'

export type GrTreeSize = GrComponentSize

/**
 * Размер дерева выражен переменными, а не утилитарными классами: те же
 * `--gr-tree-*` уже объявлены точками кастомизации в `GrTree.vue`, и size
 * обязан задавать им дефолты, а не спорить с ними отдельным каналом.
 *
 * `font-size` на `md` намеренно `inherit`: дерево по умолчанию набирается
 * кеглем родителя, и подстановка конкретных пикселей сменила бы вид всем,
 * кто ничего не просил.
 */
export type GrTreeSizeVars = {
  '--gr-tree-row-min-height': string
  '--gr-tree-row-px': string
  '--gr-tree-row-py': string
  '--gr-tree-toggle-size': string
  '--gr-tree-drag-handle-size': string
  '--gr-tree-icon-size': string
  '--gr-tree-content-gap': string
  '--gr-tree-font-size': string
}

export const treeSizeVars: Record<GrTreeSize, GrTreeSizeVars> = {
  xs: {
    '--gr-tree-row-min-height': '22px',
    '--gr-tree-row-px': '4px',
    '--gr-tree-row-py': '3px',
    '--gr-tree-toggle-size': '18px',
    '--gr-tree-drag-handle-size': '18px',
    '--gr-tree-icon-size': '12px',
    '--gr-tree-content-gap': '4px',
    '--gr-tree-font-size': '12px',
  },
  sm: {
    '--gr-tree-row-min-height': '24px',
    '--gr-tree-row-px': '6px',
    '--gr-tree-row-py': '5px',
    '--gr-tree-toggle-size': '20px',
    '--gr-tree-drag-handle-size': '20px',
    '--gr-tree-icon-size': '14px',
    '--gr-tree-content-gap': '6px',
    '--gr-tree-font-size': '13px',
  },
  md: {
    '--gr-tree-row-min-height': '28px',
    '--gr-tree-row-px': '8px',
    '--gr-tree-row-py': '8px',
    '--gr-tree-toggle-size': '24px',
    '--gr-tree-drag-handle-size': '24px',
    '--gr-tree-icon-size': '16px',
    '--gr-tree-content-gap': '8px',
    '--gr-tree-font-size': 'inherit',
  },
  lg: {
    '--gr-tree-row-min-height': '32px',
    '--gr-tree-row-px': '10px',
    '--gr-tree-row-py': '10px',
    '--gr-tree-toggle-size': '28px',
    '--gr-tree-drag-handle-size': '28px',
    '--gr-tree-icon-size': '20px',
    '--gr-tree-content-gap': '10px',
    '--gr-tree-font-size': '15px',
  },
}
