import { defineGranularComponent } from '@feugene/unocss-preset-granular/contract'

import { grCodeBlockSafelist } from './safelist'

/**
 * Кнопка «скопировать» — `GrButton` ядра, и ребро объявлено с указанием
 * провайдера: в ядре хватало имени, потому что компонент был соседом по
 * реестру, а у спутника свой провайдер, и `'GrButton'` там не резолвится.
 *
 * Ребро обязательно: пресет подмешивает safelist и CSS только компонентам из
 * селекции, и без него потребитель, выбравший один `GrCodeBlock`, получил бы
 * кнопку без фона и без фокус-кольца.
 */
export const grCodeBlockConfig = defineGranularComponent(import.meta.url, {
  name: 'GrCodeBlock',
  dependencies: [
    { provider: '@feugene/granularity', components: ['GrButton'] },
  ],
  safelist: grCodeBlockSafelist,
})
