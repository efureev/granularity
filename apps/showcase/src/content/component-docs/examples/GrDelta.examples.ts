import type { ShowcaseComponentExampleDoc } from '../types'

export const grDeltaExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'delta-basic',
    title: 'Signed value inside a sentence',
    description: 'Знак, тон и приписки для величины, стоящей в строке текста. Ноль нейтрален, `null` печатается прочерком без тона — «нет данных» и «ноль» это разные утверждения.',
    status: 'ready',
    previewKey: 'gr-delta-basic',
    note: 'Знак ставит `Intl` через `signDisplay`, а не склейка строк: `\'+\' + value` превращает число в строку и теряет разряды.',
  },
  {
    id: 'delta-polarity',
    title: 'Polarity: when growth is bad',
    description: 'Для выручки рост — успех, для оттока и времени отклика — наоборот. `polarity` инвертирует тон, оставляя знак и направление стрелки за самой величиной.',
    status: 'ready',
    previewKey: 'gr-delta-polarity',
  },
]
