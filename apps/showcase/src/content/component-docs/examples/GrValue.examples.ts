import type { ShowcaseComponentExampleDoc } from '../types'

export const grValueExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'value-affixes',
    title: 'Currency left, currency right, unit',
    description: 'Компонент не решает, чем является приписка. Дефолты выбраны по частоте: слева обычно валюта — она набирается как число; справа обычно единица измерения — она приглушается и отбивается. Рубль пишут справа, но он часть суммы, и дефолт ему не подходит: снимается двумя токенами `--gr-value-suffix-color` и `--gr-value-suffix-size`.',
    status: 'ready',
    previewKey: 'gr-value-affixes',
    note: 'Сторону символа компонент не выбирает: `Intl` расставляет валюту по локали, а не по валюте — в `ru-RU` справа оказываются все, включая доллар. Привычное «₽ справа, $ слева» — правило продуктовое, и решает его потребитель, выбирая приписку.',
  },
]
