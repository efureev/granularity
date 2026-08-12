import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'


vi.mock('~icons/lucide/check-circle', () => ({
  default: defineComponent({
    name: 'IconCheckCircle',
    template: '<svg data-icon="check-circle" />',
  }),
}))
vi.mock('~icons/lucide/alert-triangle', () => ({
  default: defineComponent({
    name: 'IconAlertTriangle',
    template: '<svg data-icon="alert-triangle" />',
  }),
}))
vi.mock('~icons/lucide/x-circle', () => ({
  default: defineComponent({
    name: 'IconXCircle',
    template: '<svg data-icon="x-circle" />',
  }),
}))
vi.mock('~icons/lucide/info', () => ({
  default: defineComponent({
    name: 'IconInfo',
    template: '<svg data-icon="info" />',
  }),
}))
vi.mock('~icons/lucide/x', () => ({
  default: defineComponent({
    name: 'IconX',
    template: '<svg data-icon="x" />',
  }),
}))

import { resetPortalRoot } from '../../../composables/internal/portalRoot'
import { granularityToastPlugin, useToast } from '../../../composables/useToast'
import GrToaster from '../GrToaster.vue'

afterEach(() => {
  useToast().clear()
  document.body.innerHTML = ''
  // Корень портала кэшируется модулем, а очистка `body` его открепляет: без
  // сброса следующий монтаж телепортировал бы тосты в узел вне документа.
  resetPortalRoot()
})

describe('GrToaster', () => {
  it('рендерит toast из useToast с tone-иконкой и цветом', () => {
    const toast = useToast()
    toast.push({
      title: 'Saved',
      message: 'Profile updated',
      tone: 'success',
      timeoutMs: 0,
    })

    mount(GrToaster, { attachTo: document.body })

    expect(document.body.textContent).toContain('Saved')
    expect(document.body.textContent).toContain('Profile updated')

    const icon = document.body.querySelector('[data-icon="check-circle"]')
    expect(icon).not.toBeNull()

    // Цвет приходит через inline-style на обёртке `GrIcon`.
    const iconWrapper = icon?.closest('[data-gr-icon]') as HTMLElement | null
    expect(iconWrapper).not.toBeNull()
    expect(iconWrapper?.getAttribute('style')).toContain('color: var(--gr-success)')
  })

  it('контейнер — a11y-регион с aria-label, кастомизируется regionLabel', () => {
    mount(GrToaster, {
      attachTo: document.body,
      props: { regionLabel: 'Уведомления' },
    })

    const region = document.body.querySelector('[data-gr-toaster]')
    expect(region).not.toBeNull()
    expect(region?.getAttribute('role')).toBe('region')
    expect(region?.getAttribute('aria-label')).toBe('Уведомления')
  })

  it('info/success — role=status, warning/danger — role=alert, и ни одного вложенного live-региона', async () => {
    const toast = useToast()
    toast.push({ title: 'Info', tone: 'info', timeoutMs: 0 })
    toast.push({ title: 'Danger', tone: 'danger', timeoutMs: 0 })
    toast.push({ title: 'Warn', tone: 'warning', timeoutMs: 0 })
    toast.push({ title: 'Ok', tone: 'success', timeoutMs: 0 })

    mount(GrToaster, { attachTo: document.body })
    await nextTick()

    const items = Array.from(
      document.body.querySelectorAll<HTMLElement>('[data-gr-toast]'),
    )
    const byVariant = Object.fromEntries(
      items.map(el => [el.getAttribute('data-tone'), el] as const),
    )

    // Роль сохраняется per-toast; критичные — ассертивный `role="alert"`.
    expect(byVariant.info.getAttribute('role')).toBe('status')
    expect(byVariant.success.getAttribute('role')).toBe('status')
    expect(byVariant.warning.getAttribute('role')).toBe('alert')
    expect(byVariant.danger.getAttribute('role')).toBe('alert')

    // Обёртки-live-region над тостами нет: `alert` внутри `polite` — не
    // определённое спецификацией вложение регионов разной ассертивности.
    expect(document.body.querySelector('[data-gr-toaster] [aria-live]')).toBeNull()
  })

  it('останавливает автозакрытие под курсором и возобновляет после ухода (WCAG 2.2.1)', async () => {
    vi.useFakeTimers()
    const toast = useToast()
    toast.clear()
    toast.push({ title: 'Auto', timeoutMs: 100 })

    mount(GrToaster, { attachTo: document.body })
    await nextTick()

    const region = document.body.querySelector('[data-gr-toaster]') as HTMLElement
    region.dispatchEvent(new MouseEvent('mouseenter'))
    await nextTick()

    // Под курсором таймер на паузе — тост не должен исчезнуть.
    await vi.advanceTimersByTimeAsync(300)
    expect(toast.list.value.length).toBe(1)

    // После ухода — отсчёт возобновляется и тост закрывается.
    region.dispatchEvent(new MouseEvent('mouseleave'))
    await nextTick()
    await vi.advanceTimersByTimeAsync(300)
    expect(toast.list.value.length).toBe(0)

    vi.useRealTimers()
  })

  it('maxVisible ограничивает число видимых тостов, очередь ждёт', async () => {
    const toast = useToast()
    toast.clear()
    for (let i = 0; i < 5; i += 1)
      toast.push({ title: `T${i}`, timeoutMs: 0 })

    mount(GrToaster, { attachTo: document.body, props: { maxVisible: 2 } })
    await nextTick()

    expect(document.body.querySelectorAll('[data-gr-toast]').length).toBe(2)
  })

  it('текст тоста идёт от токена --gr-text-sm, а не от px-литерала', () => {
    const { push } = useToast()
    push({ title: 'Заголовок', message: 'Описание', timeoutMs: 0 })

    const wrapper = mount(GrToaster)
    const html = wrapper.html()

    expect(html.split('text-[length:var(--gr-text-sm)]')).toHaveLength(3)
    expect(html).not.toContain('text-[length:var(--gr-control-text-sm)]')
  })

  it('placement применяет классы угла (bottom-left)', () => {
    mount(GrToaster, {
      attachTo: document.body,
      props: { placement: 'bottom-left' },
    })

    const region = document.body.querySelector('[data-gr-toaster]') as HTMLElement
    expect(region.className).toContain('left-4')
    expect(region.className).toContain('bottom-4')
    expect(region.className).not.toContain('right-4')
    expect(region.className).not.toContain('top-4')
  })

  it('dismiss удаляет toast по клику на кнопку закрытия (i18n dismissLabel)', async () => {
    const toast = useToast()
    const id = toast.push({
      title: 'Warning',
      tone: 'warning',
      timeoutMs: 0,
    })

    mount(GrToaster, {
      attachTo: document.body,
      props: { dismissLabel: 'Закрыть' },
    })

    const closeButton = document.body.querySelector<HTMLButtonElement>(
      'button[aria-label="Закрыть"]',
    )
    expect(closeButton).not.toBeNull()

    closeButton?.click()
    await nextTick()

    expect(toast.list.value.find(item => item.id === id)).toBeUndefined()
    expect(document.body.textContent).not.toContain('Warning')
  })

  it('ширина настраивается пропом через --gr-toaster-width', () => {
    mount(GrToaster, { attachTo: document.body, props: { width: 480 } })

    const region = document.body.querySelector('[data-gr-toaster]') as HTMLElement
    expect(region.style.getPropertyValue('--gr-toaster-width')).toBe('480px')
    expect(region.className).toContain('w-[var(--gr-toaster-width,360px)]')
  })

  it('useToast.dismiss отменяет таймер авто-закрытия', async () => {
    vi.useFakeTimers()
    try {
      const toast = useToast()
      const id = toast.push({ title: 'Auto', tone: 'info', timeoutMs: 1000 })
      expect(toast.list.value.some(t => t.id === id)).toBe(true)

      toast.dismiss(id)
      expect(toast.list.value.some(t => t.id === id)).toBe(false)

      // Даже если время «пройдёт» — повторных мутаций быть не должно.
      vi.advanceTimersByTime(2000)
      expect(toast.list.value.length).toBe(0)
    }
    finally {
      vi.useRealTimers()
    }
  })
})

describe('GrToaster — клавиатурный доступ к стеку', () => {
  function pressF6(): void {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F6', bubbles: true }))
  }

  it('F6 переводит фокус на верхний тост', async () => {
    const toast = useToast()
    toast.push({ title: 'Deleted', timeoutMs: 0, action: { label: 'Undo', onClick: () => {} } })

    mount(GrToaster, { attachTo: document.body })
    await nextTick()

    pressF6()

    const first = document.body.querySelector('[data-gr-toast]')
    expect(document.activeElement).toBe(first)
    // Из тоста кнопка «Undo» достижима обычным Tab — она следующая в порядке DOM.
    expect(first?.querySelector('[data-gr-toast-action]')).not.toBeNull()
  })

  it('тост не становится собственной остановкой Tab', async () => {
    const toast = useToast()
    toast.push({ title: 'Saved', timeoutMs: 0 })

    mount(GrToaster, { attachTo: document.body })
    await nextTick()

    expect(document.body.querySelector('[data-gr-toast]')?.getAttribute('tabindex')).toBe('-1')
  })

  it('focusHotkey переопределяет клавишу, false отключает хоткей', async () => {
    const toast = useToast()
    toast.push({ title: 'Saved', timeoutMs: 0 })

    const wrapper = mount(GrToaster, { attachTo: document.body, props: { focusHotkey: false } })
    await nextTick()

    pressF6()
    expect(document.activeElement).not.toBe(document.body.querySelector('[data-gr-toast]'))

    await wrapper.setProps({ focusHotkey: 'F8' })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F8', bubbles: true }))
    expect(document.activeElement).toBe(document.body.querySelector('[data-gr-toast]'))
  })

  it('focus() из defineExpose доступен по ref и сообщает, было ли что фокусировать', async () => {
    // Через реальный шаблонный `ref`: `wrapper.vm` отдаёт setup-состояние, а не
    // экспонированный прокси, и `defineExpose` там не виден.
    const Harness = defineComponent({
      components: { GrToaster },
      setup: () => ({ toaster: ref<{ focus: () => boolean } | null>(null) }),
      template: '<GrToaster ref="toaster" />',
    })

    const wrapper = mount(Harness, { attachTo: document.body })
    await nextTick()

    expect(wrapper.vm.toaster?.focus()).toBe(false)

    useToast().push({ title: 'Saved', timeoutMs: 0 })
    await nextTick()

    expect(wrapper.vm.toaster?.focus()).toBe(true)
    expect(document.activeElement).toBe(document.body.querySelector('[data-gr-toast]'))
  })
})

describe('GrToaster — семантика очереди: видимые дожинают, новые ждут', () => {
  /**
   * App-scoped состояние через плагин: тостеры из соседних тестов не
   * размонтированы (их watchEffect'ы живут после очистки DOM) и гоняют
   * pause/resume по общему модульному стеку — изоляция состояния снимает
   * интерференцию. `runWithContext` достаёт то же состояние, что видит
   * смонтированный тостер.
   */
  function mountScoped(maxVisible: number) {
    const wrapper = mount(GrToaster, {
      attachTo: document.body,
      props: { maxVisible },
      global: { plugins: [granularityToastPlugin] },
    })
    const toast = wrapper.vm.$.appContext.app.runWithContext(() => useToast())
    return { wrapper, toast }
  }

  // Тостер телепортирован; свой (смонтированный последним) — последний хост в документе.
  function visibleTitles(): string[] {
    const hosts = document.querySelectorAll('[data-gr-toaster]')
    const host = hosts[hosts.length - 1]
    return [...host.querySelectorAll('[data-gr-toast]')]
      .map(el => el.querySelector('.font-700')?.textContent?.trim() ?? '')
  }

  it('видимые — старейшие; новый тост ждёт, а не вытесняет', async () => {
    const { wrapper, toast } = mountScoped(2)
    for (let i = 0; i < 5; i += 1) toast.push({ title: `T${i}`, timeoutMs: 0 })
    await nextTick()

    expect(visibleTitles().sort()).toEqual(['T0', 'T1'])

    wrapper.unmount()
  })

  it('FIFO: закрытие видимого впускает самого раннего из ждущих', async () => {
    const { wrapper, toast } = mountScoped(2)
    const ids = Array.from({ length: 5 }, (_, i) => toast.push({ title: `T${i}`, timeoutMs: 0 }))
    await nextTick()

    toast.dismiss(ids[0])
    await nextTick()

    expect(visibleTitles().sort()).toEqual(['T1', 'T2'])

    wrapper.unmount()
  })

  it('таймер ждущего стоит на паузе и стартует при появлении на экране', async () => {
    vi.useFakeTimers()
    const { wrapper, toast } = mountScoped(2)
    for (let i = 0; i < 3; i += 1) toast.push({ title: `T${i}`, timeoutMs: 100 })
    await nextTick()

    // Видимые T0/T1 дожинают; ждущий T2 на паузе и переживает их таймаут.
    // Проверяем состояние, а не DOM: leave-анимация под fake timers держит
    // узлы закрытых тостов дольше, чем живёт их запись в списке.
    await vi.advanceTimersByTimeAsync(150)
    expect(toast.list.value.map(item => item.title)).toEqual(['T2'])

    // Став видимым, T2 получает свой отсчёт и закрывается.
    await vi.advanceTimersByTimeAsync(150)
    expect(toast.list.value).toHaveLength(0)

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('видимые тосты доживают до своих таймаутов независимо друг от друга', async () => {
    vi.useFakeTimers()
    const { wrapper, toast } = mountScoped(3)

    toast.push({ title: 'Быстрый', timeoutMs: 100 })
    toast.push({ title: 'Средний', timeoutMs: 300 })
    toast.push({ title: 'Вечный', timeoutMs: 0 })
    await nextTick()

    await vi.advanceTimersByTimeAsync(150)
    expect(toast.list.value.map(item => item.title)).toEqual(['Вечный', 'Средний'])

    await vi.advanceTimersByTimeAsync(200)
    expect(toast.list.value.map(item => item.title)).toEqual(['Вечный'])

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('повторный push не сбрасывает и не гасит уже показанный тост', async () => {
    vi.useFakeTimers()
    const { wrapper, toast } = mountScoped(3)

    toast.push({ title: 'Первый', timeoutMs: 200 })
    await nextTick()
    await vi.advanceTimersByTimeAsync(150)

    toast.push({ title: 'Второй', timeoutMs: 200 })
    await nextTick()

    // Первому осталось 50 мс — новый тост его отсчёт не продлевает и не обнуляет.
    await vi.advanceTimersByTimeAsync(60)
    expect(toast.list.value.map(item => item.title)).toEqual(['Второй'])

    await vi.advanceTimersByTimeAsync(150)
    expect(toast.list.value).toHaveLength(0)

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('перезапуск таймера у ждущего тоста не сжигает его в очереди', async () => {
    vi.useFakeTimers()
    const { wrapper, toast } = mountScoped(1)

    toast.push({ title: 'Держит экран', timeoutMs: 0 })
    const queued = toast.push({ title: 'Ждёт', timeoutMs: 0 })
    await nextTick()

    // Так ведёт себя `toast.promise`: стадия успеха ставит таймаут тосту, который
    // в этот момент ещё стоит в очереди. Список и пауза при этом не меняются.
    toast.update(queued, { title: 'Готово', timeoutMs: 100 })
    await nextTick()

    await vi.advanceTimersByTimeAsync(300)
    expect(toast.list.value.map(item => item.title)).toEqual(['Готово', 'Держит экран'])

    wrapper.unmount()
    vi.useRealTimers()
  })

  it('перезапуск таймера под курсором не стартует отсчёт', async () => {
    vi.useFakeTimers()
    const { wrapper, toast } = mountScoped(3)

    const id = toast.push({ title: 'Загружаем', timeoutMs: 0 })
    await nextTick()

    const hosts = document.querySelectorAll('[data-gr-toaster]')
    const region = hosts[hosts.length - 1] as HTMLElement
    region.dispatchEvent(new MouseEvent('mouseenter'))
    await nextTick()

    toast.update(id, { title: 'Готово', timeoutMs: 100 })
    await nextTick()

    await vi.advanceTimersByTimeAsync(300)
    expect(toast.list.value.map(item => item.title)).toEqual(['Готово'])

    // Курсор ушёл — остаток отсчитывается с нуля потраченного времени.
    region.dispatchEvent(new MouseEvent('mouseleave'))
    await nextTick()
    await vi.advanceTimersByTimeAsync(150)
    expect(toast.list.value).toHaveLength(0)

    wrapper.unmount()
    vi.useRealTimers()
  })
})

describe('GrToaster — пауза: курсор и фокус независимы', () => {
  it('mouseleave не возобновляет отсчёт, пока фокус внутри стека', async () => {
    vi.useFakeTimers()
    const wrapper = mount(GrToaster, {
      attachTo: document.body,
      global: { plugins: [granularityToastPlugin] },
    })
    const toast = wrapper.vm.$.appContext.app.runWithContext(() => useToast())
    toast.push({ title: 'Undo', timeoutMs: 100 })
    await nextTick()

    const hosts = document.querySelectorAll<HTMLElement>('[data-gr-toaster]')
    const region = hosts[hosts.length - 1]

    // Клавиатурный фокус в стеке, мышь прошла насквозь и ушла.
    region.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    region.dispatchEvent(new MouseEvent('mouseenter'))
    region.dispatchEvent(new MouseEvent('mouseleave'))
    await nextTick()

    // Фокус всё ещё внутри — отсчёт обязан стоять (WCAG 2.2.1).
    await vi.advanceTimersByTimeAsync(300)
    expect(toast.list.value).toHaveLength(1)

    // Фокус ушёл — отсчёт возобновился.
    region.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    await nextTick()
    await vi.advanceTimersByTimeAsync(300)
    expect(toast.list.value).toHaveLength(0)

    wrapper.unmount()
    vi.useRealTimers()
  })
})

describe('GrToaster — смахивание', () => {
  /**
   * jsdom не знает `PointerEvent`, а движение и отпускание примитив слушает на
   * `window` — приём тот же, что в спеках `useDragSort` и `useZoomPan`.
   */
  function pointer(type: string, init: MouseEventInit = {}): MouseEvent {
    return new MouseEvent(type, { bubbles: true, ...init })
  }

  /**
   * Отпущенный тост закрывается через два кадра: первый снимает запрет на
   * переход, второй задаёт точку отлёта (см. `releaseSwiped`).
   */
  async function flushRelease(): Promise<void> {
    await nextTick()
    await nextTick()
    await nextTick()
  }

  /**
   * Ищем внутри последнего хоста: уходящий тост остаётся в DOM до конца
   * перехода, и по всему документу можно поймать узел прошлого теста.
   */
  function currentHost(): HTMLElement {
    const hosts = document.querySelectorAll<HTMLElement>('[data-gr-toaster]')

    return hosts[hosts.length - 1]
  }

  /** Тост шириной 360px: порог — четверть, то есть 90px. */
  function toastNode(): HTMLElement {
    const nodes = currentHost().querySelectorAll<HTMLElement>('[data-gr-toast]')
    const node = nodes[nodes.length - 1]

    node.getBoundingClientRect = () => ({
      top: 0, bottom: 80, left: 0, right: 360, width: 360, height: 80, x: 0, y: 0, toJSON: () => ({}),
    })

    return node
  }

  async function mountWithToast(props: Record<string, unknown> = {}) {
    const wrapper = mount(GrToaster, {
      attachTo: document.body,
      props,
      global: { plugins: [granularityToastPlugin] },
    })
    const toast = wrapper.vm.$.appContext.app.runWithContext(() => useToast())
    toast.push({ title: 'Saved', timeoutMs: 0 })
    await nextTick()

    return { wrapper, toast }
  }

  it('смахивание за порог к своему краю закрывает тост', async () => {
    const { wrapper, toast } = await mountWithToast()
    const node = toastNode()

    node.dispatchEvent(pointer('pointerdown', { button: 0, clientX: 10 }))
    window.dispatchEvent(pointer('pointermove', { clientX: 140 }))
    window.dispatchEvent(pointer('pointerup'))
    await flushRelease()

    expect(toast.list.value).toHaveLength(0)

    wrapper.unmount()
  })

  it('короткое движение возвращает тост, а не закрывает', async () => {
    const { wrapper, toast } = await mountWithToast()
    const node = toastNode()

    node.dispatchEvent(pointer('pointerdown', { button: 0, clientX: 10 }))
    window.dispatchEvent(pointer('pointermove', { clientX: 50 }))
    await nextTick()
    expect(toastNode().style.transform).toBe('translateX(40px)')

    window.dispatchEvent(pointer('pointerup'))
    await nextTick()

    expect(toast.list.value).toHaveLength(1)
    expect(toastNode().style.transform).toBe('')

    wrapper.unmount()
  })

  it('обрыв жеста возвращает тост на место, а не дожимает смахивание', async () => {
    const { wrapper, toast } = await mountWithToast()
    const node = toastNode()

    node.dispatchEvent(pointer('pointerdown', { button: 0, clientX: 10 }))
    window.dispatchEvent(pointer('pointermove', { clientX: 200 }))
    window.dispatchEvent(pointer('pointercancel'))
    await nextTick()

    expect(toast.list.value).toHaveLength(1)
    expect(toastNode().style.transform).toBe('')

    wrapper.unmount()
  })

  it('движение от своего края тост не закрывает', async () => {
    const { wrapper, toast } = await mountWithToast()
    const node = toastNode()

    // Стек справа, тянем влево: сопротивление вчетверо, порог не берётся.
    node.dispatchEvent(pointer('pointerdown', { button: 0, clientX: 300 }))
    window.dispatchEvent(pointer('pointermove', { clientX: 0 }))
    window.dispatchEvent(pointer('pointerup'))
    await nextTick()

    expect(toast.list.value).toHaveLength(1)

    wrapper.unmount()
  })

  it('стек у левого края смахивается влево', async () => {
    const { wrapper, toast } = await mountWithToast({ placement: 'bottom-left' })
    const node = toastNode()

    node.dispatchEvent(pointer('pointerdown', { button: 0, clientX: 200 }))
    window.dispatchEvent(pointer('pointermove', { clientX: 60 }))
    window.dispatchEvent(pointer('pointerup'))
    await flushRelease()

    expect(toast.list.value).toHaveLength(0)

    wrapper.unmount()
  })

  it('`swipeDismiss: false` выключает жест', async () => {
    const { wrapper, toast } = await mountWithToast({ swipeDismiss: false })
    const node = toastNode()

    node.dispatchEvent(pointer('pointerdown', { button: 0, clientX: 10 }))
    window.dispatchEvent(pointer('pointermove', { clientX: 300 }))
    window.dispatchEvent(pointer('pointerup'))
    await nextTick()

    expect(toast.list.value).toHaveLength(1)

    wrapper.unmount()
  })

  it('пока тост тянут, таймер стоит', async () => {
    const wrapper = mount(GrToaster, {
      attachTo: document.body,
      global: { plugins: [granularityToastPlugin] },
    })
    const toast = wrapper.vm.$.appContext.app.runWithContext(() => useToast())
    toast.push({ title: 'Undo', timeoutMs: 5000 })
    await nextTick()

    const node = toastNode()
    node.dispatchEvent(pointer('pointerdown', { button: 0, clientX: 10 }))
    window.dispatchEvent(pointer('pointermove', { clientX: 60 }))
    await nextTick()

    const progress = currentHost().querySelector<HTMLElement>('[data-gr-toast-progress]')
    expect(progress?.style.animationPlayState).toBe('paused')

    window.dispatchEvent(pointer('pointerup'))
    wrapper.unmount()
  })

  it('нажатие на кнопке действия протяжкой не становится', async () => {
    const wrapper = mount(GrToaster, {
      attachTo: document.body,
      global: { plugins: [granularityToastPlugin] },
    })
    const toast = wrapper.vm.$.appContext.app.runWithContext(() => useToast())
    toast.push({ title: 'Deleted', timeoutMs: 0, action: { label: 'Undo', onClick: () => {} } })
    await nextTick()

    const actions = currentHost().querySelectorAll<HTMLElement>('[data-gr-toast-action]')
    const action = actions[actions.length - 1]

    action.dispatchEvent(pointer('pointerdown', { button: 0, clientX: 10 }))
    window.dispatchEvent(pointer('pointermove', { clientX: 300 }))
    await nextTick()

    // Тост стоит на месте: жест на кнопке не начался, и клик по «Отменить»
    // остаётся кликом. Сама обработка клика проверена в тестах действий выше.
    expect(toastNode().style.transform).toBe('')
    expect(toast.list.value).toHaveLength(1)

    window.dispatchEvent(pointer('pointerup'))
    wrapper.unmount()
  })

  it('`Delete` и `Backspace` закрывают сфокусированный тост', async () => {
    const first = await mountWithToast()
    toastNode().dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))
    await nextTick()
    expect(first.toast.list.value).toHaveLength(0)
    first.wrapper.unmount()

    const second = await mountWithToast()
    toastNode().dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))
    await nextTick()
    expect(second.toast.list.value).toHaveLength(0)
    second.wrapper.unmount()
  })
})
