import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi  } from 'vitest'


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

import { useToast } from '../../../composables/useToast'
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

  it('info/success — role=status, warning/danger — role=alert; список в постоянном live-region', async () => {
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

    // Постоянный live-region — на обёртке списка (существует до вставки тостов).
    const liveRegion = document.body.querySelector('[data-gr-toaster] [aria-live="polite"]')
    expect(liveRegion).not.toBeNull()
    expect(liveRegion?.contains(byVariant.info)).toBe(true)
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
