import { mount } from '@vue/test-utils'
import { defineComponent, markRaw } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrCard from '../GrCard.vue'

/** Заглушка компонента-ссылки: так устроены `Link` от Inertia и `RouterLink`. */
const StubLink = markRaw(defineComponent({
  name: 'StubLink',
  props: { href: { type: String, default: undefined } },
  template: '<a :href="href"><slot /></a>',
}))

describe('GrCard', () => {
  it('рендерит слот и базовые card-классы', () => {
    const wrapper = mount(GrCard, {
      slots: {
        default: '<div>Card content</div>',
      },
    })

    expect(wrapper.text()).toContain('Card content')
    expect(wrapper.attributes('class')).toContain('rounded-[var(--gr-radius-lg)]')
    expect(wrapper.attributes('class')).toContain('border-[var(--gr-brd)]')
    expect(wrapper.attributes('class')).toContain('bg-[var(--gr-card)]')
    expect(wrapper.attributes('class')).toContain('text-[var(--gr-card-fg)]')
  })

  // Карточка — база `GrCollapse` и `GrList`: любая обёртка или отступ по
  // умолчанию поехали бы у них, поэтому дефолт зафиксирован тестом.
  it('без пропов остаётся одним div со слотом — ни обёрток, ни отступов', () => {
    const wrapper = mount(GrCard, { slots: { default: '<span>x</span>' } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.find('[data-gr-card-body]').exists()).toBe(false)
    expect(wrapper.classes()).toContain('shadow-[var(--gr-shadow-1)]')
    expect(wrapper.classes().some(cls => /^p-\d/.test(cls))).toBe(false)
  })
})

describe('GrCard — padding и variant', () => {
  it.each([
    ['sm', 'p-3'],
    ['md', 'p-4'],
    ['lg', 'p-6'],
  ] as const)('padding=%s кладёт отступ на саму поверхность', (padding, expected) => {
    const wrapper = mount(GrCard, { props: { padding }, slots: { default: 'x' } })

    expect(wrapper.classes()).toContain(expected)
    // Обёртки по-прежнему нет: секций не просили.
    expect(wrapper.find('[data-gr-card-body]').exists()).toBe(false)
  })

  it('outlined снимает тень, ghost — ещё и рамку', () => {
    const outlined = mount(GrCard, { props: { variant: 'outlined' }, slots: { default: 'x' } })
    expect(outlined.classes()).toContain('border')
    expect(outlined.classes()).not.toContain('shadow-[var(--gr-shadow-1)]')

    const ghost = mount(GrCard, { props: { variant: 'ghost' }, slots: { default: 'x' } })
    expect(ghost.classes()).not.toContain('border')
    expect(ghost.classes()).not.toContain('shadow-[var(--gr-shadow-1)]')
    expect(ghost.classes()).toContain('bg-[var(--gr-card)]')
  })

  it('оба пропа читаются из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrCard },
      template: `
        <GrConfigProvider :component-defaults="{ GrCard: { padding: 'lg', variant: 'outlined' } }">
          <GrCard>x</GrCard>
        </GrConfigProvider>
      `,
    })

    const card = mount(Harness).get('[data-gr-card]')
    expect(card.classes()).toContain('p-6')
    expect(card.classes()).not.toContain('shadow-[var(--gr-shadow-1)]')
  })
})

describe('GrCard — секции', () => {
  const slots = {
    header: '<h3>Заголовок</h3>',
    default: '<p>Тело</p>',
    footer: '<button>Действие</button>',
  }

  it('шапка и подвал отбиваются разделителями', () => {
    const wrapper = mount(GrCard, { props: { padding: 'md' }, slots })

    expect(wrapper.get('[data-gr-card-header]').classes()).toContain('border-b')
    expect(wrapper.get('[data-gr-card-footer]').classes()).toContain('border-t')
    expect(wrapper.get('[data-gr-card-body]').text()).toBe('Тело')
  })

  // Иначе отступ был бы и у поверхности, и у каждой секции — двойной.
  it('с секциями отступ принадлежит секциям, а не корню', () => {
    const wrapper = mount(GrCard, { props: { padding: 'md' }, slots })

    expect(wrapper.classes()).not.toContain('p-4')
    expect(wrapper.get('[data-gr-card-header]').classes()).toContain('p-4')
    expect(wrapper.get('[data-gr-card-body]').classes()).toContain('p-4')
    expect(wrapper.get('[data-gr-card-footer]').classes()).toContain('p-4')
  })

  it('секции необязательны по отдельности', () => {
    const wrapper = mount(GrCard, {
      props: { padding: 'sm' },
      slots: { header: '<h3>H</h3>', default: 'body' },
    })

    expect(wrapper.find('[data-gr-card-header]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-card-footer]').exists()).toBe(false)
  })

  it('bodyClass сам по себе включает обёртку тела', () => {
    const wrapper = mount(GrCard, {
      props: { bodyClass: 'grid gap-2' },
      slots: { default: 'body' },
    })

    expect(wrapper.get('[data-gr-card-body]').classes()).toContain('grid')
  })
})

describe('GrCard — заголовок секции', () => {
  it('title даёт настоящий заголовок, description — подпись под ним', () => {
    const wrapper = mount(GrCard, {
      props: { title: 'Выручка за месяц', description: 'Без учёта возвратов', padding: 'md' },
      slots: { default: 'тело' },
    })

    const heading = wrapper.get('[data-gr-card-title]')
    // Дефолт — h3, как у GrFormSection и GrTimeline.
    expect(heading.element.tagName).toBe('H3')
    expect(heading.text()).toBe('Выручка за месяц')
    expect(wrapper.get('[data-gr-card-description]').text()).toBe('Без учёта возвратов')
  })

  it.each([2, 4, 6] as const)('headingLevel=%s задаёт уровень', (level) => {
    const wrapper = mount(GrCard, { props: { title: 'Секция', headingLevel: level } })

    expect(wrapper.get('[data-gr-card-title]').element.tagName).toBe(`H${level}`)
  })

  it('headingLevel читается из GrConfigProvider', () => {
    const Harness = defineComponent({
      components: { GrConfigProvider, GrCard },
      template: `
        <GrConfigProvider :component-defaults="{ GrCard: { headingLevel: 2 } }">
          <GrCard title="Секция" />
        </GrConfigProvider>
      `,
    })

    expect(mount(Harness).get('[data-gr-card-title]').element.tagName).toBe('H2')
  })

  // Нестандартная шапка не обязана объяснять, почему она не `title`.
  it('слот #header сильнее пропов', () => {
    const wrapper = mount(GrCard, {
      props: { title: 'Из пропа', description: 'И описание' },
      slots: { header: '<b>Своя шапка</b>' },
    })

    expect(wrapper.get('[data-gr-card-header]').text()).toBe('Своя шапка')
    expect(wrapper.find('[data-gr-card-title]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-card-description]').exists()).toBe(false)
  })

  // Иначе отступ остался бы на поверхности и сложился бы с отступом секций.
  it('title включает секции, и отступ переезжает на них', () => {
    const wrapper = mount(GrCard, { props: { title: 'Секция', padding: 'md' }, slots: { default: 'тело' } })

    expect(wrapper.classes()).not.toContain('p-4')
    expect(wrapper.get('[data-gr-card-body]').classes()).toContain('p-4')
  })

  // Заголовок рисует сама карточка, и прижатым к рамке он выглядеть не должен
  // ни при каком `padding` — тем более при дефолтном `none`.
  it('шапка из title не остаётся без отступа даже при padding=none', () => {
    const wrapper = mount(GrCard, { props: { title: 'Документ' }, slots: { default: 'тело' } })
    const header = wrapper.get('[data-gr-card-header]').classes()

    expect(header).toContain('px-4')
    expect(header).toContain('py-3')
    // Тело по-прежнему слушается `padding`: таблица внутри идёт край в край.
    expect(wrapper.get('[data-gr-card-body]').classes().some(cls => /^p-\d/.test(cls))).toBe(false)
  })

  // Компонентного подвала не бывает: подвал всегда приходит слотом, то есть
  // отвечает за него потребитель — как и за `#header`.
  it('подвал остаётся на общем padding: его рисует не карточка', () => {
    const wrapper = mount(GrCard, {
      props: { title: 'Документ' },
      slots: { default: 'тело', footer: '<button>Действие</button>' },
    })

    expect(wrapper.get('[data-gr-card-footer]').classes()).not.toContain('px-4')
  })

  // `#header` наполняет потребитель — он же отвечает за его отступы. Иначе
  // `GrDashboardItem`, который передаёт свою шапку со своими отступами,
  // получил бы двойной.
  it('слот #header своего отступа не получает', () => {
    const wrapper = mount(GrCard, {
      slots: { header: '<div class="p-2">своя шапка</div>', default: 'тело' },
    })
    const header = wrapper.get('[data-gr-card-header]').classes()

    expect(header).not.toContain('px-4')
    expect(header).not.toContain('py-3')
  })

  it('слот #header по-прежнему слушается padding', () => {
    const wrapper = mount(GrCard, {
      props: { padding: 'md' },
      slots: { header: '<h3>H</h3>', default: 'тело' },
    })

    expect(wrapper.get('[data-gr-card-header]').classes()).toContain('p-4')
  })

  it('без title карточка остаётся ровно тем, чем была', () => {
    const wrapper = mount(GrCard, { props: { padding: 'md' }, slots: { default: 'тело' } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('p-4')
    expect(wrapper.find('[data-gr-card-header]').exists()).toBe(false)
    expect(wrapper.find('[data-gr-card-body]').exists()).toBe(false)
  })

  it('карточка-ссылка получает имя из заголовка, а не из всего содержимого', () => {
    const wrapper = mount(GrCard, {
      props: { title: 'Отчёт', description: 'за август', href: '/reports/8' },
      slots: { default: 'много текста внутри' },
    })

    const titleId = wrapper.get('[data-gr-card-title]').attributes('id')
    expect(wrapper.attributes('aria-labelledby')).toBe(titleId)
    expect(wrapper.attributes('aria-describedby')).toBe(wrapper.get('[data-gr-card-description]').attributes('id'))
  })

  // Тест на срабатывание: снимут правило — заголовок уедет внутрь `<button>`,
  // где он невалиден по контент-модели.
  it('в кликабельной карточке заголовок деградирует в span и предупреждает', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(GrCard, { props: { title: 'Секция', clickable: true } })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.get('[data-gr-card-title]').element.tagName).toBe('SPAN')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[GrCard]'))

    warn.mockRestore()
  })
})

describe('GrCard — интерактивность', () => {
  it('href делает карточку ссылкой', () => {
    const wrapper = mount(GrCard, { props: { href: '/report' }, slots: { default: 'x' } })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/report')
    expect(wrapper.classes()).toContain('cursor-pointer')
  })

  it('clickable делает карточку кнопкой и эмитит click', async () => {
    const wrapper = mount(GrCard, { props: { clickable: true }, slots: { default: 'x' } })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')

    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('as подменяет корневой тег', () => {
    const wrapper = mount(GrCard, { props: { as: 'section' }, slots: { default: 'x' } })

    expect(wrapper.element.tagName).toBe('SECTION')
  })

  // Компонент-ссылка рендерит `<a>` сам, но `rootTag === 'a'` для него ложно —
  // карточка-ссылка собиралась обёрткой снаружи, потому что проп не доезжал.
  it('as-компонент получает href', () => {
    const wrapper = mount(GrCard, {
      props: { as: StubLink, href: '/reports/42' },
      slots: { default: 'x' },
    })

    expect(wrapper.getComponent(StubLink).props('href')).toBe('/reports/42')
    expect(wrapper.get('a').attributes('href')).toBe('/reports/42')
  })

  // Обратная сторона того же правила: `href` на `<article>` — невалидный атрибут.
  it('строковый as, кроме a, href не получает', () => {
    const wrapper = mount(GrCard, {
      props: { as: 'article', href: '/reports/42' },
      slots: { default: 'x' },
    })

    expect(wrapper.attributes('href')).toBeUndefined()
  })

  it('hoverable подсвечивает карточку, не делая её кнопкой', () => {
    const wrapper = mount(GrCard, { props: { hoverable: true }, slots: { default: 'x' } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.classes()).toContain('hover:bg-[var(--gr-muted)]')
    expect(wrapper.classes()).not.toContain('focus-visible:ring-2')
  })

  it('интерактивная карточка получает кольцо фокуса', () => {
    const wrapper = mount(GrCard, { props: { clickable: true }, slots: { default: 'x' } })

    expect(wrapper.classes()).toContain('focus-visible:ring-2')
  })
})

/**
 * Действие в шапке — без потери самой шапки.
 *
 * Раньше третьего случая не было: либо заголовок из пропов, либо `#header`
 * целиком. Как только появлялась кнопка, потребитель забирал слот и заново
 * писал заголовок, его уровень и отступы. К этому обходу независимо пришли
 * `GrDashboardItem` в кольце и обёртки снаружи — оба теряли настоящий `h2…h6`.
 */
describe('GrCard — действия в шапке', () => {
  it('рисует действия рядом с заголовком, сохраняя его уровень', () => {
    const wrapper = mount(GrCard, {
      props: { title: 'Отчёт', headingLevel: 3 },
      slots: { actions: '<button data-testid="more">⋯</button>', default: 'тело' },
    })

    const header = wrapper.get('[data-gr-card-header]')

    expect(header.get('[data-gr-card-title]').element.tagName).toBe('H3')
    expect(header.find('[data-testid="more"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('включают шапку так же, как заголовок', () => {
    const wrapper = mount(GrCard, {
      slots: { actions: '<button>⋯</button>', default: 'тело' },
    })

    expect(wrapper.find('[data-gr-card-header]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-card-actions]').exists()).toBe(true)
    wrapper.unmount()
  })

  // `#header` заменяет шапку целиком — приоритет прежний, иначе действия
  // приехали бы вторым блоком поверх чужой разметки.
  it('свой `#header` отменяет действия', () => {
    const wrapper = mount(GrCard, {
      slots: { header: '<div data-testid="own">своя шапка</div>', actions: '<button>⋯</button>' },
    })

    expect(wrapper.find('[data-testid="own"]').exists()).toBe(true)
    expect(wrapper.find('[data-gr-card-actions]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('без действий разметка заголовка прежняя', () => {
    const wrapper = mount(GrCard, { props: { title: 'Отчёт' } })

    expect(wrapper.find('[data-gr-card-actions]').exists()).toBe(false)
    expect(wrapper.get('[data-gr-card-title]').text()).toBe('Отчёт')
    wrapper.unmount()
  })
})

/**
 * Строковый `as` — замена `div`, а не карточка-ссылка. Пока интерактивность
 * выводилась из самого факта пропа, `as="section"` получал кольцо фокуса,
 * подсветку под курсором и вместе с `title` — `aria-labelledby`, то есть молча
 * становился лендмарком.
 */
describe('GrCard — семантический тег', () => {
  it.each(['section', 'article', 'aside'])('as="%s" не делает карточку интерактивной', (tag) => {
    const wrapper = mount(GrCard, { props: { as: tag }, slots: { default: 'x' } })

    expect(wrapper.classes()).not.toContain('focus-visible:ring-2')
    expect(wrapper.classes()).not.toContain('cursor-pointer')
    expect(wrapper.classes()).not.toContain('hover:bg-[var(--gr-muted)]')
    expect(wrapper.classes()).not.toContain('w-full')
  })

  // Требование целиком: тег другой, всё остальное — то же самое.
  it('классы as="section" совпадают с классами дефолтного div', () => {
    const props = { variant: 'outlined', padding: 'md' } as const
    const div = mount(GrCard, { props, slots: { default: 'x' } })
    const section = mount(GrCard, { props: { ...props, as: 'section' }, slots: { default: 'x' } })

    expect(section.element.tagName).toBe('SECTION')
    expect(section.attributes('class')).toBe(div.attributes('class'))
  })

  // Безымянная `<section>` для скринридера — обычный контейнер. Имя превратило
  // бы каждую карточку страницы в лендмарк и разрушило их обзор.
  it('as="section" с title не получает aria-labelledby', () => {
    const wrapper = mount(GrCard, {
      props: { as: 'section', title: 'Продажи', description: 'за август' },
      slots: { default: 'x' },
    })

    expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
    expect(wrapper.attributes('aria-describedby')).toBeUndefined()
    expect(wrapper.get('[data-gr-card-title]').element.tagName).toBe('H3')
  })

  // `href` на `<article>` отбрасывается — ссылкой карточка не становится, и
  // кольцо фокуса было обещанием, которое некому выполнить.
  it('as="article" с href не интерактивна', () => {
    const wrapper = mount(GrCard, {
      props: { as: 'article', href: '/reports/42' },
      slots: { default: 'x' },
    })

    expect(wrapper.classes()).not.toContain('focus-visible:ring-2')
  })

  it('as="a" без href не интерактивна: такая ссылка не фокусируется', () => {
    const wrapper = mount(GrCard, { props: { as: 'a' }, slots: { default: 'x' } })

    expect(wrapper.classes()).not.toContain('focus-visible:ring-2')
  })

  it('as="button" интерактивна и без clickable', () => {
    const wrapper = mount(GrCard, { props: { as: 'button' }, slots: { default: 'x' } })

    expect(wrapper.classes()).toContain('focus-visible:ring-2')
  })

  // Карточка-ссылка от починки страдать не должна: компонент рендерит `<a>`
  // сам, и до рендера его тега не видно.
  it('as-компонент остаётся интерактивным', () => {
    const wrapper = mount(GrCard, {
      props: { as: StubLink, href: '/reports/42' },
      slots: { default: 'x' },
    })

    expect(wrapper.classes()).toContain('focus-visible:ring-2')
    expect(wrapper.classes()).toContain('cursor-pointer')
  })

  // Зеркальная ловушка: кликается мышью, с клавиатуры недостижима.
  it('clickable с неинтерактивным as предупреждает, но клик эмитит', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(GrCard, {
      props: { as: 'section', clickable: true },
      slots: { default: 'x' },
    })
    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('таб-порядок'))

    warn.mockRestore()
  })
})

/**
 * Лендмарк — по явной просьбе, а не по наличию заголовка: именованных областей
 * на страницу нужно немного, иначе их обзор перестаёт помогать.
 */
describe('GrCard — regionLabel', () => {
  it('regionLabel даёт role="region" и имя', () => {
    const wrapper = mount(GrCard, {
      props: { as: 'section', regionLabel: 'Продажи за август' },
      slots: { default: 'x' },
    })

    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('aria-label')).toBe('Продажи за август')
  })

  it('без regionLabel роли нет', () => {
    const wrapper = mount(GrCard, { props: { as: 'section' }, slots: { default: 'x' } })

    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
  })

  // `role="region"` на `<button>` невалиден, а `aria-label` перебил бы заголовок.
  it('на интерактивной карточке regionLabel гасится и предупреждает', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(GrCard, {
      props: { clickable: true, regionLabel: 'Продажи' },
      slots: { default: 'x' },
    })

    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('aria-label')).toBeUndefined()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('regionLabel'))

    warn.mockRestore()
  })
})
