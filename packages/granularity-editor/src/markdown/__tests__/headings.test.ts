import { describe, expect, it } from 'vitest'

import { parseMarkdown } from '../document'
import { createSlugRegistry, markdownHeadings, slugify } from '../headings'

describe('слаги заголовков', () => {
  it('переводит текст в якорь', () => {
    expect(slugify('Как это работает')).toBe('как-это-работает')
    expect(slugify('Getting Started')).toBe('getting-started')
    expect(slugify('  Пробелы   по   краям  ')).toBe('пробелы-по-краям')
  })

  it('выбрасывает пунктуацию, но не буквы и цифры любого алфавита', () => {
    expect(slugify('API v2.1 — что нового?')).toBe('api-v21-что-нового')
    expect(slugify('C++ и C#')).toBe('c-и-c')
  })

  it('заголовок без букв получает запасное имя, а не пустой id', () => {
    const unique = createSlugRegistry()
    expect(unique('!!!')).toBe('section')
    expect(unique('')).toBe('section-1')
  })

  it('одинаковые заголовки получают разные id — иначе якорь ведёт всегда на первый', () => {
    const unique = createSlugRegistry()
    expect(unique('Заметки')).toBe('заметки')
    expect(unique('Заметки')).toBe('заметки-1')
    expect(unique('Заметки')).toBe('заметки-2')
  })

  it('детерминирован: два разбора одного документа дают одни id', () => {
    const source = '# Один\n\n## Два\n\n## Два\n'
    expect(markdownHeadings(parseMarkdown(source))).toEqual(markdownHeadings(parseMarkdown(source)))
  })

  it('idPrefix разводит два документа на одной странице', () => {
    expect(markdownHeadings(parseMarkdown('# Раздел\n', { idPrefix: 'a-' }))[0]?.id).toBe('a-раздел')
    expect(markdownHeadings(parseMarkdown('# Раздел\n', { idPrefix: 'b-' }))[0]?.id).toBe('b-раздел')
  })

  it('оглавление отдаёт уровень и текст в форме GrScrollSpySection', () => {
    expect(markdownHeadings(parseMarkdown('# Раз\n\n### Два\n'))).toEqual([
      { id: 'раз', level: 1, text: 'Раз' },
      { id: 'два', level: 3, text: 'Два' },
    ])
  })

  it('разметка внутри заголовка в текст не попадает', () => {
    expect(markdownHeadings(parseMarkdown('# Уже **готово** и `code`\n'))[0]).toEqual({
      id: 'уже-готово-и-code',
      level: 1,
      text: 'Уже готово и code',
    })
  })
})
