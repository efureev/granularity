import type { GrComponentSize } from '../shared/sizes'

/**
 * Пропы `GrJsonViewer`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrJsonViewer: { … } }">`.
 *
 * Пороги обрезки здесь наравне с оформлением не случайно: «сколько показывать»
 * — решение приложения, а не экрана. У админки с ответами модели и у панели с
 * конфигами оно разное, и повторять его на каждом просмотрщике значит однажды
 * забыть.
 */
export interface GrJsonViewerConfigurableProps {
  size: GrComponentSize
  defaultExpandDepth: number
  maxStringLength: number
  maxArrayItems: number
  searchable: boolean
  copyable: boolean
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrJsonViewer: GrJsonViewerConfigurableProps
  }
}
