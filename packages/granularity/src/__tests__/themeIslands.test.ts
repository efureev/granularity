import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { themeVarsByName } from './cssContrast'

/**
 * Остров темы внутри страницы другой темы.
 *
 * Светлая тема объявлялась только на `:root`, и поддерево
 * `GrConfigProvider theme="light"` внутри `<html data-theme="dark">` наследовало
 * тёмные роли: `bg-[var(--gr-bg)]` в нём считался `#0f172a`. Тёмный остров на
 * светлой странице работал, потому что тёмная тема с самого начала висела на
 * атрибуте. Теперь обе темы объявлены и на атрибуте, и на классе.
 *
 * jsdom считает каскад и наследование кастомных свойств, поэтому проверка идёт
 * по настоящим файлам тем, а не по их разбору.
 */
function css(path: string): string {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

const sheets = [
  css('src/styles/themes/light.css'),
  css('src/styles/themes/dark.css'),
  css('src/styles/tokens.css'),
  css('src/components/GrProgressBar/themes/light.css'),
  css('src/components/GrProgressBar/themes/dark.css'),
]

function mountPage(rootTheme: 'light' | 'dark', islandTheme: 'light' | 'dark') {
  const style = document.createElement('style')
  style.textContent = sheets.join('\n')
  document.head.append(style)

  if (rootTheme === 'dark')
    document.documentElement.setAttribute('data-theme', 'dark')

  document.body.innerHTML = `<div data-theme="${islandTheme}"><span data-inner></span></div>`

  return {
    island: document.querySelector<HTMLElement>(`[data-theme="${islandTheme}"]`)!,
    inner: document.querySelector<HTMLElement>('[data-inner]')!,
    cleanup: () => style.remove(),
  }
}

afterEach(() => {
  document.documentElement.removeAttribute('data-theme')
  document.body.innerHTML = ''
  document.head.querySelectorAll('style').forEach(node => node.remove())
})

const LIGHT_BG = themeVarsByName.light['--gr-bg']
const DARK_BG = themeVarsByName.dark['--gr-bg']

describe('остров темы', () => {
  it('светлый остров внутри тёмной страницы получает светлые роли', () => {
    const { inner } = mountPage('dark', 'light')

    expect(getComputedStyle(document.documentElement).getPropertyValue('--gr-bg').trim()).toBe(DARK_BG)
    expect(getComputedStyle(inner).getPropertyValue('--gr-bg').trim()).toBe(LIGHT_BG)
  })

  it('тёмный остров внутри светлой страницы получает тёмные роли', () => {
    const { inner } = mountPage('light', 'dark')

    expect(getComputedStyle(document.documentElement).getPropertyValue('--gr-bg').trim()).toBe(LIGHT_BG)
    expect(getComputedStyle(inner).getPropertyValue('--gr-bg').trim()).toBe(DARK_BG)
  })

  it('остров объявляет `color-scheme` своей темы — нативные контролы следуют за ним', () => {
    expect(css('src/styles/themes/light.css')).toMatch(/\[data-theme='light'\],\n\.light \{\n {2}color-scheme: light;/)
    expect(css('src/styles/themes/dark.css')).toMatch(/\.dark \{\n {2}color-scheme: dark;/)
  })

  // Значение `var()` в кастомном свойстве подставляется там, где свойство
  // объявлено: формулы и ссылки, объявленные только на `:root`, остров
  // унаследовал бы уже посчитанными от ролей страницы.
  it('производные формулы и токены компонентов пересчитываются на острове', () => {
    const { island } = mountPage('dark', 'light')
    const derivedBlock = css('src/styles/tokens.css').split('\n').slice(css('src/styles/tokens.css').split('\n').indexOf(':root,'))
    const derivedSelector = derivedBlock.slice(0, derivedBlock.findIndex(line => line.endsWith('{')) + 1).join(' ').replace(/\s*\{$/, '')

    expect(island.matches(derivedSelector)).toBe(true)
    expect(island.matches(':root, [data-theme=\'light\'], .light')).toBe(true)
    expect(css('src/components/GrProgressBar/themes/light.css')).toContain(':root,\n[data-theme=\'light\'],\n.light {')
  })

  it('фолбэк без `color-mix` объявлен на тех же селекторах, что и тема', () => {
    const light = css('src/styles/themes/light.css')
    const fallback = light.slice(light.indexOf('@supports not'))

    expect(fallback).toContain('  :root,\n  [data-theme=\'light\'],\n  .light {')
  })
})
