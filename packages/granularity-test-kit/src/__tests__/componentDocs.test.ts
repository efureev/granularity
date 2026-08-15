import { describe, expect, it } from 'vitest'

import {
  leadParagraph,
  looksLikeApiReference,
  markdownTables,
  significantText,
  splitSections,
} from '../gates/componentDocs'

describe('splitSections', () => {
  it('делит страницу по H2', () => {
    const sections = splitSections('# GrX\n\nНазначение.\n\n## Когда брать\n\n- один\n\n## Границы\n\nнет\n')

    expect(sections.map(section => section.title)).toEqual(['Когда брать', 'Границы'])
    expect(sections[0]?.body).toContain('- один')
  })

  it('не принимает комментарий внутри блока кода за заголовок', () => {
    // Иначе `## заголовок` в примере markdown-разметки резал бы страницу
    // пополам, и секция ниже него теряла бы содержимое.
    const sections = splitSections('# GrX\n\nТекст.\n\n```markdown\n## Не заголовок\n```\n\n## Настоящий\n\nтело\n')

    expect(sections.map(section => section.title)).toEqual(['Настоящий'])
  })
})

describe('leadParagraph', () => {
  it('берёт первый абзац после H1', () => {
    expect(leadParagraph('# GrX\n\nОдна фраза\nи вторая.\n\n## Дальше\n')).toBe('Одна фраза и вторая.')
  })

  it('возвращает null у страницы-заготовки', () => {
    // Заготовка обычно начинается сразу с заголовка или примера: назначение
    // в ней просто не написано, и это ловится именно здесь.
    expect(leadParagraph('# GrX\n\n## Сразу заголовок\n')).toBeNull()
    expect(leadParagraph('# GrX\n\n```vue\n<GrX />\n```\n')).toBeNull()
  })
})

describe('markdownTables', () => {
  it('считает строки каждой таблицы отдельно', () => {
    const tables = markdownTables([
      '| Проп | Что делает |',
      '| --- | --- |',
      '| `a` | раз |',
      '| `b` | два |',
      '',
      '| Слот | Что заменяет |',
      '| --- | --- |',
      '| `x` | шапку |',
    ].join('\n'))

    expect(tables).toEqual([
      { header: ['проп', 'что делает'], rowCount: 2 },
      { header: ['слот', 'что заменяет'], rowCount: 1 },
    ])
  })
})

describe('looksLikeApiReference', () => {
  it('пропускает матрицу поведения', () => {
    // Разбор двух-трёх пропов таблицей — обычный приём страниц пакета.
    // Запрет касается дубля генератора, а не табличной формы.
    expect(looksLikeApiReference({ header: ['слот', 'что заменяет'], rowCount: 4 })).toBe(false)
    expect(looksLikeApiReference({ header: ['проп', 'что добавляет'], rowCount: 4 })).toBe(false)
    expect(looksLikeApiReference({ header: ['нужно', 'берите'], rowCount: 12 })).toBe(false)
  })

  it('ловит колонку типа', () => {
    expect(looksLikeApiReference({ header: ['проп', 'тип', 'по умолчанию'], rowCount: 2 })).toBe(true)
    expect(looksLikeApiReference({ header: ['prop', 'type'], rowCount: 1 })).toBe(true)
  })

  it('ловит перечень по числу строк', () => {
    expect(looksLikeApiReference({ header: ['событие', 'когда'], rowCount: 8 })).toBe(true)
  })
})

describe('significantText', () => {
  it('снимает разметку, оставляя текст ссылок', () => {
    expect(significantText('- **тезис** — [`GrY`](./GrY.md) и `код`')).toBe('тезис — GrY и код')
  })

  it('выбрасывает блоки кода', () => {
    expect(significantText('текст\n\n```vue\n<GrX many props here />\n```\n')).toBe('текст')
  })
})
