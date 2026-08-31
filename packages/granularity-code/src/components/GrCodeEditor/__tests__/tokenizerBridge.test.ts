import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { builtInLines } from '../../../highlight/builtIn'
import { classForRole } from '../../../highlight/fromLezer'
import GrCodeEditor from '../GrCodeEditor.vue'

const CONFIG = `{
  "retries": 3,
  "enabled": true,
  "name": "billing"
}`

async function mountEditor(props: Record<string, unknown>) {
  await import('../codemirror')

  const wrapper = mount(GrCodeEditor, { props, attachTo: document.body })
  await flushPromises()

  return wrapper
}

/** Пары «класс роли — текст» в порядке документа, как их видит читатель. */
function paintedTokens(html: Element): Array<[string, string]> {
  return [...html.querySelectorAll('.cm-content span[class*="gr-code-"]')]
    .map(node => [node.className, node.textContent ?? ''] as [string, string])
}

describe('мост встроенного разбора в декорации', () => {
  it('JSON без грамматики покрашен, а не оставлен текстом', async () => {
    const wrapper = await mountEditor({ modelValue: CONFIG, language: 'json' })
    const painted = paintedTokens(wrapper.element as Element)

    expect(painted.length).toBeGreaterThan(0)
    expect(painted).toContainEqual([classForRole('key'), '"retries"'])
    expect(painted).toContainEqual([classForRole('number'), '3'])
    expect(painted).toContainEqual([classForRole('literal'), 'true'])
    expect(painted).toContainEqual([classForRole('string'), '"billing"'])
  })

  /**
   * Тот же текст красится дважды: серверной разметкой до монтирования и
   * CodeMirror после. Разойдись источники — цвет менялся бы ровно в момент
   * гидрации, и заметить это можно было бы только глазом.
   */
  it('CodeMirror красит теми же ролями, что и серверная разметка', async () => {
    const wrapper = await mountEditor({ modelValue: CONFIG, language: 'json' })

    const expected = builtInLines(CONFIG, 'json')
      .flat()
      .filter(token => token.role !== 'plain')
      .map(token => [classForRole(token.role), token.text] as [string, string])

    expect(paintedTokens(wrapper.element as Element)).toEqual(expected)
  })

  it('язык без встроенного разбора красить нечем', async () => {
    const wrapper = await mountEditor({ modelValue: CONFIG, language: 'text' })

    expect(paintedTokens(wrapper.element as Element)).toEqual([])
  })

  /**
   * Грамматика красит сама. Поставь мост рядом — на одном тексте оказались бы
   * две подсветки, и роль зависела бы от порядка расширений.
   */
  it('при грамматике мост не ставится', async () => {
    const wrapper = await mountEditor({ modelValue: CONFIG, language: [] })

    expect(paintedTokens(wrapper.element as Element)).toEqual([])
  })

  it('смена языка на живом редакторе включает и выключает подсветку', async () => {
    const wrapper = await mountEditor({ modelValue: CONFIG, language: 'text' })

    expect(paintedTokens(wrapper.element as Element)).toEqual([])

    await wrapper.setProps({ language: 'json' })
    await flushPromises()

    expect(paintedTokens(wrapper.element as Element).length).toBeGreaterThan(0)
  })

  it('правка перекрашивает документ, а не оставляет прежние роли', async () => {
    const wrapper = await mountEditor({ modelValue: '{"a": 1}', language: 'json' })

    await wrapper.setProps({ modelValue: '{"a": "1"}' })
    await flushPromises()

    expect(paintedTokens(wrapper.element as Element)).toContainEqual([classForRole('string'), '"1"'])
    expect(paintedTokens(wrapper.element as Element)).not.toContainEqual([classForRole('number'), '1'])
  })
})

/**
 * Мост пересчитывается на каждую правку, поэтому важно не то, что он считает, а
 * сколько: разбор всего документа сделал бы цену нажатия клавиши зависящей от
 * размера файла. Проверяется поведение плагина напрямую — через компонент видно
 * только результат, а не число обращений.
 */
describe('цена пересчёта', () => {
  async function countingView(doc: string) {
    const { tokenizerExtension } = await import('../codemirror')
    const { EditorSelection, EditorState } = await import('@codemirror/state')
    const { EditorView } = await import('@codemirror/view')

    const seen: string[] = []
    const view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [tokenizerExtension((text) => {
          seen.push(text)
          return [{ text, role: 'plain' }]
        })],
      }),
      parent: document.body,
    })

    return { seen, view, EditorSelection }
  }

  it('движение каретки разбор не запускает', async () => {
    const { seen, view, EditorSelection } = await countingView('{"a": 1}\n{"b": 2}')

    seen.length = 0
    view.dispatch({ selection: EditorSelection.cursor(3) })

    expect(seen).toEqual([])

    view.destroy()
  })

  it('правка запускает разбор заново', async () => {
    const { seen, view } = await countingView('{"a": 1}')

    seen.length = 0
    view.dispatch({ changes: { from: 0, to: 0, insert: ' ' } })

    expect(seen.length).toBeGreaterThan(0)

    view.destroy()
  })

  /**
   * Ключевое: разбираются строки окна, а не документа. В jsdom раскладки нет и
   * окном оказывается весь текст, поэтому проверяется не число строк, а то, что
   * плагин спрашивает разбор **построчно** — только построчный запрос и можно
   * сузить до вьюпорта в браузере.
   */
  it('разбор запрашивается построчно, а не текстом целиком', async () => {
    const doc = '{"a": 1}\n{"b": 2}\n{"c": 3}'
    const { seen, view } = await countingView(doc)

    expect(seen).toEqual(doc.split('\n'))
    expect(seen.some(text => text.includes('\n'))).toBe(false)

    view.destroy()
  })
})
