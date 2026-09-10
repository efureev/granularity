import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'

import { createMarkedEngine, markedEngine } from '../../../markdown/engine/marked'
import GrMarkdown from '../GrMarkdown.vue'

const mountMd = (props: Record<string, unknown>) => mount(GrMarkdown, { props })
function blocksOf(wrapper: { element: Element }) {
  return [...(wrapper.element as HTMLElement).querySelectorAll('[data-gr-markdown-block]')]
}

describe('GrMarkdown: разметка', () => {
  it('рисует основные узлы', () => {
    const html = mountMd({ source: '# Заголовок\n\nАбзац.\n\n- пункт\n\n| a |\n| - |\n| 1 |\n\n---\n' }).html()

    expect(html).toContain('<h1')
    expect(html).toContain('<p>Абзац.</p>')
    expect(html).toContain('<ul')
    expect(html).toContain('<table')
    expect(html).toContain('<hr')
  })

  it('сдвигает уровни заголовков, не выходя за h6', () => {
    expect(mountMd({ source: '# Раз\n', headingOffset: 1 }).html()).toContain('<h2')
    expect(mountMd({ source: '###### Шесть\n', headingOffset: 3 }).html()).toContain('<h6')
  })

  it('якорь есть в DOM всегда — появляющийся по наведению с клавиатуры недостижим', () => {
    const anchor = mountMd({ source: '## Раздел\n' }).find('.gr-md-anchor')

    expect(anchor.exists()).toBe(true)
    expect(anchor.attributes('href')).toBe('#раздел')
    expect(anchor.attributes('aria-label')).toContain('Раздел')
  })

  it('idPrefix разводит два документа на странице', () => {
    expect(mountMd({ source: '## Раздел\n', idPrefix: 'a-' }).find('h2').attributes('id')).toBe('a-раздел')
  })

  it('anchors=false убирает якоря', () => {
    expect(mountMd({ source: '## Раздел\n', anchors: false }).find('.gr-md-anchor').exists()).toBe(false)
  })
})

describe('GrMarkdown: безопасность', () => {
  it('сырой HTML не становится разметкой', () => {
    const wrapper = mountMd({ source: '<script>alert(1)</script>\n' })

    expect((wrapper.element as HTMLElement).querySelector('script')).toBeNull()
    expect(wrapper.text()).toContain('<script>alert(1)</script>')
  })

  it('strip выбрасывает его вовсе', () => {
    expect(mountMd({ source: '<script>alert(1)</script>\n', html: 'strip' }).text()).not.toContain('alert')
  })

  it('ссылка с исполняемой схемой становится текстом, а не битой ссылкой', () => {
    const wrapper = mountMd({ source: '[жми](javascript:alert(1))\n' })

    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.text()).toContain('жми')
  })

  it('внешняя ссылка получает rel', () => {
    const link = mountMd({ source: '[сайт](https://example.com)\n' }).find('a')

    expect(link.attributes('rel')).toBe('nofollow noopener noreferrer')
    expect(link.attributes('href')).toBe('https://example.com')
  })

  it('внутренней ссылке rel не навязывается', () => {
    expect(mountMd({ source: '[раздел](/docs)\n' }).find('a').attributes('rel')).toBeUndefined()
  })
})

describe('GrMarkdown: доступность', () => {
  it('таблица рисуется GrTable ядра: скролл достижим с клавиатуры и назван', () => {
    const scroll = mountMd({ source: '| a |\n| - |\n| 1 |\n' }).find('[data-gr-table-scroll]')

    expect(scroll.attributes('tabindex')).toBe('0')
    expect(scroll.attributes('role')).toBe('region')
    expect(scroll.attributes('aria-label')).toBeTruthy()
  })

  it('выравнивание колонок GFM доезжает до ячеек', () => {
    const cells = mountMd({ source: '| a | b |\n| :- | --: |\n| 1 | 2 |\n' }).findAll('th')

    expect(cells[0]?.attributes('style')).toContain('left')
    expect(cells[1]?.attributes('style')).toContain('right')
  })

  it('блок кода — тоже прокручиваемая область с именем', () => {
    const pre = mountMd({ source: '```ts\nconst x = 1\n```\n' }).find('pre.gr-md-pre')

    expect(pre.attributes('tabindex')).toBe('0')
    expect(pre.attributes('aria-label')).toContain('ts')
  })

  it('ориентиром документ объявляется только с ariaLabel', () => {
    expect(mountMd({ source: 'Текст.\n' }).attributes('role')).toBeUndefined()
    expect(mountMd({ source: 'Текст.\n', ariaLabel: 'Описание' }).attributes('role')).toBe('region')
  })
})

describe('GrMarkdown: алерты, сноски, задачи', () => {
  it('алерт рисуется GrAlert ядра, а не своей копией его вида', () => {
    const alert = mountMd({ source: '> [!WARNING]\n> Осторожно.\n' }).find('[data-gr-alert]')

    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('Осторожно.')
  })

  it('подпись тона несёт смысл текстом, а не только цветом', () => {
    for (const [marker, label] of [['NOTE', 'Note'], ['WARNING', 'Warning'], ['CAUTION', 'Caution']] as const)
      expect(mountMd({ source: `> [!${marker}]\n> Текст.\n` }).text()).toContain(label)
  })

  it('живым регионом алерт не объявляется — это часть документа, а не оповещение', () => {
    // `role="alert"` прерывает чтение диктором. Сообщение внутри статьи такого
    // права не имеет, поэтому `live="off"`.
    const alert = mountMd({ source: '> [!CAUTION]\n> Осторожно.\n' }).find('[data-gr-alert]')

    expect(alert.attributes('role')).toBeUndefined()
  })

  it('сноски собираются в секцию с обратной ссылкой', () => {
    const wrapper = mountMd({ source: 'Текст[^a].\n\n[^a]: Пояснение.\n' })

    expect(wrapper.find('.gr-md-fn-ref a').attributes('href')).toBe('#fn-a')
    expect(wrapper.find('[role="doc-endnotes"]').exists()).toBe(true)
    expect(wrapper.find('[role="doc-backlink"]').attributes('href')).toBe('#fnref-a')
  })

  it('задача рисуется GrCheckbox ядра, а не своей копией его вида', () => {
    const box = mountMd({ source: '- [x] сделано\n' }).find('[role="checkbox"]')

    expect(box.exists()).toBe(true)
    expect(box.attributes('aria-checked')).toBe('true')
  })

  it('по умолчанию задача только для чтения, а не выключена', () => {
    // `disabled` дизайн-система гасит приглушённым тоном, и отметка теряет цвет.
    // Документ состояние показывает, а не запрещает, — поэтому `readonly`.
    const box = mountMd({ source: '- [ ] дело\n' }).find('[role="checkbox"]')

    expect(box.attributes('aria-readonly')).toBe('true')
    expect(box.attributes('aria-disabled')).toBeUndefined()
  })

  it('interactiveTasks эмитит офсет маркера в исходнике, а не номер пункта', async () => {
    const source = 'Вступление.\n\n- обычный пункт\n\n* [ ] дело\n'
    const wrapper = mountMd({ source, interactiveTasks: true })

    await wrapper.find('[role="checkbox"]').trigger('click')

    const [offset, checked] = wrapper.emitted('taskToggle')![0] as [number, boolean]
    expect(source.slice(offset, offset + 3)).toBe('[ ]')
    expect(checked).toBe(true)
  })
})

describe('GrMarkdown: стриминг', () => {
  const caret = () => h('span', { class: 'caret' }, '|')

  it('курсор встаёт внутрь последнего абзаца, а не отдельной строкой под ним', () => {
    const wrapper = mount(GrMarkdown, {
      props: { source: 'Первый.\n\nПоследний набирается', streaming: true },
      slots: { caret },
    })

    const paragraphs = (wrapper.element as HTMLElement).querySelectorAll('p')
    expect(paragraphs[1]?.querySelector('.caret')).not.toBeNull()
    expect(paragraphs[0]?.querySelector('.caret')).toBeNull()
  })

  it('без streaming курсора нет вовсе', () => {
    const wrapper = mount(GrMarkdown, { props: { source: 'Текст.' }, slots: { caret } })
    expect(wrapper.find('.caret').exists()).toBe(false)
  })

  it('пустой хвост не оставляет комментарий-заглушку в разметке', () => {
    expect(mountMd({ source: 'Абзац.\n' }).html()).toContain('<p>Абзац.</p>')
  })
})

describe('GrMarkdown: подмена рендерера', () => {
  it('components.code заменяет блок кода целиком', () => {
    const Stub = defineComponent({
      props: { code: { type: String, required: true }, language: { type: String, default: null } },
      setup: props => () => h('div', { class: 'stub' }, `${props.language}:${props.code}`),
    })
    const wrapper = mountMd({ source: '```ts\nconst x = 1\n```\n', components: { code: Stub } })

    expect(wrapper.find('.stub').text()).toBe('ts:const x = 1')
    expect(wrapper.find('.gr-md-code').exists()).toBe(false)
  })

  it('смена набора рендереров перерисовывает уже показанный документ', async () => {
    const Stub = defineComponent({ setup: () => () => h('div', { class: 'stub' }) })
    const wrapper = mountMd({ source: '```ts\nx\n```\n' })

    expect(wrapper.find('.gr-md-code').exists()).toBe(true)
    await wrapper.setProps({ components: { code: Stub } })
    expect(wrapper.find('.stub').exists()).toBe(true)
  })
})

describe('GrMarkdown: расширения движка', () => {
  const inlineMath = {
    name: 'inlineMath',
    level: 'inline' as const,
    start: (src: string) => src.indexOf('$'),
    tokenizer(src: string) {
      const match = /^\$([^$\n]+)\$/.exec(src)
      return match ? { type: 'inlineMath', raw: match[0], formula: match[1] } : undefined
    },
  }

  const engine = createMarkedEngine({ extensions: [inlineMath] })

  const Math = defineComponent({
    props: { formula: { type: String, default: '' } },
    setup: props => () => h('span', { class: 'math' }, `f(${props.formula})`),
  })

  it('компонент из components рисует чужой токен', () => {
    const wrapper = mountMd({
      source: 'Формула $E = mc^2$ дальше.\n',
      engine,
      components: { inlineMath: Math },
    })

    expect(wrapper.find('.math').text()).toBe('f(E = mc^2)')
  })

  it('без компонента исходник печатается текстом, а не теряется', () => {
    const wrapper = mountMd({ source: 'Формула $E = mc^2$ дальше.\n', engine })

    expect(wrapper.find('.math').exists()).toBe(false)
    expect(wrapper.text()).toContain('$E = mc^2$')
  })
})

describe('GrMarkdown: состояния', () => {
  it('пустой источник по умолчанию не рисует ничего', () => {
    expect(mountMd({ source: '' }).text()).toBe('')
  })

  it('слот empty показывается на пустом источнике', () => {
    const wrapper = mount(GrMarkdown, { props: { source: '' }, slots: { empty: () => h('span', 'Пусто') } })
    expect(wrapper.text()).toBe('Пусто')
  })

  it('упавший движок даёт эмит, а не белое место', () => {
    const wrapper = mountMd({
      source: 'Текст.\n',
      engine: { lex: () => { throw new Error('движок сломан') } },
    })

    expect(wrapper.emitted('error')).toHaveLength(1)
  })

  it('parsed отдаёт оглавление и число блоков', () => {
    const wrapper = mountMd({ source: '# Раз\n\nАбзац.\n' })
    const [headings, count] = wrapper.emitted('parsed')![0] as [unknown[], number]

    expect(headings).toEqual([{ id: 'раз', level: 1, text: 'Раз' }])
    expect(count).toBe(2)
  })

  it('expose отдаёт заголовки и текст без разметки', () => {
    const wrapper = mountMd({ source: '# Раз\n\nАбзац **с разметкой**.\n' })

    expect((wrapper.vm as unknown as { plainText: () => string }).plainText()).toBe('Раз\n\nАбзац с разметкой.')
  })
})

/**
 * Гейты на механизм.
 *
 * Свойства ниже на экране не видны: документ выглядит одинаково и с
 * работающим кэшем, и без него. Ровно этот класс дефектов — «разметка валидна,
 * тесты зелёные, поведения нет» — стоил `granularity-code` трёх правок после
 * выпуска, и закрывается он проверкой самого механизма.
 */
describe('GrMarkdown: механизм перерисовки', () => {
  it('правка одного абзаца не трогает DOM остальных блоков', async () => {
    const wrapper = mountMd({ source: 'Первый.\n\nВторой.\n\nТретий.\n' })
    const before = blocksOf(wrapper)

    await wrapper.setProps({ source: 'Первый.\n\nВторой изменён.\n\nТретий.\n' })
    const after = blocksOf(wrapper)

    expect(after[0]).toBe(before[0])
    expect(after[2]).toBe(before[2])
    expect(after[1]).not.toBe(before[1])
  })

  it('вставка блока в начало не пересоздаёт то, что ниже', async () => {
    const wrapper = mountMd({ source: 'Первый.\n\nВторой.\n\nТретий.\n' })
    const before = blocksOf(wrapper)

    await wrapper.setProps({ source: 'Новый.\n\nПервый.\n\nВторой.\n\nТретий.\n' })
    const after = blocksOf(wrapper)

    expect(after).toHaveLength(before.length + 1)
    expect(after.slice(1)).toEqual(before)
  })

  it('лексер зовётся один раз на изменение источника', async () => {
    const lex = vi.fn(markedEngine.lex)
    const wrapper = mountMd({ source: 'Первый.\n', engine: { lex } })

    await wrapper.setProps({ source: 'Первый. Дописано.\n' })
    await nextTick()

    expect(lex).toHaveBeenCalledTimes(2)
  })

  it('каждый блок несёт подсказку о своей высоте — иначе полоса прокрутки дёргается', () => {
    const root = mountMd({ source: 'Первый.\n\n```\nодин\nдва\nтри\n```\n' }).element as HTMLElement
    const block = root.querySelector('[data-gr-markdown-block]') as HTMLElement

    expect(block.style.getPropertyValue('--gr-markdown-block-size')).toMatch(/rem$/)
  })

  it('смена контекста рендера сбрасывает кэш целиком', async () => {
    const wrapper = mountMd({ source: '## Раздел\n' })
    expect(wrapper.find('h2').exists()).toBe(true)

    await wrapper.setProps({ headingOffset: 2 })
    expect(wrapper.find('h4').exists()).toBe(true)
  })
})
