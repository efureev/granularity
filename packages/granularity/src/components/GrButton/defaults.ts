import type { GrButtonSize, GrButtonTone, GrButtonVariant } from './grButtonStyles'

/**
 * Пропы `GrButton`, которые можно задать глобально через
 * `<GrConfigProvider :component-defaults="{ GrButton: { … } }">`.
 *
 * Набор закрытый и осознанный: только оформление. `modelValue`, обработчики и
 * всё, что относится к конкретному экземпляру, через конфиг настраиваться не
 * должно — иначе получим глобальное состояние, которое ищется часами.
 */
export interface GrButtonConfigurableProps {
  variant: GrButtonVariant
  tone: GrButtonTone
  size: GrButtonSize
  square: boolean
}

/**
 * Регистрация контракта в открытом реестре провайдера. Живёт здесь, а не в
 * `GrConfigProvider`, чтобы провайдер не знал про конкретные компоненты: тип
 * приезжает к потребителю ровно тогда, когда он импортирует сам `GrButton`.
 */
declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrButton: GrButtonConfigurableProps
  }
}
