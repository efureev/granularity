/**
 * Развёртывание HTML-сущностей.
 *
 * Нужно потому, что дерево рисуется текстовыми узлами, а не строкой HTML:
 * `&amp;` в исходнике обязан доехать до экрана амперсандом, и без развёртывания
 * читатель увидел бы саму запись сущности. У `marked` этого шага нет — он
 * отдаёт HTML, где запись уже верна.
 *
 * Таблица намеренно короткая. Полная — это 2000+ имён и 29 КБ gzip в бандле
 * потребителя; здесь частотный набор плюс все числовые формы. Граница названа
 * в доке компонента: имя вне набора остаётся текстом, а не превращается в «?».
 */

const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: '\'',
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  times: '×',
  divide: '÷',
  deg: '°',
  plusmn: '±',
  middot: '·',
  bull: '•',
  dagger: '†',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  sect: '§',
  para: '¶',
  larr: '←',
  rarr: '→',
  uarr: '↑',
  darr: '↓',
  harr: '↔',
  ne: '≠',
  le: '≤',
  ge: '≥',
  infin: '∞',
  colon: ':',
  Tab: '\t',
  NewLine: '\n',
}

const ENTITY = /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);?/gi

/**
 * Один проход, а не до неподвижной точки.
 *
 * `&amp;#x6a;` — это буквальный текст `&#x6a;`. Повторное развёртывание
 * превратило бы его в `j` и тем самым создало бы схему `javascript:`, которой
 * в исходнике не было. Тот же вызов обслуживает и разбор ссылок, поэтому
 * свойство несущее, а не деталь.
 */
export function decodeEntities(value: string): string {
  if (!value.includes('&'))
    return value

  return value.replace(ENTITY, (whole, body: string) => {
    if (body[0] === '#') {
      const hex = body[1] === 'x' || body[1] === 'X'
      const code = hex ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10)
      if (!Number.isFinite(code) || code <= 0 || code > 0x10FFFF)
        return whole
      // Суррогаты в одиночку — не символ; `fromCodePoint` на них бросает.
      if (code >= 0xD800 && code <= 0xDFFF)
        return whole
      return String.fromCodePoint(code)
    }
    return NAMED[body] ?? whole
  })
}
