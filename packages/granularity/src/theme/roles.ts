import { grThemeTokens } from '../tokens/generated'
import { isHex } from './color'

/** Значения ролей темы: `--gr-bg` → `#041e2b`. */
export type GrThemeTokens = Record<string, string>

/** Роли, известные пакету, в порядке объявления. */
export function themeRoleNames(): string[] {
  return grThemeTokens.map(token => token.name)
}

/**
 * Значение роли, годное для арифметики.
 *
 * Роль вправе ссылаться на другую (`--gr-invalid-brd: var(--gr-danger)`) — такую
 * ссылку разворачиваем, иначе фолбэк и проверки считать не из чего. Всё, что не
 * разворачивается в hex (`rgb(… / .45)` у подложки, `var()` за пределы темы),
 * возвращается как `null`: посчитать нельзя, и выдумывать не надо.
 *
 * Цикл рвём с ошибкой: тема потребителя вправе ошибиться, и упасть надо с
 * именами ролей, а не переполнением стека.
 */
export function resolveRole(tokens: GrThemeTokens, name: string, seen: string[] = []): string | null {
  const value = tokens[name]
  if (value === undefined)
    return null
  if (isHex(value))
    return value

  const reference = value.trim().match(/^var\(\s*(--[\w-]+)\s*\)$/)
  if (!reference)
    return null

  if (seen.includes(name))
    throw new Error(`роль ${name} ссылается сама на себя: ${[...seen, name].join(' → ')}`)

  return resolveRole(tokens, reference[1], [...seen, name])
}
