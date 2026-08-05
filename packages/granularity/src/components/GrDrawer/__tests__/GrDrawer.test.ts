import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@headlessui/vue', async () => {
  const { defineComponent } = await import('vue')

  return {
    Dialog: defineComponent({
      name: 'Dialog',
      emits: ['close'],
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
    TransitionRoot: defineComponent({
      name: 'TransitionRoot',
      props: { show: { type: Boolean, default: false } },
      template: '<div v-if="show"><slot /></div>',
    }),
    TransitionChild: defineComponent({
      name: 'TransitionChild',
      template: '<div><slot /></div>',
    }),
  }
})

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrDrawer from '../GrDrawer.vue'
import { pushOverlayLayer, resetOverlayStack } from '../../../composables/internal/overlayStack'

afterEach(() => {
  resetOverlayStack()
})

type DrawerOptions = Record<string, unknown> & { componentDefaults?: Record<string, unknown> }

/**
 * Все пропы прокидываются как есть: тестам нужен не фиксированный набор, а
 * произвольная комбинация — от `persistent` до `headerConfig`.
 */
function mountHarness(options: DrawerOptions) {
  const { componentDefaults, ...drawerProps } = options

  const Drawer = defineComponent({
    name: 'Harness',
    components: { GrDrawer },
    setup() {
      const open = ref(true)
      return { open, drawerProps }
    },
    template: `
      <GrDrawer v-model="open" v-bind="drawerProps">
        <div data-testid="drawer-body">Body</div>
      </GrDrawer>
    `,
  })

  const Harness = componentDefaults === undefined
    ? Drawer
    : defineComponent({
        components: { GrConfigProvider, Drawer },
        setup: () => ({ componentDefaults }),
        template: `
          <GrConfigProvider :component-defaults="componentDefaults">
            <Drawer />
          </GrConfigProvider>
        `,
      })

  return mount(Harness, {
    global: {
      stubs: {
        teleport: true,
      },
    },
  })
}

describe('granularity/GrDrawer (unit)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('помечает корень inert, когда поверх открыт другой модальный слой', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: true, title: 'Filters' })

    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('inert')).toBeUndefined()

    pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {} })
    await nextTick()

    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('inert')).toBe('')

    wrapper.unmount()
  })

  it('рендерит правую панель по умолчанию с md-размером и заголовком', () => {
    const wrapper = mountHarness({ closeOnBackdrop: true, title: 'Filters' })

    const overlay = wrapper.find('[data-gr-drawer-overlay]')
    const panel = wrapper.find('[data-gr-drawer-panel]')

    expect(overlay.exists()).toBe(true)
    expect(overlay.attributes('class')).toContain('bg-[var(--gr-overlay-bg)]')
    expect(overlay.attributes('aria-hidden')).toBe('true')

    expect(panel.attributes('class')).toContain('right-0')
    expect(panel.attributes('class')).toContain('border-l')
    expect(panel.attributes('class')).toContain('w-[420px]')
    expect(panel.text()).toContain('Filters')
    expect(panel.find('[data-testid="drawer-body"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('закрывается по backdrop и ESC, если closeOnBackdrop=true', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: true, title: 'Filters', side: 'left', size: 'lg' })

    expect(wrapper.find('[data-gr-drawer-panel]').attributes('class')).toContain('left-0')
    expect(wrapper.find('[data-gr-drawer-panel]').attributes('class')).toContain('w-[560px]')

    await wrapper.find('[data-gr-drawer-overlay]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(false)

    wrapper.unmount()

    const escWrapper = mountHarness({ closeOnBackdrop: true, title: 'Filters' })

    // Esc обрабатывает общий стек оверлеев (window capture), а не локальный
    // обработчик на панели — поэтому диспатчим на уровне window, как в реальности.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(escWrapper.find('[data-gr-drawer-panel]').exists()).toBe(false)

    escWrapper.unmount()
  })

  it('не закрывается по backdrop-close, если closeOnBackdrop=false, но кнопка закрытия работает', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: false, title: 'Filters', size: 'full' })

    expect(wrapper.find('[data-gr-drawer-panel]').attributes('class')).toContain('w-[100vw]')

    await wrapper.find('[data-gr-drawer-overlay]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(true)

    await wrapper.find('button[aria-label="Close"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('живёт на модальном слое шкалы, а не на литерале ниже неё', () => {
    // `z-50` был ниже всей шкалы: панель dropdown (1000) рисовалась поверх
    // выехавшего drawer'а, а его бэкдроп её не перекрывал.
    const wrapper = mountHarness({ closeOnBackdrop: true, title: 'Filters' })

    expect(wrapper.find('[data-gr-drawer]').attributes('class')).toContain('z-[var(--gr-z-modal)]')

    wrapper.unmount()
  })

  it('блокирует скролл страницы, пока открыт, и отпускает при закрытии', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: true, title: 'Filters' })

    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.find('button[aria-label="Close"]').trigger('click')
    await nextTick()

    expect(document.body.style.overflow).toBe('')

    wrapper.unmount()
  })

  it('снимает блокировку скролла при размонтировании открытым', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: true, title: 'Filters' })
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    await nextTick()

    expect(document.body.style.overflow).toBe('')
  })

  it('persistent запрещает бэкдроп и Esc, но не кнопку закрытия', async () => {
    const wrapper = mountHarness({ closeOnBackdrop: true, title: 'Filters', persistent: true })

    await wrapper.find('[data-gr-drawer-overlay]').trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(true)

    // Панель без единого выхода — ловушка, поэтому кнопка закрытия работает.
    await wrapper.find('button[aria-label="Close"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('без заголовка и кнопки закрытия хедер не рендерится, а имя слоя остаётся', () => {
    const wrapper = mountHarness({ closeOnBackdrop: true, title: '', showCloseButton: false })

    expect(wrapper.find('[data-gr-drawer-header]').exists()).toBe(false)
    // Модальный слой без доступного имени — нарушение `aria-dialog-name`.
    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('aria-label')).toBe('Drawer')

    wrapper.unmount()
  })

  it('showHeader=false убирает хедер целиком, заголовок остаётся именем слоя', () => {
    const wrapper = mountHarness({ closeOnBackdrop: true, title: 'Filters', showHeader: false })

    expect(wrapper.find('[data-gr-drawer-header]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="hu-dialog"]').attributes('aria-label')).toBe('Drawer')

    wrapper.unmount()
  })

  it('секции настраиваются паддингами и рамкой, как у GrDialog', () => {
    const wrapper = mountHarness({
      closeOnBackdrop: true,
      title: 'Filters',
      headerConfig: { paddingX: 'px-8', bordered: false },
      bodyConfig: { paddingY: 'py-2' },
    })

    const header = wrapper.find('[data-gr-drawer-header]')
    expect(header.attributes('class')).toContain('px-8')
    expect(header.attributes('class')).not.toContain('border-b')

    expect(wrapper.find('[data-gr-drawer-body] > div').attributes('class')).toContain('py-2')

    wrapper.unmount()
  })

  it('произвольная ширина отменяет размерный класс', () => {
    const wrapper = mountHarness({ closeOnBackdrop: true, title: 'Filters', width: 640 })

    const panel = wrapper.find('[data-gr-drawer-panel]')
    expect(panel.attributes('style')).toContain('width: 640px')
    expect(panel.attributes('class')).not.toContain('w-[420px]')

    wrapper.unmount()
  })

  it('размер и сторона приходят из componentDefaults, локальный проп сильнее', () => {
    const fromConfig = mountHarness({ closeOnBackdrop: true, title: 'Filters', componentDefaults: { GrDrawer: { size: 'lg', side: 'left' } } })
    expect(fromConfig.find('[data-gr-drawer-panel]').attributes('class')).toContain('w-[560px]')
    expect(fromConfig.find('[data-gr-drawer-panel]').attributes('class')).toContain('left-0')
    fromConfig.unmount()

    const localWins = mountHarness({
      closeOnBackdrop: true,
      title: 'Filters',
      size: 'sm',
      componentDefaults: { GrDrawer: { size: 'lg', side: 'left' } },
    })
    expect(localWins.find('[data-gr-drawer-panel]').attributes('class')).toContain('w-[360px]')
    localWins.unmount()
  })
})
