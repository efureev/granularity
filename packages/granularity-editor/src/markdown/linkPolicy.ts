/**
 * Политика ссылок: какой URL доживает до разметки.
 *
 * Проверка идёт **после** развёртывания сущностей и вычистки незначащих
 * символов, потому что наивный `startsWith('javascript:')` пропускает и
 * числовую сущность вместо первой буквы, и табуляцию внутри самой схемы —
 * оба варианта браузер исполнит.
 */

import { decodeEntities } from './entities'

export const GR_MARKDOWN_DEFAULT_PROTOCOLS = ['http', 'https', 'mailto', 'tel'] as const

/**
 * Символ, который браузер при разборе схемы не считает за символ.
 *
 * Перебором кодов, а не диапазоном в регулярке: диапазон пришлось бы писать
 * управляющими символами, и файл стал бы нечитаемым в ревью ровно там, где
 * читать его важнее всего.
 */
function isInsignificant(code: number): boolean {
  if (code <= 0x20)
    return true
  if (code >= 0x7F && code <= 0xA0)
    return true
  if (code >= 0x200B && code <= 0x200D)
    return true
  return code === 0xFEFF
}

function stripInsignificant(value: string): string {
  let out = ''
  for (const char of value) {
    if (!isInsignificant(char.codePointAt(0) ?? 0))
      out += char
  }
  return out
}

function schemeOf(value: string): string | null {
  const match = /^([a-z][a-z0-9+.-]*):/i.exec(value)
  return match?.[1]?.toLowerCase() ?? null
}

/**
 * Ссылка, которую можно отдать в разметку, либо `null`.
 *
 * `null` означает «показать текстом»: ссылка без адреса честнее ссылки,
 * ведущей в исполнение скрипта.
 */
export function safeUrl(
  raw: string | null | undefined,
  allowedProtocols: readonly string[] = GR_MARKDOWN_DEFAULT_PROTOCOLS,
): string | null {
  if (!raw)
    return null

  const probe = stripInsignificant(decodeEntities(raw))
  if (probe === '')
    return null

  const scheme = schemeOf(probe)
  // Относительный путь, якорь и протокол-относительная ссылка схемы не несут.
  if (scheme === null)
    return raw.trim()

  return allowedProtocols.includes(scheme) ? raw.trim() : null
}

/** Внешняя ссылка — та, что уводит с origin: ей нужны `rel` и, возможно, `target`. */
export function isExternalUrl(raw: string | null): boolean {
  if (!raw)
    return false
  if (raw.startsWith('//'))
    return true
  const scheme = schemeOf(stripInsignificant(decodeEntities(raw)))
  return scheme === 'http' || scheme === 'https'
}
