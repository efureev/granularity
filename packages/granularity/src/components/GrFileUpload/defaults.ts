import type { GrComponentSize } from '../shared/configContext'

/** Пропы `GrFileUpload`, настраиваемые глобально через `componentDefaults`. */
export interface GrFileUploadConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrFileUpload: GrFileUploadConfigurableProps
  }
}
