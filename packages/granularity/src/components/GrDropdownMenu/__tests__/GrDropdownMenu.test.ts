import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import GrDropdownMenu from '../GrDropdownMenu.vue'
import GrDropdownMenuColumn from '../GrDropdownMenuColumn.vue'
import GrDropdownMenuColumns from '../GrDropdownMenuColumns.vue'
import GrDropdownMenuDivider from '../GrDropdownMenuDivider.vue'
import GrDropdownMenuGroup from '../GrDropdownMenuGroup.vue'
import GrDropdownMenuHeader from '../GrDropdownMenuHeader.vue'
import GrDropdownMenuItem from '../GrDropdownMenuItem.vue'
import GrDropdownMenuList from '../GrDropdownMenuList.vue'
import type { GrDropdownMenuEntry } from '../menuModel'

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

describe('GrDropdownMenuItem — переключатели, иконка и шорткат', () => {
  it('menuitemcheckbox несёт aria-checked в обоих состояниях', async () => {
    const wrapper = mount(GrDropdownMenuItem, {
      props: { role: 'menuitemcheckbox', checked: false },
      slots: { default: 'Показывать сетку' },
    })

    expect(wrapper.attributes('role')).toBe('menuitemcheckbox')
    // Именно `false`, а не отсутствие атрибута: иначе диктор прочитает пункт
    // как обычную команду и состояние потеряется.
    expect(wrapper.attributes('aria-checked')).toBe('false')

    await wrapper.setProps({ checked: true })
    expect(wrapper.attributes('aria-checked')).toBe('true')
  })

  it('обычный пункт aria-checked не получает', () => {
    const wrapper = mount(GrDropdownMenuItem, { slots: { default: 'Открыть' } })

    expect(wrapper.attributes('aria-checked')).toBeUndefined()
  })

  it('место под отметку занято и у невыбранного переключателя', () => {
    // Иначе строки «включено» и «выключено» разъезжаются по горизонтали.
    const off = mount(GrDropdownMenuItem, {
      props: { role: 'menuitemradio', checked: false },
      slots: { default: 'Список' },
    })

    expect(off.find('[data-gr-dropdown-menu-item-indicator]').exists()).toBe(true)
  })

  it('шорткат рендерится справа, слот сильнее пропа', () => {
    const fromProp = mount(GrDropdownMenuItem, {
      props: { shortcut: '⌘K' },
      slots: { default: 'Поиск' },
    })
    expect(fromProp.find('[data-gr-dropdown-menu-item-shortcut]').text()).toBe('⌘K')

    const fromSlot = mount(GrDropdownMenuItem, {
      props: { shortcut: '⌘K' },
      slots: { default: 'Поиск', shortcut: '<kbd data-custom>Ctrl+K</kbd>' },
    })
    expect(fromSlot.find('[data-custom]').exists()).toBe(true)
    expect(fromSlot.find('[data-gr-dropdown-menu-item-shortcut]').exists()).toBe(false)
  })

  it('disabled гасится фоном, а не opacity', () => {
    const wrapper = mount(GrDropdownMenuItem, {
      props: { disabled: true },
      slots: { default: 'Недоступно' },
    })

    expect(wrapper.classes()).toContain('bg-[var(--gr-muted)]')
    expect(wrapper.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
  })

  it('danger красит текстовой ролью, а не насыщенным тоном', () => {
    const wrapper = mount(GrDropdownMenuItem, {
      props: { variant: 'danger' },
      slots: { default: 'Удалить' },
    })

    expect(wrapper.classes()).toContain('text-[var(--gr-danger-text)]')
    expect(wrapper.classes()).not.toContain('text-[var(--gr-danger)]')
  })

  // `stopPropagation` не отменяет обработчики, навешенные на сам элемент, —
  // а именно так их и вешают через `v-bind="attrs"`.
  it('disabled-пункт не активируется и клавиатурой', async () => {
    const onKeydown = vi.fn()
    const wrapper = mount(GrDropdownMenuItem, {
      props: { disabled: true, as: 'a' },
      attrs: { onClick: onKeydown },
      slots: { default: 'Недоступно' },
    })

    await wrapper.trigger('click')

    expect(onKeydown).not.toHaveBeenCalled()
  })
})

describe('GrDropdownMenu — роли контейнеров', () => {
  // `role="menu"` объявляет своих потомков презентационными: любой div между
  // панелью и пунктом ломает `aria-required-children`.
  it('обёртки объявлены презентационными', () => {
    expect(mount(GrDropdownMenuList).attributes('role')).toBe('none')
    expect(mount(GrDropdownMenuColumns).attributes('role')).toBe('none')
    expect(mount(GrDropdownMenuColumn).attributes('role')).toBe('none')
    expect(mount(GrDropdownMenuHeader, { props: { title: 'Секция' } }).attributes('role')).toBe('presentation')
  })

  it('группа — role="group" с именем из заголовка', () => {
    const withTitle = mount(GrDropdownMenuGroup, { props: { title: 'Экспорт' } })

    expect(withTitle.attributes('role')).toBe('group')
    const labelledBy = withTitle.attributes('aria-labelledby')
    expect(labelledBy).toBeTruthy()
    expect(withTitle.get(`#${labelledBy}`).text()).toBe('Экспорт')

    // Без заголовка называть группу нечем — пустой `aria-labelledby` хуже, чем никакого.
    const noTitle = mount(GrDropdownMenuGroup)
    expect(noTitle.attributes('aria-labelledby')).toBeUndefined()
  })

  it('колонки раскладываются классом из мапы, а не литералом в шаблоне', () => {
    expect(mount(GrDropdownMenuColumns, { props: { cols: 3 } }).classes()).toContain('grid-cols-3')
  })
})

describe('GrDropdownMenu — декларативное меню', () => {
  const items: GrDropdownMenuEntry[] = [
    { key: 'open', label: 'Открыть', shortcut: '⌘O' },
    { key: 'grid', label: 'Сетка', role: 'menuitemcheckbox', checked: true },
    { type: 'divider' },
    { type: 'group', title: 'Экспорт', items: [
      { key: 'csv', label: 'CSV' },
      { key: 'pdf', label: 'PDF', disabled: true },
    ] },
    { key: 'delete', label: 'Удалить', variant: 'danger' },
  ]

  function mountMenu() {
    return mount(GrDropdownMenu, {
      props: { items },
      global: { stubs: { teleport: true } },
    })
  }

  it('рендерит пункты, группы и разделители из массива', () => {
    const wrapper = mountMenu()

    const labels = wrapper.findAll('[data-gr-dropdown-menu-item]').map(item => item.text())
    expect(labels).toEqual(['Открыть⌘O', 'Сетка', 'CSV', 'PDF', 'Удалить'])

    expect(wrapper.findAll('[data-gr-dropdown-menu-divider]')).toHaveLength(1)
    expect(wrapper.get('[data-gr-dropdown-menu-group]').attributes('role')).toBe('group')
  })

  it('эмитит select с выбранным пунктом и молчит на disabled', async () => {
    const wrapper = mountMenu()
    const entries = wrapper.findAll('[data-gr-dropdown-menu-item]')

    await entries[0].trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ key: 'open' })

    // PDF отключён: ни клика, ни события.
    await entries[3].trigger('click')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('слот по умолчанию сильнее модели', () => {
    const wrapper = mount(GrDropdownMenu, {
      props: { items },
      slots: { default: '<button data-custom-item>Свой пункт</button>' },
      global: { stubs: { teleport: true } },
    })

    expect(wrapper.find('[data-custom-item]').exists()).toBe(true)
    expect(wrapper.findAll('[data-gr-dropdown-menu-item]')).toHaveLength(0)
  })
})
