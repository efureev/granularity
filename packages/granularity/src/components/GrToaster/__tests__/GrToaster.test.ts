import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { vi } from 'vitest'

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
      variant: 'success',
      timeoutMs: 0,
    })

    mount(GrToaster, { attachTo: document.body })

    expect(document.body.textContent).toContain('Saved')
    expect(document.body.textContent).toContain('Profile updated')

    const icon = document.body.querySelector('[data-icon="check-circle"]')
    expect(icon).not.toBeNull()

    // Цвет приходит через inline-style на обёртке `GrIcon`.
    const iconWrapper = icon?.closest('[data-ds-icon]') as HTMLElement | null
    expect(iconWrapper).not.toBeNull()
    expect(iconWrapper?.getAttribute('style')).toContain('color: var(--ds-success)')
  })

  it('контейнер — a11y-регион с aria-label, кастомизируется regionLabel', () => {
    mount(GrToaster, {
      attachTo: document.body,
      props: { regionLabel: 'Уведомления' },
    })

    const region = document.body.querySelector('[data-ds-toaster]')
    expect(region).not.toBeNull()
    expect(region?.getAttribute('role')).toBe('region')
    expect(region?.getAttribute('aria-label')).toBe('Уведомления')
  })

  it('info/success имеют role=status+polite, warning/danger — role=alert+assertive', async () => {
    const toast = useToast()
    toast.push({ title: 'Info', variant: 'info', timeoutMs: 0 })
    toast.push({ title: 'Danger', variant: 'danger', timeoutMs: 0 })
    toast.push({ title: 'Warn', variant: 'warning', timeoutMs: 0 })
    toast.push({ title: 'Ok', variant: 'success', timeoutMs: 0 })

    mount(GrToaster, { attachTo: document.body })
    await nextTick()

    const items = Array.from(
      document.body.querySelectorAll<HTMLElement>('[data-ds-toast]'),
    )
    const byVariant = Object.fromEntries(
      items.map(el => [el.getAttribute('data-variant'), el] as const),
    )

    expect(byVariant.info.getAttribute('role')).toBe('status')
    expect(byVariant.info.getAttribute('aria-live')).toBe('polite')
    expect(byVariant.success.getAttribute('role')).toBe('status')
    expect(byVariant.success.getAttribute('aria-live')).toBe('polite')
    expect(byVariant.warning.getAttribute('role')).toBe('alert')
    expect(byVariant.warning.getAttribute('aria-live')).toBe('assertive')
    expect(byVariant.danger.getAttribute('role')).toBe('alert')
    expect(byVariant.danger.getAttribute('aria-live')).toBe('assertive')
  })

  it('placement применяет классы угла (bottom-left)', () => {
    mount(GrToaster, {
      attachTo: document.body,
      props: { placement: 'bottom-left' },
    })

    const region = document.body.querySelector('[data-ds-toaster]') as HTMLElement
    expect(region.className).toContain('left-4')
    expect(region.className).toContain('bottom-4')
    expect(region.className).not.toContain('right-4')
    expect(region.className).not.toContain('top-4')
  })

  it('dismiss удаляет toast по клику на кнопку закрытия (i18n dismissLabel)', async () => {
    const toast = useToast()
    const id = toast.push({
      title: 'Warning',
      variant: 'warning',
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
      const id = toast.push({ title: 'Auto', variant: 'info', timeoutMs: 1000 })
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
