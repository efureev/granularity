import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { componentThemeVars, THEME_MODES } from './themeCss'

/**
 * Полнота токенов компонентов по темам: каждый токен, который компонент
 * регистрирует как `kind: "theme"`, обязан получить значение в каждом режиме
 * каждой темы каталога — своим файлом или по цепочке granum (A-24: режим, его
 * `extends`, режим по умолчанию; тема, её `extends`).
 *
 * Обратное направление — «объявленное в `themes/` зарегистрировано как
 * `theme`» — держит `componentTokens` тест-кита. Без этого гейта новая тема
 * каталога без файлов компонента собиралась бы зелёной, а кнопка в ней
 * осталась бы без заливки: у `kind: "theme"` дефолта в `var()` нет.
 */
const componentsDir = resolve(process.cwd(), 'src/components')

interface RegistryEntry { name: string, kind: string }

function themeKindTokens(): Array<{ component: string, tokens: string[] }> {
  return readdirSync(componentsDir)
    .flatMap((component) => {
      let registry: { tokens: RegistryEntry[] }
      try {
        registry = JSON.parse(readFileSync(join(componentsDir, component, 'tokens.json'), 'utf8')) as { tokens: RegistryEntry[] }
      }
      catch {
        return []
      }
      const tokens = registry.tokens.filter(token => token.kind === 'theme').map(token => token.name)

      return tokens.length > 0 ? [{ component, tokens }] : []
    })
    .sort((a, b) => a.component.localeCompare(b.component))
}

describe('токены компонентов kind: theme — в каждой теме и режиме', () => {
  const owners = themeKindTokens()

  it('гейт не пуст', () => {
    expect(owners.length).toBeGreaterThan(5)
    expect(THEME_MODES.length).toBeGreaterThan(1)
  })

  it.each(THEME_MODES.map(context => context.key))('%s', (key) => {
    const missing = owners.flatMap(({ component, tokens }) => {
      const declared = componentThemeVars(component, key)

      return tokens.filter(token => !(token in declared)).map(token => `${component}: ${token}`)
    })

    expect(missing, missing.join('\n')).toEqual([])
  })
})
