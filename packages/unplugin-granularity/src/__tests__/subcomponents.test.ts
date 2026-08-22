import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { GRANULARITY_SUBCOMPONENTS } from '../manifest'

/**
 * Гейт полноты карты подкомпонентов.
 *
 * Карта статическая — так резолвер остаётся детерминированным и без I/O. Цена
 * статики в том, что новый подкомпонент можно забыть внести: ошибки сборки это
 * не даст, а у потребителя рухнет только тогда, когда компонент реально
 * встретится в шаблоне. Здесь список сверяется с деревом исходников ядра.
 */
const require = createRequire(import.meta.url)

function coreComponentsDir(): string {
  const packageJson = require.resolve('@feugene/granularity/package.json')

  return join(dirname(packageJson), 'src', 'components')
}

/** Подкомпонент — `.vue` в каталоге чужого компонента, реэкспортированный его `index.ts`. */
function discoverSubcomponents(root: string): Record<string, string> {
  const found: Record<string, string> = {}

  for (const parent of readdirSync(root)) {
    const index = join(root, parent, 'index.ts')
    if (!existsSync(index)) continue

    const source = readFileSync(index, 'utf8')

    for (const file of readdirSync(join(root, parent))) {
      if (!file.endsWith('.vue')) continue

      const name = file.slice(0, -4)
      if (name === parent || !name.startsWith('Gr')) continue

      if (new RegExp(`\\bas\\s+${name}\\b`).test(source)) {
        found[name] = parent
      }
    }
  }

  return found
}

describe('карта подкомпонентов', () => {
  const root = coreComponentsDir()

  it('исходники ядра доступны — иначе гейт молча ничего не проверяет', () => {
    expect(existsSync(root), `нет каталога ${root}`).toBe(true)
  })

  it('совпадает с деревом исходников ядра', () => {
    expect(discoverSubcomponents(root)).toEqual({ ...GRANULARITY_SUBCOMPONENTS })
  })

  it('ни один подкомпонент не указывает сам на себя', () => {
    for (const [name, owner] of Object.entries(GRANULARITY_SUBCOMPONENTS)) {
      expect(owner, name).not.toBe(name)
    }
  })

  // Совпадения с деревом мало: путь, который строит резолвер, обязан быть
  // объявлен в `exports` — именно на этом сборка и падала.
  it('subpath родителя объявлен в exports ядра', () => {
    const manifest = JSON.parse(
      readFileSync(require.resolve('@feugene/granularity/package.json'), 'utf8'),
    ) as { exports: Record<string, unknown> }

    const missing = [...new Set(Object.values(GRANULARITY_SUBCOMPONENTS))]
      .filter(owner => !(`./components/${owner}` in manifest.exports))

    expect(missing).toEqual([])
  })
})
