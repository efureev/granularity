import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * Гейт адреса аугментации реестра `componentDefaults` — companion-половина
 * того же правила, что живёт в ядре (`src/__tests__/componentDefaults.test.ts`).
 *
 * Реестр объявлен в `@feugene/granularity/composables/useGrComponentConfig`, и
 * дополнять его можно только по этому адресу. Аугментация через баррель
 * (`components/GrConfigProvider`) типизируется, пока других аугментаций в
 * программе нет, и молча отваливается, как только в тот же граф типов приезжает
 * любой `defaults.d.ts` ядра — то есть в любом реальном приложении. Ошибки нет,
 * `componentDefaults` просто перестаёт знать про компонент.
 */

const componentsDir = resolve(process.cwd(), 'src/components')

const REGISTRY_MODULE = '@feugene/granularity/composables/useGrComponentConfig'

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
    expect(files.length).toBeGreaterThan(0)
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
})
