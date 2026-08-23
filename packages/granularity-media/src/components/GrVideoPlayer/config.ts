import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grVideoPlayerSafelist } from './grVideoPlayerStyles'

/**
 * Своих соседей плеер не рендерит: кнопки нарисованы прямо в нём.
 *
 * `GrButton` сюда не годится — он рисуется на поверхности приложения, а эти
 * кнопки лежат **на кадре**, где фон заранее неизвестен и меняется каждый
 * кадр. Отсюда собственный класс с белым цветом и полупрозрачной подложкой.
 */
export const grVideoPlayerConfig = defineGranularComponent(import.meta.url, {
  name: 'GrVideoPlayer',
  safelist: grVideoPlayerSafelist,
})
