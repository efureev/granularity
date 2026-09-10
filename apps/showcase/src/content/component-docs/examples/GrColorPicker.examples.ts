import type { ShowcaseComponentExampleDoc } from '../types'

export const grColorPickerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'color-picker-basic',
    title: 'Brand and overlay colors',
    description: 'Триггер показывает образец и текущее значение, панель — оттенок, насыщенность и светлоту тремя `GrSlider`, поле hex и палитру. `alpha` добавляет четвёртый канал и восьмизначную форму `#RRGGBBAA`; под прозрачным цветом видна шахматка.',
    status: 'ready',
    previewKey: 'gr-color-picker-basic',
    note: 'Вид по умолчанию: каждый канал — настоящий `role="slider"` с полной клавиатурой и `aria-valuetext` («217°», «91 %»). Квадрат включается пропом `view="area"` — соседний пример.',
  },
  {
    id: 'color-picker-area',
    title: 'Square and screen eyedropper',
    description: '`view="area"` заменяет бегунки насыщенности и светлоты квадратом: цвет берут одним движением, а не двумя. `eyedropper` добавляет кнопку «взять цвет с экрана» — она появляется только там, где браузер даёт `EyeDropper` (сегодня это Chromium).',
    status: 'ready',
    previewKey: 'gr-color-picker-area',
    note: 'Клавиатура у квадрата настоящая: горизонтальные стрелки ведут насыщенность, вертикальные — светлоту, `Home`/`End` и `PageUp`/`PageDown` работают по оси. Диктору обе оси видны отдельными слайдерами со своими именами и значениями — внутри квадрата два `input[type=range]`, скрытых визуально, но не от вспомогательных технологий.',
  },
  {
    id: 'color-picker-shape',
    title: 'Border shape',
    description: 'Образец цвета стоит первым в триггере, и отступ пилюли отодвигает его от дуги. У коробки отступ мельче, чем у полей ввода, — ради этого же образца.',
    status: 'ready',
    previewKey: 'gr-color-picker-shape',
  },
  {
    id: 'color-picker-form',
    title: 'Inside a form field',
    description: 'Пикер — обычный форм-контрол: читает контекст `GrFormField` (подпись, подсказка, ошибка, `disabled`/`readonly`), участвует в правилах `GrForm` и отдаёт значение в нативную форму скрытым полем по пропу `name`.',
    status: 'ready',
    previewKey: 'gr-color-picker-form',
  },
]
