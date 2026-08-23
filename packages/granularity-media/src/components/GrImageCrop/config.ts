import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grImageCropSafelist } from './grImageCropStyles'

/**
 * Слайдер увеличения — `GrSlider` ядра, и ребро объявлено: пресет подмешивает
 * safelist и CSS только тем компонентам, что попали в селекцию, и без графа
 * потребитель, выбравший один `GrImageCrop`, получил бы дорожку без ползунка.
 *
 * Слот `#controls` этого не отменяет: подмену делает потребитель, а по
 * умолчанию слайдер рендерится.
 */
export const grImageCropConfig = defineGranularComponent(import.meta.url, {
  name: 'GrImageCrop',
  safelist: grImageCropSafelist,
  dependencies: [
    { provider: '@feugene/granularity', components: ['GrSlider'] },
  ],
})
