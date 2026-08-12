import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrKbd from '../GrKbd.vue'

describe('GrKbd', () => {
  it('рендерится нативным <kbd> — семантика клавиши, а не стилизованный span', () => {
    const wrapper = mount(GrKbd, { slots: { default: 'Esc' } })

    expect(wrapper.element.tagName).toBe('KBD')
    expect(wrapper.text()).toBe('Esc')
  })

  // Шкала обещает четыре ступени: раньше `xs` и `lg` молча рендерились как `md`.
  it.each([
    ['xs', 'h-5'],
    ['sm', 'h-6'],
    ['md', 'h-7'],
    ['lg', 'h-8'],
  ] as const)('размер %s меняет метрики, а не только шрифт', (size, height) => {
    const wrapper = mount(GrKbd, { props: { size }, slots: { default: 'K' } })

    expect(wrapper.classes()).toContain(height)
  })

  it('по умолчанию — md', () => {
    expect(mount(GrKbd, { slots: { default: 'K' } }).classes()).toContain('h-7')
  })

  it('размер приходит из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrKbd },
      template: `
        <GrConfigProvider size="lg">
          <GrKbd>K</GrKbd>
        </GrConfigProvider>
      `,
    })

    expect(mount(Harness).get('[data-gr-kbd]').classes()).toContain('h-8')
  })

  it('минимальная ширина держит одиночный символ квадратным', () => {
    // Без `min-w` клавиша «K» была бы уже, чем «Esc», и ряд хоткеев прыгал бы.
    const wrapper = mount(GrKbd, { slots: { default: 'K' } })

    expect(wrapper.classes().some(c => c.startsWith('min-w-'))).toBe(true)
  })

  // `tabular-nums` в `presetMini`, где живёт пакет, отсутствует — её добирает
  // `@feugene/unocss-mini-extra-rules` (с 0.8.0). Что связка потребителя её
  // действительно генерирует, стережёт `src/__tests__/presetUtilities.test.ts`:
  // здесь проверяется только наличие класса в разметке.
  it('цифры не пляшут по ширине', () => {
    const wrapper = mount(GrKbd, { slots: { default: '1' } })

    expect(wrapper.classes()).toContain('tabular-nums')
  })

  it('оформление берётся из токенов, а не из хардкода', () => {
    const wrapper = mount(GrKbd, { slots: { default: 'Esc' } })
    const className = wrapper.attributes('class') ?? ''

    expect(className).toContain('var(--gr-brd)')
    expect(className).toContain('var(--gr-muted)')
  })
})

describe('GrKbd — сочетания', () => {
  it('строка-комбинация разбирается на клавиши', () => {
    const wrapper = mount(GrKbd, { props: { keys: 'ctrl+shift+K', platform: 'other' } })
    const keys = wrapper.findAll('[data-gr-kbd-key]')

    expect(keys.map(k => k.text())).toEqual(['Ctrl', 'Shift', 'K'])
  })

  it('массив токенов работает наравне со строкой', () => {
    const wrapper = mount(GrKbd, { props: { keys: ['ctrl', 'k'], platform: 'other' } })

    expect(wrapper.findAll('[data-gr-kbd-key]').map(k => k.text())).toEqual(['Ctrl', 'K'])
  })

  // Сочетание — вложенные `<kbd>`, а не div-обёртка: так его размечает спецификация.
  it('обёртка сочетания — тоже kbd', () => {
    const wrapper = mount(GrKbd, { props: { keys: 'mod+K' } })

    expect(wrapper.element.tagName).toBe('KBD')
    expect(wrapper.get('[data-gr-kbd-combo]').findAll('kbd')).toHaveLength(2)
  })

  it('mod зависит от платформы', () => {
    const apple = mount(GrKbd, { props: { keys: 'mod+K', platform: 'apple' } })
    const other = mount(GrKbd, { props: { keys: 'mod+K', platform: 'other' } })

    expect(apple.findAll('[data-gr-kbd-key]')[0].text()).toContain('⌘')
    expect(other.findAll('[data-gr-kbd-key]')[0].text()).toContain('Ctrl')
  })

  // `navigator` в теле setup разошёлся бы с серверным рендером: платформа
  // уточняется в onMounted, поэтому первый рендер — всегда не-Apple.
  it('auto определяет платформу после монтирования', async () => {
    const platform = vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')

    const wrapper = mount(GrKbd, { props: { keys: 'mod+K' } })
    await nextTick()

    expect(wrapper.findAll('[data-gr-kbd-key]')[0].text()).toContain('⌘')
    platform.mockRestore()
  })

  it('разделитель декоративный и отключается пустой строкой', () => {
    const withSeparator = mount(GrKbd, { props: { keys: 'ctrl+K', platform: 'other' } })
    const separator = withSeparator.get('[data-gr-kbd-combo] > span')

    expect(separator.text()).toBe('+')
    expect(separator.attributes('aria-hidden')).toBe('true')

    const without = mount(GrKbd, { props: { keys: 'ctrl+K', separator: '', platform: 'other' } })
    expect(without.findAll('[data-gr-kbd-combo] > span')).toHaveLength(0)
  })

  // `⌘` без имени диктор произносит как «знак места интереса».
  it('символьные клавиши получают читаемое имя', () => {
    const wrapper = mount(GrKbd, { props: { keys: 'mod+shift+K', platform: 'apple' } })
    const keys = wrapper.findAll('[data-gr-kbd-key]')

    expect(keys[0].get('.sr-only').text()).toBe('Command')
    expect(keys[1].get('.sr-only').text()).toBe('Shift')
    expect(keys[0].get('span[aria-hidden="true"]').text()).toBe('⌘')
    // Буквенной клавише имя не нужно — она и так читается.
    expect(keys[2].findAll('.sr-only')).toHaveLength(0)
  })

  it('слот продолжает работать без keys', () => {
    const wrapper = mount(GrKbd, { slots: { default: 'Esc' } })

    expect(wrapper.find('[data-gr-kbd-combo]').exists()).toBe(false)
    expect(wrapper.text()).toBe('Esc')
  })
})

describe('GrKbd — варианты сочетания', () => {
  /**
   * Что видно на экране: `text()` включает и `sr-only`-имена символов, а они
   * произносятся вместо глифа, но не рисуются.
   */
  function visibleText(wrapper: { element: Element }): string {
    const clone = wrapper.element.cloneNode(true) as HTMLElement
    for (const hidden of clone.querySelectorAll('.sr-only')) hidden.remove()

    return (clone.textContent ?? '').replace(/\s+/g, '')
  }

  /** Рамку носит либо общая плашка, либо каждая клавиша — но не обе сразу. */
  function hasChrome(className: string): boolean {
    return className.includes('var(--gr-brd)') && className.includes('var(--gr-muted)')
  }

  it('по умолчанию сочетание — одна плашка', () => {
    const wrapper = mount(GrKbd, { props: { keys: 'mod+K', platform: 'apple' } })

    expect(wrapper.get('[data-gr-kbd-combo]').attributes('data-variant')).toBe('merged')
    expect(hasChrome(wrapper.attributes('class') ?? '')).toBe(true)
    for (const key of wrapper.findAll('[data-gr-kbd-key]'))
      expect(hasChrome(key.attributes('class') ?? '')).toBe(false)

    // Разметка остаётся вложенными `<kbd>`: имена символов живут на них.
    expect(wrapper.get('[data-gr-kbd-combo]').findAll('kbd')).toHaveLength(2)
    expect(wrapper.text()).toContain('⌘')
  })

  it('`split` возвращает плашку на каждую клавишу', () => {
    const wrapper = mount(GrKbd, { props: { keys: 'mod+K', variant: 'split', platform: 'apple' } })

    expect(hasChrome(wrapper.attributes('class') ?? '')).toBe(false)
    for (const key of wrapper.findAll('[data-gr-kbd-key]'))
      expect(hasChrome(key.attributes('class') ?? '')).toBe(true)
  })

  // Так сочетания пишут сами системы: `⌘K` и `Ctrl+K`.
  it('авто-разделитель склеивает символы и разделяет слова', () => {
    const apple = mount(GrKbd, { props: { keys: 'mod+shift+K', platform: 'apple' } })
    const other = mount(GrKbd, { props: { keys: 'mod+shift+K', platform: 'other' } })

    expect(visibleText(apple)).toBe('⌘⇧K')
    expect(visibleText(other)).toBe('Ctrl+Shift+K')
  })

  it('явный separator сильнее авто', () => {
    const glued = mount(GrKbd, { props: { keys: 'ctrl+K', separator: '', platform: 'other' } })
    const plus = mount(GrKbd, { props: { keys: 'mod+K', separator: '+', platform: 'apple' } })

    expect(visibleText(glued)).toBe('CtrlK')
    expect(visibleText(plus)).toBe('⌘+K')
  })

  it('`sequence` ставит между клавишами слово из локали', () => {
    const wrapper = mount(GrKbd, { props: { keys: ['G', 'I'], variant: 'sequence', platform: 'other' } })

    expect(wrapper.text()).toContain('then')
    expect(wrapper.findAll('[data-gr-kbd-key]').map(k => k.text())).toEqual(['G', 'I'])
  })

  it('одиночная клавиша слотом не изменилась', () => {
    const wrapper = mount(GrKbd, { slots: { default: 'Esc' } })

    expect(wrapper.find('[data-gr-kbd-combo]').exists()).toBe(false)
    expect(hasChrome(wrapper.attributes('class') ?? '')).toBe(true)
  })
})

describe('GrKbd — словарь клавиш', () => {
  it.each([
    ['up', '↑', 'Arrow Up'],
    ['down', '↓', 'Arrow Down'],
    ['left', '←', 'Arrow Left'],
    ['right', '→', 'Arrow Right'],
    ['tab', '⇥', 'Tab'],
    ['backspace', '⌫', 'Backspace'],
    ['delete', '⌦', 'Delete'],
    ['pageup', '⇞', 'Page Up'],
    ['pagedown', '⇟', 'Page Down'],
  ])('%s — глиф и читаемое имя', (token, glyph, name) => {
    const wrapper = mount(GrKbd, { props: { keys: [token], platform: 'apple' } })
    const key = wrapper.get('[data-gr-kbd-key]')

    expect(key.text()).toContain(glyph)
    // Глиф от диктора скрыт, имя произносится вместо него.
    expect(key.get('.sr-only').text()).toBe(name)
  })

  it('вне macOS у части клавиш слова, а стрелки остаются стрелками', () => {
    const wrapper = mount(GrKbd, { props: { keys: ['tab', 'up'], variant: 'split', platform: 'other' } })

    expect(wrapper.findAll('[data-gr-kbd-key]').map(k => k.text())).toEqual(['Tab', '↑Arrow Up'])
  })

  it('алиасы и регистр не важны', () => {
    const short = mount(GrKbd, { props: { keys: ['pgup', 'del'], platform: 'other' } })
    const long = mount(GrKbd, { props: { keys: ['PageUp', 'Delete'], platform: 'other' } })

    expect(short.text()).toBe(long.text())
  })
})
