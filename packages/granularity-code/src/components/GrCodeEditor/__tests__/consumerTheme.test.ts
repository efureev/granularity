import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrCodeEditor from '../GrCodeEditor.vue'

/**
 * Своя палитра редактора — **умолчание**, а не диктат.
 *
 * Пакет тем не несёт: цвет берётся из токенов `--gr-code-block-*`, чтобы код
 * слушался темы приложения. Но потребитель вправе поставить готовую тему
 * CodeMirror через `extensions`, и она обязана перекрыть нашу.
 *
 * До 0.1.0 не перекрывала: наш `HighlightStyle` регистрировался обычным
 * приоритетом и выигрывал у любой темы, поставленной позже. Снаружи это
 * выглядело так, что `extensions` тему просто не принимает — при том что
 * расширение доезжало и молча не работало.
 */
async function mountWith(extensions: unknown[]) {
  await import('../codemirror')

  const { StreamLanguage } = await import('@codemirror/language')

  // Своя грамматика вместо языкового пакета: нужен один тег, а не язык.
  const language = StreamLanguage.define({
    token(stream) {
      if (stream.match('const'))
        return 'keyword'

      stream.next()

      return null
    },
  })

  const wrapper = mount(GrCodeEditor, {
    props: { modelValue: 'const x', language, extensions },
    attachTo: document.body,
  })
  await flushPromises()

  return wrapper
}

async function consumerHighlight(className: string): Promise<unknown> {
  const { HighlightStyle, syntaxHighlighting } = await import('@codemirror/language')
  const { tags } = await import('@lezer/highlight')

  return syntaxHighlighting(HighlightStyle.define([{ tag: tags.keyword, class: className }]))
}

describe('тема потребителя', () => {
  it('без темы работает своя палитра', async () => {
    const wrapper = await mountWith([])

    expect(wrapper.html()).toContain('gr-code-keyword')
  })

  it('тема из `extensions` перекрывает нашу палитру', async () => {
    const wrapper = await mountWith([await consumerHighlight('consumer-keyword')])
    const html = wrapper.html()

    expect(html).toContain('consumer-keyword')
    expect(html).not.toContain('gr-code-keyword')
  })

  /**
   * Снятая тема обязана вернуть умолчание: иначе редактор, у которого тему
   * выключили, остался бы вовсе без цвета.
   */
  it('снятая тема возвращает свою палитру', async () => {
    const wrapper = await mountWith([await consumerHighlight('consumer-keyword')])

    await wrapper.setProps({ extensions: [] })
    await flushPromises()

    expect(wrapper.html()).toContain('gr-code-keyword')
    expect(wrapper.html()).not.toContain('consumer-keyword')
  })
})
