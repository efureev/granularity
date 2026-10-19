/** Русское согласование числа: `plural(4, ['версия', 'версии', 'версий'])` → «4 версии». */
export function plural(count: number, forms: [one: string, few: string, many: string]): string {
  const mod10 = count % 10
  const mod100 = count % 100
  const form = mod10 === 1 && mod100 !== 11
    ? forms[0]
    : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
      ? forms[1]
      : forms[2]
  return `${count} ${form}`
}
