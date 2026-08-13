import type { ComponentExposed } from '../shared/instance'
import type GrDialogComponent from './GrDialog.vue'

export { default } from './GrDialog.vue'
export { default as GrDialog, type GrDialogProps } from './GrDialog.vue'
export { default as GrDialogHeader, type GrDialogHeaderProps } from './GrDialogHeader.vue'
export { default as GrDialogFooter, type GrDialogFooterProps } from './GrDialogFooter.vue'
export { default as GrDialogCloseButton } from './GrDialogCloseButton.vue'
export { type GrDialogSectionConfig, type GrDialogSize } from './dialogShared'
export { grDialogSafelist } from './safelist'
export type { GrDialogEmits } from './GrDialog.vue'
export type GrDialogInstance = ComponentExposed<typeof GrDialogComponent>
export type { GrDialogCloseButtonEmits } from './GrDialogCloseButton.vue'
