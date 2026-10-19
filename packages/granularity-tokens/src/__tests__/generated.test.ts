import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { grDerivedTokens, grFoundationTokens, grRoleTokens, grThemeCatalog } from '../generated'
import { pairs, themes } from './themes'

const pkgDir = process.cwd()

/**
 * Гейт против ручной правки сгенерированного и против неполной темы.
 *
 * Сгенерированные файлы — TS-справочник, документ и CSS ядра — собираются из
 * реестра и данных тем; единственный способ узнать, что кто-то поправил их
 * напрямую (или поменял данные и забыл перегенерировать), — прогнать генератор
 * и сравнить. Без этого расхождение всплывёт только в браузере.
 */
describe('реестр и темы как данные', () => {
  it('сгенерированные файлы совпадают с реестром и темами', () => {
    expect(() => {
      execFileSync('node', ['scripts/generate.mjs', '--check'], { cwd: pkgDir, stdio: 'pipe' })
    }).not.toThrow()
  })

  it('имя токена принадлежит одному слою: примитив, роль или производное', () => {
    const seen = new Map<string, string>()
    const twice: string[] = []

    for (const [layer, tokens] of [['примитив', grFoundationTokens], ['роль', grRoleTokens], ['производное', grDerivedTokens]] as const) {
      for (const token of tokens) {
        const other = seen.get(token.name)
        if (other)
          twice.push(`${token.name}: ${other} и ${layer}`)
        seen.set(token.name, layer)
      }
    }

    expect(twice).toEqual([])
  })

  it.each(themes.map(theme => [theme.id, theme] as const))('%s: каждый примитив реестра задан в root', (_id, theme) => {
    const missing = grFoundationTokens.map(token => token.name.slice(2)).filter(name => theme.root[name] === undefined)

    expect(missing).toEqual([])
  })

  it.each(pairs.map(pair => [pair.label, pair] as const))('%s: каждая роль реестра задана, у каждого производного есть фолбэк', (_label, pair) => {
    const missing = grRoleTokens.map(token => token.name).filter(name => pair.vars[name] === undefined)
    const fallbacks = pair.theme.modes[pair.mode].fallbacks?.[0]?.tokens ?? {}
    const withoutFallback = grDerivedTokens.map(token => token.name.slice(2)).filter(name => fallbacks[name] === undefined)

    expect(missing).toEqual([])
    expect(withoutFallback).toEqual([])
  })

  it('формула производного в CSS — та же, что в справочнике', () => {
    const css = readFileSync(resolve(pkgDir, '../granularity/src/styles/tokens.css'), 'utf8')

    for (const token of grDerivedTokens)
      expect(css).toContain(`${token.name}: ${token.formula};`)
  })
})

describe('каталог тем', () => {
  const folders = readdirSync(resolve(pkgDir, 'themes'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort()

  it('каталог — ровно папки `themes/`', () => {
    expect(grThemeCatalog.map(entry => entry.id).sort()).toEqual(folders)
  })

  it.each(grThemeCatalog.map(entry => [entry.id, entry] as const))('%s: README со ссылкой на дизайн-систему темы', (id, entry) => {
    const readme = resolve(pkgDir, 'themes', id, 'README.md')

    expect(existsSync(readme), `нет themes/${id}/README.md`).toBe(true)
    expect(entry.docs, `${id}: docs в theme.json — абсолютный URL`).toMatch(/^https:\/\//)
    expect(readFileSync(readme, 'utf8')).toContain(entry.docs!)
  })

  it('README каталога перечисляет все темы', () => {
    const readme = readFileSync(resolve(pkgDir, 'themes/README.md'), 'utf8')

    for (const entry of grThemeCatalog)
      expect(readme, entry.id).toContain(`\`${entry.id}\``)
  })
})
