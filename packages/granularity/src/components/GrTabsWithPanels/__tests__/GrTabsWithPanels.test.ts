import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import GrTabPanel from '../../GrTabPanels/GrTabPanel.vue'
import GrTabs from '../../GrTabs/GrTabs.vue'
import GrTabsWithPanels from '../GrTabsWithPanels.vue'

const TABS = [
  { value: 'profile', label: 'Профиль' },
  { value: 'billing', label: 'Оплата' },
]

function mountComposite(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  return mount(GrTabsWithPanels, {
    // В документе, иначе dev-проверка `GrTabPanel` не найдёт вкладку по id и
    // предупредит на ровном месте: связку она ищет через `document`.
    attachTo: document.body,
    props: { modelValue: 'profile', tabs: TABS, ...props },
    slots: {
      default: () => [
        h(GrTabPanel, { value: 'profile' }, { default: () => 'Про профиль' }),
        h(GrTabPanel, { value: 'billing' }, { default: () => 'Про оплату' }),
      ],
      ...slots,
    },
  })
}

describe('GrTabsWithPanels', () => {
  it('один `v-model` двигает и ряд, и панель', async () => {
    const Harness = defineComponent({
      setup() {
        const active = ref('profile')
        return () => h(GrTabsWithPanels, {
          'modelValue': active.value,
          'tabs': TABS,
          'onUpdate:modelValue': (value: string) => (active.value = value),
        }, {
          default: () => [
            h(GrTabPanel, { value: 'profile' }, { default: () => 'Про профиль' }),
            h(GrTabPanel, { value: 'billing' }, { default: () => 'Про оплату' }),
          ],
        })
      },
    })

    const wrapper = mount(Harness)
    expect(wrapper.get('[role="tabpanel"]').text()).toContain('Про профиль')

    await wrapper.findAll('[role="tab"]')[1].trigger('click')
    await nextTick()

    expect(wrapper.get('[role="tabpanel"]').text()).toContain('Про оплату')
  })

  /**
   * Ради этого компонент и заведён: `idBase` больше не пишется в двух местах, и
   * забыть его нельзя. `GrTabs` проставляет вкладкам id только при явном
   * `idBase`, поэтому без него связка не существовала бы вовсе.
   */
  it('связка `tab` ↔ `tabpanel` собирается без единого пропа', () => {
    const wrapper = mountComposite()

    const tab = wrapper.findAll('[role="tab"]')[0]
    const panel = wrapper.get('[role="tabpanel"]')

    expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'))
    expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))
  })

  it('явный `idBase` уважается: на эти id ссылаются снаружи', () => {
    const wrapper = mountComposite({ idBase: 'settings' })

    expect(wrapper.findAll('[role="tab"]')[0].attributes('id')).toBe('settings-tab-profile')
    expect(wrapper.get('[role="tabpanel"]').attributes('id')).toBe('settings-panel-profile')
  })

  it('пропы ряда доезжают до `GrTabs`', () => {
    const wrapper = mountComposite({ variant: 'line', activationMode: 'manual', closable: true })
    const tabs = wrapper.getComponent(GrTabs)

    expect(tabs.props('variant')).toBe('line')
    expect(tabs.props('activationMode')).toBe('manual')
    expect(tabs.props('closable')).toBe(true)
  })

  /**
   * Незаданный проп обязан приехать в `GrTabs` ОТСУТСТВУЮЩИМ, а не значением
   * обёртки: дефолт `variant` и `size` живёт в резолвере `GrConfigProvider`, и
   * подставленное здесь значение перекрыло бы провайдера.
   */
  it('незаданные пропы не перекрывают провайдера', () => {
    const wrapper = mountComposite()
    const tabs = wrapper.getComponent(GrTabs)

    expect(tabs.props('variant')).toBeUndefined()
    expect(tabs.props('size')).toBeUndefined()
    // Булев проп особенно легко потерять: Vue привёл бы его к `false`.
    expect(tabs.props('closable')).toBe(false)
    expect(wrapper.getComponent(GrTabs).vm.$.vnode.props?.closable).toBeUndefined()
  })

  it('слот `#tab` уходит в ряд, `#default` — в панели', () => {
    const wrapper = mountComposite({}, {
      tab: (props: any) => h('span', { 'data-own-tab': '' }, `«${props.tab.label}»`),
    })

    expect(wrapper.get('[data-own-tab]').text()).toBe('«Профиль»')
    expect(wrapper.get('[role="tabpanel"]').text()).toContain('Про профиль')
  })

  it('`close` всплывает наружу', async () => {
    const wrapper = mountComposite({ closable: true })

    await wrapper.get('[data-gr-tab-close]').trigger('click')

    expect(wrapper.emitted('close')?.[0]?.[0]).toBe('profile')
  })

  it('вертикальная раскладка ставит ряд сбоку', () => {
    const horizontal = mountComposite()
    const vertical = mountComposite({ orientation: 'vertical' })

    expect(horizontal.get('[data-gr-tabs-with-panels]').attributes('data-orientation')).toBe('horizontal')
    expect(vertical.get('[data-gr-tabs-with-panels]').attributes('data-orientation')).toBe('vertical')
    expect(vertical.get('[data-gr-tabs-with-panels]').classes()).toContain('flex')
    expect(vertical.get('[data-gr-tabs-with-panels]').classes()).not.toContain('flex-col')
  })
})

/**
 * Строка долга жаловалась, что значение синхронизируется руками в двух местах.
 * Составной компонент добавляет ТРЕТЬЕ, если ничем не держать его поверхность:
 * `GrTabs` получит проп, обёртка о нём не узнает — молча, как и всё в этой
 * истории.
 */
describe('GrTabsWithPanels — поверхность не расходится с GrTabs', () => {
  it('обёртка объявляет ровно те же пропы, что и ряд', () => {
    const wrapperProps = Object.keys((GrTabsWithPanels as any).props ?? {}).sort()
    const tabsProps = Object.keys((GrTabs as any).props ?? {}).sort()

    expect(wrapperProps).toEqual(tabsProps)
  })

  /**
   * Объявления мало, и это главный случай: интерфейс обёртки наследует пропы
   * `GrTabs`, поэтому новый проп появится у неё сам — а вот **пробрасывать** его
   * шаблон не станет. Ключи сойдутся, значение потеряется, и заметить это будет
   * нечем.
   *
   * Поэтому список берётся из самого `GrTabs`, а не пишется руками: новый проп
   * входит в проверку сам.
   */
  it('каждый проп ряда действительно пробрасывается шаблоном', () => {
    const wrapper = mountComposite()
    const bound = wrapper.getComponent(GrTabs).vm.$.vnode.props ?? {}

    // Ключи прилетают в camelCase у явного `v-bind` и в kebab-case у атрибута.
    const boundKeys = new Set(Object.keys(bound).map(key => key.replace(/-([a-z])/g, (_, c) => c.toUpperCase())))

    for (const prop of Object.keys((GrTabs as any).props ?? {}))
      expect(boundKeys, `проп "${prop}" объявлен, но не проброшен в GrTabs`).toContain(prop)
  })

  it('обёртка объявляет события ряда', () => {
    const wrapperEmits = (GrTabsWithPanels as any).emits ?? []
    const tabsEmits = (GrTabs as any).emits ?? []

    for (const event of tabsEmits)
      expect(wrapperEmits, `событие "${event}" не проброшено`).toContain(event)
  })
})
