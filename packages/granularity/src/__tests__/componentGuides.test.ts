import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  parseComponentGuide,
  stripRelativeLinks,
// @ts-expect-error — скрипт сборки на .mjs, типов у него нет и не нужно.
} from '../../scripts/componentGuides.mjs'

interface ComponentGuide {
  summary?: string
  when?: string
  instead?: string
  limits?: string
}

const docsDir = resolve(__dirname, '../../docs/components')

describe('parseComponentGuide', () => {
  const page = [
    '# GrX',
    '',
    'Первая строка назначения,',
    'вторая строка — в отличие от [`GrY`](./GrY.md).',
    '',
    'Второй абзац в summary не идёт.',
    '',
    '## Когда брать',
    '',
    '- **сценарий** — пояснение, см. [`sizes.md`](../sizes.md#шкала);',
    '',
    '```vue',
    '## не заголовок внутри примера',
    '```',
    '',
    '## Когда взять другое',
    '',
    '- другое → [`GrY`](./GrY.md), [спецификация](https://www.w3.org/WAI/ARIA/apg/).',
    '',
    '## Клавиатура',
    '',
    'Не входит в руководство.',
  ].join('\n')

  const guide = parseComponentGuide(page) as ComponentGuide

  it('summary — первый абзац под H1, склеенный в строку', () => {
    expect(guide.summary).toBe('Первая строка назначения, вторая строка — в отличие от `GrY`.')
  })

  it('секции берутся по заголовку, фенс внутри секции заголовком не считается', () => {
    expect(guide.when).toContain('сценарий')
    expect(guide.when).toContain('## не заголовок внутри примера')
    expect(guide.when).not.toContain('Не входит')
  })

  it('относительные ссылки снимаются до текста, внешние остаются', () => {
    expect(guide.when).toContain('см. `sizes.md`;')
    expect(guide.instead).toBe('- другое → `GrY`, [спецификация](https://www.w3.org/WAI/ARIA/apg/).')
  })

  it('отсутствующая секция — undefined, а не пустая строка', () => {
    expect(guide.limits).toBeUndefined()
  })
})

describe('stripRelativeLinks', () => {
  it('картинку с относительным путём убирает целиком', () => {
    expect(stripRelativeLinks('до ![схема](./x.png) после')).toBe('до  после')
  })
})

/**
 * Генератор роняет сборку на странице без назначения или без «Когда брать».
 * Форму страниц держит `componentDocs.test.ts`, но разбирает их своим кодом —
 * здесь проверяется, что и этот разбор находит обязательное на каждой странице.
 */
describe('каждая страница пакета даёт руководство', () => {
  for (const file of readdirSync(docsDir).filter(name => name.endsWith('.md'))) {
    it(file, () => {
      const guide = parseComponentGuide(readFileSync(resolve(docsDir, file), 'utf8')) as ComponentGuide

      expect(guide.summary, 'нет абзаца назначения').toBeTruthy()
      expect(guide.when, 'нет «Когда брать»').toBeTruthy()
      expect(guide.instead, 'нет «Когда взять другое»').toBeTruthy()
    })
  }
})
