#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import process from 'node:process'

/**
 * Карта обязательных пропов ядра — из `dist/web-types.json`.
 *
 * Почему из артефакта сборки, а не из рантайма: production-сборка SFC стирает
 * `required` с объявления пропов, и в самом `dist` этой информации нет.
 * А `web-types.json` строится `vue-component-meta` по типам, где `required`
 * цел — это единственное место, где он переживает сборку.
 *
 * Целиком файл в браузер не едет: 450 КБ против единиц килобайт у карты.
 */

const require = createRequire(import.meta.url)
// Путь строится от `package.json`: самого `web-types.json` в `exports` ядра нет,
// и заводить его там незачем — файл нужен на сборке, а не потребителю.
const corePackageJson = require.resolve('@feugene/granularity/package.json', { paths: [process.cwd()] })
const webTypesPath = fileURLToPath(new URL('./dist/web-types.json', pathToFileURL(corePackageJson)))
const outPath = fileURLToPath(new URL('../src/data/requiredMap.generated.ts', import.meta.url))

const webTypes = JSON.parse(readFileSync(webTypesPath, 'utf8'))
const components = webTypes.contributions?.html?.['vue-components'] ?? []

const entries = components
  .map(component => [component.name, (component.props ?? []).filter(prop => prop.required).map(prop => prop.name)])
  .filter(([, required]) => required.length > 0)
  .sort(([left], [right]) => left.localeCompare(right))

const body = entries
  .map(([name, required]) => `  ${name}: [${required.map(prop => `'${prop}'`).join(', ')}],`)
  .join('\n')

const source = `/**
 * Обязательные пропы компонентов ядра.
 *
 * **Генерируется** \`yarn generate:required-map\` из \`dist/web-types.json\` ядра —
 * править руками бессмысленно, следующая генерация затрёт. Гейт актуальности —
 * \`src/__tests__/requiredMap.generated.test.ts\`.
 */
export const GR_REQUIRED_PROPS: Record<string, readonly string[]> = {
${body}
}
`

writeFileSync(outPath, source)
console.log(`[required-map] ${entries.length} компонентов с обязательными пропами → ${outPath}`)
