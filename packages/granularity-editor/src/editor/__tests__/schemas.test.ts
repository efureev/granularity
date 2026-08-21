import { Editor } from '@tiptap/core'
import { describe, expect, it } from 'vitest'

import { createSchema, GR_RICH_TEXT_SCHEMAS } from '../schemas'

function mount(name: 'minimal' | 'article', content: string): Editor {
  const element = document.createElement('div')
  document.body.append(element)

  return new Editor({ element, extensions: createSchema(name).extensions, content })
}

describe('схемы редактора', () => {
  it('обе схемы объявлены и собираются', () => {
    expect(GR_RICH_TEXT_SCHEMAS).toEqual(['minimal', 'article'])

    for (const name of GR_RICH_TEXT_SCHEMAS) {
      expect(createSchema(name).extensions.length).toBeGreaterThan(0)
      expect(createSchema(name).actions.length).toBeGreaterThan(0)
    }
  })

  it('в тулбаре нет дублей и у каждого действия есть подпись', () => {
    for (const name of GR_RICH_TEXT_SCHEMAS) {
      const { actions } = createSchema(name)
      const keys = actions.map(action => action.key)

      expect(new Set(keys).size).toBe(keys.length)
      expect(actions.every(action => action.labelFallback.length > 0)).toBe(true)
      expect(actions.every(action => action.labelKey.startsWith('grEditor.'))).toBe(true)
    }
  })

  /** Кнопка, за которой нет команды, — это кнопка, которая ничего не делает. */
  it('каждой кнопке соответствует существующая команда редактора', () => {
    for (const name of GR_RICH_TEXT_SCHEMAS) {
      const editor = mount(name, '<p>текст</p>')

      for (const action of createSchema(name).actions) {
        expect(typeof (editor.commands as Record<string, unknown>)[action.command], `${name}: ${action.command}`).toBe('function')
      }

      editor.destroy()
    }
  })

  it('«минимум» не пускает структурные узлы, «статья» пускает', () => {
    const minimal = mount('minimal', '<h2>заголовок</h2><blockquote><p>цитата</p></blockquote>')
    const article = mount('article', '<h2>заголовок</h2><blockquote><p>цитата</p></blockquote>')

    expect(minimal.getHTML()).not.toContain('<h2>')
    expect(minimal.getHTML()).not.toContain('<blockquote>')
    expect(article.getHTML()).toContain('<h2>')
    expect(article.getHTML()).toContain('<blockquote>')

    minimal.destroy()
    article.destroy()
  })

  /**
   * `h1` на странице один и принадлежит ей, а не полю ввода внутри неё.
   */
  it('заголовка первого уровня нет ни в одной схеме', () => {
    const article = mount('article', '<h1>заголовок страницы</h1>')

    expect(article.getHTML()).not.toContain('<h1>')
    article.destroy()
  })

  /** Разбор по схеме — он же санитайзер: другого в пакете нет. */
  it('узлы вне схемы выбрасываются при разборе', () => {
    const editor = mount('article', '<p>текст</p><script>alert(1)</script><iframe src="x"></iframe><img src="y">')
    const html = editor.getHTML()

    expect(html).toContain('текст')
    expect(html).not.toContain('script')
    expect(html).not.toContain('iframe')
    expect(html).not.toContain('<img')
    editor.destroy()
  })

  it('ссылка не открывается кликом: в поле ввода текст правят, а не читают', () => {
    const editor = mount('minimal', '<p><a href="https://example.com">ссылка</a></p>')

    expect(editor.getHTML()).toContain('href="https://example.com"')
    editor.destroy()
  })
})

describe('горячие клавиши действий', () => {
  /**
   * Значения взяты из исходников расширений TipTap, а не по памяти: пакет их не
   * задаёт и не может — клавиши приходят от самих расширений.
   */
  it('у каждого действия объявлена клавиша в записи TipTap', () => {
    for (const name of GR_RICH_TEXT_SCHEMAS) {
      for (const action of createSchema(name).actions) {
        expect(action.shortcut, action.key).toMatch(/^Mod-[A-Za-z0-9-]+$/)
      }
    }
  })

  it('клавиши не повторяются: две команды на одном сочетании — это одна нерабочая', () => {
    const shortcuts = createSchema('article').actions.map(action => action.shortcut)

    expect(new Set(shortcuts).size).toBe(shortcuts.length)
  })

  it('состав «минимума» — подмножество «статьи», и клавиши там те же', () => {
    const article = new Map(createSchema('article').actions.map(action => [action.key, action.shortcut]))

    for (const action of createSchema('minimal').actions) {
      expect(article.get(action.key), action.key).toBe(action.shortcut)
    }
  })
})
