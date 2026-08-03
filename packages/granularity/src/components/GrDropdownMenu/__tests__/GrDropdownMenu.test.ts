import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import GrDropdownMenuDivider from '../GrDropdownMenuDivider.vue'
import GrDropdownMenuItem from '../GrDropdownMenuItem.vue'

/**
 * Каталог из семи компонентов, из которых собирается содержимое `GrDropdown`.
 * Панель дропдауна объявляет `role="menu"`, а это делает потомков
 * презентационными — поэтому роли пунктов здесь не украшение, а условие того,
 * что меню вообще существует для скринридера.
 */
describe('GrDropdownMenuItem', () => {
  it('объявляет role="menuitem"', () => {
    const wrapper = mount(GrDropdownMenuItem, { slots: { default: 'Открыть' } })

    expect(wrapper.attributes('role')).toBe('menuitem')
  })

  it('по умолчанию — нативная кнопка с type="button"', () => {
    // Без явного `type` кнопка внутри формы отправляла бы её по клику.
    const wrapper = mount(GrDropdownMenuItem, { slots: { default: 'Открыть' } })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('полиморфен: `as` позволяет сделать пункт ссылкой', () => {
    const wrapper = mount(GrDropdownMenuItem, {
      props: { as: 'a' },
      attrs: { href: '/settings' },
      slots: { default: 'Настройки' },
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/settings')
    // Роль обязана сохраниться и на ссылке — иначе пункт выпадает из меню.
    expect(wrapper.attributes('role')).toBe('menuitem')
    // На не-кнопке `type` не имеет смысла и не должен появляться.
    expect(wrapper.attributes('type')).toBeUndefined()
  })

  it('disabled объявляется и для AT, и для клавиатуры', () => {
    const wrapper = mount(GrDropdownMenuItem, {
      props: { disabled: true },
      slots: { default: 'Недоступно' },
    })

    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('tabindex')).toBe('-1')
  })

  it('disabled-пункт не активируется кликом', async () => {
    const onClick = vi.fn()
    const wrapper = mount(GrDropdownMenuItem, {
      props: { disabled: true },
      attrs: { onClick },
      slots: { default: 'Недоступно' },
    })

    await wrapper.trigger('click')

    expect(onClick).not.toHaveBeenCalled()
  })

  it('обычный пункт клик пропускает', async () => {
    const onClick = vi.fn()
    const wrapper = mount(GrDropdownMenuItem, {
      attrs: { onClick },
      slots: { default: 'Открыть' },
    })

    await wrapper.trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('disabled на не-кнопке гасится ARIA, а не нативным атрибутом', () => {
    // У `<a>` нет `disabled`, поэтому единственный рабочий способ — ARIA
    // плюс исключение из таб-порядка.
    const wrapper = mount(GrDropdownMenuItem, {
      props: { as: 'a', disabled: true },
      slots: { default: 'Недоступно' },
    })

    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })
})

describe('GrDropdownMenuDivider', () => {
  it('объявляет role="separator" — внутри menu это значимый элемент', () => {
    const wrapper = mount(GrDropdownMenuDivider)

    expect(wrapper.attributes('role')).toBe('separator')
  })
})
