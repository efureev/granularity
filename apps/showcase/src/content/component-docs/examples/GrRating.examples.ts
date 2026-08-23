import type { ShowcaseComponentExampleDoc } from '../types'

export const grRatingExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'rating-basic',
    title: 'Basic rating',
    description: 'Оценка в один клик: `v-model` — число, `show-text` печатает значение рядом. Шкала фокусируется и управляется стрелками, Home/End.',
    status: 'ready',
    previewKey: 'gr-rating-basic',
    note: 'Шкала — `role="slider"` с `aria-valuenow`/`aria-valuetext`, поэтому скринридер объявляет «4 из 5», а не пять безымянных иконок.',
  },
  {
    id: 'rating-half',
    title: 'Half stars, clearable and read-only',
    description: '`allow-half` даёт половинчатые оценки (клик по левой половине символа), `clearable` сбрасывает повторным кликом, `readonly` показывает чужие оценки без ввода.',
    status: 'ready',
    previewKey: 'gr-rating-half',
    note: 'В режиме `readonly` шкала становится `role="img"` с оценкой в подписи — она не попадает в таб-порядок и не притворяется контролом.',
  },
  {
    id: 'rating-custom',
    title: 'Custom symbol, tone and size',
    description: 'Символ меняется пропом `icon` (любая UnoCSS-иконка) или слотом `#symbol`, цвет — тоном либо переменной `--gr-rating-color`, размер — `size` или `--gr-rating-symbol-size`.',
    status: 'ready',
    previewKey: 'gr-rating-custom',
  },
]
