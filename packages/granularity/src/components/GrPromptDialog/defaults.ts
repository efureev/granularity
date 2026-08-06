import type { GrDialogSize } from '../GrDialog/dialogShared'

/**
 * Пропы `GrPromptDialog`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrPromptDialog: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrPromptDialogConfigurableProps {
  size: GrDialogSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrPromptDialog: GrPromptDialogConfigurableProps
  }
}
