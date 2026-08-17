import type { ShowcaseComponentExampleDoc } from '../types'

export const grJsonViewerExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'json-viewer-response',
    title: 'Response from a service, walked by node',
    description: 'Корень раскрыт, остальное свёрнуто: сначала видно форму ответа, а не его объём. Поиск идёт и по ключу, и по значению — в чужом ответе ищут то одно, то другое.',
    status: 'ready',
    previewKey: 'gr-json-viewer-response',
    note: 'Ключ узла — читаемый путь (`$.items[2].name`), а не порядковый номер: он уходит в событие `copy`, по нему же задаётся раскрытие.',
  },
  {
    id: 'json-viewer-limits',
    title: 'A base64 image and five thousand items',
    description: 'Два крайних случая в одном значении: **один** строковый лист на сотни тысяч символов и массив на пять тысяч узлов. Первый не берёт ни свёртка, ни виртуализация — узел там один, поэтому его режет `maxStringLength`; второй режет `maxArrayItems` и виртуализация.',
    status: 'ready',
    previewKey: 'gr-json-viewer-limits',
    note: 'Копирование при этом отдаёт значение целиком: обрезка принадлежит показу, и вставить её обратно нельзя.',
  },
]
