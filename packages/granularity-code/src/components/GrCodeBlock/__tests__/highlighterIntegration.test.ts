import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrCodeBlock from '../GrCodeBlock.vue'
import { GR_CODE_HIGHLIGHTER_KEY } from '../../../highlight/key'
import type { GrCodeLine, GrCodeTokenizer } from '../../../highlight/palette'

/** Подсветка, красящая всё одной ролью: проверяется маршрут, а не разбор. */
function fakeTokenizer(role: 'keyword' | 'comment'): GrCodeTokenizer {
  return code => code.split('\n').map(text => [{ text, role }])
}

function rolesOf(html: string): string[] {
  return [...html.matchAll(/--gr-code-block-([a-z]+)/g)].map(match => match[1]!)
}

describe('подсветка в GrCodeBlock', () => {
  it('без подсветки работает встроенный разбор JSON', () => {
    const wrapper = mount(GrCodeBlock, { props: { code: { a: 1 } } })

    expect(rolesOf(wrapper.html())).toContain('key')
  })

  it('подсветка из провайдера приложения перекрывает встроенную', () => {
    const wrapper = mount(GrCodeBlock, {
      props: { code: { a: 1 } },
      global: { provide: { [GR_CODE_HIGHLIGHTER_KEY as symbol]: fakeTokenizer('keyword') } },
    })

    const roles = rolesOf(wrapper.html())

    expect(roles).toContain('keyword')
    expect(roles).not.toContain('key')
  })

  /** Проп сильнее провайдера: точечная замена движка не требует нового провайдера. */
  it('проп `highlighter` перекрывает провайдер', () => {
    const wrapper = mount(GrCodeBlock, {
      props: { code: 'x', language: 'ts', highlighter: fakeTokenizer('comment') },
      global: { provide: { [GR_CODE_HIGHLIGHTER_KEY as symbol]: fakeTokenizer('keyword') } },
    })

    expect(rolesOf(wrapper.html())).toContain('comment')
  })

  it('незнакомый язык без подсветки показывается текстом, а не пустотой', () => {
    const wrapper = mount(GrCodeBlock, { props: { code: 'SELECT 1', language: 'sql' } })

    expect(wrapper.text()).toContain('SELECT 1')
  })

  describe('асинхронная подсветка', () => {
    /** Первый кадр — встроенный разбор: ждать подсветку, показывая пустоту, нельзя. */
    it('до ответа показывает встроенный разбор, после — подсвеченный', async () => {
      let resolveWith: ((lines: GrCodeLine[]) => void) | undefined
      const tokenizer: GrCodeTokenizer = async () => new Promise<GrCodeLine[]>((resolve) => {
        resolveWith = resolve
      })

      const wrapper = mount(GrCodeBlock, {
        props: { code: { a: 1 }, highlighter: tokenizer },
      })

      expect(rolesOf(wrapper.html())).toContain('key')

      resolveWith!([[{ text: '{"a": 1}', role: 'comment' }]])
      await flushPromises()

      expect(rolesOf(wrapper.html())).toContain('comment')
    })

    /**
     * Гонка: ответ на позапрошлый вход подсветил бы не то. Дефект молчаливый —
     * не падает и не логируется, просто иногда красит строку не тем цветом.
     */
    it('устаревший ответ отбрасывается', async () => {
      const pending: Array<(lines: GrCodeLine[]) => void> = []
      const tokenizer: GrCodeTokenizer = async () => new Promise<GrCodeLine[]>((resolve) => {
        pending.push(resolve)
      })

      const wrapper = mount(GrCodeBlock, {
        props: { code: 'первый', language: 'ts', highlighter: tokenizer },
      })

      await wrapper.setProps({ code: 'второй' })
      await nextTick()

      // Сначала отвечает запрос на «второй», потом — запоздавший на «первый».
      pending[1]!([[{ text: 'второй', role: 'comment' }]])
      await flushPromises()
      pending[0]!([[{ text: 'первый', role: 'keyword' }]])
      await flushPromises()

      const roles = rolesOf(wrapper.html())

      expect(roles).toContain('comment')
      expect(roles).not.toContain('keyword')
    })
  })
})
