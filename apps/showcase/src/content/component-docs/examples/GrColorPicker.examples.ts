import type { ShowcaseComponentExampleDoc } from '../types'

export const grColorPickerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'color-picker-basic',
    title: 'Brand and overlay colors',
    description: 'Триггер показывает образец и текущее значение, панель — оттенок, насыщенность и светлоту тремя `GrSlider`, поле hex и палитру. `alpha` добавляет четвёртый канал и восьмизначную форму `#RRGGBBAA`; под прозрачным цветом видна шахматка.',
    status: 'ready',
    previewKey: 'gr-color-picker-basic',
    note: 'Каналы сделаны слайдерами, а не двумерным квадратом, намеренно: каждый — настоящий `role="slider"` с полной клавиатурой и `aria-valuetext` («217°», «91 %»), тогда как квадрат пришлось бы озвучивать и водить с клавиатуры с нуля.',
  },
  {
    id: 'color-picker-form',
    title: 'Inside a form field',
    description: 'Пикер — обычный форм-контрол: читает контекст `GrFormField` (подпись, подсказка, ошибка, `disabled`/`readonly`), участвует в правилах `GrForm` и отдаёт значение в нативную форму скрытым полем по пропу `name`.',
    status: 'ready',
    previewKey: 'gr-color-picker-form',
  },
]
