import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

import { granularityChartsComponentConfigs } from '../granular-provider/shared'

/**
 * Токен, чьё имя собирается в рантайме, статический скан не находит, и при
 * включённой обрезке (`pruneTokens` пресета) его объявление удаляется — молча:
 * сборка зелёная, `z-index` разрешается в `unset`, тултип уезжает под слой.
 *
 * У графиков источник один — `useFloating` ядра: рама передаёт ему имя слоя
 * параметром, а `var()` собирает `overlayStack.ts` ядра. Ни `var(--gr-z-tooltip)`,
 * ни `var(--gr-z-modal)` в исходниках пакета не встречаются.
 *
 * Зеркало гейта ядра (`granularity/src/__tests__/dynamicTokens.test.ts`).
 * Дублируется намеренно: разъехаться правилам мешает то, что оба падают на
 * одном и том же изменении композабла, а вынос в `test-kit` стоит дороже
 * сорока строк.
 */

const pkgDir = process.cwd()
const componentsDir = resolve(pkgDir, 'src/components')

/** Ветка `calc(var(--gr-z-modal) + N)` в `floatingLayerZIndex` ядра. */
const NESTED_IN_MODAL = 'gr-z-modal'

const CODE = new Set(['.ts', '.vue'])

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      if (entry !== '__tests__')
        sourceFiles(path, acc)
    }
    else if (CODE.has(extname(entry))) {
      acc.push(path)
    }
  }
  return acc
}

/** Исходники компонента ПЛЮС общей рамы его группы: рама и зовёт композабл. */
function sourceOf(component: string): string {
  const config = granularityChartsComponentConfigs[component as keyof typeof granularityChartsComponentConfigs]
  const dirs = [resolve(componentsDir, component)]
  if (config?.group)
    dirs.push(resolve(componentsDir, config.group, 'shared'))

  return dirs
    .flatMap((dir) => {
      try {
        return sourceFiles(dir)
      }
      catch {
        return []
      }
    })
    .map(file => readFileSync(file, 'utf8'))
    .join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '')
}

const components = Object.keys(granularityChartsComponentConfigs)

function declaredOf(component: string): string[] {
  const config = granularityChartsComponentConfigs[component as keyof typeof granularityChartsComponentConfigs]
  return [...(config?.dynamicTokens ?? [])]
}

describe('dynamicTokens: графики, чья рама зовёт useFloating', () => {
  const users = components.filter(name => /\buseFloating\(/.test(sourceOf(name)))

  it('такие компоненты есть — иначе гейт проверяет пустоту', () => {
    expect(users.length).toBeGreaterThan(0)
  })

  it.each(users)('%s объявляет свой слой и слой модалки', (component) => {
    const declared = declaredOf(component)
    const own = sourceOf(component).match(/zIndexVar:\s*'--([\w-]+)'/)?.[1]

    expect(own).toBeDefined()
    expect(declared).toContain(own)
    // График, открытый ВНУТРИ модалки, обязан показать тултип над ней.
    expect(declared).toContain(NESTED_IN_MODAL)
  })
})

describe('dynamicTokens: собственная сборка var()', () => {
  it('компонент, собирающий var() сам, объявляет хоть что-то', () => {
    const offenders = components.filter((name) => {
      const source = sourceOf(name)
      const assembles = source.includes('var(${') || /['"`]var\(['"`]\s*\+/.test(source)
      return assembles && declaredOf(name).length === 0
    })

    expect(offenders).toEqual([])
  })
})
