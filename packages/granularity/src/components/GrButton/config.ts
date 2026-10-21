import { defineGranumComponent } from '@feugene/granum/contract'
import { grButtonSafelist } from './safelist'

export const grButtonConfig = defineGranumComponent(import.meta.url, {
  name: 'GrButton',
  safelist: grButtonSafelist,
  // Радиус внешних углов склеенной группы — хук реестра `GrButtonGroup`: его
  // читает лист кнопки, потому что радиус ступени знает только она.
  hookTokens: ['--gr-button-group-radius'],
})
