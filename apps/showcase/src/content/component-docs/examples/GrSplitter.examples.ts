import type { ShowcaseComponentExampleDoc } from '../types'

export const grSplitterExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'splitter-basic',
    title: 'Дерево и контент',
    description: 'Размер первой панели — доля контейнера в процентах: она переживает смену ширины окна и рендерится на сервере без замеров. Граница тянется мышью и ходит с клавиатуры.',
    status: 'ready',
    previewKey: 'gr-splitter-basic',
  },
  {
    id: 'splitter-nested',
    title: 'Три панели — это вложение',
    description: 'Сплиттер держит две панели и один разделитель; редактор с консолью под деревом собирается вложенным вертикальным сплиттером — ровно так, как это делают редакторы кода.',
    status: 'ready',
    previewKey: 'gr-splitter-nested',
  },
  {
    id: 'splitter-collapsible',
    title: 'Минимумы и сворачивание',
    description: '`min` и `minEnd` не дают задавить ни одну из панелей. `Enter` сворачивает первую и возвращает её к прежнему размеру, двойной клик сбрасывает границу к `defaultSize`.',
    status: 'ready',
    previewKey: 'gr-splitter-collapsible',
  },
]
