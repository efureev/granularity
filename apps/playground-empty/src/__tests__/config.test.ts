import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import { playgroundEmptyBase, playgroundEmptyVueChunkGroup } from '../../vite.config'

const playgroundEmptyPackage = JSON.parse(readFileSync(
  fileURLToPath(new URL('../../package.json', import.meta.url)),
  'utf8',
)) as {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const playgroundBase = readFileSync(
  fileURLToPath(new URL('../../../playground/vite.config.ts', import.meta.url)),
  'utf8',
).match(/base:\s*'([^']+)'/)?.[1]

describe('playground-empty config', () => {
  // Смысл стенда — нулевая отметка для замеров веса. Зависимость от библиотеки
  // сделала бы её ненулевой, поэтому инвариант проверяем по манифесту, а не по
  // импортам: чтобы что-то импортировать, зависимость всё равно придётся добавить.
  it('не зависит от библиотеки — иначе это уже не базовая отметка', () => {
    const dependencies = Object.keys(playgroundEmptyPackage.dependencies ?? {})

    expect(dependencies).toEqual(['vue'])
    expect(dependencies.some(name => name.startsWith('@feugene/'))).toBe(false)
  })

  it('выделяет vue в отдельный чанк — размер runtime виден отдельно от приложения', () => {
    expect(playgroundEmptyVueChunkGroup.name).toBe('vue')
    expect(playgroundEmptyVueChunkGroup.test.test('/repo/node_modules/vue/dist/vue.js')).toBe(true)
    expect(playgroundEmptyVueChunkGroup.test.test('/repo/src/App.vue')).toBe(false)
  })

  it('имеет собственный base, не пересекающийся с соседними стендами', () => {
    expect(playgroundEmptyBase).toBe('/playground-empty/')
    expect(playgroundBase).toBeDefined()
    expect(playgroundEmptyBase).not.toBe(playgroundBase)
  })
})
