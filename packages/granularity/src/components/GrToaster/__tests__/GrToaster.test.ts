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

import { granularityToastPlugin, useToast } from '../../../composables/useToast'
import GrToaster from '../GrToaster.vue'

afterEach(() => {
  useToast().clear()
  document.body.innerHTML = ''
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
