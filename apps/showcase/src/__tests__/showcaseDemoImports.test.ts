import type { ComponentResolverObject } from 'unplugin-vue-components/types'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import { granularityAutoImportResolvers } from '../app/autoImportResolvers'

function collectVueFiles(directoryPath: string): string[] {
  const entries = readdirSync(directoryPath, { withFileTypes: true })

  return entries.flatMap((entry) => {
    const entryPath = join(directoryPath, entry.name)

    if (entry.isDirectory())
      return collectVueFiles(entryPath)

    if (!statSync(entryPath).isFile() || !entry.name.endsWith('.vue'))
      return []

    return [entryPath]
  })
}

/** Теги `Gr*` из шаблона — всё, что вне `<script>` и `<style>`. */
function collectTemplateComponents(source: string): Set<string> {
  const template = source
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  return new Set([...template.matchAll(/<(Gr[A-Z][A-Za-z0-9]*)\b/g)].map(match => match[1]))
}

/** Компоненты, импортированные из корня пакета экосистемы, а не из подпути. */
function collectRootComponentImports(source: string): string[] {
  const names: string[] = []

  for (const match of source.matchAll(/^import\s*\{([^}]*)\}\s*from\s*'@feugene\/granularity(?:-[a-z-]+)?'/gm)) {
    for (const specifier of match[1].split(',')) {
      const name = specifier.trim()
      if (/^Gr[A-Z]/.test(name))
        names.push(name)
    }
  }

  return names
}

const srcRoot = fileURLToPath(new URL('..', import.meta.url))
const vueFiles = collectVueFiles(srcRoot)
const componentResolver = granularityAutoImportResolvers()[0] as ComponentResolverObject
const resolve = componentResolver.resolve as (name: string) => { from: string } | undefined

describe('импорт компонентов в витрине', () => {
  /**
   * Компонент в шаблоне не импортируется руками: его подставляет авто-импорт
   * (`app/autoImportResolvers.ts`). Значит, каждый тег `Gr*` резолвер обязан
   * знать — иначе Vue отрендерит пустой элемент с предупреждением в консоли, а
   * сборка пройдёт.
   */
  it('каждый тег Gr* в шаблонах резолвится авто-импортом', () => {
    const unresolved = vueFiles.flatMap(filePath => [...collectTemplateComponents(readFileSync(filePath, 'utf8'))]
      .filter(name => !resolve(name))
      .map(name => `${relative(srcRoot, filePath)}: ${name}`))

    expect(unresolved).toEqual([])
  })

  /**
   * Корень пакета тянет все его компоненты, и granum отвергает такой импорт
   * ошибкой `ComponentRootImportError`. Тест называет файл раньше сборки.
   */
  it('компоненты не импортируются из корня пакета', () => {
    const rootImports = vueFiles.flatMap(filePath => collectRootComponentImports(readFileSync(filePath, 'utf8'))
      .map(name => `${relative(srcRoot, filePath)}: ${name}`))

    expect(rootImports).toEqual([])
  })
})
