import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Правило чтения `config.dependencies` — одно на все гейты.
 *
 * Читается текст `config.ts`, а не дескриптор: `defineGranularComponent`
 * подставляет `dependencies: []` там, где поля не было, и «не объявлено»
 * становится неотличимо от «объявлено пустым».
 *
 * Живёт в `scripts/`, потому что читают его с двух сторон: гейт от исходников
 * (`src/__tests__/componentGraph.ts`, TypeScript) и гейт от `dist`
 * (`check-entry-isolation.mjs`, Node). Разойдись эти разборы — гейты начали бы
 * спорить о том, что компонент объявил.
 */
export function readDeclaredDependencies(componentsDir, component) {
  const config = resolve(componentsDir, component, 'config.ts')

  if (!existsSync(config))
    return []

  const source = readFileSync(config, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')

  const block = /dependencies:\s*\[([^\]]*)\]/.exec(source)

  if (!block)
    return []

  return [...block[1].matchAll(/['"]([^'"]+)['"]/g)].map(match => match[1])
}
