import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrAvatar from '../GrAvatar.vue'

describe('GrAvatar', () => {
  it('по умолчанию рендерит слот и круглую форму', () => {
    const wrapper = mount(GrAvatar, {
      slots: {
        default: 'AB',
      },
    })

    const root = wrapper.get('span')

    expect(wrapper.text()).toContain('AB')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(root.attributes('class')).toContain('inline-flex')
    expect(root.attributes('class')).toContain('overflow-hidden')
    expect(root.attributes('class')).toContain('rounded-full')
    expect(root.attributes('style')).toContain('width: 40px;')
    expect(root.attributes('style')).toContain('height: 40px;')
  })

  it('рендерит изображение и square-форму, когда передан src', () => {
    const wrapper = mount(GrAvatar, {
      props: {
        src: '/avatar.png',
        alt: 'Avatar',
        shape: 'square',
      },
      slots: {
        default: 'AB',
      },
    })

    const image = wrapper.get('img')

    expect(image.attributes('src')).toBe('/avatar.png')
    expect(image.attributes('alt')).toBe('Avatar')
    expect(image.attributes('class')).toContain('object-cover')
    expect(wrapper.attributes('class')).toContain('rounded-[10px]')
    expect(wrapper.text()).not.toContain('AB')
  })

  it('уважает кастомный size', () => {
    const wrapper = mount(GrAvatar, {
      props: {
        size: 56,
      },
    })

    expect(wrapper.attributes('style')).toContain('width: 56px;')
    expect(wrapper.attributes('style')).toContain('height: 56px;')
  })
})