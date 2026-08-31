import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

/**
 * Пропы `GrCodeBlock`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrCodeBlock: { … } }">`.
 *
 * Только оформление: `code`, `language` и `ariaLabel` принадлежат экземпляру.
 * `lineNumbers` и `wrap` здесь не случайно — в админке блоки кода выглядят
 * одинаково на всех страницах, и повторять решение у каждого значит однажды
 * забыть.
 */
export interface GrCodeBlockConfigurableProps {
  size: GrComponentSize
  copyable: boolean
  wrap: boolean
  lineNumbers: boolean
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrCodeBlock: GrCodeBlockConfigurableProps
  }
}
