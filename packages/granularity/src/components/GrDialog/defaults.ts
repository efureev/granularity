import type { GrDialogSize } from './dialogShared'

/**
 * Пропы `GrDialog`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrDialog: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrDialogConfigurableProps {
  size: GrDialogSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrDialog: GrDialogConfigurableProps
  }
}
