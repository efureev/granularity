import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

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

describe('GrDropdownMenuItem — фокус, ссылки и выключенное состояние', () => {
  it('пункты не табируемы: внутри menu фокусом распоряжаются стрелки', () => {
    const wrapper = mount(GrDropdownMenuItem, { slots: { default: 'Открыть' } })

    expect(wrapper.attributes('tabindex')).toBe('-1')
  })

  it('явный tabindex от потребителя сильнее', () => {
    const wrapper = mount(GrDropdownMenuItem, {
      attrs: { tabindex: 0 },
      slots: { default: 'Открыть' },
    })

    expect(wrapper.attributes('tabindex')).toBe('0')
  })

  it('выключенный пункт остаётся фокусируемым: нативного disabled на кнопке нет', () => {
    const wrapper = mount(GrDropdownMenuItem, {
      props: { disabled: true },
      slots: { default: 'Недоступно' },
    })

    // Нативный `disabled` выкинул бы пункт и из фокуса, и из обхода стрелками —
    // пользователь не узнал бы, что действие вообще существует.
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('tabindex')).toBe('-1')
  })

  it('href делает пункт ссылкой без явного as', () => {
    const wrapper = mount(GrDropdownMenuItem, {
      props: { href: '/docs' },
      slots: { default: 'Документация' },
    })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/docs')
  })

  it('external даёт target и rel, а явные значения сильнее', () => {
    const external = mount(GrDropdownMenuItem, {
      props: { href: 'https://example.com', external: true },
      slots: { default: 'Сайт' },
    })
    expect(external.attributes('target')).toBe('_blank')
    expect(external.attributes('rel')).toBe('noopener noreferrer')

    const explicit = mount(GrDropdownMenuItem, {
      props: { href: 'https://example.com', target: '_self', rel: 'nofollow' },
      slots: { default: 'Сайт' },
    })
    expect(explicit.attributes('target')).toBe('_self')
    expect(explicit.attributes('rel')).toBe('nofollow')
  })

  it('у выключенной ссылки href снимается: перехват клика не спасает от средней кнопки', () => {
    const wrapper = mount(GrDropdownMenuItem, {
      props: { href: '/docs', disabled: true },
      slots: { default: 'Документация' },
    })

    expect(wrapper.attributes('href')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })
})

describe('GrDropdownMenu — проброс в GrDropdown', () => {
  it('режим открытия, задержки, disabled и teleportTo доезжают до примитива', () => {
    const wrapper = mount(GrDropdownMenu, {
      props: {
        trigger: 'hover',
        openDelay: 50,
        closeDelay: 90,
        disabled: true,
        placement: 'top-start',
        offset: 12,
        width: '20rem',
      },
      global: { stubs: { teleport: true } },
    })

    const dropdown = wrapper.findComponent({ name: 'GrDropdown' })

    expect(dropdown.props()).toMatchObject({
      trigger: 'hover',
      openDelay: 50,
      closeDelay: 90,
      disabled: true,
      placement: 'top-start',
      offset: 12,
      width: '20rem',
    })
  })

  it('модель отдаёт пункту ссылочные пропы', () => {
    const wrapper = mount(GrDropdownMenu, {
      props: {
        items: [
          { key: 'docs', label: 'Документация', href: 'https://example.com', external: true },
        ] as GrDropdownMenuEntry[],
      },
      global: { stubs: { teleport: true } },
    })

    const item = wrapper.find('[data-gr-dropdown-menu-item]')

    expect(item.element.tagName).toBe('A')
    expect(item.attributes('href')).toBe('https://example.com')
    expect(item.attributes('target')).toBe('_blank')
    expect(item.attributes('rel')).toBe('noopener noreferrer')
  })
})

describe('GrDropdownMenu — геометрия подсветки', () => {
  // Фон пункта прямоугольный ровно настолько, насколько ему разрешили: без
  // своего радиуса он заливает угловые сегменты, вырезанные радиусом панели.
  it('пункт скруглён', () => {
    const wrapper = mount(GrDropdownMenuItem, { slots: { default: 'Открыть' } })

    expect(wrapper.classes()).toContain('rounded-[var(--gr-radius-md)]')
  })

  it('выключенный пункт скруглён тоже — его фон виден без наведения', () => {
    const wrapper = mount(GrDropdownMenuItem, { props: { disabled: true }, slots: { default: 'Открыть' } })

    expect(wrapper.classes()).toContain('rounded-[var(--gr-radius-md)]')
    expect(wrapper.classes()).toContain('bg-[var(--gr-muted)]')
  })

  /**
   * Меню не гасит поле панели своим классом: `p-1` и `p-0` попадают в один
   * атрибут с равной специфичностью, и победителя выбирает порядок правил в
   * сгенерированном CSS, а не разметка. Проверяем список классов, а не
   * `getComputedStyle`: каскад в jsdom не разрешается, и такой тест зеленел бы
   * на сломанном коде.
   */
  it('поле панели остаётся за панелью', () => {
    const wrapper = mount(GrDropdownMenu, {
      props: { items: [{ key: 'rename', label: 'Переименовать' }] as GrDropdownMenuEntry[] },
      global: { stubs: { teleport: true } },
    })

    const content = wrapper.find('[data-gr-dropdown-content]')

    expect(content.classes()).toContain('p-1')
    expect(content.classes()).not.toContain('p-0')
  })
})

describe('GrDropdownMenu — v-model:open (прокидка в GrDropdown)', () => {
  it('`:open="true"` показывает меню, открытие кликом переэмитит `update:open`', async () => {
    const opened = mount(GrDropdownMenu, {
      attachTo: document.body,
      props: { open: true, items: [{ key: 'item', label: 'Пункт' }] },
      slots: { trigger: '<button type="button" data-testid="trigger" v-bind="params.triggerProps">Меню</button>' },
    })
    await nextTick()
    const content = document.querySelector<HTMLElement>('[data-gr-dropdown-panel]')
    expect(content?.style.display).not.toBe('none')
    opened.unmount()
    document.body.innerHTML = ''

    const uncontrolled = mount(GrDropdownMenu, {
      attachTo: document.body,
      props: { items: [{ key: 'item', label: 'Пункт' }] },
      slots: { trigger: '<button type="button" data-testid="trigger" v-bind="params.triggerProps">Меню</button>' },
    })
    await uncontrolled.get('[data-testid="trigger"]').trigger('click')
    expect(uncontrolled.emitted('update:open')?.at(-1)).toEqual([true])
    uncontrolled.unmount()
  })
})

/**
 * Клавиатура меню.
 *
 * Реализация живёт в `GrDropdown` (кольцо roving-фокуса и typeahead на панели),
 * но контракт принадлежит меню: `GrDropdownMenu` — единственный потребитель,
 * ради которого панель ведёт себя как `menu`, а не как произвольный поповер.
 * Поэтому спек тут, а не у примитива.
 *
 * Тесты шлют настоящие события и проверяют `document.activeElement`: проверка по
 * атрибутам показала бы `tabindex="-1"` у всех пунктов и была бы зелёной при
 * полностью сломанной навигации — фокусом в этом паттерне распоряжаются стрелки,
 * а не таб-порядок.
 */
describe('GrDropdownMenu — клавиатура паттерна menu', () => {
  const items: GrDropdownMenuEntry[] = [
    { key: 'open', label: 'Открыть' },
    { key: 'save', label: 'Сохранить' },
    { key: 'send', label: 'Скопировать' },
    { key: 'locked', label: 'Печать', disabled: true },
    { key: 'delete', label: 'Удалить' },
  ]

  function mountOpen() {
    const wrapper = mount(GrDropdownMenu, {
      attachTo: document.body,
      props: { open: true, items },
      slots: { trigger: '<button type="button" data-testid="trigger" v-bind="params.triggerProps">Меню</button>' },
    })
    return wrapper
  }

  function panel(): HTMLElement {
    const el = document.querySelector<HTMLElement>('[data-gr-dropdown-panel]')
    if (!el)
      throw new Error('панель не найдена')
    return el
  }

  function menuItems(): HTMLElement[] {
    return [...panel().querySelectorAll<HTMLElement>('[data-gr-dropdown-menu-item]')]
  }

  /** Событие уходит с сфокусированного пункта и всплывает до панели — как в браузере. */
  function press(key: string, init: KeyboardEventInit = {}): void {
    const target = (document.activeElement as HTMLElement | null) ?? panel()
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }))
  }

  function focusedLabel(): string | undefined {
    return (document.activeElement as HTMLElement | null)?.textContent?.trim()
  }

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('ArrowDown с триггера открывает меню и ведёт на первый пункт', async () => {
    const wrapper = mount(GrDropdownMenu, {
      attachTo: document.body,
      props: { items },
      slots: { trigger: '<button type="button" data-testid="trigger" v-bind="params.triggerProps">Меню</button>' },
    })

    await wrapper.get('[data-testid="trigger"]').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([true])
    expect(focusedLabel()).toBe('Открыть')
    wrapper.unmount()
  })

  it('ArrowUp с триггера открывает меню и ведёт на последний пункт', async () => {
    const wrapper = mount(GrDropdownMenu, {
      attachTo: document.body,
      props: { items },
      slots: { trigger: '<button type="button" data-testid="trigger" v-bind="params.triggerProps">Меню</button>' },
    })

    await wrapper.get('[data-testid="trigger"]').trigger('keydown', { key: 'ArrowUp' })
    await nextTick()

    expect(focusedLabel()).toBe('Удалить')
    wrapper.unmount()
  })

  it('стрелки двигают фокус по пунктам в обе стороны', async () => {
    const wrapper = mountOpen()
    await nextTick()
    menuItems()[0].focus()

    press('ArrowDown')
    expect(focusedLabel()).toBe('Сохранить')

    press('ArrowDown')
    expect(focusedLabel()).toBe('Скопировать')

    press('ArrowUp')
    expect(focusedLabel()).toBe('Сохранить')

    wrapper.unmount()
  })

  it('кольцо замкнуто в обе стороны', async () => {
    const wrapper = mountOpen()
    await nextTick()
    const all = menuItems()

    all.at(-1)!.focus()
    press('ArrowDown')
    expect(focusedLabel()).toBe('Открыть')

    press('ArrowUp')
    expect(focusedLabel()).toBe('Удалить')

    wrapper.unmount()
  })

  it('Home и End уводят на края', async () => {
    const wrapper = mountOpen()
    await nextTick()
    menuItems()[2].focus()

    press('Home')
    expect(focusedLabel()).toBe('Открыть')

    press('End')
    expect(focusedLabel()).toBe('Удалить')

    wrapper.unmount()
  })

  it('выключенный пункт остаётся в кольце', async () => {
    // Осознанное решение паттерна: `aria-disabled` вместо нативного `disabled`
    // оставляет пункт фокусируемым, чтобы скринридер прочёл, что он есть и
    // недоступен. Прыжок через него молча поменял бы семантику стрелок.
    const wrapper = mountOpen()
    await nextTick()
    menuItems()[2].focus()

    press('ArrowDown')
    expect(focusedLabel()).toBe('Печать')
    expect(document.activeElement?.getAttribute('aria-disabled')).toBe('true')

    wrapper.unmount()
  })

  it('Tab закрывает меню, а не уводит фокус внутри него', async () => {
    const wrapper = mountOpen()
    await nextTick()
    menuItems()[0].focus()

    press('Tab')
    await nextTick()

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })

  it('печатный символ ведёт на пункт с этой буквы', async () => {
    const wrapper = mountOpen()
    await nextTick()
    menuItems()[0].focus()

    press('у')
    expect(focusedLabel()).toBe('Удалить')

    wrapper.unmount()
  })

  it('повтор буквы перебирает пункты на неё, а не ищет удвоение', async () => {
    const wrapper = mountOpen()
    await nextTick()
    menuItems()[0].focus()

    press('с')
    expect(focusedLabel()).toBe('Сохранить')

    press('с')
    expect(focusedLabel()).toBe('Скопировать')

    wrapper.unmount()
  })

  it('поиск идёт от следующего за текущим, а не с начала списка', async () => {
    const wrapper = mountOpen()
    await nextTick()
    menuItems()[1].focus() // «Сохранить»

    press('с')
    expect(focusedLabel()).toBe('Скопировать')

    wrapper.unmount()
  })

  it('пробел при пустом буфере остаётся пункту, а не уходит в поиск', async () => {
    // Пункты меню — кнопки, пробел для них родная клавиша активации.
    const wrapper = mountOpen()
    await nextTick()
    menuItems()[0].focus()

    press(' ')
    expect(focusedLabel()).toBe('Открыть')

    wrapper.unmount()
  })

  it('символ с модификатором — команда, а не поиск', async () => {
    const wrapper = mountOpen()
    await nextTick()
    menuItems()[0].focus()

    press('у', { metaKey: true })
    expect(focusedLabel()).toBe('Открыть')

    wrapper.unmount()
  })

  it('Escape с триггера закрывает открытое меню', async () => {
    const wrapper = mountOpen()
    await nextTick()

    await wrapper.get('[data-testid="trigger"]').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })
})
