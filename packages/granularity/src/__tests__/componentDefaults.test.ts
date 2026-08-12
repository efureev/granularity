import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт адреса аугментации реестра `componentDefaults`.
 *
 * Реестр объявлен в `composables/useGrComponentConfig` — дополнять его можно
 * только там. Через реэкспорт (например `../GrConfigProvider/context`, который
 * тип лишь пробрасывает) слияние работает, пока аугментация в программе одна:
 * стоит появиться второй, дополняющей объявление напрямую, и первая молча
 * отваливается. Ошибки при этом нет — просто `componentDefaults` перестаёт
 * знать про компонент, а вместе с ним и `useGrComponentProp`.
 *
 * Ровно на это напоролся companion-пакет `@feugene/granularity-chrono`: его
 * компоненты выпадали из реестра, как только в ту же программу приезжал любой
 * `defaults.d.ts` ядра.
 */

const componentsDir = resolve(process.cwd(), 'src/components')

/** Единственный допустимый адрес — модуль, где реестр объявлен. */
const REGISTRY_MODULE = '../../composables/useGrComponentConfig'

const AUGMENTATION = /declare module '([^']+)'/g

function defaultsFiles(): { component: string, source: string }[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .map(entry => ({ component: entry.name, path: resolve(componentsDir, entry.name, 'defaults.ts') }))
    .filter(({ path }) => existsSync(path))
    .map(({ component, path }) => ({ component, source: readFileSync(path, 'utf8') }))
}

describe('реестр componentDefaults', () => {
  const files = defaultsFiles()

  it('в пакете есть компоненты с настраиваемыми пропами', () => {
    // Гейт на пустом списке зелен всегда — проверяем, что список не опустел.
    expect(files.length).toBeGreaterThan(10)
  })

  it.each(files.map(file => [file.component, file.source] as const))(
    '%s/defaults.ts дополняет реестр по месту объявления',
    (_component, source) => {
      const modules = [...source.matchAll(AUGMENTATION)].map(match => match[1])

      expect(modules, 'defaults.ts обязан объявлять аугментацию реестра').not.toHaveLength(0)
      for (const module of modules) {
        expect(module, `аугментация через реэкспорт: ${module}`).toBe(REGISTRY_MODULE)
      }
    },
  )

  it('реестр объявлен там, куда ссылаются аугментации', () => {
    const registry = readFileSync(resolve(process.cwd(), 'src/composables/useGrComponentConfig.ts'), 'utf8')

    expect(registry).toContain('export interface GrComponentDefaultsRegistry')
  })
})
