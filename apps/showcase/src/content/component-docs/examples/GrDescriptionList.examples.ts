import type { ShowcaseComponentExampleDoc } from '../types'

export const grDescriptionListExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'description-list-basic',
    title: 'Object summary as a real <dl>',
    description: 'Пары «характеристика и значение» с выравниванием значений в колонку. Слот адресуется по `name` пары, поэтому статус может быть бейджем, а не строкой; пустое значение печатается прочерком и строку не теряет.',
    status: 'ready',
    previewKey: 'gr-description-list-basic',
    note: 'Разметка — `dl > div > dt + dd`: она валидна по HTML5 и нужна для раскладки. Ручная вёрстка регулярно даёт `<dl>` с голыми `<div>` внутри — выглядит списком, но парой терминов не является ни для парсера, ни для скринридера.',
  },
  {
    id: 'description-list-layout',
    title: 'Inline, stacked and two columns',
    description: '`inline` держит подписи колонкой, `stacked` ставит их над значением. `stackBelow` переключает раскладку по ширине контейнера, а не вьюпорта — сузьте окно и посмотрите на переход.',
    status: 'ready',
    previewKey: 'gr-description-list-layout',
  },
]
