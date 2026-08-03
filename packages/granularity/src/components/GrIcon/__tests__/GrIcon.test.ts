import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrIcon from '../GrIcon.vue'

/**
 * Размер иконки задаётся не классом, а CSS-переменной `--gr-icon-size`: на неё
 * опираются `width`/`height`/`min-width` в `<style>` компонента. Поэтому тест
 * проверяет именно переменную — класс тут ничего не решает.
 */
describe('GrIcon', () => {
  it('ставит --gr-icon-size из шкалы размеров', () => {
    const sizes: [size: 'sm' | 'md' | 'lg', px: string][] = [
      ['sm', '16px'],
      ['md', '18px'],
      ['lg', '20px'],
    ]

    for (const [size, px] of sizes) {
      const wrapper = mount(GrIcon, { props: { size }, slots: { default: '<svg />' } })
      expect(wrapper.attributes('style'), size).toContain(`--gr-icon-size: ${px}`)
    }
  })

  it('по умолчанию — md', () => {
    const wrapper = mount(GrIcon, { slots: { default: '<svg />' } })

    expect(wrapper.attributes('style')).toContain('--gr-icon-size: 18px')
  })

  it('числовой размер принимается как пиксели', () => {
    const wrapper = mount(GrIcon, { props: { size: 42 }, slots: { default: '<svg />' } })

    expect(wrapper.attributes('style')).toContain('--gr-icon-size: 42px')
  })

  it('содержимое слота попадает внутрь без обёрток', () => {
    const wrapper = mount(GrIcon, { slots: { default: '<svg data-testid="glyph" />' } })

    expect(wrapper.find('[data-testid="glyph"]').exists()).toBe(true)
  })

  it('роли не выдумывает — семантику задаёт потребитель', () => {
    // Иконка бывает и значимой, и декоративной; навязанный `aria-hidden`
    // или `role="img"` ломал бы одну из этих ролей.
    const wrapper = mount(GrIcon, { slots: { default: '<svg />' } })

    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
  })

  it('пробрасывает aria-hidden от потребителя', () => {
    const wrapper = mount(GrIcon, {
      attrs: { 'aria-hidden': 'true' },
      slots: { default: '<svg />' },
    })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })
})
