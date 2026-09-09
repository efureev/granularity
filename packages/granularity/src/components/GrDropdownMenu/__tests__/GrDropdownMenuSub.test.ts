import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrDropdownMenu from '../GrDropdownMenu.vue'
import GrDropdownMenuSub from '../GrDropdownMenuSub.vue'
import type { GrDropdownMenuEntry } from '../menuModel'

/**
 * Второй уровень меню.
 *
 * Панель подменю уезжает в портал, то есть в DOM лежит **рядом** с родительской,
 * а не внутри неё. Отсюда и предмет проверок: всё, что на одном уровне решает
 * DOM-родство (закрыть цепочку, не закрыться от клика в своего же потомка,
 * увести фокус), на двух уровнях приходится связывать явно.
 */
const items: GrDropdownMenuEntry[] = [
  { key: 'open', label: 'Открыть' },
  {
    key: 'export',
    label: 'Экспорт',
    children: [
      { key: 'pdf', label: 'PDF' },
      { key: 'csv', label: 'CSV' },
    ],
  },
  {
    key: 'share',
    label: 'Поделиться',
    children: [
      { key: 'link', label: 'Ссылкой' },
    ],
  },
  { key: 'delete', label: 'Удалить' },
]

function mountMenu(props: Record<string, unknown> = {}) {
  return mount(GrDropdownMenu, {
    attachTo: document.body,
    props: { open: true, items, ...props },
    slots: { trigger: '<button type="button" data-testid="trigger" v-bind="params.triggerProps">Меню</button>' },
  })
}

function subTriggers(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-gr-dropdown-menu-sub-trigger]')]
}

/**
 * Раскрыватель ищется по подписи, а не по индексу: панели уровней лежат в
 * портале в порядке монтирования, и вложенная оказывается в документе **раньше**
 * родительской.
 */
function trigger(label: string): HTMLElement {
  const found = subTriggers().find(el => el.textContent?.trim() === label)
  if (!found)
    throw new Error(`раскрыватель «${label}» не найден`)
  return found
}

function click(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

function hoverEnter(el: HTMLElement): void {
  el.dispatchEvent(new MouseEvent('mouseenter'))
}

function hoverLeave(el: HTMLElement, at: { x: number, y: number }): void {
  el.dispatchEvent(new MouseEvent('mouseleave', { clientX: at.x, clientY: at.y }))
}

/**
 * Курсор входит на панель и уходит с неё. Событие адресуется списку: обработчик
 * висит на нём, а `mouseenter`/`mouseleave` не всплывают.
 */
function enterList(panel: HTMLElement): void {
  panel.querySelector('[data-gr-dropdown-menu-list]')!.dispatchEvent(new MouseEvent('mouseenter'))
}

function leaveList(panel: HTMLElement): void {
  panel.querySelector('[data-gr-dropdown-menu-list]')!
    .dispatchEvent(new MouseEvent('mouseleave', { clientX: 900, clientY: 60 }))
}

function panelWith(label: string): HTMLElement {
  const found = visibleSubmenus().find(panel => labelsIn(panel).includes(label))
  if (!found)
    throw new Error(`панель с пунктом «${label}» не раскрыта`)
  return found
}

/** jsdom геометрию не считает, а коридор строится по прямоугольнику панели. */
function stubRect(panel: HTMLElement): void {
  panel.getBoundingClientRect = () => ({
    left: 200,
    right: 340,
    top: 40,
    bottom: 160,
    width: 140,
    height: 120,
    x: 200,
    y: 40,
    toJSON: () => ({}),
  })
}

function submenuPanels(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-gr-popover-panel][role="menu"]')]
    .filter(panel => panel.querySelector('[data-gr-dropdown-menu-list]') && !panel.querySelector('[data-gr-dropdown-panel]'))
}

/** Видимая панель: `GrPopover` прячет закрытую через `v-show`. */
function visibleSubmenus(): HTMLElement[] {
  return submenuPanels().filter(panel => panel.style.display !== 'none')
}

function press(key: string, target?: HTMLElement): void {
  const el = target ?? (document.activeElement as HTMLElement | null)
  el?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

function labelsIn(panel: HTMLElement): string[] {
  return [...panel.querySelectorAll<HTMLElement>('[data-gr-dropdown-menu-item]')]
    .map(item => item.textContent?.trim() ?? '')
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('GrDropdownMenu — раскрыватель подменю', () => {
  it('пункт с children объявляет подменю, обычный — нет', () => {
    const wrapper = mountMenu()

    const triggers = subTriggers()
    expect(triggers.map(el => el.textContent?.trim())).toEqual(['Экспорт', 'Поделиться'])
    expect(triggers[0]?.getAttribute('aria-haspopup')).toBe('menu')
    expect(triggers[0]?.getAttribute('aria-expanded')).toBe('false')

    const plain = [...document.querySelectorAll<HTMLElement>('[data-gr-dropdown-menu-item]')]
      .find(el => el.textContent?.trim() === 'Открыть')
    expect(plain?.getAttribute('aria-haspopup')).toBeNull()

    wrapper.unmount()
  })

  it('раскрыватель остаётся фокусируемым пунктом меню', () => {
    // Нативный `disabled` от `GrPopover` выкинул бы его из обхода — у меню
    // выключенные пункты обязаны оставаться достижимыми.
    const wrapper = mountMenu()

    expect(subTriggers()[0]?.hasAttribute('disabled')).toBe(false)
    expect(subTriggers()[0]?.getAttribute('tabindex')).toBe('-1')

    wrapper.unmount()
  })

  it('пункт с children не эмитит select: он раскрывает подменю', async () => {
    const wrapper = mountMenu()

    click(trigger('Экспорт'))
    await nextTick()

    expect(wrapper.emitted('select')).toBeUndefined()
    expect(trigger('Экспорт').getAttribute('aria-expanded')).toBe('true')

    wrapper.unmount()
  })
})

describe('GrDropdownMenu — клавиатура подменю', () => {
  it('ArrowRight раскрывает подменю и ведёт на его первый пункт', async () => {
    const wrapper = mountMenu()

    trigger('Экспорт').focus()
    press('ArrowRight')
    await nextTick()
    await nextTick()

    expect(visibleSubmenus()).toHaveLength(1)
    expect(labelsIn(visibleSubmenus()[0])).toEqual(['PDF', 'CSV'])
    expect(document.activeElement?.textContent?.trim()).toBe('PDF')

    wrapper.unmount()
  })

  it('стрелки внутри подменю ходят по его собственным пунктам', async () => {
    const wrapper = mountMenu()

    trigger('Экспорт').focus()
    press('ArrowRight')
    await nextTick()
    await nextTick()

    press('ArrowDown')
    expect(document.activeElement?.textContent?.trim()).toBe('CSV')
    press('ArrowDown')
    expect(document.activeElement?.textContent?.trim()).toBe('PDF')

    wrapper.unmount()
  })

  it('ArrowLeft закрывает подменю и возвращает фокус раскрывателю', async () => {
    const wrapper = mountMenu()

    trigger('Экспорт').focus()
    press('ArrowRight')
    await nextTick()
    await nextTick()

    press('ArrowLeft')
    await nextTick()

    expect(visibleSubmenus()).toHaveLength(0)
    expect(document.activeElement).toBe(trigger('Экспорт'))

    wrapper.unmount()
  })

  it('Escape закрывает только подменю — корневое меню остаётся', async () => {
    const wrapper = mountMenu({ open: undefined })

    trigger('Экспорт').focus()
    press('ArrowRight')
    await nextTick()
    await nextTick()

    press('Escape')
    await nextTick()

    expect(visibleSubmenus()).toHaveLength(0)
    expect(wrapper.emitted('update:open')).toBeUndefined()

    wrapper.unmount()
  })
})

describe('GrDropdownMenu — цепочка уровней', () => {
  it('выбор в подменю эмитит select и закрывает всё меню', async () => {
    const wrapper = mountMenu()

    click(trigger('Экспорт'))
    await nextTick()
    await nextTick()

    const pdf = [...visibleSubmenus()[0].querySelectorAll<HTMLElement>('[data-gr-dropdown-menu-item]')][0]
    pdf?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({ key: 'pdf' })
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false])

    wrapper.unmount()
  })

  it('при close-on-content-click=false выбор в подменю меню не закрывает', async () => {
    const wrapper = mountMenu({ closeOnContentClick: false })

    click(trigger('Экспорт'))
    await nextTick()
    await nextTick()

    const pdf = [...visibleSubmenus()[0].querySelectorAll<HTMLElement>('[data-gr-dropdown-menu-item]')][0]
    pdf?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()

    expect(wrapper.emitted('select')?.at(-1)?.[0]).toMatchObject({ key: 'pdf' })
    expect(wrapper.emitted('update:open')).toBeUndefined()

    wrapper.unmount()
  })

  it('раскрытие соседнего подменю закрывает предыдущее', async () => {
    const wrapper = mountMenu()

    click(trigger('Экспорт'))
    await nextTick()
    expect(visibleSubmenus()).toHaveLength(1)

    click(trigger('Поделиться'))
    await nextTick()
    await nextTick()

    expect(visibleSubmenus()).toHaveLength(1)
    expect(labelsIn(visibleSubmenus()[0])).toEqual(['Ссылкой'])

    wrapper.unmount()
  })

  it('сосед, раскрытый наведением, гасит предыдущее подменю немедленно', async () => {
    // Задержка закрытия у первого ещё тикает, когда второе уже раскрылось:
    // без явной связи уровней на экране висели бы две панели сразу.
    vi.useFakeTimers()
    const wrapper = mountMenu()

    hoverEnter(trigger('Экспорт'))
    vi.advanceTimersByTime(120)
    await nextTick()
    expect(labelsIn(visibleSubmenus()[0])).toEqual(['PDF', 'CSV'])
    stubRect(visibleSubmenus()[0])

    // Порядок событий браузерный: `mouseenter` соседа приходит **до** первого
    // `pointermove` на нём, то есть пока коридор ещё жив.
    hoverLeave(trigger('Экспорт'), { x: 100, y: 50 })
    hoverEnter(trigger('Поделиться'))
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 100, clientY: 900 }))
    vi.advanceTimersByTime(120)
    await nextTick()
    await nextTick()

    expect(visibleSubmenus().map(labelsIn)).toEqual([['Ссылкой']])

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('курсор, идущий к раскрытой панели, её не теряет', async () => {
    vi.useFakeTimers()
    const wrapper = mountMenu()

    hoverEnter(trigger('Экспорт'))
    vi.advanceTimersByTime(120)
    await nextTick()

    stubRect(visibleSubmenus()[0])

    hoverLeave(trigger('Экспорт'), { x: 100, y: 50 })
    // Точка на пути к панели: между точкой ухода и её левым краем.
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 170, clientY: 70 }))
    vi.advanceTimersByTime(300)
    await nextTick()

    expect(visibleSubmenus().map(labelsIn)).toEqual([['PDF', 'CSV']])

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('первое же движение сразу после ухода коридор не рвёт', async () => {
    // Клин коридора у точки ухода вырождается в вершину, и без устья событие в
    // полпикселя от неё оказывалось «мимо»: коридор рвался, не начавшись.
    vi.useFakeTimers()
    const wrapper = mountMenu()

    hoverEnter(trigger('Экспорт'))
    vi.advanceTimersByTime(120)
    await nextTick()

    stubRect(visibleSubmenus()[0])

    hoverLeave(trigger('Экспорт'), { x: 100, y: 50 })
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 100.6, clientY: 50.8 }))
    vi.advanceTimersByTime(200)
    await nextTick()

    expect(visibleSubmenus().map(labelsIn)).toEqual([['PDF', 'CSV']])

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('уход курсора в подменю третьего уровня не закрывает второй', async () => {
    // Панель третьего уровня — брат второй в портале, а не её потомок: уходя
    // туда, курсор покидает вторую панель, и та закрылась бы по своей задержке,
    // унеся с собой ту, в которую пользователь как раз идёт.
    vi.useFakeTimers()
    const wrapper = mountMenu({
      items: [{
        key: 'export',
        label: 'Экспорт',
        children: [{ key: 'image', label: 'Картинкой', children: [{ key: 'png', label: 'PNG' }] }],
      }],
    })

    hoverEnter(trigger('Экспорт'))
    vi.advanceTimersByTime(120)
    await nextTick()

    // Путь курсора как в браузере: с пункта на его панель, оттуда на пункт
    // следующего уровня и на его панель.
    hoverLeave(trigger('Экспорт'), { x: 200, y: 60 })
    enterList(panelWith('Картинкой'))
    hoverEnter(trigger('Картинкой'))
    vi.advanceTimersByTime(120)
    await nextTick()
    await nextTick()
    expect(visibleSubmenus().map(labelsIn)).toEqual([['PNG'], ['Картинкой']])

    hoverLeave(trigger('Картинкой'), { x: 400, y: 60 })
    leaveList(panelWith('Картинкой'))
    enterList(panelWith('PNG'))
    vi.advanceTimersByTime(400)
    await nextTick()

    expect(visibleSubmenus().map(labelsIn)).toEqual([['PNG'], ['Картинкой']])

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('уйдя с третьего уровня, курсор уносит и второй', async () => {
    // Обратная сторона предыдущего: закрытие второго уровня отложено, пока
    // раскрыт третий, — и обязано состояться, когда тот ушёл. Иначе панель
    // остаётся висеть после того, как курсор покинул всё меню.
    vi.useFakeTimers()
    const wrapper = mountMenu({
      items: [{
        key: 'export',
        label: 'Экспорт',
        children: [{ key: 'image', label: 'Картинкой', children: [{ key: 'png', label: 'PNG' }] }],
      }],
    })

    hoverEnter(trigger('Экспорт'))
    vi.advanceTimersByTime(120)
    await nextTick()
    hoverLeave(trigger('Экспорт'), { x: 200, y: 60 })
    enterList(panelWith('Картинкой'))
    hoverEnter(trigger('Картинкой'))
    vi.advanceTimersByTime(120)
    await nextTick()
    await nextTick()

    hoverLeave(trigger('Картинкой'), { x: 400, y: 60 })
    leaveList(panelWith('Картинкой'))
    enterList(panelWith('PNG'))
    vi.advanceTimersByTime(200)
    await nextTick()

    leaveList(panelWith('PNG'))
    vi.advanceTimersByTime(200)
    await nextTick()
    await nextTick()

    expect(visibleSubmenus()).toHaveLength(0)

    vi.useRealTimers()
    wrapper.unmount()
  })

  const RETURNS = [
    ['раскрыватель', () => hoverEnter(trigger('Экспорт'))],
    ['свою панель', () => enterList(panelWith('Картинкой'))],
  ] as const

  it.each(RETURNS)('курсор, вернувшийся на %s, отменяет отложенное закрытие', async (_where, back) => {
    vi.useFakeTimers()
    const wrapper = mountMenu({
      items: [{
        key: 'export',
        label: 'Экспорт',
        children: [{ key: 'image', label: 'Картинкой', children: [{ key: 'png', label: 'PNG' }] }],
      }],
    })

    hoverEnter(trigger('Экспорт'))
    vi.advanceTimersByTime(120)
    await nextTick()
    hoverLeave(trigger('Экспорт'), { x: 200, y: 60 })
    enterList(panelWith('Картинкой'))
    hoverEnter(trigger('Картинкой'))
    vi.advanceTimersByTime(120)
    await nextTick()
    await nextTick()

    hoverLeave(trigger('Картинкой'), { x: 400, y: 60 })
    leaveList(panelWith('Картинкой'))
    enterList(panelWith('PNG'))
    vi.advanceTimersByTime(200)
    await nextTick()

    // Курсор вернулся на второй уровень — закрывать под ним нечего.
    back()
    leaveList(panelWith('PNG'))
    vi.advanceTimersByTime(400)
    await nextTick()
    await nextTick()

    expect(visibleSubmenus().map(labelsIn)).toEqual([['Картинкой']])

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('курсор, ушедший мимо панели, подменю закрывает', async () => {
    vi.useFakeTimers()
    const wrapper = mountMenu()

    hoverEnter(trigger('Экспорт'))
    vi.advanceTimersByTime(120)
    await nextTick()

    stubRect(visibleSubmenus()[0])

    hoverLeave(trigger('Экспорт'), { x: 100, y: 50 })
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 100, clientY: 900 }))
    vi.advanceTimersByTime(300)
    await nextTick()

    expect(visibleSubmenus()).toHaveLength(0)

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('закрытие корневого меню уносит раскрытое подменю', async () => {
    const wrapper = mountMenu({ open: true })

    click(trigger('Экспорт'))
    await nextTick()
    expect(visibleSubmenus()).toHaveLength(1)

    await wrapper.setProps({ open: false })
    await nextTick()

    expect(visibleSubmenus()).toHaveLength(0)

    wrapper.unmount()
  })

  it('третий уровень раскрывается, и клик по его раскрывателю цепочку не рушит', async () => {
    const wrapper = mountMenu({
      items: [{
        key: 'export',
        label: 'Экспорт',
        children: [{
          key: 'image',
          label: 'Картинкой',
          children: [{ key: 'png', label: 'PNG' }],
        }],
      }],
    })

    click(trigger('Экспорт'))
    await nextTick()
    await nextTick()

    click(trigger('Картинкой'))
    await nextTick()
    await nextTick()

    expect(visibleSubmenus()).toHaveLength(2)
    expect(wrapper.emitted('update:open')?.at(-1)).not.toEqual([false])

    wrapper.unmount()
  })
})

describe('GrDropdownMenuSub — сам по себе', () => {
  it('вне меню монтируется и раскрывается: контекст инжектится с null', async () => {
    const wrapper = mount(GrDropdownMenuSub, {
      attachTo: document.body,
      props: { label: 'Ещё' },
      slots: { default: '<button type="button" data-testid="deep">Пункт</button>' },
    })
    await nextTick()

    click(trigger('Ещё'))
    await nextTick()

    expect(visibleSubmenus()).toHaveLength(1)

    wrapper.unmount()
  })

  it('выключенный раскрыватель не раскрывается', async () => {
    const wrapper = mount(GrDropdownMenuSub, {
      attachTo: document.body,
      props: { label: 'Ещё', disabled: true },
      slots: { default: '<button type="button">Пункт</button>' },
    })

    await nextTick()

    click(trigger('Ещё'))
    trigger('Ещё').focus()
    press('ArrowRight')
    await nextTick()

    expect(visibleSubmenus()).toHaveLength(0)

    wrapper.unmount()
  })
})

describe('GrDropdownMenu — предупреждения о модели', () => {
  it('children вместе с href — предупреждение: пункт не может быть и ссылкой, и раскрывателем', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountMenu({
      items: [{ key: 'export', label: 'Экспорт', href: '/export', children: [{ key: 'pdf', label: 'PDF' }] }],
    })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('href'))

    warn.mockRestore()
    wrapper.unmount()
  })

  it('children вместе с ролью-переключателем — предупреждение', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountMenu({
      items: [{ key: 'view', label: 'Вид', role: 'menuitemcheckbox', checked: true, children: [{ key: 'grid', label: 'Сетка' }] }],
    })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('menuitemcheckbox'))

    warn.mockRestore()
    wrapper.unmount()
  })

  it('обычное подменю молчит', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountMenu()

    expect(warn).not.toHaveBeenCalled()

    warn.mockRestore()
    wrapper.unmount()
  })
})
