import type { GrComponentSize } from '../GrConfigProvider/context'

/** Пропы `GrFileUpload`, настраиваемые глобально через `componentDefaults`. */
export interface GrFileUploadConfigurableProps {
  size: GrComponentSize
}

declare module '../../composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrFileUpload: GrFileUploadConfigurableProps
  }
}
