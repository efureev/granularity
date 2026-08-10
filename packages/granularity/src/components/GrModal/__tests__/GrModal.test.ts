import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrModal from '../GrModal.vue'
import { overlayStackSize, pushOverlayLayer, resetOverlayStack } from '../../../composables/internal/overlayStack'
import { resetScrollLock } from '../../../composables/internal/useScrollLock'

/**
 * Мока `@headlessui/vue` здесь больше нет — и это половина смысла файла.
 * Пока он был, ловушка фокуса, `aria-modal`, `aria-labelledby` и клик по
 * подложке проверялись против заглушки, то есть не проверялись вовсе.
 */

interface HarnessOptions {
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  scrollBehavior?: 'outside' | 'inside'
  ariaLabel?: string
  withTitleSlot?: boolean
  withDescriptionSlot?: boolean
  withSectionSlots?: boolean
}

/** Escape приходит так же, как в проде: через общий стек слоёв на `window`. */
function pressEscape(): void {
  window.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  }))
}

/**
 * Дожидается конца leave-анимации.
 *
 * Транзишн держит поддеревo до `@after-leave`, а Vue переключает фазы через
 * `requestAnimationFrame` — одного `nextTick` для «панель исчезла» мало.
 */
async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
    await nextTick()
  }
}

/**
 * Хелпер асинхронный: поддерево слоя появляется на такт позже монтирования —
 * телепорт включается только после маунта, чтобы серверный рендер и первый
 * клиентский совпадали (см. `useTeleportEnabled`).
 */
async function mountHarness(options: HarnessOptions = {}) {
  const slots: Record<string, string> = {
    default: '<div data-testid="modal-body">Body</div>',
  }
  if (options.withTitleSlot)
    slots.title = '<span data-testid="title-slot">Title</span>'
  if (options.withDescriptionSlot)
    slots.description = '<span data-testid="description-slot">Desc</span>'
  if (options.withSectionSlots) {
    slots.header = '<div data-testid="header-slot">Header</div>'
    slots.footer = '<div data-testid="footer-slot">Footer</div>'
  }

  const Harness = defineComponent({
    name: 'Harness',
    components: { GrModal },
    props: {
      closeOnBackdrop: { type: Boolean, default: true },
      closeOnEsc: { type: Boolean, default: true },
      size: { type: String, default: 'md' },
      scrollBehavior: { type: String, default: 'outside' },
      ariaLabel: { type: String, default: undefined },
    },
    setup() {
      const open = ref(true)
      return { open }
    },
    template: `
      <GrModal
        v-model="open"
        :close-on-backdrop="closeOnBackdrop"
        :close-on-esc="closeOnEsc"
        :size="size"
        :scroll-behavior="scrollBehavior"
        :aria-label="ariaLabel"
      >
        ${Object.entries(slots)
          .map(([name, html]) =>
            name === 'default'
              ? html
              : `<template #${name}>${html}</template>`,
          )
          .join('\n')}
      </GrModal>
    `,
  })

  const wrapper = mount(Harness, {
    props: {
      closeOnBackdrop: options.closeOnBackdrop ?? true,
      closeOnEsc: options.closeOnEsc ?? true,
      size: options.size ?? 'md',
      scrollBehavior: options.scrollBehavior ?? 'outside',
      ariaLabel: options.ariaLabel,
    },
    attachTo: document.body,
    global: { stubs: { transition: false } },
  })

  await nextTick()
  return wrapper
}

/**
 * Панель и подложка живут в `body` (телепорт), поэтому ищем их по документу:
 * `wrapper.find` смотрит только внутрь дерева обёртки.
 */
function q<T extends Element = HTMLElement>(selector: string): T | null {
  return document.querySelector<T>(selector)
}

function exists(selector: string): boolean {
  return q(selector) !== null
}

/** Клик по подложке так, как его делает пользователь: mousedown и следом click. */
function clickBackdrop(overlay: Element): void {
  overlay.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
  overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

describe('granularity/GrModal (unit)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    resetOverlayStack()
    resetScrollLock()
  })

  it('объявляет себя модальным диалогом', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X' })
    const dialog = document.querySelector('[data-gr-overlay-root]')!

    expect(dialog.getAttribute('role')).toBe('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')

    wrapper.unmount()
  })

  it('помечает корень inert, когда поверх открыта другая модалка (не верхнее окно)', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X' })
    const dialog = document.querySelector('[data-gr-overlay-root]')!

    // Пока окно верхнее — inert не выставлен.
    expect(dialog.hasAttribute('inert')).toBe(false)

    // Открываем «поверх» ещё одну модалку: текущее окно перестаёт быть верхним.
    pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {} })
    await nextTick()

    expect(dialog.hasAttribute('inert')).toBe(true)

    wrapper.unmount()
  })

  it('убирает остальную страницу из таб-порядка и дерева доступности', async () => {
    const page = document.createElement('main')
    page.innerHTML = '<button data-testid="page-button">под окном</button>'
    document.body.appendChild(page)

    const wrapper = await mountHarness({ ariaLabel: 'X' })
    await nextTick()

    expect(page.hasAttribute('inert')).toBe(true)
    expect(page.getAttribute('aria-hidden')).toBe('true')

    wrapper.unmount()
    await nextTick()

    expect(page.hasAttribute('inert')).toBe(false)
    expect(page.hasAttribute('aria-hidden')).toBe(false)
  })

  it('рендерит оверлей ниже панели, aria-hidden и дефолтный размер md', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X' })

    const overlay = q('[data-gr-modal-overlay]')!
    const panel = q('[data-gr-modal-panel]')!

    expect(overlay).not.toBeNull()
    expect(panel).not.toBeNull()

    expect(overlay.className).toContain('z-0')
    expect(overlay.getAttribute('aria-hidden')).toBe('true')

    expect(panel.className).toContain('relative')
    expect(panel.className).toContain('z-10')
    expect(panel.className).toContain('max-w-[560px]')

    wrapper.unmount()
  })

  it('закрывается по Esc, когда closeOnEsc=true (по умолчанию)', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X' })

    pressEscape()
    await settle()

    expect(exists('[data-gr-modal-panel]')).toBe(false)

    wrapper.unmount()
  })

  it('не закрывается по Esc, если closeOnEsc=false', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X', closeOnEsc: false })

    pressEscape()
    await settle()

    expect(exists('[data-gr-modal-panel]')).toBe(true)

    wrapper.unmount()
  })

  it('Esc закрывает даже при closeOnBackdrop=false (независимость флагов)', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X', closeOnBackdrop: false, closeOnEsc: true })

    pressEscape()
    await settle()

    expect(exists('[data-gr-modal-panel]')).toBe(false)

    wrapper.unmount()
  })

  it('закрывается по клику на подложку, если closeOnBackdrop=true', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X', closeOnBackdrop: true })

    clickBackdrop(q('[data-gr-modal-overlay]')!)
    await settle()

    expect(exists('[data-gr-modal-panel]')).toBe(false)

    wrapper.unmount()
  })

  it('не закрывается по клику на подложку, если closeOnBackdrop=false', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X', closeOnBackdrop: false })

    clickBackdrop(q('[data-gr-modal-overlay]')!)
    await settle()

    expect(exists('[data-gr-modal-panel]')).toBe(true)

    wrapper.unmount()
  })

  it('выделение текста, начатое в панели и отпущенное на подложке, окно не закрывает', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X' })

    const panel = q('[data-gr-modal-panel]')!
    const overlay = q('[data-gr-modal-overlay]')!

    panel.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await settle()

    expect(exists('[data-gr-modal-panel]')).toBe(true)

    wrapper.unmount()
  })

  it('размер full раскрывает окно во весь экран: панель без полей и без радиуса', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X', size: 'full' })

    const panelClass = q('[data-gr-modal-panel]')!.getAttribute('class')

    expect(panelClass).toContain('max-w-none')
    expect(panelClass).toContain('h-full')
    expect(panelClass).toContain('rounded-[var(--gr-radius-none)]')

    // Паддинг оболочки при `full` снимается: вместе с `h-full` он дал бы панель
    // выше вьюпорта и лишний скролл.
    const shell = document.querySelector('[data-gr-overlay-root]')!.firstElementChild as HTMLElement
    expect(shell.className).not.toContain('p-4')

    wrapper.unmount()
  })

  it('при остальных размерах оболочка сохраняет поля вокруг панели', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X', size: 'md' })

    const shell = document.querySelector('[data-gr-overlay-root]')!.firstElementChild as HTMLElement
    expect(shell.className).toContain('p-4')

    wrapper.unmount()
  })

  it('рендерит контент напрямую внутри панели без header/footer и кнопки закрытия', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X' })

    expect(exists('[data-gr-dialog-header]')).toBe(false)
    expect(exists('[data-gr-dialog-footer]')).toBe(false)
    expect(exists('button[aria-label="Close"]')).toBe(false)
    expect(exists('[data-gr-modal-panel] [data-testid="modal-body"]')).toBe(true)

    wrapper.unmount()
  })

  it('рендерит слоты #title и #description, только если переданы', async () => {
    const wrapperEmpty = await mountHarness({ ariaLabel: 'X' })
    expect(exists('[data-gr-modal-title]')).toBe(false)
    expect(exists('[data-gr-modal-description]')).toBe(false)
    wrapperEmpty.unmount()

    const wrapper = await mountHarness({ withTitleSlot: true, withDescriptionSlot: true })
    expect(exists('[data-gr-modal-title]')).toBe(true)
    expect(exists('[data-gr-modal-description]')).toBe(true)
    expect(exists('[data-testid="title-slot"]')).toBe(true)
    expect(exists('[data-testid="description-slot"]')).toBe(true)
    wrapper.unmount()
  })

  it('блокирует прокрутку body при открытии и восстанавливает при закрытии', async () => {
    document.body.style.overflow = 'auto'

    const Harness = defineComponent({
      components: { GrModal },
      setup() {
        const open = ref(false)
        return { open }
      },
      template: `<GrModal v-model="open" aria-label="X"><div>body</div></GrModal>`,
    })

    const wrapper = mount(Harness, { attachTo: document.body, global: { stubs: { transition: false } } })

    expect(document.body.style.overflow).toBe('auto')

    wrapper.vm.open = true
    await nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.vm.open = false
    await nextTick()
    expect(document.body.style.overflow).toBe('auto')

    wrapper.unmount()
  })
})

describe('GrModal — доступное имя', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    resetOverlayStack()
    resetScrollLock()
    vi.restoreAllMocks()
  })

  it('со слотом #title имя даёт aria-labelledby, свой aria-label не ставится', async () => {
    const wrapper = await mountHarness({ withTitleSlot: true })

    const dialog = document.querySelector('[data-gr-overlay-root]')!
    const title = q('[data-gr-modal-title]')!

    expect(dialog.getAttribute('aria-label')).toBeNull()
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id)
    expect(title.id).toBeTruthy()

    wrapper.unmount()
  })

  it('слот #description связывается через aria-describedby', async () => {
    const wrapper = await mountHarness({ withTitleSlot: true, withDescriptionSlot: true })

    const dialog = document.querySelector('[data-gr-overlay-root]')!
    expect(dialog.getAttribute('aria-describedby'))
      .toBe(q('[data-gr-modal-description]')!.getAttribute('id'))

    wrapper.unmount()
  })

  it('без слота #title имя берётся из пропа ariaLabel', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'Настройки профиля' })

    expect(document.querySelector('[data-gr-overlay-root]')!.getAttribute('aria-label'))
      .toBe('Настройки профиля')

    wrapper.unmount()
  })

  it('без заголовка и без ariaLabel окно всё равно не остаётся безымянным', async () => {
    // Иначе axe роняет `aria-dialog-name` (critical), а диктор объявляет
    // «диалог» без единого слова о том, какой именно.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = await mountHarness()

    expect(document.querySelector('[data-gr-overlay-root]')!.getAttribute('aria-label')).toBe('Dialog')
    expect(warn).toHaveBeenCalledOnce()

    wrapper.unmount()
  })
})

describe('GrModal — фокус', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    resetOverlayStack()
    resetScrollLock()
  })

  async function mountWithFields(initialFocus: HTMLElement | null = null) {
    const wrapper = mount(defineComponent({
      components: { GrModal },
      props: { target: { type: Object, default: null } },
      setup: () => ({ open: ref(true) }),
      template: `
        <GrModal v-model="open" aria-label="X" :initial-focus="target">
          <button data-testid="first">first</button>
          <button data-testid="last">last</button>
        </GrModal>
      `,
    }), {
      props: { target: initialFocus as unknown as Record<string, unknown> },
      attachTo: document.body,
      global: { stubs: { transition: false } },
    })

    await nextTick()
    return wrapper
  }

  it('по умолчанию фокус уходит на панель', async () => {
    const wrapper = await mountWithFields()
    await settle()

    expect(document.activeElement).toBe(document.querySelector('[data-gr-modal-panel]'))

    wrapper.unmount()
  })

  it('initialFocus перебивает панель по умолчанию', async () => {
    const wrapper = mount(defineComponent({
      components: { GrModal },
      setup() {
        const open = ref(true)
        const target = ref<HTMLElement | null>(null)
        return { open, target }
      },
      template: `
        <GrModal v-model="open" aria-label="X" :initial-focus="target">
          <button data-testid="first">first</button>
          <button ref="target" data-testid="second">second</button>
        </GrModal>
      `,
    }), { attachTo: document.body, global: { stubs: { transition: false } } })

    // Ссылка на элемент внутри окна появляется только после его рендера,
    // поэтому фокус проверяем после того, как слой устоялся.
    await settle()

    expect(document.activeElement).toBe(document.querySelector('[data-testid="second"]'))

    wrapper.unmount()
  })

  it('Tab ходит по кругу внутри окна', async () => {
    const wrapper = await mountWithFields()
    await settle()

    const first = document.querySelector<HTMLElement>('[data-testid="first"]')!
    const last = document.querySelector<HTMLElement>('[data-testid="last"]')!

    // С панели Tab заходит внутрь, а не выпрыгивает на страницу.
    first.focus()
    last.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    await nextTick()
    expect(document.activeElement).toBe(first)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    await nextTick()
    expect(document.activeElement).toBe(last)

    wrapper.unmount()
  })

  it('фокус, утёкший наружу, возвращается в окно', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    const wrapper = await mountWithFields()
    await settle()

    outside.focus()
    await nextTick()

    expect(document.activeElement).not.toBe(outside)
    expect(document.querySelector('[data-gr-modal-panel]')!.contains(document.activeElement)).toBe(true)

    wrapper.unmount()
    outside.remove()
  })

  it('панель другого слоя, открытого изнутри окна, фокус сохраняет', async () => {
    const wrapper = await mountWithFields()
    await settle()

    // Так ведёт себя панель `GrSelect`, открытая внутри модалки: она
    // телепортирована в `body`, но принадлежит слою выше.
    const panel = document.createElement('div')
    panel.innerHTML = '<button data-testid="option">option</button>'
    document.body.appendChild(panel)
    pushOverlayLayer({ modal: false, shouldClose: () => true, close: () => {}, root: () => panel })

    const option = panel.querySelector<HTMLElement>('[data-testid="option"]')!
    option.focus()
    await nextTick()

    expect(document.activeElement).toBe(option)

    wrapper.unmount()
    panel.remove()
  })

  it('возвращает фокус на триггер при закрытии', async () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()

    const wrapper = mount(defineComponent({
      components: { GrModal },
      setup: () => ({ open: ref(false) }),
      template: '<GrModal v-model="open" aria-label="X"><button>inside</button></GrModal>',
    }), { attachTo: document.body, global: { stubs: { transition: false } } })

    wrapper.vm.open = true
    await settle()
    expect(document.activeElement).not.toBe(trigger)

    wrapper.vm.open = false
    await settle()

    expect(document.activeElement).toBe(trigger)

    wrapper.unmount()
    trigger.remove()
  })
})

describe('GrModal — жизненный цикл и раскладка', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    resetOverlayStack()
    resetScrollLock()
  })

  it('эмитит opened/closed после анимации', async () => {
    const wrapper = mount(GrModal, {
      attachTo: document.body,
      props: { modelValue: false, ariaLabel: 'X' },
      slots: { default: '<div />' },
      global: { stubs: { transition: false } },
    })

    await wrapper.setProps({ modelValue: true })
    await settle()
    expect(wrapper.emitted('opened')).toHaveLength(1)
    expect(wrapper.emitted('closed')).toBeUndefined()

    await wrapper.setProps({ modelValue: false })
    await settle()
    expect(wrapper.emitted('closed')).toHaveLength(1)

    wrapper.unmount()
  })

  it('scrollBehavior решает, кто скроллится: оверлей или сама панель', async () => {
    const shellOf = () =>
      document.querySelector('[data-gr-overlay-root]')!.firstElementChild as HTMLElement

    const outside = await mountHarness({ ariaLabel: 'X' })
    expect(shellOf().className).toContain('overflow-y-auto')
    expect(q('[data-gr-modal-panel]')!.getAttribute('class')).toContain('overflow-hidden')
    outside.unmount()

    const inside = await mountHarness({ ariaLabel: 'X', scrollBehavior: 'inside' })
    expect(shellOf().className).toContain('overflow-hidden')
    expect(q('[data-gr-modal-panel]')!.getAttribute('class')).toContain('max-h-full')

    // Скроллится тело, а не панель целиком: заголовок обязан остаться на месте.
    expect(q('[data-gr-modal-body]')!.getAttribute('class')).toContain('overflow-y-auto')
    inside.unmount()
  })

  it('скроллящееся тело попадает в таб-порядок, нескроллящееся — нет', async () => {
    const inside = await mountHarness({ ariaLabel: 'X', scrollBehavior: 'inside' })
    expect(q('[data-gr-modal-body]')!.getAttribute('tabindex')).toBe('0')
    inside.unmount()

    const outside = await mountHarness({ ariaLabel: 'X' })
    expect(exists('[data-gr-modal-body]')).toBe(false)
    outside.unmount()
  })

  it('слоты #header и #footer рендерятся вне скроллящегося тела', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X', scrollBehavior: 'inside', withSectionSlots: true })

    const body = q('[data-gr-modal-body]')!
    const header = q('[data-gr-modal-header]')!
    const footer = q('[data-gr-modal-footer]')!

    expect(header.querySelector('[data-testid="header-slot"]')).not.toBeNull()
    expect(footer.querySelector('[data-testid="footer-slot"]')).not.toBeNull()
    expect(body.querySelector('[data-testid="header-slot"]')).toBeNull()
    expect(body.querySelector('[data-testid="footer-slot"]')).toBeNull()

    // Сжиматься в колонке должно тело, а не закреплённые секции.
    expect(header.className).toContain('shrink-0')
    expect(footer.className).toContain('shrink-0')

    wrapper.unmount()
  })

  it('без слотов секций обёртки шапки и подвала не появляются', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X' })

    expect(exists('[data-gr-modal-header]')).toBe(false)
    expect(exists('[data-gr-modal-footer]')).toBe(false)

    wrapper.unmount()
  })

  it('снимает слой со стека при размонтировании без закрытия', async () => {
    const wrapper = await mountHarness({ ariaLabel: 'X' })
    expect(overlayStackSize()).toBe(1)

    wrapper.unmount()
    expect(overlayStackSize()).toBe(0)
  })
})


describe('GrModal — императивный API', () => {
  it('open/close/toggle просят родителя, а не подменяют модель', async () => {
    const wrapper = mount(GrModal, { props: { modelValue: false, ariaLabel: 'X' } })
    const api = wrapper.vm as unknown as { open: () => void, close: () => void, toggle: () => void }

    api.open()
    api.toggle()
    api.close()

    // Окно управляемое: источник правды — родительский `v-model`, и методы
    // только просят его измениться. Своё состояние разошлось бы с ним.
    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [true], [false]])
    wrapper.unmount()
  })
})
