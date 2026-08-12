import type { GrDialogSize } from '../GrDialog/dialogShared'

/**
 * Пропы `GrPromptDialog`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrPromptDialog: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrPromptDialogConfigurableProps {
  size: GrDialogSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrPromptDialog: GrPromptDialogConfigurableProps
  }
}
