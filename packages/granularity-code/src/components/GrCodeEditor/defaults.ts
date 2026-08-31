import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'

/**
 * Пропы `GrCodeEditor`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrCodeEditor: { … } }">`.
 *
 * Только оформление и поведение клавиатуры: текст, язык и валидация
 * принадлежат экземпляру. `tabIndents` здесь не случайно — решение про
 * ловушку `Tab` принимают один раз на приложение, а не у каждого поля.
 */
export interface GrCodeEditorConfigurableProps {
  size: GrComponentSize
  wrap: boolean
  lineNumbers: boolean
  tabIndents: boolean
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrCodeEditor: GrCodeEditorConfigurableProps
  }
}
