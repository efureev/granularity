import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { resetGranularityDom } from '../../../testing'
import GrContextMenu from '../GrContextMenu.vue'
import type { GrDropdownMenuEntry } from '../../GrDropdownMenu/menuModel'

/**
 * Контекстное меню отличается от дропдауна не содержимым, а тем, откуда оно
 * растёт: у точки курсора элемента нет. Отсюда и то, что здесь проверяется, —
 * разбор события, подавление нативного меню и клавиатурный путь, без которого
 * меню на правом клике недоступно в принципе.
 */
const items: GrDropdownMenuEntry[] = [
  { key: 'open', label: 'Открыть' },
  { key: 'rename', label: 'Переименовать' },
  { type: 'divider' },
  { key: 'delete', label: 'Удалить', variant: 'danger' },
]

const AREA = '<template #default><button data-row>Строка</button></template>'

let mounted: ReturnType<typeof mount> | null = null

function mountMenu(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  mounted = mount(GrContextMenu, {
    props: { items, ...props },
    slots: { default: AREA, ...slots },
    attachTo: document.body,
  })

  return mounted
}

afterEach(() => {
  // Панель телепортируется в портал и переживает размонтирование wrapper'а.
  // Чистить один `body` мало: корень портала кешируется модулем, и следующая
  // панель уехала бы в узел, вырезанный из документа.
  mounted?.unmount()
  mounted = null
  resetGranularityDom()
})

function panelEl(): HTMLElement | null {
  return document.body.querySelector('[data-gr-popover-panel]')
}

function isOpen(): boolean {
  const el = panelEl()
  return el !== null && el.style.display !== 'none'
}

function menuItems(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'))
}

/**
 * Клавиша уходит с того, что в фокусе. Диспатч на панель не годится: слушатель
 * висит на списке внутри неё, а всплытие идёт снизу вверх.
 */
function pressInMenu(key: string): void {
  document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
}

/**
 * Открытие асинхронно на два тика: компонент ждёт, пока доедут `items`,
 * пересобранные потребителем под цель, и только потом решает, что показывать.
 */
async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
  // Слушатель прокрутки навешивается со следующего кадра — ждём и его.
  await new Promise(resolve => requestAnimationFrame(resolve))
}

function rightClick(target: Element, init: MouseEventInit = {}): MouseEvent {
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    button: 2,
    detail: 1,
    clientX: 120,
    clientY: 240,
    ...init,
  })
  target.dispatchEvent(event)
  return event
}

describe('GrContextMenu — открытие указателем', () => {
  it('правый клик открывает меню и подавляет нативное', async () => {
    const wrapper = mountMenu()
    const event = rightClick(wrapper.get('[data-row]').element)
    await settle()

    expect(isOpen()).toBe(true)
    expect(event.defaultPrevented).toBe(true)
  })

  it('открытие отдаёт точку курсора и цель', async () => {
    const wrapper = mountMenu()
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    const [context] = wrapper.emitted('beforeOpen')?.[0] as [Record<string, unknown>]
    expect(context.source).toBe('pointer')
    expect(context.anchor).toEqual({ x: 120, y: 240 })
    expect((context.target as HTMLElement).dataset.row).toBe('')
  })

  /** В Firefox это документированный способ дотянуться до меню браузера. */
  it('Shift+правый клик отдаётся браузеру', async () => {
    const wrapper = mountMenu()
    const event = rightClick(wrapper.get('[data-row]').element, { shiftKey: true })
    await settle()

    expect(isOpen()).toBe(false)
    expect(event.defaultPrevented).toBe(false)
  })

  it('allowNativeMenu=false забирает и Shift', async () => {
    const wrapper = mountMenu({ allowNativeMenu: false })
    rightClick(wrapper.get('[data-row]').element, { shiftKey: true })
    await settle()

    expect(isOpen()).toBe(true)
  })

  it('trigger="manual" не реагирует на правый клик', async () => {
    const wrapper = mountMenu({ trigger: 'manual' })
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    expect(isOpen()).toBe(false)
  })

  it('disabled не открывается ни кликом, ни из кода', async () => {
    const wrapper = mountMenu({ disabled: true })
    rightClick(wrapper.get('[data-row]').element)
    await settle()
    expect(isOpen()).toBe(false)

    ;(wrapper.vm as unknown as { openAt: (p: { x: number, y: number }) => void }).openAt({ x: 1, y: 1 })
    await settle()
    expect(isOpen()).toBe(false)
  })

  /**
   * Пустое меню — клавиатурная ловушка: фокусировать нечего, а Esc пользователь
   * ещё должен догадаться нажать.
   */
  /**
   * Уведомление приходит до открытия — на этом держится сборка пунктов под
   * цель: потребитель ставит их в обработчике, и они успевают доехать пропом.
   */
  it('beforeOpen позволяет собрать пункты под цель', async () => {
    const wrapper = mount(GrContextMenu, {
      props: {
        items: [] as GrDropdownMenuEntry[],
        onBeforeOpen: () => {
          void wrapper.setProps({ items: [{ key: 'a', label: 'Действие' }] })
        },
      },
      slots: { default: AREA },
      attachTo: document.body,
    })
    mounted = wrapper

    rightClick(wrapper.get('[data-row]').element)
    await settle()

    expect(isOpen()).toBe(true)
    expect(menuItems()).toHaveLength(1)
  })

  it('меню без действий не открывается вовсе', async () => {
    const wrapper = mountMenu({ items: [{ type: 'divider' }] })
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    expect(isOpen()).toBe(false)
  })
})

describe('GrContextMenu — повторный вызов и закрытие', () => {
  it('правый клик по другой точке переносит меню, не закрывая его', async () => {
    const wrapper = mountMenu()
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    rightClick(wrapper.get('[data-row]').element, { clientX: 400, clientY: 500 })
    await settle()

    expect(isOpen()).toBe(true)
    const opened = wrapper.emitted('beforeOpen') ?? []
    expect(opened).toHaveLength(2)
    expect((opened[1]?.[0] as { anchor: unknown }).anchor).toEqual({ x: 400, y: 500 })
  })

  /**
   * `v-click-outside` отбрасывает всё, что не левая кнопка, а `contextmenu` не
   * порождает `click` — без своего слушателя меню осталось бы висеть.
   */
  it('правый клик вне области закрывает меню', async () => {
    const wrapper = mountMenu()
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    rightClick(document.body)
    await settle()

    expect(isOpen()).toBe(false)
  })

  it('левый клик вне закрывает меню', async () => {
    const wrapper = mountMenu()
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await settle()

    expect(isOpen()).toBe(false)
  })

  it('прокрутка страницы закрывает меню, прокрутка внутри панели — нет', async () => {
    const wrapper = mountMenu()
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    panelEl()?.dispatchEvent(new Event('scroll', { bubbles: true }))
    await settle()
    expect(isOpen()).toBe(true)

    window.dispatchEvent(new Event('scroll'))
    await settle()
    expect(isOpen()).toBe(false)
  })

  it('closeOnScroll=false оставляет меню открытым', async () => {
    const wrapper = mountMenu({ closeOnScroll: false })
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    window.dispatchEvent(new Event('scroll'))
    await settle()

    expect(isOpen()).toBe(true)
  })
})

describe('GrContextMenu — клавиатура', () => {
  async function openByKeyboard(wrapper: ReturnType<typeof mount>, key = 'F10') {
    const row = wrapper.get('[data-row]').element as HTMLElement
    row.focus()

    const event = new KeyboardEvent('keydown', {
      key,
      shiftKey: key === 'F10',
      bubbles: true,
      cancelable: true,
    })
    row.dispatchEvent(event)
    await settle()

    return event
  }

  it('Shift+F10 открывает меню у прямоугольника строки', async () => {
    const wrapper = mountMenu()
    const event = await openByKeyboard(wrapper)

    expect(isOpen()).toBe(true)
    // Отмена keydown гасит `contextmenu`, который браузер породил бы следом.
    expect(event.defaultPrevented).toBe(true)

    const context = wrapper.emitted('beforeOpen')?.[0]?.[0] as { source: string, anchor: Record<string, number> }
    expect(context.source).toBe('keyboard')
    // Якорь — прямоугольник, а не точка: меню принадлежит строке целиком.
    expect(context.anchor).toHaveProperty('width')
  })

  it('клавиша ContextMenu работает наравне с Shift+F10', async () => {
    const wrapper = mountMenu()
    await openByKeyboard(wrapper, 'ContextMenu')

    expect(isOpen()).toBe(true)
  })

  /**
   * `manual` отключает открытие указателем, а клавиатуру оставить обязан: иначе
   * композит вроде дерева, который открывает меню сам, оказался бы недоступен.
   */
  it('trigger="manual" клавиатурный путь не отключает', async () => {
    const wrapper = mountMenu({ trigger: 'manual' })
    await openByKeyboard(wrapper)

    expect(isOpen()).toBe(true)
  })

  it('в поле ввода клавиатурный вызов не перехватывается', async () => {
    const wrapper = mountMenu({}, { default: '<template #default><input data-field></template>' })
    const field = wrapper.get('[data-field]').element as HTMLElement
    field.focus()

    const event = new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true, cancelable: true })
    field.dispatchEvent(event)
    await settle()

    expect(isOpen()).toBe(false)
    expect(event.defaultPrevented).toBe(false)
  })

  it('после открытия фокус на первом пункте, стрелки водят по кольцу', async () => {
    const wrapper = mountMenu()
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    const list = menuItems()
    expect(document.activeElement).toBe(list[0])

    pressInMenu('ArrowDown')
    expect(document.activeElement).toBe(list[1])

    pressInMenu('End')
    expect(document.activeElement).toBe(list[list.length - 1])
  })

  it('Tab закрывает меню', async () => {
    const wrapper = mountMenu()
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    pressInMenu('Tab')
    await settle()

    expect(isOpen()).toBe(false)
  })

  it('поиск по первой букве переводит фокус на пункт', async () => {
    const wrapper = mountMenu()
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    pressInMenu('у')

    expect((document.activeElement as HTMLElement).textContent?.trim()).toBe('Удалить')
  })
})

describe('GrContextMenu — выбор и разметка', () => {
  it('панель объявлена меню и имеет доступное имя', async () => {
    const wrapper = mountMenu()
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    expect(panelEl()?.getAttribute('role')).toBe('menu')
    expect(panelEl()?.getAttribute('aria-label')).toBe('Context menu')
  })

  it('выбор пункта эмитит select и закрывает меню', async () => {
    const wrapper = mountMenu()
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    menuItems()[0]?.click()
    await settle()

    expect((wrapper.emitted('select')?.[0]?.[0] as { key: string }).key).toBe('open')
    expect(isOpen()).toBe(false)
  })

  it('выключенный пункт не выбирается и меню не закрывает', async () => {
    const wrapper = mountMenu({
      items: [{ key: 'open', label: 'Открыть', disabled: true }, { key: 'copy', label: 'Копировать' }],
    })
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    menuItems()[0]?.click()
    await settle()

    expect(wrapper.emitted('select')).toBeUndefined()
    expect(isOpen()).toBe(true)
  })

  it('openAt открывает у заданной точки без события мыши', async () => {
    const wrapper = mountMenu({ trigger: 'manual' })
    ;(wrapper.vm as unknown as { openAt: (p: { x: number, y: number }) => void }).openAt({ x: 30, y: 40 })
    await settle()

    expect(isOpen()).toBe(true)
    const context = wrapper.emitted('beforeOpen')?.[0]?.[0] as { source: string, anchor: unknown }
    expect(context.source).toBe('api')
    expect(context.anchor).toEqual({ x: 30, y: 40 })
  })

  it('v-model:open работает в обе стороны', async () => {
    const wrapper = mountMenu({ open: false, trigger: 'manual' })
    ;(wrapper.vm as unknown as { openAt: (p: { x: number, y: number }) => void }).openAt({ x: 5, y: 5 })
    await settle()

    // Контролируемый режим: сам компонент не открывается, пока родитель не сказал.
    expect(wrapper.emitted('update:open')?.[0]).toEqual([true])
    expect(isOpen()).toBe(false)

    await wrapper.setProps({ open: true })
    expect(isOpen()).toBe(true)
  })

  it('своё содержимое из слота заменяет модель', async () => {
    const wrapper = mountMenu(
      { items: undefined },
      { content: '<template #content><button data-custom>Своё</button></template>' },
    )
    rightClick(wrapper.get('[data-row]').element)
    await settle()

    expect(isOpen()).toBe(true)
    expect(document.body.querySelector('[data-custom]')).not.toBeNull()
  })
})
