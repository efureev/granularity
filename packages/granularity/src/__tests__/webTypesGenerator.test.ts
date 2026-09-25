import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  componentEntries,
  expandPropType,
// @ts-expect-error — скрипт сборки на .mjs, типов у него нет и не нужно.
} from '../../scripts/webTypes.mjs'

interface ComponentEntry {
  name: string
  owner: string
}

const pkgDir = resolve(__dirname, '../..')
const pkg = JSON.parse(readFileSync(resolve(pkgDir, 'package.json'), 'utf8')) as { exports: Record<string, unknown> }

/**
 * Экспортируемые подпути без SFC — это сервисы, а не компоненты: описывать в
 * `web-types.json` у них нечего. Список закрытый, чтобы потерянный `.vue` не
 * прятался среди них.
 */
const NOT_SFC: Record<string, string> = {
  GrDialogService: 'плагин и композабл `useDialogService`; разметку рисует `GrDialogServiceHost`',
}

describe('состав web-types', () => {
  const entries = componentEntries(pkg.exports) as ComponentEntry[]

  it('берётся из exports целиком, включая подкомпоненты', () => {
    const exported = Object.keys(pkg.exports).filter(path => /^\.\/components\/Gr[A-Za-z0-9]+$/.test(path))
    const names = entries.map(entry => entry.name)

    expect(names).toHaveLength(exported.length)
    expect(names).toContain('GrDropdownMenuItem')
    expect(entries.find(entry => entry.name === 'GrDropdownMenuItem')?.owner).toBe('GrDropdownMenu')
  })

  it('у каждого компонента находится SFC в директории владельца', () => {
    const lost = entries
      .filter(entry => !NOT_SFC[entry.name])
      .filter(entry => !existsSync(resolve(pkgDir, 'src/components', entry.owner, `${entry.name}.vue`)))
      .map(entry => entry.name)

    expect(lost).toEqual([])
  })

  it('исключения без SFC существуют и действительно без SFC', () => {
    for (const name of Object.keys(NOT_SFC)) {
      const entry = entries.find(candidate => candidate.name === name)

      expect(entry, `${name} пропал из exports — снимите исключение`).toBeDefined()
      expect(existsSync(resolve(pkgDir, 'src/components', entry!.owner, `${name}.vue`))).toBe(false)
    }
  })

  it('принимает строковую запись подпути и пропускает не-компоненты', () => {
    expect(componentEntries({
      './components/GrB': './dist/components/GrB/index.js',
      './components/GrA': { types: './dist/types/components/GrA/index.d.ts', import: './dist/components/GrA/index.js' },
      './composables/useTheme': { import: './dist/composables/useTheme.js' },
      './styles.css': './dist/styles.css',
    })).toEqual([
      { name: 'GrA', owner: 'GrA' },
      { name: 'GrB', owner: 'GrB' },
    ])
  })
})

describe('expandPropType', () => {
  const enumOf = (type: string, schema: unknown[]) => ({ kind: 'enum', type, schema })

  it('раскрывает алиас с литеральным перечнем', () => {
    const type = 'GrButtonVariant | undefined'

    expect(expandPropType(type, enumOf(type, ['undefined', '"primary"', '"ghost"'])))
      .toBe('"primary" | "ghost" | undefined')
  })

  it('сохраняет примитивы из перечня', () => {
    const type = 'GrSizeWithPx | undefined'

    expect(expandPropType(type, enumOf(type, ['undefined', 'number', '"xs"', '"sm"'])))
      .toBe('"xs" | "sm" | number | undefined')
  })

  it('не трогает тип, записанный без алиаса', () => {
    expect(expandPropType('boolean | undefined', enumOf('boolean | undefined', ['undefined', 'false', 'true'])))
      .toBe('boolean | undefined')
    expect(expandPropType('number | "auto" | undefined', enumOf('number | "auto" | undefined', ['undefined', 'number', '"auto"'])))
      .toBe('number | "auto" | undefined')
  })

  it('не раскрывает перечень с объектом, дженериком или функцией', () => {
    const type = 'string | Component | undefined'

    expect(expandPropType(type, enumOf(type, ['undefined', 'string', { kind: 'object', type: 'ComponentOptions' }]))).toBe(type)
    expect(expandPropType('GrValue<TValue>', enumOf('GrValue<TValue>', ['TValue']))).toBe('GrValue<TValue>')
  })

  it('без схемы-перечня возвращает тип как есть', () => {
    expect(expandPropType('GrColumns', { kind: 'object', type: 'GrColumns' })).toBe('GrColumns')
    expect(expandPropType('GrColumns', undefined)).toBe('GrColumns')
  })
})
