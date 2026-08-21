import { CharacterCount } from '@tiptap/extensions'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrRichText from '../GrRichText.vue'

function mountEditor(props: Record<string, unknown> = {}) {
  return mount(GrRichText, { props, attachTo: document.body })
}

type Editor = ReturnType<typeof mountEditor>

/** Редактор поднимается в `onMounted` — до него в поле пусто. */
async function ready(_wrapper: Editor) {
  for (let i = 0; i < 3; i += 1) await nextTick()
}

function area(wrapper: Editor): HTMLElement {
  const root = wrapper.element as HTMLElement
  const element = root.querySelector('[contenteditable]')
  if (!element) throw new Error('нет области ввода')

  return element as HTMLElement
}

function actions(wrapper: Editor) {
  return wrapper.findAll('[data-gr-rich-text-action]')
}

function action(wrapper: Editor, key: string) {
  const element = wrapper.find(`[data-gr-rich-text-action][data-key="${key}"]`)
  if (!element.exists()) throw new Error(`нет кнопки ${key}`)

  return element
}

function lastModel(wrapper: Editor): unknown {
  return wrapper.emitted('update:modelValue')?.at(-1)?.[0]
}

/** Инстанс редактора наружу: тесту нужен курсор, а мышью его не поставить. */
function instanceOf(wrapper: Editor) {
  return (wrapper.vm as unknown as {
    editor: {
      commands: { selectAll: () => void }
      state: { selection: { empty: boolean } }
    }
  }).editor
}

/**
 * Координаты выделения в jsdom не считаются: `coordsAtPos` доходит до
 * `getClientRects`, которого у текстового узла тут нет. Подмена отвечает за
 * геометрию, а проверяется всё остальное — открытие, фокус, реакция на кнопку.
 */
function stubCoords(wrapper: Editor): void {
  const view = (instanceOf(wrapper) as unknown as {
    view: { coordsAtPos: (pos: number) => unknown }
  }).view

  view.coordsAtPos = () => ({ left: 10, right: 40, top: 20, bottom: 32 })
}

/** Панель поповера уезжает в портал — искать её в обёртке бесполезно. */
function bubblePanel(): HTMLElement | null {
  const bubble = document.body.querySelector('[data-gr-rich-text-bubble]')

  return (bubble?.closest('[data-gr-popover-panel]') as HTMLElement | null) ?? null
}

function bubbleButtons(): HTMLElement[] {
  return [...document.body.querySelectorAll<HTMLElement>('[data-gr-rich-text-bubble-action]')]
}

/** Выделить всё в поле с пузырьком и дождаться, пока он встанет у выделения. */
async function selectAllWithBubble(wrapper: Editor) {
  stubCoords(wrapper)
  area(wrapper).focus()
  instanceOf(wrapper).commands.selectAll()
  for (let i = 0; i < 3; i += 1) await nextTick()
}

/**
 * Выделить всё и нажать кнопку.
 *
 * Клик по кнопке при пустом выделении документ не меняет — марка только
 * запоминается для следующего ввода, — и события `update` не будет.
 */
async function applyToAll(wrapper: Editor, key: string) {
  instanceOf(wrapper).commands.selectAll()
  await nextTick()
  await action(wrapper, key).trigger('click')
  await nextTick()
}

describe('GrRichText — значение', () => {
  it('начальное значение приходит из модели', async () => {
    const wrapper = mountEditor({ modelValue: '<p>привет</p>' })
    await ready(wrapper)

    expect(area(wrapper).innerHTML).toContain('привет')
    wrapper.unmount()
  })

  it('правка уходит наружу строкой HTML', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>' })
    await ready(wrapper)

    await applyToAll(wrapper, 'bold')

    expect(String(lastModel(wrapper))).toContain('<strong>текст</strong>')
    wrapper.unmount()
  })

  it('`output="json"` меняет форму значения, а не поведение', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>', output: 'json' })
    await ready(wrapper)

    await applyToAll(wrapper, 'bold')

    expect(lastModel(wrapper)).toMatchObject({ type: 'doc' })
    wrapper.unmount()
  })

  it('смена значения снаружи пересобирает документ', async () => {
    const wrapper = mountEditor({ modelValue: '<p>первый</p>' })
    await ready(wrapper)

    await wrapper.setProps({ modelValue: '<p>второй</p>' })
    await nextTick()

    expect(area(wrapper).innerHTML).toContain('второй')
    expect(area(wrapper).innerHTML).not.toContain('первый')
    wrapper.unmount()
  })

  it('в форму уходит разметка строкой даже в режиме JSON', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>', output: 'json', name: 'body' })
    await ready(wrapper)

    const hidden = wrapper.find('input[type="hidden"]')

    expect(hidden.attributes('name')).toBe('body')
    expect(hidden.attributes('value')).toContain('текст')
    wrapper.unmount()
  })
})

describe('GrRichText — тулбар', () => {
  it('состав тулбара идёт за схемой', async () => {
    const minimal = mountEditor({ schema: 'minimal' })
    await ready(minimal)
    const article = mountEditor({ schema: 'article' })
    await ready(article)

    expect(actions(minimal).length).toBeLessThan(actions(article).length)
    expect(minimal.find('[data-key="heading2"]').exists()).toBe(false)
    expect(article.find('[data-key="heading2"]').exists()).toBe(true)

    minimal.unmount()
    article.unmount()
  })

  /** Подсветка без `aria-pressed` — состояние, которого нет для скринридера. */
  it('активная марка объявлена `aria-pressed`', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>' })
    await ready(wrapper)

    expect(action(wrapper, 'bold').attributes('aria-pressed')).toBe('false')

    await applyToAll(wrapper, 'bold')

    expect(action(wrapper, 'bold').attributes('aria-pressed')).toBe('true')
    expect(action(wrapper, 'italic').attributes('aria-pressed')).toBe('false')
    wrapper.unmount()
  })

  it('тулбар — одна остановка `Tab`: ровно один `tabindex="0"`', async () => {
    const wrapper = mountEditor({ schema: 'article' })
    await ready(wrapper)

    const tabbable = actions(wrapper).filter(button => button.attributes('tabindex') === '0')

    expect(tabbable).toHaveLength(1)
    wrapper.unmount()
  })

  it('стрелка переводит остановку на соседнюю кнопку', async () => {
    const wrapper = mountEditor({ schema: 'article' })
    await ready(wrapper)

    const toolbar = wrapper.find('[data-gr-rich-text-toolbar]')
    expect(toolbar.attributes('role')).toBe('toolbar')

    await toolbar.trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(actions(wrapper)[1]!.attributes('tabindex')).toBe('0')
    expect(actions(wrapper)[0]!.attributes('tabindex')).toBe('-1')
    wrapper.unmount()
  })

  it('`toolbar: false` убирает панель, оставляя поле', async () => {
    const wrapper = mountEditor({ toolbar: false })
    await ready(wrapper)

    expect(wrapper.find('[data-gr-rich-text-toolbar]').exists()).toBe(false)
    expect(area(wrapper)).toBeTruthy()
    wrapper.unmount()
  })
})

describe('GrRichText — доступность и форма', () => {
  it('область ввода объявлена многострочным полем', async () => {
    const wrapper = mountEditor({ ariaLabel: 'Описание' })
    await ready(wrapper)

    expect(area(wrapper).getAttribute('role')).toBe('textbox')
    expect(area(wrapper).getAttribute('aria-multiline')).toBe('true')
    expect(area(wrapper).getAttribute('aria-label')).toBe('Описание')
    expect(area(wrapper).getAttribute('id')).toBeTruthy()
    wrapper.unmount()
  })

  it('`invalid` и `required` объявлены на области ввода', async () => {
    const wrapper = mountEditor({ invalid: true, required: true })
    await ready(wrapper)

    expect(area(wrapper).getAttribute('aria-invalid')).toBe('true')
    expect(area(wrapper).getAttribute('aria-required')).toBe('true')
    wrapper.unmount()
  })

  /** Негативный класс: запрещённое состояние обязано не давать править. */
  it('`readonly` показывает значение, но не даёт править', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>', readonly: true })
    await ready(wrapper)

    expect(area(wrapper).getAttribute('contenteditable')).toBe('false')
    expect(area(wrapper).innerHTML).toContain('текст')

    await action(wrapper, 'bold').trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('`disabled` гасит и поле, и кнопки', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>', disabled: true })
    await ready(wrapper)

    expect(area(wrapper).getAttribute('contenteditable')).toBe('false')
    expect(action(wrapper, 'bold').attributes('disabled')).toBeDefined()

    await action(wrapper, 'bold').trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('снятый `readonly` возвращает правку', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>', readonly: true })
    await ready(wrapper)

    await wrapper.setProps({ readonly: false })
    await nextTick()

    expect(area(wrapper).getAttribute('contenteditable')).toBe('true')
    wrapper.unmount()
  })
})

describe('GrRichText — разбор по схеме', () => {
  /** Санитайзера в пакете нет намеренно: схема и есть санитайзер. */
  it('чужие узлы не доживают до модели', async () => {
    const wrapper = mountEditor({
      modelValue: '<p>текст</p><script>alert(1)</script><iframe src="x"></iframe>',
    })
    await ready(wrapper)

    expect(area(wrapper).innerHTML).not.toContain('script')
    expect(area(wrapper).innerHTML).not.toContain('iframe')
    expect(area(wrapper).innerHTML).toContain('текст')
    wrapper.unmount()
  })
})

describe('GrRichText — предупреждения разработки', () => {
  /**
   * `setContent` принимает и строку, и документ, поэтому чужая форма приезжает
   * молча — а первая правка меняет тип значения под потребителем.
   */
  it('форма модели, разошедшаяся с `output`, объявляется в консоли', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountEditor({ modelValue: { type: 'doc', content: [] }, output: 'html' })
    await ready(wrapper)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('output'))
    warn.mockRestore()
    wrapper.unmount()
  })

  it('совпадающая форма молчит', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountEditor({ modelValue: '<p>текст</p>', output: 'html' })
    await ready(wrapper)

    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
    wrapper.unmount()
  })
})

describe('GrRichText — иконки тулбара', () => {
  /**
   * Буква вместо иконки была нечитаемой: `B` — и «Bold», и «Bulleted list»,
   * `H` — оба заголовка, `C` — код в строке и блок кода. По такой панели нельзя
   * выбрать действие, не наводя курсор на каждую кнопку.
   */
  it('каждая кнопка рисует контур, а не букву', async () => {
    const wrapper = mountEditor({ schema: 'article' })
    await ready(wrapper)

    for (const button of actions(wrapper)) {
      expect(button.find('svg').exists(), button.attributes('data-key')).toBe(true)
      expect(button.findAll('svg path').length).toBeGreaterThan(0)
      expect(button.text().trim()).toBe('')
    }

    wrapper.unmount()
  })

  it('подпись остаётся именем кнопки и всплывающей подсказкой', async () => {
    const wrapper = mountEditor({ schema: 'article' })
    await ready(wrapper)

    const bold = action(wrapper, 'bold')

    expect(bold.attributes('aria-label')).toBe('Bold')
    expect(bold.attributes('title')).toBe('Bold')
    wrapper.unmount()
  })

  it('контуры у действий разные: одинаковые не различить на глаз', async () => {
    const wrapper = mountEditor({ schema: 'article' })
    await ready(wrapper)

    const shapes = actions(wrapper).map(button => button.findAll('svg path').map(p => p.attributes('d')).join('|'))

    expect(new Set(shapes).size).toBe(shapes.length)
    wrapper.unmount()
  })
})

describe('GrRichText — смена схемы и расширений на живом поле', () => {
  /**
   * Схема ProseMirror неизменяема: из неё выведены и документ, и команды.
   * Читай её только при монтировании — и смена `schema` двигала бы тулбар, не
   * трогая правил документа.
   */
  it('смена схемы пересобирает редактор и правила документа', async () => {
    const wrapper = mountEditor({ schema: 'article', modelValue: '<h2>Заголовок</h2><p>Текст</p>' })
    await ready(wrapper)

    expect(area(wrapper).innerHTML).toContain('<h2>')

    await wrapper.setProps({ schema: 'minimal' })
    await ready(wrapper)

    // Заголовка в «минимуме» нет — узел не пережил переноса, как и при вставке.
    expect(area(wrapper).innerHTML).not.toContain('<h2>')
    expect(area(wrapper).innerHTML).toContain('Заголовок')
    expect(area(wrapper).innerHTML).toContain('Текст')
    wrapper.unmount()
  })

  it('тулбар идёт за схемой', async () => {
    const wrapper = mountEditor({ schema: 'minimal' })
    await ready(wrapper)

    expect(wrapper.find('[data-key="heading2"]').exists()).toBe(false)

    await wrapper.setProps({ schema: 'article' })
    await ready(wrapper)

    expect(wrapper.find('[data-key="heading2"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('добавленное расширение включается без перемонтирования', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>' })
    await ready(wrapper)

    const before = (wrapper.vm as unknown as { editor: { storage: Record<string, unknown> } }).editor
    expect(before.storage.characterCount).toBeUndefined()

    await wrapper.setProps({ extensions: [CharacterCount] })
    await ready(wrapper)

    const after = (wrapper.vm as unknown as { editor: { storage: Record<string, unknown> } }).editor
    expect(after.storage.characterCount).toBeDefined()
    // Текст пережил пересборку.
    expect(area(wrapper).innerHTML).toContain('текст')
    wrapper.unmount()
  })
})

describe('GrRichText — пузырьковый тулбар', () => {
  it('встаёт у выделения с кнопками внутри', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>', toolbar: 'bubble' })
    await ready(wrapper)

    expect(bubblePanel()?.style.display).toBe('none')

    await selectAllWithBubble(wrapper)

    // Содержимое поповера живёт в слоте `content`: в слоте по умолчанию оно
    // не рисуется вовсе, и панель открывается пустой.
    expect(bubbleButtons().length).toBeGreaterThan(0)
    expect(bubblePanel()?.style.display).not.toBe('none')
    expect(bubbleButtons()[0]?.querySelector('svg')).not.toBeNull()

    wrapper.unmount()
  })

  it('не забирает фокус из текста', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>', toolbar: 'bubble' })
    await ready(wrapper)
    await selectAllWithBubble(wrapper)

    // Панель с автофокусом уводила бы фокус из поля, а уход фокуса гасит
    // пузырёк блюром — он закрывался в тот же кадр, в котором открылся.
    expect(document.activeElement).toBe(area(wrapper))
    expect(bubblePanel()?.style.display).not.toBe('none')

    wrapper.unmount()
  })

  it('кнопка не уводит фокус и применяет формат', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>', toolbar: 'bubble' })
    await ready(wrapper)
    await selectAllWithBubble(wrapper)

    const button = bubbleButtons().find(node => node.dataset.key === 'bold')
    if (!button) throw new Error('нет кнопки bold')

    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    button.dispatchEvent(mousedown)
    expect(mousedown.defaultPrevented).toBe(true)

    button.click()
    for (let i = 0; i < 3; i += 1) await nextTick()

    expect(String(lastModel(wrapper))).toContain('<strong>')
    expect(bubblePanel()?.style.display).not.toBe('none')

    wrapper.unmount()
  })

  it('Esc закрывает пузырёк, не трогая выделение', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>', toolbar: 'bubble' })
    await ready(wrapper)
    await selectAllWithBubble(wrapper)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    for (let i = 0; i < 3; i += 1) await nextTick()

    // Закрытие с той стороны обязано погасить якорь: иначе `open` возвращался
    // бы в `true` тем же вычислением, и Esc не делал бы ничего.
    expect(bubblePanel()?.style.display).toBe('none')
    expect(instanceOf(wrapper).state.selection.empty).toBe(false)

    wrapper.unmount()
  })

  it('в режиме панели не появляется', async () => {
    const wrapper = mountEditor({ modelValue: '<p>текст</p>', toolbar: true })
    await ready(wrapper)

    expect(bubblePanel()).toBeNull()
    wrapper.unmount()
  })
})
