import type { GrComponentSize } from '../shared/sizes'

import type {
  GrDescriptionColumns,
  GrDescriptionDensity,
  GrDescriptionLayout,
} from './grDescriptionListStyles'

/**
 * Пропы `GrDescriptionList`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrDescriptionList: { … } }">`.
 * Только оформление — данные принадлежат экземпляру.
 */
export interface GrDescriptionListConfigurableProps {
  size: GrComponentSize
  layout: GrDescriptionLayout
  labelWidth: string
  density: GrDescriptionDensity
  divided: boolean
  columns: GrDescriptionColumns
  emptyText: string
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrDescriptionList: GrDescriptionListConfigurableProps
  }
}
