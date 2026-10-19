import type { GrThemeData } from './types'

/**
 * Итоговые токены каждого режима готовых данных темы: цепочка `extends`,
 * затем свои. Ключи — без `--`, как в данных.
 */
export function resolveModes(theme: GrThemeData): Map<string, Record<string, string>> {
  const out = new Map<string, Record<string, string>>()

  const visit = (name: string, chain: string[]): Record<string, string> => {
    const known = out.get(name)
    if (known)
      return known
    if (chain.includes(name))
      throw new Error(`тема "${theme.id}": цикл режимов ${[...chain, name].join(' → ')}`)

    const mode = theme.modes[name]
    if (!mode)
      throw new Error(`тема "${theme.id}": нет режима "${name}"`)

    const tokens = { ...(mode.extends !== undefined ? visit(mode.extends, [...chain, name]) : {}), ...mode.tokens }
    out.set(name, tokens)
    return tokens
  }

  for (const name of Object.keys(theme.modes))
    visit(name, [])

  return out
}
