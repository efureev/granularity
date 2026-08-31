import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

/**
 * Пропы `GrDiff`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrDiff: { … } }">`.
 *
 * Только оформление: стороны сравнения, язык и подсветка принадлежат
 * экземпляру. `context` и `expandStep` здесь не случайно — сколько строк вокруг
 * правки показывать и по сколько открывать пропуск, решают один раз на
 * приложение, а не у каждого диффа.
 */
export interface GrDiffConfigurableProps {
  size: GrComponentSize
  mode: 'unified' | 'split'
  wrap: boolean
  lineNumbers: boolean
  context: number
  expandStep: number
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDiff: GrDiffConfigurableProps
  }
}
