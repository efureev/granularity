import { resolve } from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { componentDirs, readSources, stripComments, tokenNamesIn } from '../sources'
import { createFixturePackage } from './fixture'

let dir: string
let cleanup: () => void

beforeAll(() => {
  ({ dir, cleanup } = createFixturePackage({
    'src/components/GrThing/GrThing.vue': '<template><div class="text-sm" /></template>',
    'src/components/GrThing/styles.css': '.gr-thing { color: var(--gr-fg); }',
    'src/components/GrThing/__tests__/GrThing.test.ts': 'const broken = "text-sm"',
    'src/components/GrThing/GrThing.spec.md': 'ignored extension',
    'src/components/notAComponent/index.ts': 'export const x = 1',
    'src/composables/useThing.ts': 'export const y = 2',
    'src/styles/tokens.css': ':root { --gr-radius-md: 8px; }',
    'src/index.ts': 'export * from \'./components/GrThing\'',
  }))
})

afterAll(() => cleanup())

describe('readSources', () => {
  it('обходит исходники рекурсивно и отдаёт пути от корня скана', () => {
    const paths = readSources({ dir: resolve(dir, 'src') }).map(file => file.path).sort()

    expect(paths).toEqual([
      'components/GrThing/GrThing.vue',
      'components/GrThing/styles.css',
      'components/notAComponent/index.ts',
      'composables/useThing.ts',
      'index.ts',
      'styles/tokens.css',
    ])
  })

  it('пропускает `__tests__` и файлы с `.test.`', () => {
    // Гейт, читающий собственные фикстуры, ловит в них свои же нарушения и
    // краснеет на здоровом пакете.
    const paths = readSources({ dir: resolve(dir, 'src') }).map(file => file.path)

    expect(paths.some(path => path.includes('__tests__'))).toBe(false)
    expect(paths.some(path => path.includes('.test.'))).toBe(false)
  })

  it('исключает сгенерированные директории только на верхнем уровне', () => {
    const paths = readSources({ dir: resolve(dir, 'src'), excludeTopDirs: ['styles'] }).map(file => file.path)

    expect(paths).not.toContain('styles/tokens.css')
    expect(paths).toContain('components/GrThing/styles.css')
  })

  it('на несуществующей директории отдаёт пустой список, а не падает', () => {
    expect(readSources({ dir: resolve(dir, 'src/nope') })).toEqual([])
  })
})

describe('componentDirs', () => {
  it('берёт только директории `Gr*`', () => {
    expect(componentDirs(resolve(dir, 'src/components'))).toEqual(['GrThing'])
  })

  it('на несуществующей директории отдаёт пустой список', () => {
    expect(componentDirs(resolve(dir, 'src/nope'))).toEqual([])
  })
})

describe('stripComments', () => {
  it('выбрасывает строки-комментарии всех трёх стилей', () => {
    const source = [
      '// rounded corners here',
      ' * rounded corners here',
      '/* rounded corners here',
      '<!-- rounded corners here -->',
      'class="rounded-md"',
    ].join('\n')

    expect(stripComments(source)).toBe('class="rounded-md"')
  })

  it('не трогает код, у которого комментарий в хвосте строки', () => {
    const source = 'class="rounded-md" // почему так'

    expect(stripComments(source)).toBe(source)
  })
})

describe('tokenNamesIn', () => {
  it('собирает имена токенов', () => {
    expect([...tokenNamesIn('color: var(--gr-fg); background: var(--gr-bg);')]).toEqual(['--gr-fg', '--gr-bg'])
  })

  it('отбрасывает групповую ссылку с хвостовым дефисом', () => {
    // `--gr-tree-*` в комментарии — не токен, а обозначение семейства.
    expect([...tokenNamesIn('см. --gr-tree-* и --gr-tree-row-py')]).toEqual(['--gr-tree-row-py'])
  })
})
