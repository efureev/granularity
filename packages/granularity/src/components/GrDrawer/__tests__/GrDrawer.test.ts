import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrDrawer from '../GrDrawer.vue'
import { pushOverlayLayer, resetOverlayStack } from '../../../composables/internal/overlayStack'
import { resetScrollLock } from '../../../composables/internal/useScrollLock'

afterEach(() => {
  resetOverlayStack()
  // Счётчик локов глобальный: тест, упавший до `unmount`, иначе прячет причину
  // падения следующего.
  resetScrollLock()
})

type DrawerOptions = Record<string, unknown> & { componentDefaults?: Record<string, unknown> }

/**
 * Все пропы прокидываются как есть: тестам нужен не фиксированный набор, а
 * произвольная комбинация — от `persistent` до `headerConfig`.
 *
 * Хелпер асинхронный: поддерево слоя появляется на такт позже монтирования —
 * телепорт включается после маунта (см. `useTeleportEnabled`).
 */
async function mountHarness(options: DrawerOptions) {
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

  const wrapper = mount(Harness, {
    global: {
      stubs: {
        teleport: true,
      },
    },
  })

  await nextTick()
  return wrapper
}

/** Стенд со своей шапкой: слот подменяет и заголовок, и кнопку закрытия. */
async function mountHarnessWithHeader() {
  const Harness = defineComponent({
    components: { GrDrawer },
    setup() {
      const open = ref(true)
      return { open }
    },
    template: `
      <GrDrawer v-model="open" title="Filters">
        <template #header="{ title, close }">
          <div data-testid="custom-header">
            <span>{{ title }}</span>
            <button data-testid="custom-close" @click="close">×</button>
          </div>
        </template>
        <div data-testid="drawer-body">Body</div>
      </GrDrawer>
    `,
  })

  const wrapper = mount(Harness, { global: { stubs: { teleport: true } } })
  await nextTick()
  return wrapper
}

/**
 * Ждёт конца анимации слоя: `<Transition>` объявляет её законченной через
 * `nextFrame`, то есть парой кадров позже смены пропа. Без этого `opened`/
 * `closed` ещё не эмитнуты, а фокус не переставлен.
 */
async function settle(): Promise<void> {
  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
    await nextTick()
  }
}

describe('granularity/GrDrawer (unit)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('помечает корень inert, когда поверх открыт другой модальный слой', async () => {
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters' })

    expect(wrapper.find('[data-gr-drawer]').attributes('inert')).toBeUndefined()

    pushOverlayLayer({ modal: true, shouldClose: () => true, close: () => {} })
    await nextTick()

    expect(wrapper.find('[data-gr-drawer]').attributes('inert')).toBeDefined()

    wrapper.unmount()
  })

  it('рендерит правую панель по умолчанию с md-размером и заголовком', async () => {
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters' })

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
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters', side: 'left', size: 'lg' })

    expect(wrapper.find('[data-gr-drawer-panel]').attributes('class')).toContain('left-0')
    expect(wrapper.find('[data-gr-drawer-panel]').attributes('class')).toContain('w-[560px]')

    await wrapper.find('[data-gr-drawer-overlay]').trigger('mousedown')
    await wrapper.find('[data-gr-drawer-overlay]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(false)

    wrapper.unmount()

    const escWrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters' })

    // Esc обрабатывает общий стек оверлеев (window capture), а не локальный
    // обработчик на панели — поэтому диспатчим на уровне window, как в реальности.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(escWrapper.find('[data-gr-drawer-panel]').exists()).toBe(false)

    escWrapper.unmount()
  })

  it('не закрывается по backdrop-close, если closeOnBackdrop=false, но кнопка закрытия работает', async () => {
    const wrapper = await mountHarness({ closeOnBackdrop: false, title: 'Filters', size: 'full' })

    expect(wrapper.find('[data-gr-drawer-panel]').attributes('class')).toContain('w-[100vw]')

    await wrapper.find('[data-gr-drawer-overlay]').trigger('mousedown')
    await wrapper.find('[data-gr-drawer-overlay]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(true)

    await wrapper.find('button[aria-label="Close"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('живёт на модальном слое шкалы, а не на литерале ниже неё', async () => {
    // `z-50` был ниже всей шкалы: панель dropdown (1000) рисовалась поверх
    // выехавшего drawer'а, а его бэкдроп её не перекрывал.
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters' })

    expect(wrapper.find('[data-gr-drawer]').attributes('class')).toContain('z-[var(--gr-z-modal)]')

    wrapper.unmount()
  })

  it('блокирует скролл страницы, пока открыт, и отпускает при закрытии', async () => {
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters' })

    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.find('button[aria-label="Close"]').trigger('click')
    await nextTick()

    expect(document.body.style.overflow).toBe('')

    wrapper.unmount()
  })

  it('снимает блокировку скролла при размонтировании открытым', async () => {
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters' })
    expect(document.body.style.overflow).toBe('hidden')

    wrapper.unmount()
    await nextTick()

    expect(document.body.style.overflow).toBe('')
  })

  it('persistent запрещает бэкдроп и Esc, но не кнопку закрытия', async () => {
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters', persistent: true })

    await wrapper.find('[data-gr-drawer-overlay]').trigger('mousedown')
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

  it('closeOnEsc=false гасит только Esc, бэкдроп и кнопка закрытия работают', async () => {
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters', closeOnEsc: false })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(true)

    // Отличие от `persistent`: тот запрещает оба мягких выхода, а этот — один.
    await wrapper.find('[data-gr-drawer-overlay]').trigger('mousedown')
    await wrapper.find('[data-gr-drawer-overlay]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('без заголовка и кнопки закрытия хедер не рендерится, а имя слоя остаётся', async () => {
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: '', showCloseButton: false })

    expect(wrapper.find('[data-gr-drawer-header]').exists()).toBe(false)
    // Модальный слой без доступного имени — нарушение `aria-dialog-name`.
    expect(wrapper.find('[data-gr-drawer]').attributes('aria-label')).toBe('Drawer')

    wrapper.unmount()
  })

  it('showHeader=false убирает хедер, но имя слоя остаётся своим', async () => {
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters', showHeader: false })

    expect(wrapper.find('[data-gr-drawer-header]').exists()).toBe(false)

    // Заголовок рисуется скрытым: обобщённое «Drawer» из локали хуже, чем
    // настоящее имя, которое автор уже передал.
    const title = wrapper.find('[data-gr-drawer-title]')
    expect(title.exists()).toBe(true)
    expect(title.classes()).toContain('sr-only')
    expect(title.text()).toBe('Filters')

    expect(wrapper.find('[data-gr-drawer]').attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect(wrapper.find('[data-gr-drawer]').attributes('aria-label')).toBeUndefined()

    wrapper.unmount()
  })

  it('секции настраиваются паддингами и рамкой, как у GrDialog', async () => {
    const wrapper = await mountHarness({
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

  it('произвольная ширина отменяет размерный класс', async () => {
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters', width: 640 })

    const panel = wrapper.find('[data-gr-drawer-panel]')
    expect(panel.attributes('style')).toContain('width: 640px')
    expect(panel.attributes('class')).not.toContain('w-[420px]')

    wrapper.unmount()
  })

  it('размер и сторона приходят из componentDefaults, локальный проп сильнее', async () => {
    const fromConfig = await mountHarness({ closeOnBackdrop: true, title: 'Filters', componentDefaults: { GrDrawer: { size: 'lg', side: 'left' } } })
    expect(fromConfig.find('[data-gr-drawer-panel]').attributes('class')).toContain('w-[560px]')
    expect(fromConfig.find('[data-gr-drawer-panel]').attributes('class')).toContain('left-0')
    fromConfig.unmount()

    const localWins = await mountHarness({
      closeOnBackdrop: true,
      title: 'Filters',
      size: 'sm',
      componentDefaults: { GrDrawer: { size: 'lg', side: 'left' } },
    })
    expect(localWins.find('[data-gr-drawer-panel]').attributes('class')).toContain('w-[360px]')
    localWins.unmount()
  })

  it('тело попадает в таб-порядок: длинный текст без ссылок иначе не прокрутить', async () => {
    const wrapper = await mountHarness({ closeOnBackdrop: true, title: 'Filters' })

    expect(wrapper.find('[data-gr-drawer-body]').attributes('tabindex')).toBe('0')

    wrapper.unmount()
  })
})

describe('GrDrawer — стороны', () => {
  it('боковые стороны растянуты по вертикали и берут ширину из шкалы', async () => {
    const right = await mountHarness({ title: 'F' })
    const rightPanel = right.find('[data-gr-drawer-panel]').attributes('class')
    expect(rightPanel).toContain('inset-y-0')
    expect(rightPanel).toContain('right-0')
    expect(rightPanel).toContain('w-[420px]')
    right.unmount()

    const left = await mountHarness({ title: 'F', side: 'left' })
    expect(left.find('[data-gr-drawer-panel]').attributes('class')).toContain('left-0')
    left.unmount()
  })

  it('верхняя и нижняя растянуты по горизонтали и берут из шкалы высоту', async () => {
    const bottom = await mountHarness({ title: 'F', side: 'bottom' })
    const bottomPanel = bottom.find('[data-gr-drawer-panel]').attributes('class')
    expect(bottomPanel).toContain('inset-x-0')
    expect(bottomPanel).toContain('bottom-0')
    expect(bottomPanel).toContain('h-[360px]')
    expect(bottomPanel).not.toContain('w-[420px]')
    bottom.unmount()

    const top = await mountHarness({ title: 'F', side: 'top', size: 'lg' })
    const topPanel = top.find('[data-gr-drawer-panel]').attributes('class')
    expect(topPanel).toContain('top-0')
    expect(topPanel).toContain('h-[480px]')
    top.unmount()
  })

  it('произвольный размер задаётся по оси панели', async () => {
    const bottom = await mountHarness({ title: 'F', side: 'bottom', height: 320 })
    const panel = bottom.find('[data-gr-drawer-panel]')
    expect(panel.attributes('style')).toContain('height: 320px')
    expect(panel.attributes('class')).not.toContain('h-[360px]')
    bottom.unmount()
  })

  it('проп не своей оси не молчит, а ругается в dev', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = await mountHarness({ title: 'F', side: 'bottom', width: 400 })

    expect(warn).toHaveBeenCalled()
    expect(String(warn.mock.calls[0]?.[0])).toContain('width')
    // Игнорируется он в любом случае — размер остаётся из шкалы по своей оси.
    expect(wrapper.find('[data-gr-drawer-panel]').attributes('class')).toContain('h-[360px]')

    wrapper.unmount()
    warn.mockRestore()
  })
})

describe('GrDrawer — своя шапка', () => {
  it('слот #header подменяет содержимое шапки, а имя слоя остаётся', async () => {
    const wrapper = await mountHarnessWithHeader()

    expect(wrapper.find('[data-testid="custom-header"]').exists()).toBe(true)
    // Штатной кнопки закрытия в своей шапке нет — её рисует потребитель.
    expect(wrapper.find('[data-gr-drawer-close]').exists()).toBe(false)

    const title = wrapper.find('[data-gr-drawer-title]')
    expect(title.classes()).toContain('sr-only')
    expect(wrapper.find('[data-gr-drawer]').attributes('aria-labelledby')).toBe(title.attributes('id'))

    wrapper.unmount()
  })

  it('слот получает заголовок и функцию закрытия', async () => {
    const wrapper = await mountHarnessWithHeader()

    expect(wrapper.find('[data-testid="custom-header"]').text()).toContain('Filters')

    await wrapper.find('[data-testid="custom-close"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(false)

    wrapper.unmount()
  })
})

describe('GrDrawer — заголовок разметкой', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('слот #title работает без пропа title и остаётся именем слоя', async () => {
    const Harness = defineComponent({
      components: { GrDrawer },
      setup: () => ({ open: ref(true) }),
      template: `
        <GrDrawer v-model="open">
          <template #title>
            <span data-testid="rich-title">Filters <b>3</b></span>
          </template>
          <div data-testid="drawer-body">Body</div>
        </GrDrawer>
      `,
    })

    const wrapper = mount(Harness, { global: { stubs: { teleport: true } } })
    await nextTick()

    const title = wrapper.find('[data-gr-drawer-title]')
    expect(title.find('[data-testid="rich-title"]').exists()).toBe(true)
    expect(title.classes()).not.toContain('sr-only')

    // Заголовок разметкой — тоже заголовок: имя слоя берётся с него, а не
    // сваливается на обобщённое «Drawer» из локали.
    expect(wrapper.find('[data-gr-drawer]').attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect(wrapper.find('[data-gr-drawer]').attributes('aria-label')).toBeUndefined()

    wrapper.unmount()
  })

  it('со скрытой шапкой слот #title уезжает в sr-only, а не пропадает', async () => {
    const Harness = defineComponent({
      components: { GrDrawer },
      setup: () => ({ open: ref(true) }),
      template: `
        <GrDrawer v-model="open" :show-header="false">
          <template #title>
            <span data-testid="rich-title">Filters</span>
          </template>
          <div data-testid="drawer-body">Body</div>
        </GrDrawer>
      `,
    })

    const wrapper = mount(Harness, { global: { stubs: { teleport: true } } })
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-header]').exists()).toBe(false)

    const title = wrapper.find('[data-gr-drawer-title]')
    expect(title.classes()).toContain('sr-only')
    expect(title.find('[data-testid="rich-title"]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-drawer]').attributes('aria-labelledby')).toBe(title.attributes('id'))

    wrapper.unmount()
  })
})

describe('GrDrawer — жизненный цикл, фокус и expose', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('эмитит opened/closed по концу анимации, а не по смене пропа', async () => {
    const wrapper = mount(GrDrawer, {
      attachTo: document.body,
      props: { modelValue: false, title: 'Filters' },
      slots: { default: '<div data-testid="drawer-body">Body</div>' },
      global: { stubs: { transition: false } },
    })

    await wrapper.setProps({ modelValue: true })
    expect(wrapper.emitted('opened')).toBeUndefined()

    await settle()
    expect(wrapper.emitted('opened')).toHaveLength(1)
    expect(wrapper.emitted('closed')).toBeUndefined()

    await wrapper.setProps({ modelValue: false })
    await settle()
    expect(wrapper.emitted('closed')).toHaveLength(1)

    wrapper.unmount()
  })

  it('initialFocus перебивает панель по умолчанию', async () => {
    const wrapper = mount(defineComponent({
      components: { GrDrawer },
      setup() {
        const open = ref(true)
        const target = ref<HTMLElement | null>(null)
        return { open, target }
      },
      template: `
        <GrDrawer v-model="open" title="Filters" :initial-focus="target">
          <input data-testid="first">
          <input ref="target" data-testid="second">
        </GrDrawer>
      `,
    }), { attachTo: document.body, global: { stubs: { transition: false } } })

    // Ссылка на элемент внутри панели появляется только после её рендера,
    // поэтому фокус проверяем, когда слой устоялся.
    await settle()

    expect(document.activeElement).toBe(document.querySelector('[data-testid="second"]'))

    wrapper.unmount()
  })

  it('без initialFocus фокус уходит на саму панель', async () => {
    const wrapper = mount(GrDrawer, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Filters' },
      slots: { default: '<input data-testid="first">' },
      global: { stubs: { transition: false } },
    })

    await settle()

    expect(document.activeElement).toBe(document.querySelector('[data-gr-drawer-panel]'))

    wrapper.unmount()
  })

  it('expose close() закрывает и persistent-панель', async () => {
    const wrapper = mount(GrDrawer, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Filters', persistent: true },
      slots: { default: '<div data-testid="drawer-body">Body</div>' },
      global: { stubs: { transition: false } },
    })

    await settle()

    wrapper.vm.close()
    await nextTick()

    // `v-model` остаётся у потребителя: expose эмитит обновление, а не правит
    // проп мимо него.
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])

    wrapper.unmount()
  })

  it('expose focus() возвращает фокус на панель, уведённый наружу', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    // Немодальный режим: ловушка фокуса выключена, и вернуть его на панель
    // после работы со страницей под ней больше нечем.
    const wrapper = mount(GrDrawer, {
      attachTo: document.body,
      props: { modelValue: true, title: 'Filters', modal: false },
      slots: { default: '<div data-testid="drawer-body">Body</div>' },
      global: { stubs: { transition: false } },
    })

    await settle()

    outside.focus()
    expect(document.activeElement).toBe(outside)

    wrapper.vm.focus()
    expect(document.activeElement).toBe(document.querySelector('[data-gr-drawer-panel]'))

    wrapper.unmount()
    outside.remove()
  })
})

describe('GrDrawer — немодальный режим', () => {
  it('не рисует подложку, не блокирует скролл и не гасит страницу', async () => {
    const page = document.createElement('main')
    document.body.appendChild(page)

    const wrapper = await mountHarness({ title: 'Filters', modal: false })

    expect(wrapper.find('[data-gr-drawer-overlay]').exists()).toBe(false)
    expect(document.body.style.overflow).toBe('')
    expect(page.hasAttribute('inert')).toBe(false)

    // Корень растянут на весь экран ради позиционирования — но клики сквозь.
    expect(wrapper.find('[data-gr-drawer]').attributes('class')).toContain('pointer-events-none')
    expect(wrapper.find('[data-gr-drawer-panel]').attributes('class')).toContain('pointer-events-auto')

    wrapper.unmount()
    page.remove()
  })

  it('не объявляет себя модальным окном', async () => {
    const wrapper = await mountHarness({ title: 'Filters', modal: false })

    const root = wrapper.find('[data-gr-drawer]')
    expect(root.attributes('role')).toBe('dialog')
    expect(root.attributes('aria-modal')).toBeUndefined()

    wrapper.unmount()
  })

  it('остаётся в очереди Esc', async () => {
    const wrapper = await mountHarness({ title: 'Filters', modal: false })

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    expect(wrapper.find('[data-gr-drawer-panel]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('фокус не держит: он остаётся там, куда его увели', async () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)

    const wrapper = await mountHarness({ title: 'Filters', modal: false })
    await nextTick()

    outside.focus()
    await nextTick()

    expect(document.activeElement).toBe(outside)

    wrapper.unmount()
    outside.remove()
  })
})
