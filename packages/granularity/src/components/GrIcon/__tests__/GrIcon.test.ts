import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrIcon from '../GrIcon.vue'

/**
 * Размер иконки задаётся не классом, а CSS-переменной `--gr-icon-size`: на неё
 * опираются `width`/`height`/`min-width` в `<style>` компонента. Поэтому тест
 * проверяет именно переменную — класс тут ничего не решает.
 */
describe('GrIcon', () => {
  it('ставит --gr-icon-size токеном шкалы, а не числом', () => {
    // Значения живут в `tokens/foundation.json`: иконка обязана масштабироваться
    // вместе с темой, а не вместе с пересборкой пакета.
    const sizes: ('xs' | 'sm' | 'md' | 'lg')[] = ['xs', 'sm', 'md', 'lg']

    for (const size of sizes) {
      const wrapper = mount(GrIcon, { props: { size }, slots: { default: '<svg />' } })
      expect(wrapper.attributes('style'), size).toContain(`--gr-icon-size: var(--gr-icon-size-${size})`)
    }
  })

  it('по умолчанию — md', () => {
    const wrapper = mount(GrIcon, { slots: { default: '<svg />' } })

    expect(wrapper.attributes('style')).toContain('--gr-icon-size: var(--gr-icon-size-md)')
  })

  it('числовой размер принимается как пиксели', () => {
    const wrapper = mount(GrIcon, { props: { size: 42 }, slots: { default: '<svg />' } })

    expect(wrapper.attributes('style')).toContain('--gr-icon-size: 42px')
  })

  it('содержимое слота попадает внутрь без обёрток', () => {
    const wrapper = mount(GrIcon, { slots: { default: '<svg data-testid="glyph" />' } })

    expect(wrapper.find('[data-testid="glyph"]').exists()).toBe(true)
  })

  it('без `label` иконка декоративна: скрыта от AT и без роли', () => {
    // Решение развёрнуто осознанно. Раньше семантику полностью оставляли
    // потребителю, и `aria-hidden` ставился руками в шести местах библиотеки:
    // достаточно забыть один раз, чтобы диктор прочитал `<title>` из SVG.
    // Безопасный дефолт — скрытая иконка, а значимой её делает `label`.
    const wrapper = mount(GrIcon, { slots: { default: '<svg />' } })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('`label` делает иконку значимой: роль, имя и никакого скрытия', () => {
    const wrapper = mount(GrIcon, { props: { label: 'Избранное' }, slots: { default: '<svg />' } })

    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Избранное')
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
  })

  it('tone красит иконку токеном текста, `current` наследует цвет', () => {
    const toned = mount(GrIcon, { props: { tone: 'danger' }, slots: { default: '<svg />' } })
    expect(toned.classes()).toContain('text-[var(--gr-danger-text)]')

    // Насыщенный тон как цвет текста запрещён правилами пакета — только `-text`.
    expect(toned.classes()).not.toContain('text-[var(--gr-danger)]')

    const inherited = mount(GrIcon, { slots: { default: '<svg />' } })
    expect(inherited.classes().some(name => name.startsWith('text-['))).toBe(false)
  })

  it('spin включает вращение', () => {
    expect(mount(GrIcon, { props: { spin: true }, slots: { default: '<svg />' } }).classes())
      .toContain('animate-spin')
    expect(mount(GrIcon, { slots: { default: '<svg />' } }).classes()).not.toContain('animate-spin')
  })

  it('потребитель может переопределить скрытие', () => {
    // Fallthrough-атрибут сильнее собственной привязки: редкий случай «иконка
    // значима, но имя даёт соседний элемент» остаётся выразимым.
    const wrapper = mount(GrIcon, {
      attrs: { 'aria-hidden': 'false' },
      slots: { default: '<svg />' },
    })

    expect(wrapper.attributes('aria-hidden')).toBe('false')
  })
})
