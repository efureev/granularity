import type { ComponentExposed } from '../shared/instance'
import type GrContextMenuComponent from './GrContextMenu.vue'

export { default } from './GrContextMenu.vue'
export { default as GrContextMenu } from './GrContextMenu.vue'
export type {
  GrContextMenuEmits,
  GrContextMenuOpenContext,
  GrContextMenuProps,
  GrContextMenuSource,
  GrContextMenuTrigger,
} from './GrContextMenu.vue'
export { grContextMenuConfig } from './config'
export type GrContextMenuInstance = ComponentExposed<typeof GrContextMenuComponent>
