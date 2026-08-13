import { mount } from '@vue/test-utils'
import { defineComponent, markRaw, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GrLoading from '../GrLoading.vue'
import { granularityGlobal } from '../../../testing'

describe('granularity/GrLoading (unit)', () => {
  it('рендерит дефолтный текст, дефолтный overlay-класс и анимированный спиннер', () => {
    const wrapper = mount(GrLoading)

    const root = wrapper.get('[data-gr-loading]')
    const spinner = root.get('[data-gr-loading-spinner]')

    expect(root.attributes('class')).toContain('absolute')
    expect(root.attributes('class')).toContain('inset-0')
    expect(root.attributes('class')).toContain('z-10')
    expect(root.attributes('class')).toContain('bg-[var(--gr-overlay-bg)]')
    expect(root.attributes('role')).toBe('status')
    expect(root.attributes('aria-live')).toBe('polite')
    expect(wrapper.text()).toContain('Loading...')
    expect(spinner.attributes('class')).toContain('animate-spin')
    expect(spinner.attributes('class')).toContain('text-[var(--gr-muted-fg)]')
    expect(spinner.attributes('aria-hidden')).toBe('true')
  })

  it('берёт дефолтный текст из локали', () => {
    const wrapper = mount(GrLoading, {
      global: granularityGlobal({ i18n: { 'gr.loading.defaultText': 'Загрузка...' } }),
    })

    expect(wrapper.text()).toContain('Загрузка...')
  })

  it('поддерживает fullscreen, custom background, zIndexVar и скрытие текста', () => {
    const wrapper = mount(GrLoading, {
      props: {
        text: '',
        animated: false,
        fullscreen: true,
        background: 'rgba(255, 0, 0, 0.2)',
        zIndexVar: '--app-z-loading',
        customClass: 'custom-overlay',
        spinnerClass: 'custom-spinner',
      },
    })

    const root = wrapper.get('[data-gr-loading]')
    const spinner = root.get('[data-gr-loading-spinner]')

    expect(root.attributes('class')).toContain('fixed')
    expect(root.attributes('class')).toContain('z-[var(--gr-z-loading)]')
    expect(root.attributes('class')).toContain('custom-overlay')
    expect(root.attributes('class')).not.toContain('bg-[var(--gr-overlay-bg)]')
    expect(root.attributes('style')).toContain('background-color: rgba(255, 0, 0, 0.2);')
    expect(root.attributes('style')).toContain('z-index: var(--app-z-loading);')
    expect(root.find('[data-gr-loading-text]').exists()).toBe(false)
    expect(spinner.attributes('class')).toContain('custom-spinner')
    expect(spinner.attributes('class')).not.toContain('animate-spin')
  })

  it('fullscreen без zIndexVar не пишет инлайновый z-index — слой берётся классом', () => {
    const wrapper = mount(GrLoading, { props: { fullscreen: true } })

    expect(wrapper.get('[data-gr-loading]').attributes('style') ?? '').not.toContain('z-index')
  })

  it('размер и тон спиннера идут через шкалу иконок', () => {
    const scaled = mount(GrLoading, { props: { spinnerSize: 'sm', spinnerTone: 'primary' } })
    const spinner = scaled.get('[data-gr-loading-spinner]')

    expect(spinner.attributes('style')).toContain('--gr-icon-size: var(--gr-icon-size-sm)')
    expect(spinner.attributes('class')).toContain('text-[var(--gr-primary)]')

    const pixels = mount(GrLoading, { props: { spinnerSize: 40 } })
    expect(pixels.get('[data-gr-loading-spinner]').attributes('style')).toContain('--gr-icon-size: 40px')
  })

  it('рендерит кастомный spinner-компонент', () => {
    const CustomSpinner = markRaw(defineComponent({
      name: 'CustomSpinner',
      template: '<svg data-testid="custom-spinner" />',
    }))

    const wrapper = mount(GrLoading, {
      props: {
        spinner: CustomSpinner,
        text: 'Please wait',
      },
    })

    expect(wrapper.find('[data-testid="custom-spinner"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Please wait')
  })

  it('слот заменяет содержимое панели целиком', () => {
    const wrapper = mount(GrLoading, {
      slots: { default: '<progress data-testid="progress" value="0.4" />' },
    })

    expect(wrapper.find('[data-testid="progress"]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-loading-spinner]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-loading-text]').exists()).toBe(false)
    // Панель остаётся: слот меняет её содержимое, а не подложку и оверлей.
    expect(wrapper.find('[data-gr-loading-panel]').exists()).toBe(true)
  })

  describe('delay', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('до истечения задержки оверлея нет, после — есть, и он объявляет `show`', async () => {
      const wrapper = mount(GrLoading, { props: { delay: 200 } })

      expect(wrapper.find('[data-gr-loading]').exists()).toBe(false)
      expect(wrapper.emitted('show')).toBeUndefined()

      vi.advanceTimersByTime(199)
      await nextTick()
      expect(wrapper.find('[data-gr-loading]').exists()).toBe(false)

      vi.advanceTimersByTime(1)
      await nextTick()
      expect(wrapper.find('[data-gr-loading]').exists()).toBe(true)
      expect(wrapper.emitted('show')).toHaveLength(1)
    })

    it('без задержки показывается сразу и сразу объявляет `show`', () => {
      const wrapper = mount(GrLoading)

      expect(wrapper.find('[data-gr-loading]').exists()).toBe(true)
      expect(wrapper.emitted('show')).toHaveLength(1)
    })

    it('размонтирование до истечения задержки снимает таймер', () => {
      const wrapper = mount(GrLoading, { props: { delay: 200 } })
      wrapper.unmount()

      expect(() => vi.advanceTimersByTime(500)).not.toThrow()
    })
  })
})
