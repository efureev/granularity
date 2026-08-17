import type { ShowcaseComponentExampleDoc } from '../types'

export const grFilePreviewExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'file-preview-kinds',
    title: 'One row, six kinds of file',
    description: 'Тип решает `mime`, а не расширение. Картинка рисуется картинкой, остальное получает иконку вида: PDF, документ, таблица, архив. Пустой тип даёт заглушку, а не пустоту — «типа нет» это обычное состояние строки в БД.',
    status: 'ready',
    previewKey: 'gr-file-preview-kinds',
    note: '`<img>` на не-картинку рисует битую иконку. Ровно этот дефект и был у потребителя: контроллер отдавал варианты файла без фильтра по типу.',
  },
  {
    id: 'file-preview-viewer',
    title: 'Tile opens the viewer, and survives a dead link',
    description: 'Плитка эмитит `click` — просмотрщик открывает потребитель: набор плиток и просмотр набора это разные состояния страницы. Третья ссылка битая: превью деградирует в заглушку с другим значком — «изображение не открылось», а не «это файл».',
    status: 'ready',
    previewKey: 'gr-file-preview-viewer',
  },
  {
    id: 'file-preview-grid',
    title: 'A dozen tiles, each holding its place while it loads',
    description: 'Лента вложений к заявке: двенадцать плиток мелкой ступени. Пока картинка не доехала, место держит скелет — «ещё грузится» и «у файла нет превью» это разные сообщения, и пустой ячейкой их не различить.',
    status: 'ready',
    previewKey: 'gr-file-preview-grid',
    note: 'Картинка при этом остаётся в разметке и просто ждёт невидимой: убери её на время загрузки — браузер не начнёт качать, и состояние «грузится» не кончится никогда.',
  },
]
