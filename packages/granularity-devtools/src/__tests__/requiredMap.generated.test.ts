import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

import { GR_REQUIRED_PROPS } from '../data/requiredMap.generated'

/**
 * Гейт актуальности карты — по образцу «Registry drift» в ядре.
 *
 * Карта генерируется из `web-types.json` ядра, и разъехаться она может молча:
 * компонент получает обязательный проп, карта остаётся прежней, и панель
 * перестаёт замечать ровно тот класс дефектов, ради которого заведена.
 */

const require = createRequire(import.meta.url)
const corePackageJson = require.resolve('@feugene/granularity/package.json')
const webTypesPath = fileURLToPath(new URL('./dist/web-types.json', pathToFileURL(corePackageJson)))

interface WebTypesComponent {
  name: string
  props?: { name: string, required?: boolean }[]
}

function requiredFromWebTypes(): Record<string, string[]> {
  const webTypes = JSON.parse(readFileSync(webTypesPath, 'utf8')) as {
    contributions?: { html?: { 'vue-components'?: WebTypesComponent[] } }
  }

  const components = webTypes.contributions?.html?.['vue-components'] ?? []
  return Object.fromEntries(
    components
      .map(component => [component.name, (component.props ?? []).filter(prop => prop.required).map(prop => prop.name)] as const)
      .filter(([, required]) => required.length > 0),
  )
}

describe('карта обязательных пропов не разъехалась с ядром', () => {
  it('состав компонентов совпадает', () => {
    expect(Object.keys(GR_REQUIRED_PROPS).sort()).toEqual(Object.keys(requiredFromWebTypes()).sort())
  })

  it('состав пропов совпадает покомпонентно', () => {
    const expected = requiredFromWebTypes()

    for (const [component, required] of Object.entries(expected))
      expect(GR_REQUIRED_PROPS[component]).toEqual(required)
  })
})
