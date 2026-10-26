import type { GrFormFieldHintPosition, GrFormFieldLabelPosition, GrFormFieldSize } from './grFormFieldStyles'

/**
 * Пропы `GrFormField`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrFormField: { … } }">`.
 * Только оформление — см. `GrButton/defaults.ts`.
 */
export interface GrFormFieldConfigurableProps {
  size: GrFormFieldSize
  labelPosition: GrFormFieldLabelPosition
  hintPosition: GrFormFieldHintPosition
  /** Держать место под строку сообщения — см. проп `reserveMessage`. */
  reserveMessage: boolean
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrFormField: GrFormFieldConfigurableProps
  }
}
