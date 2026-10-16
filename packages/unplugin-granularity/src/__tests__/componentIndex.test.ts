import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'

import { buildComponentIndex, componentsOfExports, discoverGranularityPackages } from '../componentIndex'

const root = mkdtempSync(join(tmpdir(), 'unplugin-granularity-'))

function writePackage(name: string, exports: Record<string, unknown>): void {
  const dir = join(root, 'node_modules', ...name.split('/'))
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, exports: { ...exports, './package.json': './package.json' } }))
}

writeFileSync(join(root, 'package.json'), JSON.stringify({
  dependencies: { '@feugene/granularity': '^1.0.0', 'vue': '^3.5.0' },
  devDependencies: { '@feugene/granularity-chrono': '^1.0.0', '@feugene/granum': '^2.0.0' },
  peerDependencies: { '@feugene/granularity-test-kit': '^1.0.0' },
}))
writePackage('@acme/one', {
  './components/GrCard': { import: './dist/components/GrCard/index.js' },
  './components/GrList': { import: './dist/components/GrList/index.js' },
  './components/GrListItem': { types: './dist/types/components/GrList/index.d.ts', import: './dist/components/GrList/index.js' },
})
writePackage('@acme/two', {
  './components/GrCard': './dist/components/GrCard/index.js',
  './components/GrChart': './dist/components/GrChart/index.js',
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe('componentsOfExports', () => {
  it('часть составного компонента ведёт в модуль родителя', () => {
    expect(componentsOfExports({
      './components/GrList': { import: './dist/components/GrList/index.js' },
      './components/GrListItem': { import: './dist/components/GrList/index.js' },
      './components/GrCard/styles.css': './dist/components/GrCard/styles.css',
      './directives/hotkey': './dist/directives/hotkey.js',
    })).toEqual(new Map([['GrList', 'GrList'], ['GrListItem', 'GrList']]))
  })
})

describe('discoverGranularityPackages', () => {
  it('берёт пакеты экосистемы из всех трёх секций, остальное не трогает', () => {
    expect(discoverGranularityPackages(root)).toEqual([
      '@feugene/granularity',
      '@feugene/granularity-chrono',
      '@feugene/granularity-test-kit',
    ])
  })

  it('без package.json — пусто', () => {
    expect(discoverGranularityPackages(join(root, 'nowhere'))).toEqual([])
  })
})

describe('buildComponentIndex', () => {
  const index = buildComponentIndex(['@acme/one', '@acme/two', '@acme/missing'], root)

  it('имя одного пакета резолвится, у части — владелец-родитель', () => {
    expect(index.components.get('GrListItem')).toEqual({ packageName: '@acme/one', owner: 'GrList' })
    expect(index.components.get('GrChart')).toEqual({ packageName: '@acme/two', owner: 'GrChart' })
  })

  it('имя двух пакетов неоднозначно и не резолвится', () => {
    expect(index.components.has('GrCard')).toBe(false)
    expect(index.ambiguous).toEqual(new Set(['GrCard']))
  })
})
