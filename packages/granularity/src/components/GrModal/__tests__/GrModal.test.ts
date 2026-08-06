import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@headlessui/vue', async () => {
  const { defineComponent, onBeforeUnmount, onMounted } = await import('vue')

  return {
    // Escape мок намеренно НЕ превращает в `@close`: общий стек слоёв гасит
    // нажатие в capture-фазе на `window`, и до `<Dialog>` оно не доходит.
    // Мок, эмулирующий обратное, проверял бы путь, которого в проде нет.
    Dialog: defineComponent({
      name: 'Dialog',
      emits: ['close'],
      props: {
        as: { type: String, default: 'div' },
        initialFocus: { type: Object, default: null },
      },
      template: '<div data-testid="hu-dialog"><slot /></div>',
    }),
    DialogPanel: defineComponent({
      name: 'DialogPanel',
      template: '<div data-testid="hu-panel"><slot /></div>',
    }),
    DialogTitle: defineComponent({
      name: 'DialogTitle',
      template: '<div data-testid="hu-title"><slot /></div>',
    }),
    DialogDescription: defineComponent({
      name: 'DialogDescription',
      template: '<div data-testid="hu-description"><slot /></div>',
    }),
    TransitionRoot: defineComponent({
      name: 'TransitionRoot',
      props: { show: { type: Boolean, default: false } },
      template: '<div v-if="show"><slot /></div>',
    }),
    // `after-enter`/`after-leave` мок эмитит сразу: настоящих транзишнов в
    // jsdom нет, а проверяем мы проводку событий наружу, а не тайминг.
    // `TransitionChild` монтируется вместе с открытием и размонтируется с
    // закрытием, поэтому событие привязано к жизненному циклу, а не к пропу.
    TransitionChild: defineComponent({
      name: 'TransitionChild',
      emits: ['after-enter', 'after-leave'],
      setup(_, { emit }) {
        onMounted(() => emit('after-enter'))
        onBeforeUnmount(() => emit('after-leave'))
      },
      template: '<div><slot /></div>',
    }),
  }
})

import GrModal from '../GrModal.vue'
import { overlayStackSize, pushOverlayLayer, resetOverlayStack } from '../../../composables/internal/overlayStack'

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

function mountHarness(options: HarnessOptions = {}) {
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

  return mount(Harness, {
    props: {
      closeOnBackdrop: options.closeOnBackdrop ?? true,
      closeOnEsc: options.closeOnEsc ?? true,
      size: options.size ?? 'md',
      scrollBehavior: options.scrollBehavior ?? 'outside',
      ariaLabel: options.ariaLabel,
    },
    global: {
      stubs: { teleport: true },
    },
  })
}

describe('granularity/GrModal (unit)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    resetOverlayStack()
  })

  it('помечает корень inert, когда поверх открыта другая модалка (не верхнее окно)', async () => {
    const wrapper = mountHarness()
    const dialog = wrapper.find('[data-testid="hu-dialog"]')

    // Пока окно верхнее — inert не выставлен.
    expect(dialog.attributes('inert')).toBeUndefined()

    // Открываем «поверх» ещё одну модалку: текущее окно перестаёт быть верхним.
    pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {} })
    await nextTick()

    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('inert')).toBe('')

    wrapper.unmount()
  })

  it('рендерит оверлей ниже панели, aria-hidden и дефолтный размер md', () => {
    const wrapper = mountHarness()

    const overlay = wrapper.find('[data-gr-modal-overlay]')
    const panel = wrapper.find('[data-gr-modal-panel]')

    expect(overlay.exists()).toBe(true)
    expect(panel.exists()).toBe(true)

    expect(overlay.attributes('class')).toContain('z-0')
    expect(overlay.attributes('aria-hidden')).toBe('true')

    expect(panel.attributes('class')).toContain('relative')
    expect(panel.attributes('class')).toContain('z-10')
    expect(panel.attributes('class')).toContain('max-w-[560px]')

    wrapper.unmount()
  })

  it('закрывается по Esc, когда closeOnEsc=true (по умолчанию)', async () => {
    const wrapper = mountHarness()

    pressEscape()
    await nextTick()

    expect(wrapper.find('[data-gr-modal-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('не закрывается по Esc, если closeOnEsc=false', async () => {
    const wrapper = mountHarness({ closeOnEsc: false })

    pressEscape()
    await nextTick()

    expect(wrapper.find('[data-gr-modal-panel]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('Esc закрывает даже при closeOnBackdrop=false (независимость флагов)', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: false, closeOnEsc: true })

    pressEscape()
    await nextTick()

    expect(wrapper.find('[data-gr-modal-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('закрывается по клику на оверлей, если closeOnBackdrop=true', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: true })

    wrapper.findComponent({ name: 'Dialog' }).vm.$emit('close')
    await nextTick()

    expect(wrapper.find('[data-gr-modal-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('не закрывается по клику на оверлей, если closeOnBackdrop=false', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: false })

    wrapper.findComponent({ name: 'Dialog' }).vm.$emit('close')
    await nextTick()

    expect(wrapper.find('[data-gr-modal-panel]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('размер full раскрывает окно во весь экран: панель без полей и без радиуса', () => {
    const wrapper = mountHarness({ size: 'full' })

    const panelClass = wrapper.find('[data-gr-modal-panel]').attributes('class')

    expect(panelClass).toContain('max-w-none')
    expect(panelClass).toContain('h-full')
    expect(panelClass).toContain('rounded-none')

    // Паддинг оболочки при `full` снимается: вместе с `h-full` он дал бы панель
    // выше вьюпорта и лишний скролл.
    const shell = wrapper.find('[data-testid="hu-dialog"]').element.firstElementChild as HTMLElement
    expect(shell.className).not.toContain('p-4')

    wrapper.unmount()
  })

  it('при остальных размерах оболочка сохраняет поля вокруг панели', () => {
    const wrapper = mountHarness({ size: 'md' })

    const shell = wrapper.find('[data-testid="hu-dialog"]').element.firstElementChild as HTMLElement
    expect(shell.className).toContain('p-4')

    wrapper.unmount()
  })

  it('рендерит контент напрямую внутри панели без header/footer и кнопки закрытия', () => {
    const wrapper = mountHarness()

    expect(wrapper.find('[data-gr-dialog-header]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-dialog-footer]').exists()).toBe(false)
    expect(wrapper.find('button[aria-label="Close"]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-modal-panel] [data-testid="modal-body"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('рендерит слоты #title и #description как DialogTitle/Description, только если переданы', () => {
    const wrapperEmpty = mountHarness()
    expect(wrapperEmpty.find('[data-gr-modal-title]').exists()).toBe(false)
    expect(wrapperEmpty.find('[data-gr-modal-description]').exists()).toBe(false)
    wrapperEmpty.unmount()

    const wrapper = mountHarness({ withTitleSlot: true, withDescriptionSlot: true })
    expect(wrapper.find('[data-gr-modal-title]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-modal-description]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="title-slot"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="description-slot"]').exists()).toBe(true)
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
      template: `<GrModal v-model="open"><div>body</div></GrModal>`,
    })

    const wrapper = mount(Harness, {
      global: { stubs: { teleport: true } },
    })

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
    vi.restoreAllMocks()
  })

  it('со слотом #title имя даёт aria-labelledby, свой aria-label не ставится', () => {
    const wrapper = mountHarness({ withTitleSlot: true })

    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('aria-label')).toBeUndefined()
    expect(wrapper.find('[data-gr-modal-title]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('без слота #title имя берётся из пропа ariaLabel', () => {
    const wrapper = mountHarness({ ariaLabel: 'Настройки профиля' })

    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('aria-label')).toBe('Настройки профиля')

    wrapper.unmount()
  })

  it('без заголовка и без ariaLabel окно всё равно не остаётся безымянным', () => {
    // Иначе axe роняет `aria-dialog-name` (critical), а диктор объявляет
    // «диалог» без единого слова о том, какой именно.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mountHarness()

    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('aria-label')).toBe('Dialog')
    expect(warn).toHaveBeenCalledOnce()

    wrapper.unmount()
  })
})

describe('GrModal — жизненный цикл и раскладка', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    resetOverlayStack()
  })

  it('эмитит opened/closed после анимации', async () => {
    // Без `teleport`-стаба: он пересоздаёт поддерево на каждом ре-рендере, и
    // инстанс транзишна не доживает до перехода «открыто → закрыто».
    const wrapper = mount(GrModal, {
      attachTo: document.body,
      props: { modelValue: false, ariaLabel: 'X' },
      slots: { default: '<div />' },
    })

    await wrapper.setProps({ modelValue: true })
    expect(wrapper.emitted('opened')).toHaveLength(1)
    expect(wrapper.emitted('closed')).toBeUndefined()

    await wrapper.setProps({ modelValue: false })
    expect(wrapper.emitted('closed')).toHaveLength(1)

    wrapper.unmount()
  })

  it('initialFocus перебивает панель по умолчанию', () => {
    const target = document.createElement('button')
    document.body.appendChild(target)

    const wrapper = mount(defineComponent({
      components: { GrModal },
      props: { target: { type: Object, default: null } },
      setup: () => ({ open: ref(true) }),
      template: '<GrModal v-model="open" aria-label="X" :initial-focus="target"><div /></GrModal>',
    }), { props: { target }, global: { stubs: { teleport: true } } })

    expect(wrapper.findComponent({ name: 'Dialog' }).props('initialFocus')).toBe(target)

    wrapper.unmount()
    target.remove()
  })

  it('scrollBehavior решает, кто скроллится: оверлей или сама панель', () => {
    // Оболочка — первый потомок корня `<Dialog>`, за ней раскладка.
    const shellOf = (w: ReturnType<typeof mountHarness>) =>
      w.find('[data-testid="hu-dialog"]').element.firstElementChild as HTMLElement

    const outside = mountHarness({ ariaLabel: 'X' })
    expect(shellOf(outside).className).toContain('overflow-y-auto')
    expect(outside.find('[data-gr-modal-panel]').attributes('class')).toContain('overflow-hidden')
    outside.unmount()

    const inside = mountHarness({ ariaLabel: 'X', scrollBehavior: 'inside' })
    expect(shellOf(inside).className).toContain('overflow-hidden')
    expect(inside.find('[data-gr-modal-panel]').attributes('class')).toContain('max-h-full')

    // Скроллится тело, а не панель целиком: заголовок обязан остаться на месте.
    expect(inside.find('[data-gr-modal-body]').attributes('class')).toContain('overflow-y-auto')
    inside.unmount()
  })

  it('скроллящееся тело попадает в таб-порядок, нескроллящееся — нет', () => {
    const inside = mountHarness({ ariaLabel: 'X', scrollBehavior: 'inside' })
    expect(inside.find('[data-gr-modal-body]').attributes('tabindex')).toBe('0')
    inside.unmount()

    const outside = mountHarness({ ariaLabel: 'X' })
    expect(outside.find('[data-gr-modal-body]').exists()).toBe(false)
    outside.unmount()
  })

  it('слоты #header и #footer рендерятся вне скроллящегося тела', () => {
    const wrapper = mountHarness({ ariaLabel: 'X', scrollBehavior: 'inside', withSectionSlots: true })

    const body = wrapper.find('[data-gr-modal-body]')
    const header = wrapper.find('[data-gr-modal-header]')
    const footer = wrapper.find('[data-gr-modal-footer]')

    expect(header.find('[data-testid="header-slot"]').exists()).toBe(true)
    expect(footer.find('[data-testid="footer-slot"]').exists()).toBe(true)
    expect(body.find('[data-testid="header-slot"]').exists()).toBe(false)
    expect(body.find('[data-testid="footer-slot"]').exists()).toBe(false)

    // Сжиматься в колонке должно тело, а не закреплённые секции.
    expect(header.attributes('class')).toContain('shrink-0')
    expect(footer.attributes('class')).toContain('shrink-0')

    wrapper.unmount()
  })

  it('без слотов секций обёртки шапки и подвала не появляются', () => {
    const wrapper = mountHarness({ ariaLabel: 'X' })

    expect(wrapper.find('[data-gr-modal-header]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-modal-footer]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('снимает слой со стека при размонтировании без закрытия', () => {
    const wrapper = mountHarness({ ariaLabel: 'X' })
    expect(overlayStackSize()).toBe(1)

    wrapper.unmount()
    expect(overlayStackSize()).toBe(0)
  })
})
