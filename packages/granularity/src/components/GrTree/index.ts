export { default } from './GrTree.vue'
export { default as GrTree } from './GrTree.vue'
export type {
  GrTreeAllowDropType,
  GrTreeInstance,
  GrTreeKey,
  GrTreeNode,
  GrTreeNodeDropType,
  GrTreeNodeTarget,
} from './grTreeTypes'
export type {
  GrTreeBranchLineColor,
  GrTreeFilterNodeMethod,
  GrTreeNodeClass,
  GrTreeProps,
  GrTreePropsMap,
  GrTreeVisibleRow,
  GrTreeVisibleTreeRow,
} from './grTreeProps'
export { grTreeConfig } from './config'
// Реэкспорт затягивает `defaults.ts` (и его аугментацию реестра) к потребителю.
export type { GrTreeConfigurableProps } from './defaults'
export type { GrTreeSize } from './grTreeStyles'
export { grTreeSafelist } from './safelist'