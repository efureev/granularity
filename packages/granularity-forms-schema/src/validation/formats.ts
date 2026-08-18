import type { GrSchemaFormat } from '../model'

/**
 * Форматы, которые ядро не знает.
 *
 * `GrFormRule.type` понимает ровно `email` и `url`. Всё остальное — `uuid`,
 * `ipv4`, `hostname`, время — выражается регуляркой; сообщение при этом ставим
 * своё, потому что дефолтное «неверный формат» не подсказывает, чего ждут.
 *
 * Источник хранится строкой и компилируется на месте: `RegExp` с флагом `g`
 * двигает `lastIndex` между вызовами и на втором прогоне врёт, а правило живёт
 * в объекте и переживает не один прогон.
 */
export interface GrSchemaFormatSpec {
  pattern?: string
  patternFlags?: string
  /** Проверка, которую регуляркой не выразить (календарная валидность даты). */
  validate?: (value: unknown) => boolean
  /** Ключ сообщения в блоке пакета. */
  messageKey: string
  /** Английский текст на случай, когда i18n не подключён. */
  fallback: string
}

const ISO_DATE = '^\\d{4}-\\d{2}-\\d{2}$'
const ISO_TIME = '^\\d{2}:\\d{2}(:\\d{2}(\\.\\d+)?)?$'

/** Календарно существующая дата: `2026-02-31` формат проходит, а даты такой нет. */
function isRealDate(value: unknown): boolean {
  if (typeof value !== 'string') return true

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return true

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))

  return date.getUTCFullYear() === Number(year)
    && date.getUTCMonth() === Number(month) - 1
    && date.getUTCDate() === Number(day)
}

export const KNOWN_FORMATS: Partial<Record<GrSchemaFormat, GrSchemaFormatSpec>> = {
  'uuid': {
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    patternFlags: 'i',
    messageKey: 'grForms.format.uuid',
    fallback: 'Enter a valid UUID',
  },
  'ipv4': {
    pattern: '^((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)$',
    messageKey: 'grForms.format.ipv4',
    fallback: 'Enter a valid IPv4 address',
  },
  'ipv6': {
    pattern: '^(([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|::|([0-9a-f]{1,4}:){1,7}:|:(:[0-9a-f]{1,4}){1,7})$',
    patternFlags: 'i',
    messageKey: 'grForms.format.ipv6',
    fallback: 'Enter a valid IPv6 address',
  },
  'hostname': {
    pattern: '^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\\.)*[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$',
    patternFlags: 'i',
    messageKey: 'grForms.format.hostname',
    fallback: 'Enter a valid host name',
  },
  'date': {
    pattern: ISO_DATE,
    validate: isRealDate,
    messageKey: 'grForms.format.date',
    fallback: 'Enter a date as YYYY-MM-DD',
  },
  'date-time': {
    pattern: '^\\d{4}-\\d{2}-\\d{2}[T ]\\d{2}:\\d{2}',
    validate: isRealDate,
    messageKey: 'grForms.format.dateTime',
    fallback: 'Enter a date and time',
  },
  'time': {
    pattern: ISO_TIME,
    messageKey: 'grForms.format.time',
    fallback: 'Enter a time as HH:MM',
  },
  'color': {
    pattern: '^#([0-9a-f]{3}|[0-9a-f]{6})$',
    patternFlags: 'i',
    messageKey: 'grForms.format.color',
    fallback: 'Enter a colour as #RRGGBB',
  },
  'slug': {
    pattern: '^[a-z0-9]+(-[a-z0-9]+)*$',
    messageKey: 'grForms.format.slug',
    fallback: 'Use lowercase letters, digits and hyphens',
  },
  'json': {
    validate: (value) => {
      if (typeof value !== 'string' || value.trim() === '') return true
      try {
        JSON.parse(value)
        return true
      }
      catch {
        return false
      }
    },
    messageKey: 'grForms.format.json',
    fallback: 'Enter valid JSON',
  },
}

/**
 * Компилирует источник регулярки, снимая флаги, которые ломают повторный вызов.
 *
 * `g` и `y` двигают `lastIndex`, и правило, проверенное дважды, во второй раз
 * вернуло бы неверный вердикт — без единого признака поломки.
 */
export function toSafeRegExp(source: string, flags = ''): RegExp {
  return new RegExp(source, flags.replace(/[gy]/g, ''))
}
