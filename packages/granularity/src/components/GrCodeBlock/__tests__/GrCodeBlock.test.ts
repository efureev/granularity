import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/copy', () => ({
  default: defineComponent({ name: 'IconCopy', render: () => h('svg', { 'data-icon': 'copy' }) }),
}))
vi.mock('~icons/lucide/check', () => ({
  default: defineComponent({ name: 'IconCheck', render: () => h('svg', { 'data-icon': 'check' }) }),
}))

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrCodeBlock from '../GrCodeBlock.vue'
import { announced, resetGranularityDom } from '../../../testing'

const SAMPLE = { name: 'Alice', age: 30, ok: true }

/** Буфер в jsdom не реализован — ставим свой и отдаём шпион на `writeText`. */
function stubClipboard(impl: (text: string) => Promise<void> = () => Promise.resolve()) {
  const writeText = vi.fn(impl)
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  return writeText
}

function dropClipboard(): void {
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
}

afterEach(() => {
  dropClipboard()
  resetGranularityDom()
})

describe('GrCodeBlock', () => {
  it('сериализует объект и подсвечивает роли', () => {
    const wrapper = mount(GrCodeBlock, { props: { code: SAMPLE } })

    const text = wrapper.get('[data-gr-code-block-code]').text()
    expect(text).toContain('"name"')
    expect(text).toContain('"Alice"')

    const classes = wrapper.findAll('[data-gr-code-block-line] span').map(el => el.attributes('class') ?? '')
    expect(classes.some(cls => cls.includes('--gr-code-block-key'))).toBe(true)
    expect(classes.some(cls => cls.includes('--gr-code-block-string'))).toBe(true)
    expect(classes.some(cls => cls.includes('--gr-code-block-number'))).toBe(true)
    expect(classes.some(cls => cls.includes('--gr-code-block-literal'))).toBe(true)
  })

  it('строка проходит как есть и по строкам', () => {
    const wrapper = mount(GrCodeBlock, { props: { code: 'первая\nвторая', language: 'text' } })

    expect(wrapper.findAll('[data-gr-code-block-line]')).toHaveLength(2)
    expect(wrapper.get('[data-gr-code-block-code]').text()).toContain('первая')
  })

  // Данные приходят из БД: цикл там встречается, и уронить страницу компонент права не имеет.
  it('циклическая ссылка не роняет рендер', () => {
    const node: Record<string, unknown> = { id: 1 }
    node.self = node

    const wrapper = mount(GrCodeBlock, { props: { code: node } })

    expect(wrapper.get('[data-gr-code-block-code]').text()).toContain('[Circular]')
  })

  it('в language="text" разбора нет — токенов ролей не появляется', () => {
    const wrapper = mount(GrCodeBlock, { props: { code: '{"a": 1}', language: 'text' } })

    const classes = wrapper.findAll('[data-gr-code-block-line] span').map(el => el.attributes('class') ?? '')
    expect(classes.every(cls => !cls.includes('--gr-code-block-key'))).toBe(true)
  })
})

describe('GrCodeBlock — скроллер и клавиатура', () => {
  // Решение по конструкции, а не по замеру: мигающая остановка `Tab` на каждой
  // смене данных хуже, чем предсказуемая.
  it('без maxHeight и с переносом остановку Tab не занимает', () => {
    const wrapper = mount(GrCodeBlock, { props: { code: SAMPLE, wrap: true } })

    expect(wrapper.get('[data-gr-code-block-scroll]').attributes('tabindex')).toBeUndefined()
  })

  it.each([
    ['горизонтальный скролл (wrap выключен)', { wrap: false }],
    ['вертикальный скролл (задан maxHeight)', { wrap: true, maxHeight: '20rem' }],
  ])('%s делает блок таб-стопом', (_name, props) => {
    const wrapper = mount(GrCodeBlock, { props: { code: SAMPLE, ...props } })

    expect(wrapper.get('[data-gr-code-block-scroll]').attributes('tabindex')).toBe('0')
  })

  it('maxHeight числом уезжает в пиксели', () => {
    const wrapper = mount(GrCodeBlock, { props: { code: SAMPLE, maxHeight: 320 } })

    expect(wrapper.get('[data-gr-code-block-scroll]').attributes('style')).toContain('max-height: 320px')
  })

  // Безымянную область скринридер объявляет просто «регион».
  it('ariaLabel даёт role="region" и имя, без него роли нет', () => {
    const named = mount(GrCodeBlock, { props: { code: SAMPLE, ariaLabel: 'Ответ модели' } })
    expect(named.get('[data-gr-code-block-scroll]').attributes('role')).toBe('region')
    expect(named.get('[data-gr-code-block-scroll]').attributes('aria-label')).toBe('Ответ модели')

    const anonymous = mount(GrCodeBlock, { props: { code: SAMPLE } })
    expect(anonymous.get('[data-gr-code-block-scroll]').attributes('role')).toBeUndefined()
  })
})

describe('GrCodeBlock — копирование', () => {
  beforeEach(() => {
    dropClipboard()
  })

  // Инвариант ТЗ: молча не работающая кнопка хуже её отсутствия.
  it('без буфера кнопки нет вовсе', async () => {
    const wrapper = mount(GrCodeBlock, { props: { code: SAMPLE } })
    await nextTick()

    expect(wrapper.find('[data-gr-code-block-copy]').exists()).toBe(false)
  })

  it('с буфером кнопка появляется, copyable=false её убирает', async () => {
    stubClipboard()

    const shown = mount(GrCodeBlock, { props: { code: SAMPLE } })
    await nextTick()
    expect(shown.find('[data-gr-code-block-copy]').exists()).toBe(true)

    const hidden = mount(GrCodeBlock, { props: { code: SAMPLE, copyable: false } })
    await nextTick()
    expect(hidden.find('[data-gr-code-block-copy]').exists()).toBe(false)
  })

  // Главный инвариант: в буфер уходит исходный текст, а не отрисованный. Номера
  // строк — CSS-счётчик, и попасть туда они не могут по построению.
  it('копирует исходный текст, а не разметку с номерами строк', async () => {
    const writeText = stubClipboard()
    const wrapper = mount(GrCodeBlock, { props: { code: SAMPLE, lineNumbers: true } })
    await nextTick()

    await wrapper.get('[data-gr-code-block-copy]').trigger('click')

    const copiedText = writeText.mock.calls[0][0]
    expect(copiedText).toBe(JSON.stringify(SAMPLE, null, 2))
    expect(copiedText).not.toMatch(/^\s*1\s/)
  })

  it('эмитит copy и объявляет успех', async () => {
    stubClipboard()
    const wrapper = mount(GrCodeBlock, { props: { code: 'привет' } })
    await nextTick()

    await wrapper.get('[data-gr-code-block-copy]').trigger('click')
    await nextTick()

    expect(wrapper.emitted('copy')?.[0]).toEqual(['привет'])
    expect(await announced()).toBe('Code copied')
  })

  it('отказ буфера не эмитит и объявляет неудачу', async () => {
    stubClipboard(() => Promise.reject(new Error('denied')))
    const wrapper = mount(GrCodeBlock, { props: { code: 'привет' } })
    await nextTick()

    await wrapper.get('[data-gr-code-block-copy]').trigger('click')
    await nextTick()

    expect(wrapper.emitted('copy')).toBeUndefined()
    expect(await announced()).toBe('Could not copy code')
  })

  // Витринный прототип таймер не гасил; в пакете это утечка на каждом блоке.
  it('таймер «скопировано» снимается при размонтировании', async () => {
    stubClipboard()
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')

    const wrapper = mount(GrCodeBlock, { props: { code: 'x' } })
    await nextTick()
    await wrapper.get('[data-gr-code-block-copy]').trigger('click')
    await nextTick()

    wrapper.unmount()

    expect(clearSpy).toHaveBeenCalled()
    clearSpy.mockRestore()
  })
})

describe('GrCodeBlock — номера строк и конфиг', () => {
  it('lineNumbers включает колонку счётчика', () => {
    const off = mount(GrCodeBlock, { props: { code: SAMPLE } })
    expect(off.get('[data-gr-code-block-scroll]').classes()).not.toContain('gr-code-block--numbered')

    const on = mount(GrCodeBlock, { props: { code: SAMPLE, lineNumbers: true } })
    expect(on.get('[data-gr-code-block-scroll]').classes()).toContain('gr-code-block--numbered')
    // Номер — псевдоэлемент: текстом в разметке его нет, и в выделение он не попадёт.
    expect(on.get('[data-gr-code-block-code]').text()).not.toMatch(/^1/)
  })

  it('оформление читается из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrCodeBlock },
      template: `
        <GrConfigProvider :component-defaults="{ GrCodeBlock: { wrap: true, lineNumbers: true } }">
          <GrCodeBlock :code="{ a: 1 }" />
        </GrConfigProvider>
      `,
    })

    const scroll = mount(Harness).get('[data-gr-code-block-scroll]')
    expect(scroll.classes()).toContain('whitespace-pre-wrap')
    expect(scroll.classes()).toContain('gr-code-block--numbered')
    // wrap=true и maxHeight не задан — скроллером блок не стал.
    expect(scroll.attributes('tabindex')).toBeUndefined()
  })
})
