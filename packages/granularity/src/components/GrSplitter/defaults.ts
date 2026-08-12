import type { GrSplitterOrientation } from './splitterGeometry'

/**
 * Пропы `GrSplitter`, настраиваемые глобально через `componentDefaults`.
 *
 * Только оформление раскладки: размер панели и её свёрнутость принадлежат
 * конкретному экземпляру.
 */
export interface GrSplitterConfigurableProps {
  orientation: GrSplitterOrientation
  collapsible: boolean
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrSplitter: GrSplitterConfigurableProps
  }
}
