import { relative } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { componentCodeFiles, parseRelativeImports, redundantSafelistEntries } from '../gates/safelist'

import { createFixturePackage } from './fixture'

let cleanup: (() => void) | undefined

afterEach(() => {
  cleanup?.()
  cleanup = undefined
})

function fixture(files: Record<string, string>): string {
  const created = createFixturePackage(files)
  cleanup = created.cleanup

  return `${created.dir}/src/components`
}

describe('parseRelativeImports', () => {
  it('находит статический, реэкспорт, динамический и голый импорт', () => {
    const source = [
      `import { a } from './a'`,
      `export { b } from '../shared/b'`,
      `const c = () => import('./c.vue')`,
      `import './d.css'`,
    ].join('\n')

    expect(parseRelativeImports(source).sort()).toEqual(['../shared/b', './a', './c.vue', './d.css'])
  })

  it('пропускает типовой импорт: он стирается на сборке и классов не приносит', () => {
    expect(parseRelativeImports(`import type { Size } from './sizes'`)).toEqual([])
    expect(parseRelativeImports(`import { type Size } from './sizes'`)).toEqual([])
  })

  it('не считает импорт пакета: чужой бандл экстрактор этого пакета не читает', () => {
    expect(parseRelativeImports(`import GrButton from '@feugene/granularity/components/GrButton'`)).toEqual([])
  })

  it('закомментированный импорт не считается', () => {
    expect(parseRelativeImports(`// import { a } from './a'`)).toEqual([])
  })
})

describe('componentCodeFiles', () => {
  it('идёт по импортам сквозь общие директории, но не в директорию соседа', () => {
    const dir = fixture({
      'src/components/GrA/GrA.vue': `<script setup lang="ts">\nimport { aClass } from './styles'\nimport { frame } from '../Frame/frameStyles'\nimport GrB from '../GrB/GrB.vue'\n</script>`,
      'src/components/GrA/styles.ts': `import { split } from '../../internal/tokens'\nexport const aClass = 'flex'`,
      'src/components/GrA/index.ts': `export * from './safelist'`,
      'src/components/GrA/safelist.ts': `export const grASafelist = ['flex']`,
      'src/components/Frame/frameStyles.ts': `export const frame = 'grid'`,
      'src/components/GrB/GrB.vue': `<template><div class="block" /></template>`,
      'src/internal/tokens.ts': `export const split = (v: string) => v.split(' ')`,
    })

    const files = componentCodeFiles(dir, 'GrA', ['GrA', 'GrB']).map(file => relative(dir, file)).sort()

    expect(files).toEqual(['../internal/tokens.ts', 'Frame/frameStyles.ts', 'GrA/GrA.vue', 'GrA/styles.ts'])
  })
})

describe('redundantSafelistEntries', () => {
  it('литерал кода делает запись лишней, собранный класс — нет', () => {
    const dir = fixture({
      'src/components/GrA/styles.ts': `export const base = 'flex items-center'\nexport const tone = (t: string) => \`bg-[var(--gr-\${t})]\`\n`,
    })

    const redundant = redundantSafelistEntries(
      ['flex', 'bg-[var(--gr-primary)]'],
      [`${dir}/GrA/styles.ts`],
      dir,
    )

    expect(redundant).toEqual(['flex (GrA/styles.ts)'])
  })

  it('одиночное слово без маркера утилиты классом не считается', () => {
    // `variant: 'outline'` — значение пропа, а не утилита `outline`.
    const dir = fixture({ 'src/components/GrA/a.ts': `export const variant = 'outline'\n` })

    expect(redundantSafelistEntries(['outline'], [`${dir}/GrA/a.ts`], dir)).toEqual([])
  })
})
