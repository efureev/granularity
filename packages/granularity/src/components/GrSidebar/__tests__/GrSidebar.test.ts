import { mount } from '@vue/test-utils'
import { defineComponent, markRaw, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrSidebar, { GrSidebarGroup, GrSidebarItem } from '..'
import { grSidebarCollapseDirection } from '../grSidebarStyles'
import { granularityGlobal } from '../../../testing'

describe('GrSidebar', () => {
  it('рендерит title, subtitle и содержимое слота', () => {
    const wrapper = mount(GrSidebar, {
      props: {
        title: 'Workspace',
        subtitle: 'Administration',
      },
      slots: {
        default: '<nav><a href="#">Overview</a></nav>',
      },
    })

    expect(wrapper.text()).toContain('Workspace')
    expect(wrapper.text()).toContain('Administration')
    expect(wrapper.text()).toContain('Overview')
    expect(wrapper.find('aside').classes()).toContain('border-r')
  })

  it('не рендерит subtitle-блок, если subtitle не передан', () => {
    const wrapper = mount(GrSidebar, {
      props: {
        title: 'Workspace',
      },
    })

    expect(wrapper.text()).toContain('Workspace')
    expect(wrapper.find('.text-\\[var\\(--gr-muted-fg\\)\\]').exists()).toBe(false)
  })

  it('не рендерит header, если нет ни title, ни subtitle, ни кнопки тогла', () => {
    const wrapper = mount(GrSidebar, {
      slots: { default: '<a href="#">Item</a>' },
    })

    expect(wrapper.find('[data-gr-sidebar-header]').exists()).toBe(false)
  })

  it('кнопка тогла сворачивает панель и эмитит update:collapsed', async () => {
    const wrapper = mount(GrSidebar, {
      props: { title: 'Nav', showToggleButton: true },
    })

    const toggle = wrapper.get('[data-gr-sidebar-toggle]')
    await toggle.trigger('click')

    expect(wrapper.emitted('update:collapsed')?.[0]).toEqual([true])
    expect(wrapper.get('aside').attributes('data-collapsed')).toBe('true')
    // Заголовок скрывается в свёрнутом виде.
    expect(wrapper.find('[data-gr-sidebar-title]').exists()).toBe(false)
  })

  it('GrSidebarItem: в свёрнутом виде без иконки показывает первую букву метки', async () => {
    const Host = defineComponent({
      components: { GrSidebar, GrSidebarItem },
      data: () => ({ collapsed: false }),
      template: `
        <GrSidebar v-model:collapsed="collapsed" title="Nav" show-toggle-button>
          <GrSidebarItem label="Billing" />
          <GrSidebarItem label="Overview" icon="i-lucide-home" />
        </GrSidebar>
      `,
    })

    const wrapper = mount(Host)
    // Развёрнуто: видны полные метки.
    expect(wrapper.text()).toContain('Billing')
    expect(wrapper.text()).toContain('Overview')

    ;(wrapper.vm as unknown as { collapsed: boolean }).collapsed = true
    await nextTick()

    const items = wrapper.findAll('[data-gr-sidebar-item]')
    // «Billing» без иконки → первая буква «B», имя приходит из `aria-label`.
    expect(items[0].text()).toBe('B')
    expect(items[0].attributes('aria-label')).toBe('Billing')
    // «Overview» с иконкой → метка не показывается, имя остаётся.
    expect(items[1].text()).toBe('')
    expect(items[1].attributes('aria-label')).toBe('Overview')
  })
})

/**
 * Подпись свёрнутого пункта.
 *
 * Нативный `title` показывался только по наведению: зрячий пользователь
 * клавиатуры проходил свёрнутую панель табом и не понимал, где он. Теперь
 * подпись показывает `GrTooltip`, который срабатывает и по фокусу.
 */
describe('GrSidebarItem — подсказка в свёрнутом режиме', () => {
  function mountRail(props: Record<string, unknown> = {}) {
    return mount(defineComponent({
      components: { GrSidebar, GrSidebarItem },
      props: { collapsed: { type: Boolean, default: true }, position: { type: String, default: 'left' } },
      template: `
        <GrSidebar :collapsed="collapsed" :position="position" aria-label="Разделы">
          <GrSidebarItem label="Billing" />
        </GrSidebar>
      `,
    }), { props })
  }

  it('развёрнутый пункт обёртки не получает вовсе', () => {
    const wrapper = mountRail({ collapsed: false })

    expect(wrapper.find('[data-gr-sidebar-item-tooltip]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('свёрнутый получает подсказку, а нативного `title` у него больше нет', () => {
    const wrapper = mountRail()

    expect(wrapper.find('[data-gr-sidebar-item-tooltip]').exists()).toBe(true)

    const item = wrapper.get('[data-gr-sidebar-item]')
    expect(item.attributes('title')).toBeUndefined()
    // Имя остаётся: у пункта с одной иконкой его иначе нет вовсе.
    expect(item.attributes('aria-label')).toBe('Billing')

    wrapper.unmount()
  })

  /**
   * Подсказка дословно повторяет имя пункта. Свяжи её `aria-describedby` — и
   * диктор произнесёт «Billing, Billing».
   */
  it('подсказка не описывает триггер: имя и так то же самое', async () => {
    const wrapper = mountRail()

    // `aria-describedby` тултип ставит эффектом после монтирования: проверка
    // без ожидания была бы пустой — атрибута нет ещё ни при каком раскладе.
    await nextTick()
    await nextTick()

    expect(wrapper.get('[data-gr-sidebar-item]').attributes('aria-describedby')).toBeUndefined()

    wrapper.unmount()
  })

  it('подсказка уходит от панели: у левой вправо, у правой влево', () => {
    const left = mountRail()
    expect(left.findComponent({ name: 'GrTooltip' }).props('placement')).toBe('right')
    left.unmount()

    const right = mountRail({ position: 'right' })
    expect(right.findComponent({ name: 'GrTooltip' }).props('placement')).toBe('left')
    right.unmount()
  })

  /**
   * Пункт тянется на всю ширину рейла. Обёртка `inline-flex` схлопнула бы его
   * по содержимому — вместе с подсветкой и кольцом фокуса.
   */
  it('обёртка не сжимает пункт по содержимому', () => {
    const wrapper = mountRail()

    const tooltip = wrapper.get('[data-gr-sidebar-item-tooltip]')
    expect(tooltip.classes()).toContain('w-full')
    expect(tooltip.classes()).not.toContain('inline-flex')
    // Внутренний триггер тоже: снаружи до него не дотянуться.
    expect(wrapper.get('[data-gr-tooltip-trigger]').classes()).toContain('w-full')

    wrapper.unmount()
  })
})
describe('GrSidebar — лендмарк и сторона', () => {
  /**
   * Лендмарк — сама панель, а не корень компонента: корнем стала обёртка слоя,
   * которая вне режима `overlay` схлопнута в `display: contents` и в раскладке
   * не участвует.
   */
  it('панель по умолчанию aside, landmark="navigation" делает её nav', () => {
    const aside = mount(GrSidebar, { props: { ariaLabel: 'Разделы' } })
    expect(aside.get('[data-gr-sidebar]').element.tagName).toBe('ASIDE')
    expect(aside.get('[data-gr-sidebar]').attributes('aria-label')).toBe('Разделы')

    const nav = mount(GrSidebar, { props: { landmark: 'navigation', ariaLabel: 'Основная навигация' } })
    expect(nav.get('[data-gr-sidebar]').element.tagName).toBe('NAV')
    expect(nav.get('[data-gr-sidebar]').attributes('aria-label')).toBe('Основная навигация')
  })

  it('position меняет сторону границы и направление шеврона', () => {
    const left = mount(GrSidebar, { props: { showToggleButton: true } })
    expect(left.get('[data-gr-sidebar]').classes()).toContain('border-r')
    // Развёрнутая левая панель сворачивается влево.
    expect(left.get('[data-gr-sidebar-toggle]').attributes('data-direction')).toBe('left')

    const right = mount(GrSidebar, { props: { showToggleButton: true, position: 'right' } })
    const rightPanel = right.get('[data-gr-sidebar]')
    expect(rightPanel.classes()).toContain('border-l')
    expect(rightPanel.classes()).not.toContain('border-r')
    expect(rightPanel.attributes('data-position')).toBe('right')
    expect(right.get('[data-gr-sidebar-toggle]').attributes('data-direction')).toBe('right')
  })

  it('шеврон всегда указывает туда, куда уедет панель', () => {
    expect(grSidebarCollapseDirection('left', false)).toBe('left')
    expect(grSidebarCollapseDirection('left', true)).toBe('right')
    expect(grSidebarCollapseDirection('right', false)).toBe('right')
    expect(grSidebarCollapseDirection('right', true)).toBe('left')
  })

  it('скроллящийся контейнер достижим с клавиатуры', () => {
    const wrapper = mount(GrSidebar)
    const content = wrapper.get('[data-gr-sidebar-content]')

    expect(content.attributes('tabindex')).toBe('0')
    expect(content.classes()).toContain('overflow-y-auto')
    expect(content.classes().some(cls => cls.startsWith('focus-visible:ring-'))).toBe(true)
  })
})

describe('GrSidebar — лейбл тогла и типографика', () => {
  it('лейбл кнопки берётся из локали и меняется вместе с состоянием', async () => {
    const i18n = {
      t: (key: string) => ({
        'gr.sidebar.expand': 'Развернуть панель',
        'gr.sidebar.collapse': 'Свернуть панель',
      }[key] ?? key),
    }

    const wrapper = mount(GrSidebar, {
      props: { showToggleButton: true },
      global: granularityGlobal({ i18n }),
    })

    const toggle = wrapper.get('[data-gr-sidebar-toggle]')
    expect(toggle.attributes('aria-label')).toBe('Свернуть панель')

    await toggle.trigger('click')
    expect(wrapper.get('[data-gr-sidebar-toggle]').attributes('aria-label')).toBe('Развернуть панель')
  })

  it('toggleLabel сильнее локали', () => {
    const wrapper = mount(GrSidebar, { props: { showToggleButton: true, toggleLabel: 'Своя подпись' } })

    expect(wrapper.get('[data-gr-sidebar-toggle]').attributes('aria-label')).toBe('Своя подпись')
  })

  it('кегли заголовка, подзаголовка, буквы и бейджа идут от токенов', async () => {
    const wrapper = mount(GrSidebar, {
      props: { title: 'Workspace', subtitle: 'Navigation' },
      slots: { default: '<GrSidebarItem label="Billing" :badge="4" />' },
      global: { components: { GrSidebarItem } },
    })

    expect(wrapper.get('[data-gr-sidebar-title]').classes()).toContain('text-[length:var(--gr-text-lg)]')
    expect(wrapper.get('[data-gr-sidebar-subtitle]').classes()).toContain('text-[length:var(--gr-text-sm)]')
    expect(wrapper.html()).toContain('text-[length:var(--gr-text-2xs)]')
    expect(wrapper.html()).not.toMatch(/text-\[\d+px\]/)
  })
})

describe('GrSidebarItem — корневой тег и href', () => {
  /** Заглушка компонента-ссылки: так устроены `Link` от Inertia и `RouterLink`. */
  const StubLink = markRaw(defineComponent({
    name: 'StubLink',
    props: { href: { type: String, default: undefined } },
    template: '<a :href="href"><slot /></a>',
  }))

  // Компонент-ссылка рендерит `<a>` сам, но `rootTag === 'a'` для него ложно —
  // проп до него не доезжал, и пункт вёл в никуда.
  it('as-компонент получает href', () => {
    const wrapper = mount(GrSidebarItem, { props: { label: 'Отчёты', as: StubLink, href: '/reports' } })

    expect(wrapper.getComponent(StubLink).props('href')).toBe('/reports')
    expect(wrapper.get('a').attributes('href')).toBe('/reports')
  })

  it('строковый as, кроме a, href не получает', () => {
    const wrapper = mount(GrSidebarItem, { props: { label: 'Отчёты', as: 'div', href: '/reports' } })

    expect(wrapper.attributes('href')).toBeUndefined()
  })

  // Недоступный пункт — `span`: ссылка, по которой нельзя пройти, хуже её отсутствия.
  it('disabled гасит href даже у компонента-ссылки', () => {
    const wrapper = mount(GrSidebarItem, {
      props: { label: 'Отчёты', as: StubLink, href: '/reports', disabled: true },
    })

    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes('href')).toBeUndefined()
  })
})

describe('GrSidebarItem — недоступный пункт', () => {
  it('гасится токеном, а не прозрачностью', () => {
    const wrapper = mount(GrSidebarItem, { props: { label: 'Archive', disabled: true } })

    expect(wrapper.classes()).toContain('text-[var(--gr-disabled-fg)]')
    expect(wrapper.classes()).toContain('cursor-not-allowed')
    expect(wrapper.classes().some(cls => cls.startsWith('opacity-'))).toBe(false)
    // Недоступный пункт перестаёт быть кнопкой: `span` не ловит фокус.
    expect(wrapper.element.tagName).toBe('SPAN')
  })
})

describe('GrSidebarGroup', () => {
  function mountGroup(collapsed = false) {
    return mount(GrSidebar, {
      props: { collapsed },
      slots: {
        default: `
          <GrSidebarGroup label="Аналитика">
            <GrSidebarItem label="Отчёты" />
          </GrSidebarGroup>
        `,
      },
      global: { components: { GrSidebarGroup, GrSidebarItem } },
    })
  }

  it('объявляет секцию группой и связывает её с заголовком', () => {
    const wrapper = mountGroup()
    const group = wrapper.get('[data-gr-sidebar-group]')
    const label = wrapper.get('[data-gr-sidebar-group-label]')

    expect(group.attributes('role')).toBe('group')
    expect(group.attributes('aria-labelledby')).toBe(label.attributes('id'))
    expect(label.text()).toBe('Аналитика')
  })

  it('в свёрнутой панели заголовок уходит, а секции разделяет линия', () => {
    const wrapper = mountGroup(true)
    const group = wrapper.get('[data-gr-sidebar-group]')

    expect(wrapper.find('[data-gr-sidebar-group-label]').exists()).toBe(false)
    // Имя из пустоты не берётся: заголовка в DOM нет.
    expect(group.attributes('aria-labelledby')).toBeUndefined()
    expect(group.classes()).toContain('border-t')
  })
})

/**
 * Вложенные пункты: глубина считается разметкой, а не пропом, который
 * потребителю пришлось бы держать в синхроне при перестановке ветки.
 */
describe('GrSidebarItem — вложенные пункты', () => {
  function mountNested(props: Record<string, unknown> = {}, itemProps = '') {
    return mount(defineComponent({
      components: { GrSidebar, GrSidebarItem },
      props: { collapsed: { type: Boolean, default: false } },
      template: `
        <GrSidebar :collapsed="collapsed">
          <GrSidebarItem label="Настройки" ${itemProps}>
            <GrSidebarItem label="Профиль" />
            <GrSidebarItem label="Безопасность" />
          </GrSidebarItem>
          <GrSidebarItem label="Обзор" />
        </GrSidebar>
      `,
    }), { props, global: granularityGlobal() })
  }

  it('пункт без подпунктов гнездом не оборачивается', () => {
    const wrapper = mountNested()

    expect(wrapper.findAll('[data-gr-sidebar-item-nest]')).toHaveLength(1)
  })

  it('свёрнутая ветка не рисует подпункты вовсе', () => {
    const wrapper = mountNested()

    expect(wrapper.find('[data-gr-sidebar-item-children]').exists()).toBe(false)
    // Не отрисованное поддерево не ловит `Tab` и не читается диктором.
    expect(wrapper.text()).not.toContain('Профиль')
  })

  it('нажатие раскрывает ветку и меняет `aria-expanded`', async () => {
    const wrapper = mountNested()
    const parent = wrapper.findAll('[data-gr-sidebar-item]')[0]

    expect(parent.attributes('aria-expanded')).toBe('false')

    await parent.trigger('click')

    expect(parent.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get('[data-gr-sidebar-item-children]').text()).toContain('Профиль')
  })

  it('`aria-controls` указывает на само поддерево', async () => {
    const wrapper = mountNested()
    const parent = wrapper.findAll('[data-gr-sidebar-item]')[0]
    await parent.trigger('click')

    expect(parent.attributes('aria-controls')).toBe(wrapper.get('[data-gr-sidebar-item-children]').attributes('id'))
  })

  it('`default-expanded` открывает ветку сразу', () => {
    const wrapper = mountNested({}, 'default-expanded')

    expect(wrapper.get('[data-gr-sidebar-item-children]').text()).toContain('Безопасность')
  })

  it('`v-model:expanded` управляется снаружи', async () => {
    const wrapper = mountNested({}, ':expanded="false"')
    const parent = wrapper.findAll('[data-gr-sidebar-item]')[0]

    await parent.trigger('click')

    // Проп сильнее внутреннего состояния: снаружи его никто не поменял.
    expect(wrapper.find('[data-gr-sidebar-item-children]').exists()).toBe(false)
    expect(parent.attributes('aria-expanded')).toBe('false')
  })

  it('подпункт отодвинут отступом уровня, а корневой — нет', async () => {
    const wrapper = mountNested({}, 'default-expanded')
    const items = wrapper.findAll('[data-gr-sidebar-item]')

    expect(items[0].attributes('style')).toBeUndefined()
    expect(items[1].attributes('style')).toContain('padding-inline-start')
  })

  /** В шестьдесят четыре пикселя подпункты не влезают, а подменю — другая история. */
  it('в свёрнутом рейле подпунктов нет, а нажатие возвращает панели ширину', async () => {
    const wrapper = mountNested({ collapsed: true })

    expect(wrapper.find('[data-gr-sidebar-item-children]').exists()).toBe(false)

    await wrapper.findAll('[data-gr-sidebar-item]')[0].trigger('click')
    await nextTick()

    expect(wrapper.get('[data-gr-sidebar]').attributes('data-collapsed')).toBeUndefined()
    expect(wrapper.get('[data-gr-sidebar-item-children]').text()).toContain('Профиль')
  })
})

/**
 * Мобильный режим: панель как модальный слой поверх страницы. Когда включать —
 * решает приложение: своей системы брейкпоинтов у пакета нет, а спрашивать среду
 * в `setup` нельзя, иначе первый клиентский рендер разойдётся с серверным.
 */
describe('GrSidebar — модальный слой', () => {
  function mountSidebar(props: Record<string, unknown> = {}) {
    return mount(GrSidebar, {
      attachTo: document.body,
      props: { ariaLabel: 'Разделы', ...props },
      slots: { default: '<a href="#a">Обзор</a>' },
      global: granularityGlobal(),
    })
  }

  it('без `overlay` панель остаётся в раскладке потребителя', () => {
    const wrapper = mountSidebar()

    expect(document.querySelector('[data-gr-sidebar-layer]')).toBeNull()
    // Панель — в собственном поддереве компонента, а не в портале.
    expect(wrapper.find('[data-gr-sidebar]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('`overlay` с открытым состоянием даёт модальный слой с подложкой', async () => {
    const wrapper = mountSidebar({ overlay: true, open: true })
    await nextTick()

    const layer = document.querySelector('[data-gr-sidebar-layer]')
    expect(layer).not.toBeNull()
    expect(layer?.getAttribute('role')).toBe('dialog')
    expect(layer?.getAttribute('aria-modal')).toBe('true')
    expect(document.querySelector('[data-gr-sidebar-backdrop]')).not.toBeNull()

    wrapper.unmount()
  })

  it('закрытый слой не рисует ни панели, ни подложки', async () => {
    const wrapper = mountSidebar({ overlay: true, open: false })
    await nextTick()

    expect(document.querySelector('[data-gr-sidebar-backdrop]')).toBeNull()
    expect(wrapper.find('[data-gr-sidebar]').exists(), wrapper.html()).toBe(false)

    wrapper.unmount()
  })

  /**
   * Телепорт включается только после монтирования — иначе первый клиентский
   * рендер не совпал бы с серверным. Значит в этом кадре панель не должна
   * рисоваться вовсе: иначе модальная панель мелькнула бы прямо в потоке
   * страницы, а потом прыгнула в портал.
   */
  it('до монтирования слой не мелькает в потоке страницы', () => {
    const wrapper = mountSidebar({ overlay: true, open: true })

    expect(wrapper.find('[data-gr-sidebar]').exists(), wrapper.html()).toBe(false)

    wrapper.unmount()
  })

  /**
   * Корень слоя растянут на весь экран. Оставь мы его при закрытой панели —
   * страница получила бы невидимую плёнку, перехватывающую все клики.
   */
  it('закрытый слой не накрывает страницу', async () => {
    const wrapper = mountSidebar({ overlay: true, open: false })
    await nextTick()

    expect(document.querySelector('[data-gr-sidebar-layer]')).toBeNull()
    expect(wrapper.html()).not.toContain('fixed inset-0')

    wrapper.unmount()
  })

  /** Рейл шириной в иконку внутри модального окна — половина экрана под пустоту. */
  it('в слое свёрнутость игнорируется', async () => {
    const wrapper = mountSidebar({ overlay: true, open: true, collapsed: true })
    await nextTick()

    expect(document.querySelector('[data-gr-sidebar]')?.getAttribute('data-collapsed')).toBeNull()

    wrapper.unmount()
  })

  /** Сворачивать в слое нечего, а закрыть иначе можно только `Esc` или подложкой. */
  it('кнопка шапки в слое закрывает, а не сворачивает', async () => {
    const wrapper = mountSidebar({ overlay: true, open: true, showToggleButton: true, title: 'Меню' })
    await nextTick()

    const toggle = document.querySelector<HTMLElement>('[data-gr-sidebar-toggle]')!
    toggle.click()
    await nextTick()

    expect(wrapper.emitted('update:open')?.at(-1)?.[0]).toBe(false)
    expect(wrapper.emitted('update:collapsed')).toBeUndefined()

    wrapper.unmount()
  })

  it('атрибуты потребителя садятся на панель, а не на схлопнутую обёртку', () => {
    const wrapper = mountSidebar({})
    wrapper.unmount()

    const withClass = mount(GrSidebar, {
      props: { ariaLabel: 'Разделы' },
      attrs: { 'class': 'проверка', 'data-own': 'да' },
      global: granularityGlobal(),
    })

    const panel = withClass.get('[data-gr-sidebar]')
    expect(panel.classes()).toContain('проверка')
    expect(panel.attributes('data-own')).toBe('да')

    withClass.unmount()
  })
})
