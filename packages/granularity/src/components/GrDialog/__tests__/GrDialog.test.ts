import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

// Esc приходит так же, как в проде: общий стек слоёв ловит его в capture-фазе
// на `window` и закрывает верхний слой (тот же контракт в тестах `GrModal`).
import GrDialog from '../GrDialog.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

function makeHarness(template: string) {
  return defineComponent({
    name: 'HarnessGrDialog',
    components: { GrDialog },
    setup() {
      const open = ref(true)
      return { open }
    },
    template,
  })
}

/**
 * Хелпер асинхронный: поддерево окна появляется на такт позже монтирования —
 * телепорт включается после маунта (см. `useTeleportEnabled`).
 */
async function mountHarness(template: string) {
  // `transition: false` — VTU по умолчанию заглушает `<Transition>`, и тогда
  // `@after-leave` не приходит: поддеревo окна остаётся смонтированным навсегда.
  const wrapper = mount(makeHarness(template), {
    global: { stubs: { teleport: true, transition: false } },
  })

  await nextTick()
  return wrapper
}

describe('GrDialog', () => {
  it('рендерит видимый title в хедере и кнопку закрытия по умолчанию', async () => {
    const wrapper = await mountHarness(`
      <GrDialog v-model="open" title="Settings">
        <div data-testid="body">Body</div>
      </GrDialog>
    `)

    const header = wrapper.find('[data-gr-dialog-header]')
    expect(header.exists()).toBe(true)
    expect(header.text()).toContain('Settings')
    expect(wrapper.find('[data-gr-dialog-close]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="body"]').exists()).toBe(true)
  })

  it('при showHeader=false хедер не рендерится, а sr-only title уходит в #title слот GrModal', async () => {
    const wrapper = await mountHarness(`
      <GrDialog v-model="open" title="Hidden header title" :show-header="false">
        Body
      </GrDialog>
    `)

    expect(wrapper.find('[data-gr-dialog-header]').exists()).toBe(false)
    const modalTitle = wrapper.find('[data-gr-modal-title]')
    expect(modalTitle.exists()).toBe(true)
    expect(modalTitle.text()).toBe('Hidden header title')
    // sr-only класс навешен на обёртку заголовка.
    expect(modalTitle.html()).toContain('sr-only')
  })

  it('футер рендерится только если передан слот #footer', async () => {
    const withoutFooter = await mountHarness(`
      <GrDialog v-model="open" title="T">Body</GrDialog>
    `)
    expect(withoutFooter.find('[data-gr-dialog-footer]').exists()).toBe(false)

    const withFooter = await mountHarness(`
      <GrDialog v-model="open" title="T">
        <template #footer><button data-testid="ok">OK</button></template>
        Body
      </GrDialog>
    `)
    expect(withFooter.find('[data-gr-dialog-footer]').exists()).toBe(true)
    expect(withFooter.find('[data-testid="ok"]').exists()).toBe(true)
  })

  it('клик по кнопке закрытия эмитит update:modelValue=false', async () => {
    const wrapper = await mountHarness(`
      <GrDialog v-model="open" title="T">Body</GrDialog>
    `)
    await wrapper.find('[data-gr-dialog-close]').trigger('click')
    await nextTick()
    expect((wrapper.vm as any).open).toBe(false)
  })

  it('проп closeLabel прокидывается на кнопку закрытия как aria-label', async () => {
    const wrapper = await mountHarness(`
      <GrDialog v-model="open" title="T" close-label="Закрыть">Body</GrDialog>
    `)
    const btn = wrapper.find('[data-gr-dialog-close]')
    expect(btn.attributes('aria-label')).toBe('Закрыть')
  })

  it('кастомный слот #header подменяет видимый заголовок; a11y-title остаётся через GrModal', async () => {
    const wrapper = await mountHarness(`
      <GrDialog v-model="open" title="A11y only">
        <template #header="{ title }">
          <div data-testid="custom-header">Custom: {{ title }}</div>
        </template>
        Body
      </GrDialog>
    `)

    const customHeader = wrapper.find('[data-testid="custom-header"]')
    expect(customHeader.exists()).toBe(true)
    expect(customHeader.text()).toBe('Custom: A11y only')

    // sr-only title идёт через #title слот GrModal — он и даёт окну имя.
    const modalTitle = wrapper.find('[data-gr-modal-title]')
    expect(modalTitle.exists()).toBe(true)
    expect(modalTitle.html()).toContain('sr-only')
    expect(modalTitle.text()).toBe('A11y only')
  })

  it('Esc закрывает при closeOnEsc=true и не закрывает при closeOnEsc=false', async () => {
    function pressEscape(): void {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    }

    const withEsc = await mountHarness(`
      <GrDialog v-model="open" title="T">Body</GrDialog>
    `)
    pressEscape()
    await nextTick()
    expect((withEsc.vm as any).open).toBe(false)
    withEsc.unmount()

    const withoutEsc = await mountHarness(`
      <GrDialog v-model="open" title="T" :close-on-esc="false">Body</GrDialog>
    `)
    pressEscape()
    await nextTick()
    expect((withoutEsc.vm as any).open).toBe(true)
    withoutEsc.unmount()
  })

  it('передаёт имя окна вниз, чтобы GrModal не подставлял обобщённое', async () => {
    const wrapper = await mountHarness(`
      <GrDialog v-model="open" title="Профиль">Body</GrDialog>
    `)

    // Имя даёт видимый заголовок шапки через `aria-labelledby` — своего
    // `aria-label` окно при этом не ставит, чтобы имён не было два.
    const dialog = wrapper.find('[data-gr-overlay-root]')
    const title = wrapper.find('[data-gr-dialog-title]')

    expect(title.text()).toBe('Профиль')
    expect(dialog.attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect(dialog.attributes('aria-label')).toBeUndefined()
    wrapper.unmount()
  })

  it('ariaLabel даёт имя окну без заголовка вовсе', async () => {
    const wrapper = await mountHarness(`
      <GrDialog v-model="open" :show-header="false" aria-label="Мастер импорта">Body</GrDialog>
    `)

    expect(wrapper.find('[data-gr-overlay-root]').attributes('aria-label')).toBe('Мастер импорта')
    wrapper.unmount()
  })
})

describe('GrDialog — скролл, фокус и жизненный цикл', () => {
  it('при scrollBehavior=inside шапка и подвал остаются вне скроллящегося тела', async () => {
    const wrapper = await mountHarness(`
      <GrDialog v-model="open" title="Настройки" scroll-behavior="inside">
        <div data-testid="body">Body</div>
        <template #footer><button data-testid="save">Save</button></template>
      </GrDialog>
    `)

    const body = wrapper.find('[data-gr-modal-body]')

    expect(body.find('[data-testid="body"]').exists()).toBe(true)
    expect(body.find('[data-gr-dialog-header]').exists()).toBe(false)
    expect(body.find('[data-gr-dialog-footer]').exists()).toBe(false)

    expect(wrapper.find('[data-gr-modal-header] [data-gr-dialog-header]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-modal-footer] [data-gr-dialog-footer]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('при scrollBehavior=outside скроллящегося тела нет вовсе', async () => {
    const wrapper = await mountHarness(`
      <GrDialog v-model="open" title="Настройки">
        <div data-testid="body">Body</div>
        <template #footer><button data-testid="save">Save</button></template>
      </GrDialog>
    `)

    expect(wrapper.find('[data-gr-modal-body]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-dialog-header]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-dialog-footer]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('size=full доходит до панели GrModal', async () => {
    const wrapper = await mountHarness(`
      <GrDialog v-model="open" title="Мастер" size="full">Body</GrDialog>
    `)

    const panelClass = wrapper.find('[data-gr-modal-panel]').attributes('class')
    expect(panelClass).toContain('max-w-none')
    expect(panelClass).toContain('h-full')

    wrapper.unmount()
  })

  it('initialFocus доходит до GrModal', async () => {
    const Harness = defineComponent({
      name: 'HarnessInitialFocus',
      components: { GrDialog },
      setup() {
        const target = ref<HTMLElement | null>(null)
        return { open: ref(true), target }
      },
      template: `
        <GrDialog v-model="open" title="X" :initial-focus="target">
          <button>первая</button>
          <button ref="target" data-testid="focus-target">вторая</button>
        </GrDialog>
      `,
    })

    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { stubs: { transition: false } },
    })

    // Ловушка фокусирует на следующем тике после появления панели.
    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(document.querySelector('[data-testid="focus-target"]'))

    wrapper.unmount()
  })

  it('ретранслирует opened/closed от GrModal', async () => {
    const Harness = defineComponent({
      name: 'HarnessLifecycle',
      components: { GrDialog },
      setup() {
        const open = ref(false)
        const events: string[] = []
        return { open, events }
      },
      template: `
        <GrDialog
          v-model="open"
          title="X"
          @opened="events.push('opened')"
          @closed="events.push('closed')"
        >Body</GrDialog>
      `,
    })

    // Без teleport-стаба: он пересоздаёт поддерево, и инстанс транзишна не
    // доживает до перехода «открыто → закрыто».
    const wrapper = mount(Harness, {
      attachTo: document.body,
      global: { stubs: { transition: false } },
    })
    const vm = wrapper.vm as any

    // `opened`/`closed` приходят по концу анимации панели, а Vue переключает её
    // фазы через `requestAnimationFrame`.
    async function settle(): Promise<void> {
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
        await nextTick()
      }
    }

    vm.open = true
    await settle()
    expect(vm.events).toEqual(['opened'])

    vm.open = false
    await settle()
    expect(vm.events).toEqual(['opened', 'closed'])

    wrapper.unmount()
  })
})

describe('GrDialog — императивный API', () => {
  it('open/close/toggle просят родителя, а не подменяют модель', () => {
    const wrapper = mount(GrDialog, { props: { modelValue: false, ariaLabel: 'X' } })
    const api = wrapper.vm as unknown as { open: () => void, close: () => void, toggle: () => void }

    api.open()
    api.toggle()
    api.close()

    expect(wrapper.emitted('update:modelValue')).toEqual([[true], [true], [false]])
    wrapper.unmount()
  })
})
