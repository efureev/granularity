import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrProgressBar from '../GrProgressBar.vue'
import { GR_TONES } from '../../shared/tones'
import { grProgressBarFillClass, trackSizes } from '../grStyle'

const TRACK = '[data-gr-progress-bar-track]'
const FILL = '[data-gr-progress-bar-fill]'
const BUFFER = '[data-gr-progress-bar-buffer]'
const VALUE = '[data-gr-progress-bar-value]'

describe('GrProgressBar', () => {
  it('рендерит текущее значение и ширину прогресса', () => {
    const wrapper = mount(GrProgressBar, {
      props: {
        value: 45,
        ariaLabel: 'Upload progress',
      },
    })

    const track = wrapper.get(TRACK)

    expect(track.attributes('role')).toBe('progressbar')
    expect(track.attributes('aria-label')).toBe('Upload progress')
    expect(track.attributes('aria-valuemin')).toBe('0')
    expect(track.attributes('aria-valuemax')).toBe('100')
    expect(track.attributes('aria-valuenow')).toBe('45')
    expect(wrapper.get(FILL).attributes('style')).toContain('width: 45%;')
  })

  it('клампит значение выше 100', () => {
    const wrapper = mount(GrProgressBar, { props: { value: 140 } })

    expect(wrapper.get(TRACK).attributes('aria-valuenow')).toBe('100')
    expect(wrapper.get(FILL).attributes('style')).toContain('width: 100%;')
  })

  it('сбрасывает NaN и отрицательные значения к нулю', async () => {
    const wrapper = mount(GrProgressBar, { props: { value: Number.NaN } })

    expect(wrapper.get(TRACK).attributes('aria-valuenow')).toBe('0')
    expect(wrapper.get(FILL).attributes('style')).toContain('width: 0%;')

    await wrapper.setProps({ value: -5 })

    expect(wrapper.get(TRACK).attributes('aria-valuenow')).toBe('0')
    expect(wrapper.get(FILL).attributes('style')).toContain('width: 0%;')
  })
})

describe('GrProgressBar — неопределённый режим', () => {
  it('не объявляет значение, но сохраняет границы', () => {
    const wrapper = mount(GrProgressBar, {
      props: { value: 40, indeterminate: true, ariaLabel: 'Loading' },
    })

    const track = wrapper.get(TRACK)

    expect(track.attributes('aria-valuenow')).toBeUndefined()
    expect(track.attributes('aria-valuetext')).toBeUndefined()
    expect(track.attributes('aria-valuemin')).toBe('0')
    expect(track.attributes('aria-valuemax')).toBe('100')
    expect(track.attributes('aria-label')).toBe('Loading')
  })

  it('помечает трек data-атрибутом и не задаёт ширину заливки инлайном', () => {
    const wrapper = mount(GrProgressBar, { props: { value: 40, indeterminate: true } })

    expect(wrapper.get(TRACK).attributes('data-gr-progress-bar-indeterminate')).toBe('')
    expect(wrapper.get(FILL).attributes('style')).toBeUndefined()
  })

  it('не показывает ни подписи, ни буфера — показывать нечего', () => {
    const wrapper = mount(GrProgressBar, {
      props: { value: 40, buffer: 80, indeterminate: true, showValue: true },
    })

    expect(wrapper.find(VALUE).exists()).toBe(false)
    expect(wrapper.find(BUFFER).exists()).toBe(false)
  })

  it('возвращает значение и подпись, когда прогресс снова известен', async () => {
    const wrapper = mount(GrProgressBar, {
      props: { value: 62, indeterminate: true, showValue: true },
    })

    await wrapper.setProps({ indeterminate: false })

    expect(wrapper.get(TRACK).attributes('aria-valuenow')).toBe('62')
    expect(wrapper.get(TRACK).attributes('data-gr-progress-bar-indeterminate')).toBeUndefined()
    expect(wrapper.get(VALUE).text()).toBe('62%')
  })
})

describe('GrProgressBar — подпись значения', () => {
  it('без showValue подписи нет', () => {
    const wrapper = mount(GrProgressBar, { props: { value: 45 } })

    expect(wrapper.find(VALUE).exists()).toBe(false)
  })

  it('по умолчанию печатает целые проценты', () => {
    const wrapper = mount(GrProgressBar, { props: { value: 45.6, showValue: true } })

    expect(wrapper.get(VALUE).text()).toBe('46%')
  })

  it('formatValue управляет и подписью, и aria-valuetext', () => {
    const wrapper = mount(GrProgressBar, {
      props: {
        value: 45,
        showValue: true,
        formatValue: (value: number) => `${value} из 100 файлов`,
      },
    })

    expect(wrapper.get(VALUE).text()).toBe('45 из 100 файлов')
    expect(wrapper.get(TRACK).attributes('aria-valuetext')).toBe('45 из 100 файлов')
  })

  it('без своего формата aria-valuetext не выставляется', () => {
    const wrapper = mount(GrProgressBar, { props: { value: 45, showValue: true } })

    expect(wrapper.get(TRACK).attributes('aria-valuetext')).toBeUndefined()
  })

  it('получает значение из формата даже без видимой подписи', () => {
    const wrapper = mount(GrProgressBar, {
      props: { value: 45, formatValue: (value: number) => `${value} MB` },
    })

    expect(wrapper.find(VALUE).exists()).toBe(false)
    expect(wrapper.get(TRACK).attributes('aria-valuetext')).toBe('45 MB')
  })
})

describe('GrProgressBar — буфер', () => {
  it('без пропа слоя нет', () => {
    const wrapper = mount(GrProgressBar, { props: { value: 30 } })

    expect(wrapper.find(BUFFER).exists()).toBe(false)
  })

  it('рендерит слой позади заливки', () => {
    const wrapper = mount(GrProgressBar, { props: { value: 30, buffer: 70 } })

    const layers = wrapper.get(TRACK).findAll('div')

    expect(layers[0].attributes('data-gr-progress-bar-buffer')).toBe('')
    expect(layers[0].attributes('style')).toContain('width: 70%;')
    expect(layers[1].attributes('data-gr-progress-bar-fill')).toBe('')
  })

  it('клампит буфер по тем же правилам, что и значение', async () => {
    const wrapper = mount(GrProgressBar, { props: { value: 30, buffer: 180 } })

    expect(wrapper.get(BUFFER).attributes('style')).toContain('width: 100%;')

    await wrapper.setProps({ buffer: Number.NaN })

    expect(wrapper.get(BUFFER).attributes('style')).toContain('width: 0%;')
  })

  it('буфер меньше значения слой не ломает', () => {
    const wrapper = mount(GrProgressBar, { props: { value: 80, buffer: 20 } })

    expect(wrapper.get(BUFFER).attributes('style')).toContain('width: 20%;')
    expect(wrapper.get(FILL).attributes('style')).toContain('width: 80%;')
  })

  it('нулевой буфер отличим от отсутствующего', () => {
    const wrapper = mount(GrProgressBar, { props: { value: 10, buffer: 0 } })

    expect(wrapper.get(BUFFER).attributes('style')).toContain('width: 0%;')
  })
})

describe('GrProgressBar — оформление и размеры', () => {
  it('заливка берёт класс своего тона', () => {
    for (const tone of GR_TONES) {
      const wrapper = mount(GrProgressBar, { props: { value: 50, tone } })

      expect(wrapper.get(FILL).classes()).toContain(grProgressBarFillClass(tone))
    }
  })

  it('size задаёт толщину трека', () => {
    const wrapper = mount(GrProgressBar, { props: { value: 50, size: 'lg' } })

    expect(wrapper.get(TRACK).classes()).toContain(trackSizes.lg)
  })

  it('xs из GrConfigProvider доходит до полосы', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrProgressBar },
      template: `<GrConfigProvider size="xs"><GrProgressBar :value="50" show-value /></GrConfigProvider>`,
    })

    const wrapper = mount(Harness)

    expect(wrapper.get(TRACK).classes()).toContain(trackSizes.xs)
    expect(wrapper.get(VALUE).classes()).toContain('text-[length:var(--gr-text-2xs)]')
  })

  it('оформление держится на токенах, а не на прозрачности', () => {
    const wrapper = mount(GrProgressBar, {
      props: { value: 50, buffer: 70, showValue: true },
    })

    expect(wrapper.html()).not.toMatch(/opacity-\d/)
  })
})
