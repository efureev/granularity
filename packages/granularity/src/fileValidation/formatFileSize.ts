/** `t` из `useGranularityTranslations`: ключ → строка, иначе fallback. */
export type FileSizeTranslate = (key: string, fallback: string, params?: Record<string, unknown>) => string

export interface FormatFileSizeOptions {
  /** Перевод единиц (`gr.fileSize.*`). Без него — английские `B`, `KB`, `MB`, `GB`. */
  t?: FileSizeTranslate
  /** Локаль для числа: `1,5 МБ`, а не `1.5 МБ`. Без неё — `en`, чтобы сервер и клиент совпали. */
  locale?: string
}

const UNITS = [
  { key: 'gb', fallback: '{value} GB', factor: 1024 ** 3 },
  { key: 'mb', fallback: '{value} MB', factor: 1024 ** 2 },
  { key: 'kb', fallback: '{value} KB', factor: 1024 },
] as const

/**
 * Размер файла для человека: `10 MB`, `1.5 MB`, `500 KB`.
 *
 * Сообщения об ошибках показывают пределы, а предел в байтах (`10485760`) —
 * это язык разработчика. Единицы двоичные — те же, что у `maxFileSize({ mb })`:
 * `mb: 10` и выводится как «10 MB». Округление — до одного знака ниже десяти и
 * до целого выше: «1.5 MB», но «12 MB».
 */
export function formatFileSize(bytes: number, options: FormatFileSizeOptions = {}): string {
  const unit = UNITS.find(candidate => bytes >= candidate.factor)
  const format = new Intl.NumberFormat(options.locale ?? 'en', { maximumFractionDigits: 1 })

  if (!unit) {
    const value = format.format(Math.max(0, Math.round(bytes)))
    return options.t ? options.t('gr.fileSize.b', '{value} B', { value }) : `${value} B`
  }

  const raw = bytes / unit.factor
  const snapped = raw >= 10 ? Math.round(raw) : Math.round(raw * 10) / 10
  const value = format.format(snapped)

  return options.t
    ? options.t(`gr.fileSize.${unit.key}`, unit.fallback, { value })
    : unit.fallback.replace('{value}', value)
}
