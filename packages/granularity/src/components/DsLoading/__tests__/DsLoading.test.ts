import { mount } from '@vue/test-utils'
import { defineComponent, markRaw } from 'vue'
import { describe, expect, it } from 'vitest'

import DsLoading from '../DsLoading.vue'

describe('granularity/DsLoading (unit)', () => {
  it('рендерит дефолтный текст, дефолтный overlay-класс и анимированный спиннер', () => {
    const wrapper = mount(DsLoading)

    const root = wrapper.get('[data-ds-loading]')
    const spinner = root.find('.ds-loading__spinner')

    expect(root.attributes('class')).toContain('absolute')
    expect(root.attributes('class')).toContain('inset-0')
    expect(root.attributes('class')).toContain('z-10')
    expect(root.attributes('class')).toContain('bg-black/25')
    expect(root.attributes('role')).toBe('status')
    expect(root.attributes('aria-live')).toBe('polite')
    expect(wrapper.text()).toContain('Loading...')
    expect(spinner.attributes('class')).toContain('ds-loading__spinner--animated')
  })

  it('поддерживает fullscreen, custom background, zIndex и скрытие текста', () => {
    const wrapper = mount(DsLoading, {
      props: {
        text: '',
        animated: false,
        fullscreen: true,
        background: 'rgba(255, 0, 0, 0.2)',
        zIndex: 777,
        customClass: 'custom-overlay',
        spinnerClass: 'custom-spinner',
      },
    })

    const root = wrapper.get('[data-ds-loading]')
    const spinner = root.find('.ds-loading__spinner')

    expect(root.attributes('class')).toContain('fixed')
    expect(root.attributes('class')).toContain('z-50')
    expect(root.attributes('class')).toContain('custom-overlay')
    expect(root.attributes('class')).not.toContain('bg-black/25')
    expect(root.attributes('style')).toContain('background-color: rgba(255, 0, 0, 0.2);')
    expect(root.attributes('style')).toContain('z-index: 777;')
    expect(root.find('.text-sm').exists()).toBe(false)
    expect(spinner.attributes('class')).toContain('custom-spinner')
    expect(spinner.attributes('class')).not.toContain('ds-loading__spinner--animated')
  })

  it('рендерит кастомный spinner-компонент', () => {
    const CustomSpinner = markRaw(defineComponent({
      name: 'CustomSpinner',
      template: '<svg data-testid="custom-spinner" />',
    }))

    const wrapper = mount(DsLoading, {
      props: {
        spinner: CustomSpinner,
        text: 'Please wait',
      },
    })

    expect(wrapper.find('[data-testid="custom-spinner"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Please wait')
  })
})