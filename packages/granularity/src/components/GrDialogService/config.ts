import { defineGranumComponent } from '@feugene/granum/contract'

export const grDialogServiceConfig = defineGranumComponent(import.meta.url, {
  // Совпадает с именем директории: по нему granum находит в сборке вход
  // `components/<name>/index.js`, от которого обходит чанки компонента.
  name: 'GrDialogService',
  dependencies: ['GrButton', 'GrConfirmDialog', 'GrPromptDialog'],
})
