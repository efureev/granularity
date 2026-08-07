import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrList, { GrListItem } from '..'

describe('GrList', () => {
  it('рендерит список внутри карточки и по умолчанию добавляет разделители', () => {
    const wrapper = mount(GrList, {
      slots: {
        default: `
          <GrListItem title="Notifications" description="Choose delivery channels">
            <button type="button">Manage</button>
          </GrListItem>
        `,
      },
      global: {
        components: {
          GrListItem,
        },
      },
    })

    expect(wrapper.text()).toContain('Notifications')
    expect(wrapper.text()).toContain('Choose delivery channels')
    expect(wrapper.get('button').text()).toBe('Manage')
    expect(wrapper.find('.divide-y').exists()).toBe(true)
    expect(wrapper.find('[role="list"]').exists()).toBe(true)
    expect(wrapper.find('[role="listitem"]').exists()).toBe(true)
  })

  it('не добавляет divide-y при divided=false, но сохраняет role="list"', () => {
    const wrapper = mount(GrList, {
      props: { divided: false },
      slots: { default: '<div data-testid="child">child</div>' },
    })

    expect(wrapper.find('.divide-y').exists()).toBe(false)
    expect(wrapper.find('[role="list"]').exists()).toBe(true)
  })
})

describe('GrListItem', () => {
  it('экспортируется и скрывает description, если он не передан', () => {
    const wrapper = mount(GrListItem, {
      props: {
        title: 'Security',
      },
      slots: {
        default: '<span>Status</span>',
      },
    })

    expect(wrapper.text()).toContain('Security')
    expect(wrapper.text()).toContain('Status')
    expect(wrapper.find('.text-\\[var\\(--gr-muted-fg\\)\\]').exists()).toBe(false)
    expect(wrapper.attributes('role')).toBe('listitem')
  })

  it('поддерживает слоты title, description и prefix', () => {
    const wrapper = mount(GrListItem, {
      slots: {
        title: '<span data-testid="title">Custom <b>Title</b></span>',
        description: '<span data-testid="desc">Custom description</span>',
        prefix: '<span data-testid="prefix">ICON</span>',
      },
    })

    expect(wrapper.get('[data-testid="title"]').text()).toContain('Custom')
    expect(wrapper.get('[data-testid="desc"]').text()).toBe('Custom description')
    expect(wrapper.get('[data-testid="prefix"]').text()).toBe('ICON')
  })

  it('меняет вертикальный паддинг при density="compact"', () => {
    const compact = mount(GrListItem, { props: { title: 'T', density: 'compact' } })
    expect(compact.attributes('class')).toContain('py-2')
    expect(compact.attributes('class')).not.toContain('py-3')

    const regular = mount(GrListItem, { props: { title: 'T' } })
    expect(regular.attributes('class')).toContain('py-3')
  })
})

describe('GrList — пустое состояние', () => {
  // Пустоту компонент видит сам: `v-for` по пустому массиву оставляет фрагмент
  // без узлов, `v-if` — комментарий, и ни то ни другое пунктом не является.
  it('определяет пустоту по содержимому слота', () => {
    const wrapper = mount(GrList, { slots: { default: '<!-- v-if -->' } })

    expect(wrapper.get('[data-gr-list-empty]').text()).toBe('Nothing here yet')
    expect(wrapper.get('[data-gr-list]').attributes('role')).toBe('list')
  })

  it('со списком пунктов пустое состояние не показывается', () => {
    const wrapper = mount(GrList, {
      global: { components: { GrListItem } },
      slots: { default: '<GrListItem title="A" />' },
    })

    expect(wrapper.find('[data-gr-list-empty]').exists()).toBe(false)
  })

  it('слот #empty сильнее текста', () => {
    const wrapper = mount(GrList, {
      slots: { empty: '<button data-testid="cta">Добавить</button>' },
    })

    expect(wrapper.find('[data-testid="cta"]').exists()).toBe(true)
  })

  it('emptyText перекрывает текст из локали', () => {
    const wrapper = mount(GrList, { props: { emptyText: 'Нет заявок' } })

    expect(wrapper.get('[data-gr-list-empty]').text()).toBe('Нет заявок')
  })

  it('проп empty остаётся escape-hatch’ем в обе стороны', () => {
    const forced = mount(GrList, {
      props: { empty: true },
      global: { components: { GrListItem } },
      slots: { default: '<GrListItem title="A" />' },
    })
    expect(forced.find('[data-gr-list-empty]').exists()).toBe(true)

    const suppressed = mount(GrList, { props: { empty: false } })
    expect(suppressed.find('[data-gr-list-empty]').exists()).toBe(false)
  })

  // Разделители между пунктами; в пустой ветке линия висела бы сама по себе.
  it('в пустой ветке нет divide-y', () => {
    const wrapper = mount(GrList)

    expect(wrapper.get('[data-gr-list]').classes()).not.toContain('divide-y')
  })
})

describe('GrList — загрузка', () => {
  it('показывает скелетоны и помечает контейнер aria-busy', () => {
    const wrapper = mount(GrList, {
      props: { loading: true },
      global: { components: { GrListItem } },
      slots: { default: '<GrListItem title="A" />' },
    })

    expect(wrapper.get('[data-gr-list]').attributes('aria-busy')).toBe('true')
    expect(wrapper.findAll('[data-gr-list-loading-row]')).toHaveLength(3)
    expect(wrapper.findAll('[data-gr-skeleton]')).toHaveLength(3)
    expect(wrapper.find('[data-gr-list-item]').exists()).toBe(false)
  })

  it('число строк настраивается, слот #loading сильнее', () => {
    expect(mount(GrList, { props: { loading: true, loadingRows: 5 } })
      .findAll('[data-gr-list-loading-row]')).toHaveLength(5)

    const custom = mount(GrList, {
      props: { loading: true },
      slots: { loading: '<div data-testid="spinner" />' },
    })
    expect(custom.find('[data-testid="spinner"]').exists()).toBe(true)
    expect(custom.find('[data-gr-list-loading-row]').exists()).toBe(false)
  })

  it('загрузка сильнее пустоты — иначе пустой список мигал бы текстом', () => {
    const wrapper = mount(GrList, { props: { loading: true } })

    expect(wrapper.find('[data-gr-list-empty]').exists()).toBe(false)
  })
})

describe('GrListItem — кликабельная строка', () => {
  // Роль остаётся на обёртке: `<a role="listitem">` потерял бы роль ссылки,
  // а интерактив снаружи разорвал бы связку list → listitem.
  it('href делает строку ссылкой, не ломая роль пункта', () => {
    const wrapper = mount(GrListItem, { props: { title: 'Docs', href: '/docs' } })

    expect(wrapper.attributes('role')).toBe('listitem')
    const action = wrapper.get('[data-gr-list-item-action]')
    expect(action.element.tagName).toBe('A')
    expect(action.attributes('href')).toBe('/docs')
  })

  it('clickable даёт button и событие click', async () => {
    const wrapper = mount(GrListItem, { props: { title: 'Row', clickable: true } })
    const action = wrapper.get('[data-gr-list-item-action]')

    expect(action.element.tagName).toBe('BUTTON')
    expect(action.attributes('type')).toBe('button')

    await action.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('as подменяет тег строки', () => {
    const wrapper = mount(GrListItem, { props: { title: 'Row', as: 'span', clickable: true } })

    expect(wrapper.get('[data-gr-list-item-action]').element.tagName).toBe('SPAN')
  })

  it('disabled не делает строку интерактивной и не эмитит click', async () => {
    const wrapper = mount(GrListItem, { props: { title: 'Row', href: '/docs', disabled: true } })

    expect(wrapper.find('[data-gr-list-item-action]').exists()).toBe(false)
    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.classes()).toContain('cursor-not-allowed')
    expect(wrapper.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('обычный пункт остаётся одиночным div без лишней вложенности', () => {
    const wrapper = mount(GrListItem, { props: { title: 'Row' } })

    expect(wrapper.attributes('role')).toBe('listitem')
    expect(wrapper.find('[data-gr-list-item-action]').exists()).toBe(false)
    expect(wrapper.classes()).toContain('px-4')
  })

  it('hoverable подсвечивает строку, не делая её кнопкой', () => {
    const wrapper = mount(GrListItem, { props: { title: 'Row', hoverable: true } })

    expect(wrapper.find('[data-gr-list-item-action]').exists()).toBe(false)
    expect(wrapper.classes()).toContain('hover:bg-[var(--gr-muted)]')
  })
})

describe('GrList — поверхность и типографика', () => {
  const sizeToken = 'text-[length:var(--gr-text-sm)]'

  it('variant доходит до карточки под списком', () => {
    const wrapper = mount(GrList, { props: { variant: 'ghost' }, slots: { default: '<div>row</div>' } })

    const card = wrapper.get('[data-gr-card]')
    expect(card.classes()).not.toContain('shadow-sm')
    expect(card.classes()).not.toContain('border')
  })

  it('без пропа вариант карточки берётся из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrList },
      template: `
        <GrConfigProvider :component-defaults="{ GrCard: { variant: 'outlined' } }">
          <GrList><div>row</div></GrList>
        </GrConfigProvider>
      `,
    })

    const card = mount(Harness).get('[data-gr-card]')
    expect(card.classes()).toContain('border')
    expect(card.classes()).not.toContain('shadow-sm')
  })

  it('заголовок и описание строки размечены токеном --gr-text-sm в обеих ветках', () => {
    const plain = mount(GrListItem, { props: { title: 'Row', description: 'Sub' } })
    const interactive = mount(GrListItem, { props: { title: 'Row', description: 'Sub', href: '/docs' } })

    // Заголовок и описание — по одному вхождению на каждую ветку: разметка
    // веток продублирована, и счёт ловит их расхождение.
    for (const wrapper of [plain, interactive]) {
      const html = wrapper.html()
      expect(html.split(sizeToken)).toHaveLength(3)
      expect(html).not.toContain('text-[13px]')
    }
  })

  it('пустое состояние тоже идёт от токена', () => {
    const wrapper = mount(GrList)

    expect(wrapper.get('[data-gr-list-empty]').classes()).toContain(sizeToken)
  })
})
