import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

// HeadlessUI внутри GrModal подменяем минимальными заглушками — палитру
// проверяем как список команд, а не как модалку (её контракт покрыт GrModal).
vi.mock('@headlessui/vue', async () => {
  const { defineComponent } = await import('vue')

  return {
    Dialog: defineComponent({
      name: 'Dialog',
      emits: ['close'],
      props: { as: { type: String, default: 'div' }, initialFocus: { type: Object, default: null } },
      template: '<div data-testid="hu-dialog"><slot /></div>',
    }),
    DialogPanel: defineComponent({ name: 'DialogPanel', template: '<div><slot /></div>' }),
    DialogTitle: defineComponent({ name: 'DialogTitle', template: '<div><slot /></div>' }),
    DialogDescription: defineComponent({ name: 'DialogDescription', template: '<div><slot /></div>' }),
    TransitionRoot: defineComponent({
      name: 'TransitionRoot',
      props: { show: { type: Boolean, default: false } },
      template: '<div v-if="show"><slot /></div>',
    }),
    TransitionChild: defineComponent({ name: 'TransitionChild', template: '<div><slot /></div>' }),
  }
})

import GrCommandPalette from '../GrCommandPalette.vue'
import type { GrCommandItem } from '../filtering'

const items: GrCommandItem[] = [
  { id: 'new', label: 'Новый документ', group: 'Файл', shortcut: ['⌘', 'N'] },
  { id: 'open', label: 'Открыть…', group: 'Файл' },
  { id: 'theme', label: 'Сменить тему', group: 'Настройки' },
  { id: 'archive', label: 'Архивировать', group: 'Настройки', disabled: true },
]

/**
 * Атрибут читаем по свежему запросу, а не по сохранённой обёртке.
 *
 * `stubs: { teleport: true }` подменяет телепорт компонентом-заглушкой, и когда
 * `GrModal` включает телепорт после монтирования (гидрационно-безопасный
 * контракт, см. `useTeleportEnabled`), заглушка пересоздаёт поддомен. В живом
 * браузере узел тот же — Vue его перемещает, — но в тесте сохранённая ссылка
 * протухает и показывает старые атрибуты.
 */
function activeDescendantOf(wrapper: ReturnType<typeof mountPalette>): string | undefined {
  return wrapper.get('[data-testid="gr-command-palette-input"]').attributes('aria-activedescendant')
}

function mountPalette(props: Record<string, unknown> = {}) {
  return mount(GrCommandPalette, {
    props: { modelValue: true, items, ...props },
    global: { stubs: { teleport: true } },
  })
}

describe('GrCommandPalette', () => {
  it('рендерит combobox + listbox с группами и командами', () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-expanded')).toBe('true')
    expect(input.attributes('aria-controls')).toBe(wrapper.get('[data-testid="gr-command-palette-list"]').attributes('id'))
    expect(wrapper.get('[data-testid="gr-command-palette-list"]').attributes('role')).toBe('listbox')
    expect(wrapper.findAll('[data-gr-command-palette-group]').map(el => el.text()))
      .toEqual(['Файл', 'Настройки'])
    expect(wrapper.findAll('[data-gr-command-palette-item]')).toHaveLength(4)
  })

  it('активная команда указана через aria-activedescendant', async () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')
    const first = wrapper.get('[data-testid="gr-command-palette-item-new"]')

    expect(input.attributes('aria-activedescendant')).toBe(first.attributes('id'))
    expect(first.attributes('aria-selected')).toBe('true')

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(activeDescendantOf(wrapper))
      .toBe(wrapper.get('[data-testid="gr-command-palette-item-open"]').attributes('id'))
  })

  it('стрелки зациклены и пропускают disabled-команды', async () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    await input.trigger('keydown', { key: 'End' })
    // Последняя выбираемая — 'theme': 'archive' отключена.
    expect(activeDescendantOf(wrapper))
      .toBe(wrapper.get('[data-testid="gr-command-palette-item-theme"]').attributes('id'))

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(activeDescendantOf(wrapper))
      .toBe(wrapper.get('[data-testid="gr-command-palette-item-new"]').attributes('id'))

    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(activeDescendantOf(wrapper))
      .toBe(wrapper.get('[data-testid="gr-command-palette-item-theme"]').attributes('id'))
  })

  it('Enter выбирает активную команду и закрывает палитру', async () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({ id: 'open' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('closeOnSelect=false оставляет палитру открытой', async () => {
    const wrapper = mountPalette({ closeOnSelect: false })
    await wrapper.get('[data-testid="gr-command-palette-item-theme"]').trigger('click')

    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({ id: 'theme' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('клик по disabled-команде ничего не выбирает', async () => {
    const wrapper = mountPalette()
    await wrapper.get('[data-testid="gr-command-palette-item-archive"]').trigger('click')

    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('ввод фильтрует список и эмитит search', async () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    await input.setValue('тему')

    expect(wrapper.emitted('search')?.at(-1)).toEqual(['тему'])
    expect(wrapper.findAll('[data-gr-command-palette-item]').map(el => el.attributes('data-testid')))
      .toEqual(['gr-command-palette-item-theme'])
  })

  it('filterable=false отдаёт фильтрацию наружу', async () => {
    const wrapper = mountPalette({ filterable: false })
    await wrapper.get('[data-testid="gr-command-palette-input"]').setValue('ничего такого')

    expect(wrapper.emitted('search')?.at(-1)).toEqual(['ничего такого'])
    expect(wrapper.findAll('[data-gr-command-palette-item]')).toHaveLength(4)
  })

  it('пустой результат показывает состояние «ничего не найдено»', async () => {
    const wrapper = mountPalette()
    await wrapper.get('[data-testid="gr-command-palette-input"]').setValue('zzz')

    expect(wrapper.get('[data-testid="gr-command-palette-empty"]').text()).toBe('Nothing found')
  })

  it('глобальное сочетание переключает открытие палитры', async () => {
    const wrapper = mountPalette({ modelValue: false })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))

    // Платформа теста не важна: сработает ровно один из двух вариантов `mod`.
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('снимает глобальный слушатель при размонтировании', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = mountPalette({ modelValue: false })

    wrapper.unmount()

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('hotkey=null отключает глобальный слушатель', () => {
    const wrapper = mountPalette({ modelValue: false, hotkey: null })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('GrCommandPalette — структура listbox и состояния', () => {
  it('прямые потомки listbox — только role="group"', () => {
    const wrapper = mountPalette()
    const list = wrapper.get('[data-testid="gr-command-palette-list"]')

    const roles = [...list.element.children].map(child => child.getAttribute('role'))

    // Заголовок группы и блок состояния прямыми потомками быть не могут:
    // `role="listbox"` разрешает только option/group (axe: aria-required-children).
    expect(roles).toEqual(roles.map(() => 'group'))
    expect(roles.length).toBeGreaterThan(0)
  })

  it('заголовок группы лежит внутри неё и объявлен презентационным', () => {
    const wrapper = mountPalette()
    const group = wrapper.get('[role="group"]')
    const label = group.get('[data-gr-command-palette-group]')

    expect(label.attributes('role')).toBe('presentation')
    // Имя группе он всё равно даёт — через aria-labelledby.
    expect(group.attributes('aria-labelledby')).toBe(label.attributes('id'))
  })

  it('состояние объявляется живым регионом — и загрузка, и пустой результат', async () => {
    const loading = mountPalette({ loading: true })
    const region = loading.get('[data-testid="gr-command-palette-empty"]')

    expect(region.attributes('role')).toBe('status')
    expect(region.attributes('aria-live')).toBe('polite')
    expect(region.text()).toBe('Loading…')

    // Иконка спиннера декоративна: текст состояния читает регион.
    expect(loading.find('.i-lucide-loader-2').attributes('aria-label')).toBeUndefined()

    const empty = mountPalette()
    await empty.get('[data-testid="gr-command-palette-input"]').setValue('ничего такого нет')

    expect(empty.get('[data-testid="gr-command-palette-empty"]').text()).toBe('Nothing found')
  })

  it('регион состояния лежит вне listbox', () => {
    const wrapper = mountPalette({ loading: true })
    const list = wrapper.get('[data-testid="gr-command-palette-list"]')

    expect(list.find('[data-testid="gr-command-palette-empty"]').exists()).toBe(false)
  })
})

describe('GrCommandPalette — выбор, подсветка и недавние', () => {
  it('новый массив с тем же содержимым не сбрасывает выбранную команду', async () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    await input.trigger('keydown', { key: 'ArrowDown' })
    const active = activeDescendantOf(wrapper)

    // Родитель отдаёт `:items` инлайн-выражением: массив новый, содержимое то же.
    await wrapper.setProps({ items: items.map(item => ({ ...item })) })

    expect(activeDescendantOf(wrapper)).toBe(active)
  })

  it('изменившееся содержимое возвращает выбор в начало', async () => {
    const wrapper = mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    await input.trigger('keydown', { key: 'ArrowDown' })
    const active = activeDescendantOf(wrapper)

    // Список стал другим — активной снова становится первая команда, а она
    // здесь уже не та, что была выбрана стрелкой.
    await wrapper.setProps({ items: items.slice(2) })

    expect(active).toContain('open')
    expect(activeDescendantOf(wrapper)).toContain('theme')
  })

  it('совпадение с запросом подсвечивается, остальное — нет', async () => {
    const wrapper = mountPalette()

    await wrapper.get('[data-testid="gr-command-palette-input"]').setValue('нов')

    const marks = wrapper.findAll('mark')
    expect(marks).toHaveLength(1)
    expect(marks[0].text()).toBe('Нов')
    expect(wrapper.get('[data-testid="gr-command-palette-item-new"]').text()).toContain('Новый документ')
  })

  it('без запроса подсветки нет вовсе', () => {
    expect(mountPalette().findAll('mark')).toHaveLength(0)
  })

  it('недавние идут первой группой и не дублируются ниже', () => {
    const wrapper = mountPalette({ recentIds: ['theme', 'new'] })
    const groups = wrapper.findAll('[role="group"]')

    expect(groups[0].get('[data-gr-command-palette-group]').text()).toBe('Recent')
    expect(groups[0].findAll('[data-gr-command-palette-item]').map(el => el.attributes('data-testid')))
      .toEqual(['gr-command-palette-item-theme', 'gr-command-palette-item-new'])

    expect(wrapper.findAll('[data-testid="gr-command-palette-item-new"]')).toHaveLength(1)
  })

  it('первая стрелка ведёт в недавние: порядок обхода совпадает с экранным', async () => {
    const wrapper = mountPalette({ recentIds: ['theme'] })

    await wrapper.get('[data-testid="gr-command-palette-input"]').trigger('keydown', { key: 'Home' })

    expect(activeDescendantOf(wrapper)).toContain('theme')
  })

  it('с непустым запросом недавние исчезают — там правит релевантность', async () => {
    const wrapper = mountPalette({ recentIds: ['theme'] })

    await wrapper.get('[data-testid="gr-command-palette-input"]').setValue('открыть')

    expect(wrapper.text()).not.toContain('Recent')
  })

  it('дубли id предупреждают: aria-activedescendant укажет не на ту команду', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mountPalette({ items: [...items, { id: 'new', label: 'Ещё один new' }] })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('повторяющиеся id'))
    warn.mockRestore()
  })
})
