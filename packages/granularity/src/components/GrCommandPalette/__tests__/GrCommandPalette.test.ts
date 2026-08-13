import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

// Разметку `GrModal` подменяем минимальными заглушками — палитру
// проверяем как список команд, а не как модалку (её контракт покрыт GrModal).
import GrCommandPalette from '../GrCommandPalette.vue'
import type { GrCommandItem } from '../filtering'
import { composingKeydown } from '../../../testing/keyboard'

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
function activeDescendantOf(wrapper: Awaited<ReturnType<typeof mountPalette>>): string | undefined {
  return wrapper.get('[data-testid="gr-command-palette-input"]').attributes('aria-activedescendant')
}

/**
 * Хелпер асинхронный: поддерево окна появляется на такт позже монтирования —
 * телепорт включается после маунта (см. `useTeleportEnabled`).
 */
async function mountPalette(props: Record<string, unknown> = {}) {
  const wrapper = mount(GrCommandPalette, {
    props: { modelValue: true, items, ...props },
    global: { stubs: { teleport: true } },
  })

  await nextTick()
  return wrapper
}

describe('GrCommandPalette', () => {
  it('рендерит combobox + listbox с группами и командами', async () => {
    const wrapper = await mountPalette()
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
    const wrapper = await mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')
    const first = wrapper.get('[data-testid="gr-command-palette-item-new"]')

    expect(input.attributes('aria-activedescendant')).toBe(first.attributes('id'))
    expect(first.attributes('aria-selected')).toBe('true')

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(activeDescendantOf(wrapper))
      .toBe(wrapper.get('[data-testid="gr-command-palette-item-open"]').attributes('id'))
  })

  it('стрелки зациклены и пропускают disabled-команды', async () => {
    const wrapper = await mountPalette()
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
    const wrapper = await mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({ id: 'open' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('closeOnSelect=false оставляет палитру открытой', async () => {
    const wrapper = await mountPalette({ closeOnSelect: false })
    await wrapper.get('[data-testid="gr-command-palette-item-theme"]').trigger('click')

    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({ id: 'theme' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('клик по disabled-команде ничего не выбирает', async () => {
    const wrapper = await mountPalette()
    await wrapper.get('[data-testid="gr-command-palette-item-archive"]').trigger('click')

    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('ввод фильтрует список и эмитит search', async () => {
    const wrapper = await mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    await input.setValue('тему')

    expect(wrapper.emitted('search')?.at(-1)).toEqual(['тему'])
    expect(wrapper.findAll('[data-gr-command-palette-item]').map(el => el.attributes('data-testid')))
      .toEqual(['gr-command-palette-item-theme'])
  })

  it('filterable=false отдаёт фильтрацию наружу', async () => {
    const wrapper = await mountPalette({ filterable: false })
    await wrapper.get('[data-testid="gr-command-palette-input"]').setValue('ничего такого')

    expect(wrapper.emitted('search')?.at(-1)).toEqual(['ничего такого'])
    expect(wrapper.findAll('[data-gr-command-palette-item]')).toHaveLength(4)
  })

  it('пустой результат показывает состояние «ничего не найдено»', async () => {
    const wrapper = await mountPalette()
    await wrapper.get('[data-testid="gr-command-palette-input"]').setValue('zzz')

    expect(wrapper.get('[data-testid="gr-command-palette-empty"]').text()).toBe('Nothing found')
  })

  it('глобальное сочетание переключает открытие палитры', async () => {
    const wrapper = await mountPalette({ modelValue: false })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))

    // Платформа теста не важна: сработает ровно один из двух вариантов `mod`.
    expect(wrapper.emitted('update:modelValue')).toEqual([[true]])
  })

  it('снимает глобальный слушатель при размонтировании', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = await mountPalette({ modelValue: false })

    wrapper.unmount()

    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('hotkey=null отключает глобальный слушатель', async () => {
    const wrapper = await mountPalette({ modelValue: false, hotkey: null })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('GrCommandPalette — структура listbox и состояния', () => {
  it('прямые потомки listbox — только role="group"', async () => {
    const wrapper = await mountPalette()
    const list = wrapper.get('[data-testid="gr-command-palette-list"]')

    const roles = [...list.element.children].map(child => child.getAttribute('role'))

    // Заголовок группы и блок состояния прямыми потомками быть не могут:
    // `role="listbox"` разрешает только option/group (axe: aria-required-children).
    expect(roles).toEqual(roles.map(() => 'group'))
    expect(roles.length).toBeGreaterThan(0)
  })

  it('заголовок группы лежит внутри неё и объявлен презентационным', async () => {
    const wrapper = await mountPalette()
    const group = wrapper.get('[role="group"]')
    const label = group.get('[data-gr-command-palette-group]')

    expect(label.attributes('role')).toBe('presentation')
    // Имя группе он всё равно даёт — через aria-labelledby.
    expect(group.attributes('aria-labelledby')).toBe(label.attributes('id'))
  })

  it('состояние объявляется живым регионом — и загрузка, и пустой результат', async () => {
    const loading = await mountPalette({ loading: true })
    const region = loading.get('[data-testid="gr-command-palette-empty"]')

    expect(region.attributes('role')).toBe('status')
    expect(region.attributes('aria-live')).toBe('polite')
    expect(region.text()).toBe('Loading…')

    // Иконка спиннера декоративна: текст состояния читает регион.
    expect(loading.get('.animate-spin').attributes('aria-label')).toBeUndefined()

    const empty = await mountPalette()
    await empty.get('[data-testid="gr-command-palette-input"]').setValue('ничего такого нет')

    expect(empty.get('[data-testid="gr-command-palette-empty"]').text()).toBe('Nothing found')
  })

  it('регион состояния лежит вне listbox', async () => {
    const wrapper = await mountPalette({ loading: true })
    const list = wrapper.get('[data-testid="gr-command-palette-list"]')

    expect(list.find('[data-testid="gr-command-palette-empty"]').exists()).toBe(false)
  })
})

describe('GrCommandPalette — выбор, подсветка и недавние', () => {
  it('новый массив с тем же содержимым не сбрасывает выбранную команду', async () => {
    const wrapper = await mountPalette()
    const input = wrapper.get('[data-testid="gr-command-palette-input"]')

    await input.trigger('keydown', { key: 'ArrowDown' })
    const active = activeDescendantOf(wrapper)

    // Родитель отдаёт `:items` инлайн-выражением: массив новый, содержимое то же.
    await wrapper.setProps({ items: items.map(item => ({ ...item })) })

    expect(activeDescendantOf(wrapper)).toBe(active)
  })

  it('изменившееся содержимое возвращает выбор в начало', async () => {
    const wrapper = await mountPalette()
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
    const wrapper = await mountPalette()

    await wrapper.get('[data-testid="gr-command-palette-input"]').setValue('нов')

    const marks = wrapper.findAll('mark')
    expect(marks).toHaveLength(1)
    expect(marks[0].text()).toBe('Нов')
    expect(wrapper.get('[data-testid="gr-command-palette-item-new"]').text()).toContain('Новый документ')
  })

  it('без запроса подсветки нет вовсе', async () => {
    expect((await mountPalette()).findAll('mark')).toHaveLength(0)
  })

  it('недавние идут первой группой и не дублируются ниже', async () => {
    const wrapper = await mountPalette({ recentIds: ['theme', 'new'] })
    const groups = wrapper.findAll('[role="group"]')

    expect(groups[0].get('[data-gr-command-palette-group]').text()).toBe('Recent')
    expect(groups[0].findAll('[data-gr-command-palette-item]').map(el => el.attributes('data-testid')))
      .toEqual(['gr-command-palette-item-theme', 'gr-command-palette-item-new'])

    expect(wrapper.findAll('[data-testid="gr-command-palette-item-new"]')).toHaveLength(1)
  })

  it('первая стрелка ведёт в недавние: порядок обхода совпадает с экранным', async () => {
    const wrapper = await mountPalette({ recentIds: ['theme'] })

    await wrapper.get('[data-testid="gr-command-palette-input"]').trigger('keydown', { key: 'Home' })

    expect(activeDescendantOf(wrapper)).toContain('theme')
  })

  it('с непустым запросом недавние исчезают — там правит релевантность', async () => {
    const wrapper = await mountPalette({ recentIds: ['theme'] })

    await wrapper.get('[data-testid="gr-command-palette-input"]').setValue('открыть')

    expect(wrapper.text()).not.toContain('Recent')
  })

  it('императивные open/close/toggle правят модель, а не своё состояние', async () => {
    const wrapper = await mountPalette({ modelValue: false })
    const api = wrapper.vm as unknown as { open: () => void, close: () => void, toggle: () => void }

    api.open()
    api.toggle()
    api.close()

    // Палитра управляемая: методы только просят родителя — сама она `modelValue`
    // не подменяет, иначе разошлась бы с источником правды.
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [true], [false]])
    expect(wrapper.find('[data-testid="gr-command-palette-input"]').exists()).toBe(false)
  })

  it('выключенная команда гасится токенами состояния, а не прозрачностью', async () => {
    const wrapper = await mountPalette({
      items: [{ id: 'off', label: 'Недоступно', disabled: true }],
    })

    // `opacity` разбавляет выверенные на AA токены текста и роняет контраст.
    const item = wrapper.get('[data-gr-command-palette-item]')
    expect(item.classes()).toContain('text-[var(--gr-disabled-fg)]')
    expect(item.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
    // Цвет метки задаётся ровно один раз: два `text-[…]` в одном списке
    // разрешаются порядком правил в CSS, и токен состояния молча проигрывал бы.
    expect(item.classes()).not.toContain('text-[var(--gr-fg)]')
  })

  it('иконка и описание выключенной команды гаснут вместе с ней', async () => {
    const wrapper = await mountPalette({
      items: [{
        id: 'off',
        label: 'Недоступно',
        description: 'Нет прав',
        icon: 'i-lucide-archive',
        disabled: true,
      }],
    })

    // Свой `--gr-muted-fg` оставил бы иконку темнее метки выключенной команды.
    const description = '[class*="--gr-text-xs"]'
    for (const selector of ['[aria-hidden="true"]', description]) {
      const part = wrapper.get(`[data-gr-command-palette-item] ${selector}`)
      expect(part.classes()).toContain('text-[var(--gr-disabled-fg)]')
      expect(part.classes()).not.toContain('text-[var(--gr-muted-fg)]')
    }
  })

  it('дубли id предупреждают: aria-activedescendant укажет не на ту команду', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await mountPalette({ items: [...items, { id: 'new', label: 'Ещё один new' }] })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('повторяющиеся id'))
    warn.mockRestore()
  })
})

describe('GrCommandPalette — IME-композиция', () => {
  it('Enter во время композиции не запускает команду', async () => {
    const wrapper = await mountPalette()

    composingKeydown(wrapper.get('[data-testid="gr-command-palette-input"]').element, 'Enter')
    await nextTick()

    expect(wrapper.emitted('select')).toBeUndefined()
    wrapper.unmount()
  })
})

describe('GrCommandPalette — иконка команды', () => {
const CustomIcon = defineComponent({ name: 'CustomIcon', render: () => h('svg', { 'data-custom-icon': '' }) })

  it('принимает компонент наравне с классом', async () => {
    const wrapper = await mountPalette({
      items: [{ id: 'new', label: 'Новый документ', icon: CustomIcon }],
    })

    expect(wrapper.find('[data-custom-icon]').exists()).toBe(true)
  })
})
