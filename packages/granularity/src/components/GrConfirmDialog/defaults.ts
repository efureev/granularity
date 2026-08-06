import type { GrDialogSize } from '../GrDialog/dialogShared'

/**
 * Пропы `GrConfirmDialog`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrConfirmDialog: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrConfirmDialogConfigurableProps {
  size: GrDialogSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrConfirmDialog: GrConfirmDialogConfigurableProps
  }
}
