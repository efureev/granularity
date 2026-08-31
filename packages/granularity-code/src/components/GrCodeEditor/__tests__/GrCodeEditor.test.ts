import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrCodeEditor from '../GrCodeEditor.vue'
import type { GrCodeIssue } from '../editorState'

/**
 * Редактор монтируется в jsdom вместе с настоящим CodeMirror: подменять его
 * заглушкой значило бы проверять заглушку. Всё, что требует раскладки
 * (положение каретки, прокрутка), сюда не входит — это область e2e.
 */
async function mountEditor(props: Record<string, unknown> = {}) {
  // Модуль CodeMirror компонент грузит динамическим `import()`, а это не
  // микрозадача — `flushPromises` её не дожидается. Первый импорт греет кэш
  // модулей, после чего внутренний `await import` разрешается микрозадачей.
  await import('../codemirror')

  const wrapper = mount(GrCodeEditor, { props: { modelValue: 'const a = 1', ...props }, attachTo: document.body })
  await flushPromises()

  return wrapper
}

/** `Tab` по редактируемому узлу: раскладку CodeMirror слушает именно он. */
function pressTab(wrapper: { get: (selector: string) => { element: Element } }): void {
  wrapper.get('.cm-content').element.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true }),
  )
}

describe('GrCodeEditor', () => {
  it('монтирует редактор и показывает текст', async () => {
    const wrapper = await mountEditor()

    expect(wrapper.text()).toContain('const a = 1')
  })

  it('правка в редакторе эмитит `update:modelValue`', async () => {
    const wrapper = await mountEditor()
    const view = (wrapper.vm as unknown as { getView: () => { dispatch: (spec: unknown) => void } }).getView()

    view.dispatch({ changes: { from: 0, to: 0, insert: 'x' } })
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['xconst a = 1'])
  })

  /**
   * Наивная обёртка пересоздаёт документ и сбрасывает выделение на каждом
   * раунд-трипе `v-model`. Проверяется именно это: выделение переживает правку
   * родителем.
   */
  it('входящее изменение не сбрасывает выделение', async () => {
    const wrapper = await mountEditor({ modelValue: 'aaa bbb ccc' })
    const view = (wrapper.vm as unknown as {
      getView: () => { dispatch: (spec: unknown) => void, state: { selection: { main: { from: number, to: number } } } }
    }).getView()

    view.dispatch({ selection: { anchor: 0, head: 3 } })
    await wrapper.setProps({ modelValue: 'aaa bbb ddd' })
    await flushPromises()

    expect(view.state.selection.main.from).toBe(0)
    expect(view.state.selection.main.to).toBe(3)
  })

  it('эхо-петля: изменение из редактора обратно не применяется', async () => {
    const wrapper = await mountEditor({ modelValue: 'a' })
    const view = (wrapper.vm as unknown as { getView: () => { dispatch: (spec: unknown) => void } }).getView()

    view.dispatch({ changes: { from: 1, to: 1, insert: 'b' } })
    await flushPromises()

    // Родитель возвращает то же значение — второй правки быть не должно.
    await wrapper.setProps({ modelValue: 'ab' })
    await flushPromises()

    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
  })

  it('`readonly` не пускает ввод', async () => {
    const wrapper = await mountEditor({ readonly: true })
    const view = (wrapper.vm as unknown as { getView: () => { state: { readOnly: boolean } } }).getView()

    expect(view.state.readOnly).toBe(true)
  })

  it('`disabled` тоже запирает ввод', async () => {
    const wrapper = await mountEditor({ disabled: true })
    const view = (wrapper.vm as unknown as { getView: () => { state: { readOnly: boolean } } }).getView()

    expect(view.state.readOnly).toBe(true)
  })

  it('`invalid` доезжает до разметки', async () => {
    const wrapper = await mountEditor({ invalid: true })

    expect(wrapper.get('[aria-invalid="true"]')).toBeTruthy()
  })

  describe('ловушка Tab', () => {
    /**
     * Редактор в форме, из которого нельзя выйти клавиатурой, — ловушка: до
     * кнопки «Сохранить» пользователь не доберётся.
     */
    it('по умолчанию подсказки про Esc нет — Tab уводит фокус', async () => {
      const wrapper = await mountEditor()

      expect(wrapper.text()).not.toMatch(/Escape|Esc/)
    })

    it('с `tabIndents` подсказка про Esc показана', async () => {
      const wrapper = await mountEditor({ tabIndents: true })

      expect(wrapper.text()).toMatch(/Escape|Esc/)
    })

    it('без `tabIndents` Tab документ не трогает', async () => {
      const wrapper = await mountEditor()

      pressTab(wrapper)
      await flushPromises()

      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    /**
     * Раскладка клавиш собиралась один раз при создании и жила вне
     * `Compartment`: подсказка про Esc на смену пропа отзывалась, а `Tab`
     * по-прежнему уводил фокус — интерфейс обещал то, чего не делал.
     */
    it('`tabIndents`, включённый на живом редакторе, меняет поведение Tab', async () => {
      const wrapper = await mountEditor()

      await wrapper.setProps({ tabIndents: true })
      await flushPromises()

      pressTab(wrapper)
      await flushPromises()

      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['  const a = 1'])
    })
  })

  describe('замечания', () => {
    const issue: GrCodeIssue = { from: 0, to: 5, severity: 'error', message: 'сломано' }

    it('синхронный `validate` показывает замечание и связывает его с полем', async () => {
      const wrapper = await mountEditor({ validate: () => [issue] })

      expect(wrapper.text()).toContain('сломано')

      const described = wrapper.get('[aria-describedby]').attributes('aria-describedby')
      const list = wrapper.get('ul')

      expect(described).toContain(list.attributes('id'))
    })

    it('без `validate` полосы замечаний нет', async () => {
      const wrapper = await mountEditor()

      expect(wrapper.find('ul').exists()).toBe(false)
    })

    it('асинхронный `validate` доезжает', async () => {
      const wrapper = await mountEditor({ validate: async () => [issue] })
      await flushPromises()

      expect(wrapper.text()).toContain('сломано')
    })

    /** Замечание за концом документа уронило бы построение декорации. */
    it('замечание за границей текста не роняет компонент', async () => {
      const wrapper = await mountEditor({
        modelValue: 'ab',
        validate: () => [{ from: 100, to: 200, severity: 'error' as const, message: 'далеко' }],
      })

      expect(wrapper.find('ul').exists()).toBe(false)
    })
  })

  describe('серверная разметка', () => {
    /**
     * До монтирования рисуется разметка блока. Проверяем её напрямую: в jsdom
     * редактор поднимается сразу, поэтому смотрим на неподключённый компонент.
     */
    it('без CodeMirror показывает код текстом, а не пустоту', () => {
      const wrapper = mount(GrCodeEditor, { props: { modelValue: '{"a": 1}', language: 'json' } })

      expect(wrapper.get('pre').text()).toContain('{"a": 1}')
    })
  })

  describe('expose', () => {
    it('`getView` отдаёт живой редактор', async () => {
      const wrapper = await mountEditor()
      const view = (wrapper.vm as unknown as { getView: () => unknown }).getView()

      expect(view).toBeTruthy()
    })

    it('`focus` не падает', async () => {
      const wrapper = await mountEditor()
      await (wrapper.vm as unknown as { focus: () => Promise<void> }).focus()

      expect(true).toBe(true)
    })
  })
})
