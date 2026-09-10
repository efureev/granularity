import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'

import { grMarkdownSafelist } from '../components/GrMarkdown/grMarkdownStyles'

/**
 * Гейт на механизм, а не на вид.
 *
 * Урок выпуска `granularity-code`: свойство, которое видно только на экране,
 * закрывается проверкой самого механизма. Здесь таких два — правило
 * `content-visibility` (без него длинный документ размечается целиком, при
 * валидной разметке и зелёных тестах) и класс, для которого никто не породил
 * CSS (тот же класс дефектов, что мёртвая подсветка редактора).
 */

function read(relative: string) {
  return readFileSync(resolve(process.cwd(), 'src/components/GrMarkdown', relative), 'utf8')
}

const styles = read('styles.css')
const sources = ['renderNodes.ts', 'GrMarkdownCode.vue', 'GrMarkdown.vue'].map(read).join('\n')

describe('контракт стилей GrMarkdown', () => {
  it('правило content-visibility на месте — на нём стоит весь длинный документ', () => {
    expect(styles).toMatch(/\.gr-md-block\s*\{[^}]*content-visibility:\s*auto/)
  })

  it('рядом стоит contain-intrinsic-size с `auto` — без него дёргается полоса прокрутки', () => {
    expect(styles).toMatch(/contain-intrinsic-size:\s*auto var\(--gr-markdown-block-size/)
  })

  it('печать разворачивает пропущенную раскладку — иначе на бумаге пустые страницы', () => {
    const print = /@media print\s*\{([\s\S]*?)\n\}/.exec(styles)?.[1] ?? ''
    expect(print).toContain('content-visibility: visible')
  })

  it('каждый класс gr-md-*, который рождает рендерер, имеет правило или лежит в safelist', () => {
    const produced = new Set([...sources.matchAll(/'(gr-md-[\w-]+)'/g)].map(m => m[1]!))
    const declared = new Set([...styles.matchAll(/\.(gr-md-[\w-]+)/g)].map(m => m[1]!))

    const dead = [...produced].filter(name => !declared.has(name) && !grMarkdownSafelist.includes(name))
    expect(dead, 'класс без правила мёртв: разметка валидна, тесты зелены, на экране ничего').toEqual([])
  })

  it('в исходниках компонента нет v-html — это обещание пакета, а не пожелание', () => {
    // Ищем употребление, а не слово: про отсутствие `v-html` в этих же файлах
    // написано в комментариях, и поиск по подстроке ловил бы их.
    expect(sources).not.toMatch(/v-html\s*=/)
    expect(sources).not.toMatch(/\.innerHTML\s*=/)
  })
})
