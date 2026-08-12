import type { GrDialogSize } from '../GrDialog/dialogShared'

/**
 * Пропы `GrConfirmDialog`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrConfirmDialog: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrConfirmDialogConfigurableProps {
  size: GrDialogSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrConfirmDialog: GrConfirmDialogConfigurableProps
  }
}
