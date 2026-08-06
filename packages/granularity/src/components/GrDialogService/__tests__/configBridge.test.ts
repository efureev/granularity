import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@headlessui/vue', async () => {
  const { defineComponent: dc } = await import('vue')

  return {
    Dialog: dc({ name: 'Dialog', emits: ['close'], props: { initialFocus: { type: Object, default: null } }, template: '<div><slot /></div>' }),
    DialogPanel: dc({ name: 'DialogPanel', template: '<div><slot /></div>' }),
    DialogTitle: dc({ name: 'DialogTitle', template: '<div><slot /></div>' }),
    TransitionRoot: dc({ name: 'TransitionRoot', props: { show: { type: Boolean, default: false } }, template: '<div v-if="show"><slot /></div>' }),
    TransitionChild: dc({ name: 'TransitionChild', template: '<div><slot /></div>' }),
  }
})

const { dialogService, useDialogService, teardownDialogService } = await import('../useDialogService')
const GrConfigProvider = (await import('../../GrConfigProvider/GrConfigProvider.vue')).default
const { GRANULARITY_I18N_KEY } = await import('../../../i18n/adapter')

async function flush(times = 6): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await nextTick()
    await Promise.resolve()
  }
}

function confirmButton(): HTMLElement | null {
  return document.querySelector('[data-testid="gr-confirm-confirm"]')
}

/**
 * Клик по кнопке диалога с обязательным тиком таймера перед ним — см.
 * подробное объяснение в `useDialogService.test.ts`: Vue гасит обработчик,
 * инвокер которого прикреплён в ту же миллисекунду, что и событие, а в jsdom
 * «открыли → отрисовали → кликнули» укладывается в одну миллисекунду.
 */
async function clickConfirm(): Promise<void> {
  const button = confirmButton()
  if (!button)
    throw new Error('[test] кнопка подтверждения не найдена')

  await new Promise(resolve => setTimeout(resolve, 2))
  button.click()
}

/** Класс высоты кнопки — по нему видно применённый размер. */
function confirmSizeClass(): string {
  return confirmButton()?.className ?? ''
}

/**
 * Монтирует компонент, который вызывает сервис из `setup` — то есть ровно так,
 * как это делает приложение: в момент вызова компонент ещё внутри дерева.
 */
function mountCaller(providerProps: Record<string, unknown> | null, defaults = {}) {
  const service = ref<ReturnType<typeof useDialogService> | null>(null)

  const Caller = defineComponent({
    setup() {
      service.value = useDialogService(defaults)
      return () => h('span')
    },
  })

  const wrapper = providerProps === null
    ? mount(Caller)
    : mount(GrConfigProvider, { props: providerProps, slots: { default: () => h(Caller) } })

  return { wrapper, service }
}

afterEach(() => {
  teardownDialogService()
  document.body.innerHTML = ''
})

describe('GrDialogService: мост конфига', () => {
  it('диалог наследует size от провайдера в точке вызова', async () => {
    const { service } = mountCaller({ size: 'sm' })
    void service.value!.confirm('Delete?')
    await flush()

    expect(confirmSizeClass()).toContain('h-8')
  })

  it('без провайдера остаётся дефолт компонента', async () => {
    const { service } = mountCaller(null)
    void service.value!.confirm('Delete?')
    await flush()

    expect(confirmSizeClass()).toContain('h-10')
  })

  it('componentDefaults тоже доезжает', async () => {
    const { service } = mountCaller({ componentDefaults: { GrButton: { size: 'lg' } } })
    void service.value!.confirm('Delete?')
    await flush()

    expect(confirmSizeClass()).toContain('h-11')
  })

  it('buttonSize сервиса перебивает конфиг, опции вызова — и то и другое', async () => {
    const { service } = mountCaller({ size: 'sm' }, { buttonSize: 'lg' })
    void service.value!.confirm('Delete?')
    await flush()
    expect(confirmSizeClass()).toContain('h-11')

    await clickConfirm()
    await flush()

    void service.value!.confirm('Delete?', { buttonSize: 'xs' })
    await flush()
    expect(confirmSizeClass()).toContain('h-7')
  })

  it('два поддерева с разными провайдерами не делят конфиг', async () => {
    // Хост монтируется один на приложение и живёт между вызовами — если бы конфиг
    // кэшировался на уровне модуля, второй вызов получил бы чужой размер.
    const first = mountCaller({ size: 'sm' })
    const second = mountCaller({ size: 'lg' })

    void first.service.value!.confirm('First?')
    await flush()
    expect(confirmSizeClass()).toContain('h-8')

    await clickConfirm()
    await flush()

    void second.service.value!.confirm('Second?')
    await flush()
    expect(confirmSizeClass()).toContain('h-11')
  })

  it('реактивность жива: смена size на провайдере видна открытому диалогу', async () => {
    const size = ref<'sm' | 'lg'>('sm')
    const service = ref<ReturnType<typeof useDialogService> | null>(null)

    const Caller = defineComponent({
      setup() {
        service.value = useDialogService()
        return () => h('span')
      },
    })

    mount(defineComponent({
      setup() {
        return () => h(GrConfigProvider as never, { size: size.value }, { default: () => h(Caller) })
      },
    }))

    void service.value!.confirm('Delete?')
    await flush()
    expect(confirmSizeClass()).toContain('h-8')

    size.value = 'lg'
    await flush()
    expect(confirmSizeClass()).toContain('h-11')
  })

  it('i18n из провайдера доезжает до диалога', async () => {
    const { service } = mountCaller({
      i18n: { t: (key: string) => (key === 'gr.common.confirm' ? 'Ага' : key) },
    })

    void service.value!.confirm('Delete?')
    await flush()

    expect(confirmButton()?.textContent).toContain('Ага')
  })
})

describe('GrDialogService: изоляция между приложениями', () => {
  it('teardown сбрасывает кэш appContext — чужие provides не протекают', async () => {
    const adapter = { t: (key: string) => (key === 'gr.common.confirm' ? 'ИЗ-ПЕРВОГО' : key) }

    // Первое приложение ставит i18n на уровне приложения.
    const firstService = ref<ReturnType<typeof useDialogService> | null>(null)
    const FirstCaller = defineComponent({
      setup() {
        firstService.value = useDialogService()
        return () => h('span')
      },
    })
    mount(FirstCaller, { global: { provide: { [GRANULARITY_I18N_KEY as symbol]: adapter } } })
    void firstService.value!.confirm('x')
    await flush()
    expect(confirmButton()?.textContent).toContain('ИЗ-ПЕРВОГО')

    teardownDialogService()
    document.body.innerHTML = ''

    // Второе приложение — без i18n. Оно не должно унаследовать адаптер первого.
    const secondService = ref<ReturnType<typeof useDialogService> | null>(null)
    const SecondCaller = defineComponent({
      setup() {
        secondService.value = useDialogService()
        return () => h('span')
      },
    })
    mount(SecondCaller)
    void secondService.value!.confirm('x')
    await flush()

    expect(confirmButton()?.textContent).not.toContain('ИЗ-ПЕРВОГО')
  })
})

describe('GrDialogService: готовый синглтон', () => {
  it('подхватывает контекст, захваченный вызовом из setup', async () => {
    const adapter = { t: (key: string) => (key === 'gr.common.confirm' ? 'ИЗ-ПРОВАЙДЕРА' : key) }

    // Синглтон создаётся на импорте модуля, вне `setup`, — своего контекста у
    // него нет и быть не может. Раньше это значило «всегда английские строки».
    mountCaller({ i18n: adapter, size: 'lg' })

    void dialogService.confirm('Delete?')
    await flush()

    expect(confirmButton()?.textContent).toContain('ИЗ-ПРОВАЙДЕРА')
    expect(confirmSizeClass()).toContain('h-11')
  })

  it('без единого вызова из setup ругается в dev и работает на дефолтах', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    void dialogService.confirm('Delete?')
    await flush()

    expect(warn).toHaveBeenCalledOnce()
    expect(String(warn.mock.calls[0][0])).toContain('без контекста приложения')
    warn.mockRestore()
  })
})
