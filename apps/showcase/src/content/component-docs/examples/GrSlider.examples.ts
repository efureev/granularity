import type { ShowcaseComponentExampleDoc } from '../types'

export const grSliderExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'slider-basic',
    title: 'Single value with tooltip',
    description: 'Базовый ползунок: `v-model` (число), диапазон `min`/`max`, всплывающее значение (`show-tooltip` + `format-tooltip`). Полная клавиатура: стрелки меняют на `step`, PageUp/PageDown — крупный шаг, Home/End — к границам.',
    status: 'ready',
    previewKey: 'gr-slider-basic',
    note: 'Каждый бегунок — `role="slider"` с `aria-valuemin`/`max`/`now`, доступный с клавиатуры и для скринридеров.',
  },
  {
    id: 'slider-range',
    title: 'Range with two thumbs',
    description: 'Режим `range`: модель — кортеж `[lo, hi]`, два бегунка, которые не перепрыгивают друг друга. Клик по дорожке двигает ближайший бегунок.',
    status: 'ready',
    previewKey: 'gr-slider-range',
    note: 'Для диапазона у нижнего бегунка `aria-valuemax` = значение верхнего, а у верхнего `aria-valuemin` = значение нижнего — скринридер объявляет корректные границы.',
  },
  {
    id: 'slider-marks',
    title: 'Marks, steps, sizes and disabled',
    description: 'Метки делений (`marks`), фиксированный `step`, размеры (`sm`/`md`/`lg`) и `disabled`-состояние.',
    status: 'ready',
    previewKey: 'gr-slider-marks',
  },
  {
    id: 'slider-custom',
    title: 'Custom colors & size (CSS variables)',
    description: 'Внешний вид настраивается CSS-переменными на самом слайдере (или любом предке) — без новых пропов: `--gr-slider-fill` (активная часть), `--gr-slider-rail` (фон дорожки), `--gr-slider-thumb-bg` / `--gr-slider-thumb-border` (заливка и окантовка бегунка), `--gr-slider-thumb-size` и `--gr-slider-track-height` (размеры). Незаданные переменные откатываются к дефолтам темы/размера.',
    status: 'ready',
    previewKey: 'gr-slider-custom',
    note: 'Переменные наследуются, поэтому одну тему слайдеров можно задать на контейнере формы, а отдельные слайдеры точечно переопределить.',
  },
]
