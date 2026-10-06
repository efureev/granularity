import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrCodeEditor from '../GrCodeEditor.vue'
import type { GrCodeIssue } from '../editorState'

/**
 * Замечания `validate` — в самом тексте, а не только списком под полем.
 *
 * Проп обещал «подчёркивание в месте и метку в жёлобе», а декорации строились
 * только для ролей подсветки: в редакторе с замечанием «140» не было подчёркнуто
 * ничего, и в жёлобе стояли одни номера строк.
 */
const doc = '{\n  "timeout": 140,\n  "mode": "rolout"\n}'

async function mountEditor(props: Record<string, unknown>) {
  await import('../codemirror')

  const wrapper = mount(GrCodeEditor, { props: { modelValue: doc, ...props }, attachTo: document.body })
  await flushPromises()

  return wrapper
}

const timeout: GrCodeIssue = { from: doc.indexOf('140'), to: doc.indexOf('140') + 3, severity: 'warning', message: 'Больше лимита' }
const mode: GrCodeIssue = { from: doc.indexOf('"rolout"'), to: doc.indexOf('"rolout"') + 8, severity: 'error', message: 'Неизвестный режим' }

function underlined(wrapper: Awaited<ReturnType<typeof mountEditor>>, severity: GrCodeIssue['severity']): string[] {
  return wrapper.findAll(`.cm-content .gr-code-issue-${severity}`).map(node => node.text())
}

function markerLines(wrapper: Awaited<ReturnType<typeof mountEditor>>): string[] {
  const gutter = wrapper.get('.gr-code-issue-gutter')

  return gutter.findAll('.cm-gutterElement').filter(node => node.find('.gr-code-issue-marker').exists() && node.find('.gr-code-issue-marker').attributes('title')).map(node => node.get('.gr-code-issue-marker').attributes('title')!)
}

describe('GrCodeEditor: замечания в тексте', () => {
  it('синхронный `validate`: подчёркнут ровно диапазон замечания, в тоне важности', async () => {
    const wrapper = await mountEditor({ validate: () => [timeout, mode] })

    expect(underlined(wrapper, 'warning').join('')).toBe('140')
    expect(underlined(wrapper, 'error').join('')).toBe('"rolout"')
    expect(wrapper.get('.cm-content .gr-code-issue-error').attributes('title')).toBe('Неизвестный режим')
    wrapper.unmount()
  })

  it('метка в жёлобе стоит на строке замечания', async () => {
    const wrapper = await mountEditor({ validate: () => [mode] })
    const marked = wrapper.get('.gr-code-issue-gutter').findAll('.cm-gutterElement').filter(node => node.find('.gr-code-issue-marker-error').exists())

    expect(marked).toHaveLength(1)
    expect(marked[0]!.get('.gr-code-issue-marker-error').attributes('title')).toBe('Неизвестный режим')

    // Жёлоб пропускает строки без метки отступом сверху: метка третьей строки
    // стоит ниже двух строк высотой как у номеров.
    const style = marked[0]!.attributes('style') ?? ''
    const height = Number(/height: (\d+)px/.exec(style)?.[1])
    const offset = Number(/margin-top: (\d+)px/.exec(style)?.[1] ?? 0)

    expect(offset / height).toBe(2)
    wrapper.unmount()
  })

  it('асинхронный `validate`: ответ доезжает и до подчёркивания', async () => {
    const wrapper = await mountEditor({ validate: async () => [mode] })
    await flushPromises()
    await flushPromises()

    expect(underlined(wrapper, 'error').join('')).toBe('"rolout"')
    expect(markerLines(wrapper)).toEqual(['Неизвестный режим'])
    wrapper.unmount()
  })

  it('точечное замечание расширяется до символа — иначе подчёркивать нечего', async () => {
    const at = doc.indexOf('140')
    const wrapper = await mountEditor({ validate: () => [{ from: at, to: at, severity: 'info', message: 'Точка' }] })

    expect(underlined(wrapper, 'info').join('')).toBe('1')
    wrapper.unmount()
  })

  it('пункт списка называет строку и столбец', async () => {
    const wrapper = await mountEditor({ validate: () => [mode] })

    expect(wrapper.get('ul li').text()).toBe('Line 3, column 11 — Error: Неизвестный режим')
    wrapper.unmount()
  })

  it('колонка меток держится и без замечаний, пока задан `validate`, и не ставится без него', async () => {
    const quiet = await mountEditor({ validate: () => [] })
    const none = await mountEditor({})

    expect(quiet.find('.gr-code-issue-gutter').exists()).toBe(true)
    expect(none.find('.gr-code-issue-gutter').exists()).toBe(false)
    quiet.unmount()
    none.unmount()
  })

  it('исправленный текст снимает подчёркивание', async () => {
    const wrapper = await mountEditor({ validate: (value: string) => (value.includes('rolout') ? [{ ...mode, to: value.indexOf('"rolout"') + 8, from: value.indexOf('"rolout"') }] : []) })

    await wrapper.setProps({ modelValue: doc.replace('rolout', 'rollout') })
    await flushPromises()

    expect(wrapper.findAll('.cm-content .gr-code-issue')).toHaveLength(0)
    wrapper.unmount()
  })
})
