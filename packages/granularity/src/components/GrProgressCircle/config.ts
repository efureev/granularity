import { defineGranumComponent } from '@feugene/granum/contract'

import { grProgressCircleSafelist } from './safelist'

export const grProgressCircleConfig = defineGranumComponent(import.meta.url, {
  name: 'GrProgressCircle',
  safelist: grProgressCircleSafelist,
  // Длительность бесконечной анимации — общий хук с `GrProgressBar`, его реестр
  // его и объявляет; свои хуки дескриптору приносит сборка из `tokens.json`.
  hookTokens: ['--gr-progress-indeterminate-duration'],
})
