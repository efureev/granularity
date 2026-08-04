import type { GrComponentSize } from '../GrConfigProvider/context'

/**
 * Пропы `GrTextarea`, настраиваемые глобально через `componentDefaults`.
 *
 * `size` типизируем через `GrComponentSize`, а не через `GrTextareaSize`:
 * последний объявлен в `grTextareaStyles.ts`, который тянет контекст, — вышел
 * бы цикл модулей.
 */
export interface GrTextareaConfigurableProps {
  size: GrComponentSize
}

declare module '../GrConfigProvider/context' {
  interface GrComponentDefaultsRegistry {
    GrTextarea: GrTextareaConfigurableProps
  }
}
