/**
 * Ключ блока для кэша VNode.
 *
 * FNV-1a: не криптография, а дешёвая свёртка. Требование одно — разный текст
 * даёт разный ключ достаточно часто, чтобы столкновение не превращалось в
 * «блок не перерисовался». Длина исходника в ключе поверх хеша делает
 * столкновение практически недостижимым, а стоит один `+`.
 */
export function blockKey(raw: string): string {
  let hash = 0x811C9DC5
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return `${(hash >>> 0).toString(36)}-${raw.length.toString(36)}`
}
