import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrJsonViewer from '../GrJsonViewer.vue'

/** Буфер в jsdom не реализован — ставим свой и отдаём шпион на `writeText`. */
function stubClipboard(impl?: (text: string) => Promise<void>) {
  const writeText = vi.fn(impl ?? (() => Promise.resolve()))
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  return writeText
}

function dropClipboard(): void {
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
}

afterEach(() => {
  dropClipboard()
})

const SAMPLE = {
  id: 'run_01',
  usage: { prompt_tokens: 1284, total_tokens: 1380 },
  cached: false,
  finished_at: null,
}

function rowsOf(wrapper: ReturnType<typeof mount>): string[] {
  return wrapper.findAll('[data-gr-json-viewer-key]').map(node => node.text())
}

describe('GrJsonViewer — раскрытие', () => {
  it('по умолчанию раскрыт только корень', () => {
    const wrapper = mount(GrJsonViewer, { props: { value: SAMPLE } })

    // Корень раскрыт: его прямые дети видны, а внутренности `usage` — нет.
    expect(rowsOf(wrapper)).toContain('usage')
    expect(rowsOf(wrapper)).not.toContain('prompt_tokens')
  })

  it('defaultExpandDepth раскрывает вложенные уровни', () => {
    const wrapper = mount(GrJsonViewer, { props: { value: SAMPLE, defaultExpandDepth: 2 } })

    expect(rowsOf(wrapper)).toContain('prompt_tokens')
  })

  it('expandAll раскрывает всё, collapseAll сворачивает', async () => {
    const wrapper = mount(GrJsonViewer, { props: { value: SAMPLE } })

    wrapper.vm.expandAll()
    await nextTick()
    expect(rowsOf(wrapper)).toContain('prompt_tokens')

    wrapper.vm.collapseAll()
    await nextTick()
    // Свёрнут и сам корень: у «свернуть всё» полумер нет.
    expect(rowsOf(wrapper)).toEqual(['$'])
  })
})

describe('GrJsonViewer — поиск', () => {
  it('фильтр находит по ключу и по значению', async () => {
    const wrapper = mount(GrJsonViewer, { props: { value: SAMPLE, defaultExpandDepth: 3 } })

    wrapper.vm.filter('prompt')
    await nextTick()
    expect(rowsOf(wrapper)).toContain('prompt_tokens')

    wrapper.vm.filter('run_01')
    await nextTick()
    expect(rowsOf(wrapper)).toContain('id')
  })

  it('searchable=false убирает поле, но не сам поиск', () => {
    const wrapper = mount(GrJsonViewer, { props: { value: SAMPLE, searchable: false } })

    expect(wrapper.find('[data-gr-json-viewer-toolbar]').exists()).toBe(false)
    expect(typeof wrapper.vm.filter).toBe('function')
  })
})

describe('GrJsonViewer — копирование', () => {
  beforeEach(() => {
    dropClipboard()
  })

  // Молча не работающая кнопка хуже её отсутствия.
  it('без буфера кнопок копирования нет', async () => {
    const wrapper = mount(GrJsonViewer, { props: { value: SAMPLE } })
    await nextTick()

    expect(wrapper.find('[data-gr-json-viewer-copy]').exists()).toBe(false)
  })

  /**
   * Главный инвариант: в буфер уходит полное значение, а не обрезанный показ.
   * Обрезка принадлежит показу, и вставить её обратно нельзя.
   */
  it('копирует полное значение обрезанного узла', async () => {
    const writeText = stubClipboard()
    const long = 'x'.repeat(5000)
    const wrapper = mount(GrJsonViewer, {
      props: { value: { image: long }, maxStringLength: 20, defaultExpandDepth: 2 },
    })
    await nextTick()

    const buttons = wrapper.findAll('[data-gr-json-viewer-copy]')
    await buttons[buttons.length - 1].trigger('click')

    expect(writeText).toHaveBeenCalledWith(long)
    expect(wrapper.emitted('copy')?.[0][0]).toMatchObject({ path: '$.image', value: long })
  })

  it('копирование ветки отдаёт поддерево, а не превью-счётчик', async () => {
    const writeText = stubClipboard()
    const wrapper = mount(GrJsonViewer, { props: { value: SAMPLE } })
    await nextTick()

    await wrapper.findAll('[data-gr-json-viewer-copy]')[0].trigger('click')

    expect(writeText.mock.calls[0][0]).toContain('"prompt_tokens"')
  })

  it('отказ буфера не даёт ни эмита, ни состояния «скопировано»', async () => {
    stubClipboard(() => Promise.reject(new Error('denied')))
    const wrapper = mount(GrJsonViewer, { props: { value: SAMPLE } })
    await nextTick()

    await wrapper.findAll('[data-gr-json-viewer-copy]')[0].trigger('click')
    await nextTick()

    expect(wrapper.emitted('copy')).toBeUndefined()
  })
})

describe('GrJsonViewer — разметка строки', () => {
  it('ключ и значение красятся разными ролями', () => {
    const wrapper = mount(GrJsonViewer, { props: { value: { name: 'Иван' }, defaultExpandDepth: 2 } })

    const keys = wrapper.findAll('[data-gr-json-viewer-key]')
    expect(keys[0].classes().join(' ')).toContain('--gr-json-viewer-key')

    const values = wrapper.findAll('[data-gr-json-viewer-value]')
    expect(values.at(-1)!.classes().join(' ')).toContain('--gr-json-viewer-string')
  })

  it('ariaLabel доезжает до дерева', () => {
    const wrapper = mount(GrJsonViewer, { props: { value: SAMPLE, ariaLabel: 'Ответ модели' } })

    expect(wrapper.get('[role="tree"]').attributes('aria-label')).toBe('Ответ модели')
  })

  it('слот leaf перекрывает показ значения', () => {
    const wrapper = mount(GrJsonViewer, {
      props: { value: { name: 'Иван' }, defaultExpandDepth: 2 },
      slots: { leaf: '<b class="custom">{{ params.node.label }}</b>' },
    })

    expect(wrapper.find('b.custom').exists()).toBe(true)
  })
})
