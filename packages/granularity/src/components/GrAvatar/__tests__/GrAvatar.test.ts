import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrAvatar from '../GrAvatar.vue'
import GrAvatarGroup from '../GrAvatarGroup.vue'
import { initialsFrom } from '../grAvatarStyles'

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
    expect(wrapper.attributes('class')).toContain('rounded-[var(--gr-avatar-square-radius,10px)]')
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
describe('GrAvatar — битая и загружающаяся картинка', () => {
  it('битая ссылка уходит на fallbackSrc, а затем на инициалы', async () => {
    const wrapper = mount(GrAvatar, {
      props: { src: '/broken.png', fallbackSrc: '/backup.png', name: 'Ada Lovelace' },
    })

    expect(wrapper.get('[data-gr-avatar-image]').attributes('src')).toBe('/broken.png')

    // Раньше `v-if="src"` оставался истинным, и браузер рисовал сломанную
    // картинку: слот не показывался никогда.
    await wrapper.get('[data-gr-avatar-image]').trigger('error')
    expect(wrapper.get('[data-gr-avatar-image]').attributes('src')).toBe('/backup.png')

    await wrapper.get('[data-gr-avatar-image]').trigger('error')
    expect(wrapper.find('[data-gr-avatar-image]').exists()).toBe(false)
    expect(wrapper.get('[data-gr-avatar-initials]').text()).toBe('AL')
  })

  it('новая ссылка не наследует ошибку прошлой', async () => {
    const wrapper = mount(GrAvatar, { props: { src: '/broken.png', name: 'Ada' } })

    await wrapper.get('[data-gr-avatar-image]').trigger('error')
    expect(wrapper.find('[data-gr-avatar-image]').exists()).toBe(false)

    await wrapper.setProps({ src: '/fresh.png' })
    expect(wrapper.get('[data-gr-avatar-image]').attributes('src')).toBe('/fresh.png')
  })

  it('скелет держит место, пока картинка едет', async () => {
    const wrapper = mount(GrAvatar, { props: { src: '/avatar.png' } })

    expect(wrapper.find('[data-gr-avatar-skeleton]').exists()).toBe(true)

    await wrapper.get('[data-gr-avatar-image]').trigger('load')
    expect(wrapper.find('[data-gr-avatar-skeleton]').exists()).toBe(false)
  })
})

describe('GrAvatar — имя, статус и конфиг', () => {
  it('инициалы и доступное имя берутся из name', () => {
    const wrapper = mount(GrAvatar, { props: { name: 'Grace Brewster Hopper' } })

    // Две первых слова, остальное отбрасывается.
    expect(wrapper.get('[data-gr-avatar-initials]').text()).toBe('GB')
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Grace Brewster Hopper')
  })

  it('слот сильнее name', () => {
    const wrapper = mount(GrAvatar, { props: { name: 'Ada Lovelace' }, slots: { default: 'QA' } })

    expect(wrapper.find('[data-gr-avatar-initials]').exists()).toBe(false)
    expect(wrapper.text()).toContain('QA')
  })

  it('статус объявляется словом, а не только цветом', () => {
    const wrapper = mount(GrAvatar, { props: { name: 'Ada', status: 'online' } })

    expect(wrapper.get('[data-gr-avatar-status]').attributes('aria-hidden')).toBe('true')
    const label = wrapper.get('[data-gr-avatar-status-label]')
    expect(label.classes()).toContain('sr-only')
    expect(label.text()).toBe('online')
  })

  it('shape читается из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrAvatar },
      template: `
        <GrConfigProvider :component-defaults="{ GrAvatar: { shape: 'square' } }">
          <GrAvatar name="Ada" />
        </GrConfigProvider>
      `,
    })

    expect(mount(Harness).get('[data-gr-avatar]').classes()).toContain('rounded-[var(--gr-avatar-square-radius,10px)]')
  })

  it('initialsFrom — чистая функция', () => {
    expect(initialsFrom('Ada Lovelace')).toBe('AL')
    expect(initialsFrom('  ada   lovelace  ')).toBe('AL')
    expect(initialsFrom('Прометей')).toBe('П')
    expect(initialsFrom('')).toBe('')
  })
})

describe('GrAvatarGroup', () => {
  function mountGroup(props: Record<string, unknown> = {}) {
    return mount(GrAvatarGroup, {
      props,
      slots: {
        default: `
          <GrAvatar name="Ada Lovelace" />
          <GrAvatar name="Grace Hopper" />
          <GrAvatar name="Barbara Liskov" />
        `,
      },
      global: { components: { GrAvatar } },
    })
  }

  it('стекает аватары и объявляет группу', () => {
    const wrapper = mountGroup()

    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('People')
    expect(wrapper.findAll('[data-gr-avatar]')).toHaveLength(3)
    expect(wrapper.findAll('[data-gr-avatar]')[1].classes()).toContain('-ml-2')
  })

  it('max сворачивает остаток в «+N» и сообщает его в имени группы', () => {
    const wrapper = mountGroup({ max: 2 })

    expect(wrapper.findAll('[data-gr-avatar]')).toHaveLength(2)
    expect(wrapper.get('[data-gr-avatar-group-overflow]').text()).toBe('+1')
    // Счётчик декоративен: число уже озвучено в имени группы.
    expect(wrapper.get('[data-gr-avatar-group-overflow]').attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('aria-label')).toContain('and 1 more')
  })

  it('total учитывает участников, которых нет в слоте', () => {
    const wrapper = mountGroup({ max: 2, total: 12 })

    expect(wrapper.get('[data-gr-avatar-group-overflow]').text()).toBe('+10')
  })

  it('размер и форма группы доходят до детей', () => {
    const wrapper = mountGroup({ size: 'xs', shape: 'square' })
    const first = wrapper.findAll('[data-gr-avatar]')[0]

    expect(first.attributes('style')).toContain('width: 24px')
    expect(first.classes()).toContain('rounded-[var(--gr-avatar-square-radius,10px)]')
  })
})
