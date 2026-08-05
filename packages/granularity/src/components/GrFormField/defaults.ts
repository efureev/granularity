import type { GrFormFieldLabelPosition, GrFormFieldSize } from './grFormFieldStyles'

/**
 * Пропы `GrFormField`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrFormField: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrFormFieldConfigurableProps {
  size: GrFormFieldSize
  labelPosition: GrFormFieldLabelPosition
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrFormField: GrFormFieldConfigurableProps
  }
}
