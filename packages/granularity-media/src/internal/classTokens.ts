/**
 * Разбор строки классов на токены для safelist.
 *
 * Своя копия двух строк, а не импорт из ядра: в его публичной поверхности
 * этого хелпера нет, и расширять её ради `split` дороже, чем повторить.
 */
export function splitClassTokens(value: string): string[] {
  return value.split(/\s+/).filter(Boolean)
}
