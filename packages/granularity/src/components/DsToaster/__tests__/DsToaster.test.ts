import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/loader-circle', () => {
  return {
    default: defineComponent({
      name: 'IconLoaderCircle',
      template: '<svg data-icon="loader-circle" />',
    }),
  }
})

vi.mock('~icons/lucide/check-circle', () => {
  return {
    default: defineComponent({
      name: 'IconCheckCircle',
      template: '<svg data-icon="check-circle" />',
    }),
  }
})

vi.mock('~icons/lucide/alert-triangle', () => {
  return {
    default: defineComponent({
      name: 'IconAlertTriangle',
      template: '<svg data-icon="alert-triangle" />',
    }),
  }
})

vi.mock('~icons/lucide/x-circle', () => {
  return {
    default: defineComponent({
      name: 'IconXCircle',
      template: '<svg data-icon="x-circle" />',
    }),
  }
})

vi.mock('~icons/lucide/info', () => {
  return {
    default: defineComponent({
      name: 'IconInfo',
      template: '<svg data-icon="info" />',
    }),
  }
})

vi.mock('~icons/lucide/x', () => {
  return {
    default: defineComponent({
      name: 'IconX',
      template: '<svg data-icon="x" />',
    }),
  }
})

import { useToast } from '../../../composables/useToast'
import DsToaster from '../DsToaster.vue'

afterEach(() => {
  useToast().clear()
  document.body.innerHTML = ''
})

describe('DsToaster', () => {
  it('рендерит toast из useToast и показывает tone-иконку с цветом', () => {
    const toast = useToast()
    toast.clear()
    toast.push({
      title: 'Saved',
      message: 'Profile updated',
      variant: 'success',
      timeoutMs: 0,
    })

    mount(DsToaster, {
      attachTo: document.body,
    })

    expect(document.body.textContent).toContain('Saved')
    expect(document.body.textContent).toContain('Profile updated')

    const icon = document.body.querySelector('[data-icon="check-circle"]')
    expect(icon).not.toBeNull()
    expect(icon?.getAttribute('style')).toContain('color: var(--ds-success)')
  })

  it('dismiss удаляет toast по клику на кнопку закрытия', async () => {
    const toast = useToast()
    toast.clear()
    const id = toast.push({
      title: 'Warning',
      variant: 'warning',
      timeoutMs: 0,
    })

    mount(DsToaster, {
      attachTo: document.body,
    })

    const closeButton = document.body.querySelector<HTMLButtonElement>('button[aria-label="Dismiss"]')
    expect(closeButton).not.toBeNull()

    closeButton?.click()
    await nextTick()

    expect(toast.list.value.find(item => item.id === id)).toBeUndefined()
    expect(document.body.textContent).not.toContain('Warning')
  })
})