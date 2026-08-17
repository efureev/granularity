/**
 * Вид файла по MIME-типу.
 *
 * Тип решает **`mime`, а не расширение**: расширение врёт (`.dat` у выгрузки,
 * `.pdf` у переименованного архива), а бэкенд отдаёт настоящий тип — брать надо
 * его. От вида зависит единственное решение компонента: рисовать `<img>` или
 * иконку.
 */

export type GrFileKind =
  | 'image'
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'archive'
  /** Тип не опознан, пуст или это `application/octet-stream`. */
  | 'unknown'

/** Точные типы. Порядок не важен — совпадение полное. */
const EXACT: Record<string, GrFileKind> = {
  'application/pdf': 'pdf',
  'application/x-pdf': 'pdf',

  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.oasis.opendocument.text': 'document',
  'application/rtf': 'document',

  'application/vnd.ms-excel': 'spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'application/vnd.oasis.opendocument.spreadsheet': 'spreadsheet',
  'text/csv': 'spreadsheet',
  'text/tab-separated-values': 'spreadsheet',

  'application/zip': 'archive',
  'application/x-zip-compressed': 'archive',
  'application/x-rar-compressed': 'archive',
  'application/vnd.rar': 'archive',
  'application/x-7z-compressed': 'archive',
  'application/x-tar': 'archive',
  'application/gzip': 'archive',
  'application/x-gzip': 'archive',
}

/**
 * Приведение к сравнимому виду: тип приходит из БД и бывает с параметрами
 * (`text/plain; charset=utf-8`) и в любом регистре.
 */
function normalize(mime: string): string {
  return mime.split(';')[0].trim().toLowerCase()
}

export function fileKindOf(mime: string | null | undefined): GrFileKind {
  if (!mime) return 'unknown'

  const type = normalize(mime)
  if (!type) return 'unknown'

  // Картинка — единственный вид, который компонент рисует, а не подписывает.
  if (type.startsWith('image/')) return 'image'

  const exact = EXACT[type]
  if (exact) return exact

  // `text/csv` уже разобран выше: таблица важнее общего правила для текста.
  if (type.startsWith('text/')) return 'document'

  return 'unknown'
}

/** Картинку показываем, остальное — подписываем иконкой. */
export function isPreviewableKind(kind: GrFileKind): boolean {
  return kind === 'image'
}
