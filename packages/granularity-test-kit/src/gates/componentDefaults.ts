import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

import { describe, expect, it } from 'vitest'

import { componentDirs } from '../sources'

const AUGMENTATION = /declare module '([^']+)'/g

export interface ComponentDefaultsGateOptions {
  /** Корень пакета; по умолчанию — cwd, из которого запущен vitest. */
  pkgDir?: string
  /**
   * Единственный допустимый адрес аугментации — модуль, где реестр объявлен.
   * У ядра это относительный путь (`../../composables/useGrComponentConfig`),
   * у спутника — публичный подпуть
   * (`@feugene/granularity/composables/useGrComponentConfig`).
   */
  registryModule: string
  /** Сколько компонентов с `defaults.ts` обязано быть в пакете. */
  minComponents?: number
  /**
   * Проверить, что реестр объявлен там, куда ссылаются аугментации, — это
   * имеет смысл только в пакете, который его и объявляет (в ядре).
   */
  registryDeclaration?: {
    /** Путь файла относительно корня пакета. */
    path: string
    /** Строка, по которой видно объявление. */
    contains: string
  }
}

/**
 * Гейт адреса аугментации реестра `componentDefaults`.
 *
 * Реестр объявлен в `composables/useGrComponentConfig` — дополнять его можно
 * только там. Через реэкспорт (например баррель `GrConfigProvider`, который тип
 * лишь пробрасывает) слияние работает, пока аугментация в программе одна: стоит
 * появиться второй, дополняющей объявление напрямую, и первая молча
 * отваливается. Ошибки при этом нет — просто `componentDefaults` перестаёт
 * знать про компонент, а вместе с ним и `useGrComponentProp`.
 *
 * Ровно на это напоролся `@feugene/granularity-chrono`: его компоненты выпадали
 * из реестра, как только в ту же программу приезжал любой `defaults.d.ts` ядра.
 */
export function defineComponentDefaultsGate(options: ComponentDefaultsGateOptions): void {
  const pkgDir = options.pkgDir ?? process.cwd()
  const componentsDir = resolve(pkgDir, 'src/components')

  const files = componentDirs(componentsDir)
    .map(component => ({ component, path: resolve(componentsDir, component, 'defaults.ts') }))
    .filter(({ path }) => existsSync(path))
    .map(({ component, path }) => ({ component, source: readFileSync(path, 'utf8') }))

  describe('реестр componentDefaults', () => {
    it('в пакете есть компоненты с настраиваемыми пропами', () => {
      // Гейт на пустом списке зелен всегда — проверяем, что список не опустел.
      expect(files.length).toBeGreaterThanOrEqual(options.minComponents ?? 1)
    })

    it.each(files.map(file => [file.component, file.source] as const))(
      '%s/defaults.ts дополняет реестр по месту объявления',
      (_component, source) => {
        const modules = [...source.matchAll(AUGMENTATION)].map(match => match[1])

        expect(modules, 'defaults.ts обязан объявлять аугментацию реестра').not.toHaveLength(0)
        for (const module of modules) {
          expect(module, `аугментация через реэкспорт: ${module}`).toBe(options.registryModule)
        }
      },
    )

    it.runIf(options.registryDeclaration !== undefined)('реестр объявлен там, куда ссылаются аугментации', () => {
      const declaration = options.registryDeclaration!
      const registry = readFileSync(resolve(pkgDir, declaration.path), 'utf8')

      expect(registry).toContain(declaration.contains)
    })
  })
}
