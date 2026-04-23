import { DOMWrapper, mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { GRANULARITY_I18N_KEY, type GranularityI18nAdapter } from '../../../i18n/adapter'
import DsTreeSelect from '../DsTreeSelect.vue'

type Row = { id: number; label: string; children?: Row[] }

function createGranularityTestI18n(locale: 'en' | 'ru'): GranularityI18nAdapter {
  const messages = {
    en: {
      'ds.treeSelect.filterPlaceholder': 'Search…',
      'ds.treeSelect.empty': 'No data',
      'ds.common.clear': 'Clear',
    },
    ru: {
      'ds.treeSelect.filterPlaceholder': 'Поиск…',
      'ds.treeSelect.empty': 'Нет данных',
      'ds.common.clear': 'Очистить',
    },
  } as const

  return {
    t(key) {
      return messages[locale][key as keyof typeof messages.en] ?? key
    },
  }
}

async function mountHarness(
  props?: Partial<InstanceType<typeof DsTreeSelect>['$props']>,
  options?: { locale?: 'en' | 'ru'; data?: Row[] },
) {
  const i18n = options?.locale
    ? createGranularityTestI18n(options.locale)
    : undefined

  const initialData = options?.data

  const Harness = defineComponent({
    name: 'Harness',
    components: { DsTreeSelect },
    setup() {
      const value = ref<any>(null)
      const data = ref<Row[]>(
        initialData
        ?? [
          { id: 1, label: 'Food' },
          { id: 2, label: 'Travel' },
          {
            id: 3,
            label: 'Home',
            children: [
              { id: 31, label: 'Rent' },
              { id: 32, label: 'Utilities' },
            ],
          },
        ],
      )

      return { value, data }
    },
    template: `
      <div>
        <DsTreeSelect
          v-model="value"
          :data="data"
          node-key="id"
          placeholder="Pick"
          v-bind="passthrough"
        />
        <div data-testid="model">{{ value }}</div>
      </div>
    `,
    computed: {
      passthrough() {
        return (this.$attrs as any).passthrough
      },
    },
  })

  return mount(Harness, {
    attachTo: document.body,
    global: i18n
      ? {
          provide: {
            [GRANULARITY_I18N_KEY as symbol]: i18n,
          },
        }
      : undefined,
    attrs: {
      passthrough: props ?? {},
    },
  })
}

function bodyFind(selector: string): DOMWrapper<Element> {
  const el = document.body.querySelector(selector)
  return new DOMWrapper((el ?? document.createElement('i')) as Element)
}

function bodyExists(selector: string): boolean {
  return document.body.querySelector(selector) !== null
}

function bodyFindAllRows(): DOMWrapper<Element>[] {
  return [...document.body.querySelectorAll('.ds-tree__row')].map((el) => new DOMWrapper(el as Element))
}

describe('DsTreeSelect (unit)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('показывает шеврон когда нет значения, переворачивает его при open и заменяет на крестик при выбранном значении (clearable)', async () => {
    const wrapper = await mountHarness({ clearable: true })

    expect(wrapper.find('[data-testid="ds-tree-select-clear"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="ds-tree-select-chevron"]').exists()).toBe(true)

    await wrapper.find('[data-testid="ds-tree-select-trigger"]').trigger('click')
    await nextTick()

    const chevronIcon = wrapper.find('[data-testid="ds-tree-select-chevron"] > span')
    expect(chevronIcon.exists()).toBe(true)
    expect(chevronIcon.classes()).toContain('rotate-180')

    const travelRow = bodyFindAllRows().find((w) => w.text().includes('Travel'))
    expect(travelRow).toBeTruthy()

    await travelRow!.trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="ds-tree-select-clear"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="ds-tree-select-chevron"]').exists()).toBe(false)

    await wrapper.find('[data-testid="ds-tree-select-clear"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="model"]').text()).toBe('')
    expect(wrapper.find('[data-testid="ds-tree-select-clear"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="ds-tree-select-chevron"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('локализует дефолтные строки (ru): empty state, placeholder фильтра и aria-label кнопки очистки', async () => {
    const wrapperEmpty = await mountHarness(
      { filterable: true },
      { locale: 'ru', data: [] },
    )

    await wrapperEmpty.find('[data-testid="ds-tree-select-trigger"]').trigger('click')
    await nextTick()

    const filter = bodyFind('[data-testid="ds-tree-select-filter"]')
    expect(bodyExists('[data-testid="ds-tree-select-filter"]')).toBe(true)
    expect(filter.attributes('placeholder')).toBe('Поиск…')

    expect(document.body.textContent ?? '').toContain('Нет данных')

    wrapperEmpty.unmount()

    const wrapperClear = await mountHarness({ clearable: true }, { locale: 'ru' })
    await wrapperClear.find('[data-testid="ds-tree-select-trigger"]').trigger('click')
    await nextTick()

    const travelRow = bodyFindAllRows().find((w) => w.text().includes('Travel'))
    expect(travelRow).toBeTruthy()

    await travelRow!.trigger('click')
    await nextTick()

    const clearBtn = wrapperClear.find('[data-testid="ds-tree-select-clear"]')
    expect(clearBtn.exists()).toBe(true)
    expect(clearBtn.attributes('aria-label')).toBe('Очистить')

    wrapperClear.unmount()
  })

  it('не закрывается сразу при клике (реальный порядок событий: pointerdown -> focus -> click)', async () => {
    const wrapper = await mountHarness()

    const trigger = wrapper.find('[data-testid="ds-tree-select-trigger"]')

    await trigger.trigger('pointerdown')
    await trigger.trigger('focus')
    await trigger.trigger('click')
    await nextTick()
    expect(bodyExists('[data-testid="ds-tree-select-panel"]')).toBe(true)
    expect(bodyFind('[data-testid="ds-tree-select-panel"]').isVisible()).toBe(true)

    wrapper.unmount()
  })

  it('открывается и закрывается по клику вне / ESC', async () => {
    const wrapper = await mountHarness()

    const panel = () => bodyFind('[data-testid="ds-tree-select-panel"]')
    expect(bodyExists('[data-testid="ds-tree-select-panel"]')).toBe(true)
    expect(panel().isVisible()).toBe(false)

    await wrapper.find('[data-testid="ds-tree-select-trigger"]').trigger('click')
    await nextTick()
    expect(panel().isVisible()).toBe(true)

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(panel().isVisible()).toBe(false)

    await wrapper.find('[data-testid="ds-tree-select-trigger"]').trigger('click')
    await nextTick()
    expect(panel().isVisible()).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(panel().isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('выбирает узел и обновляет v-model (single)', async () => {
    const wrapper = await mountHarness()

    await wrapper.find('[data-testid="ds-tree-select-trigger"]').trigger('click')
    await nextTick()

    const travelRow = bodyFindAllRows().find((w) => w.text().includes('Travel'))
    expect(travelRow).toBeTruthy()

    await travelRow!.trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="model"]').text()).toBe('2')
    expect(bodyFind('[data-testid="ds-tree-select-panel"]').isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('обновляет значение в input при асинхронном изменении v-model (single)', async () => {
    const wrapper = await mountHarness()

    const trigger = wrapper.find('[data-testid="ds-tree-select-trigger"]')
    expect(trigger.exists()).toBe(true)
    expect((trigger.element as HTMLInputElement).value).toBe('')

    // имитируем внешний апдейт модели после монтирования (например, данные пришли с сервера)
    await nextTick()
    ;(wrapper.vm as any).value = 2
    await nextTick()

    expect((trigger.element as HTMLInputElement).value).toBe('Travel')

    wrapper.unmount()
  })

  it('в режиме valueDisplay="path" показывает путь от корня до выбранной ноды (single)', async () => {
    const wrapper = await mountHarness({ valueDisplay: 'path', defaultExpandedKeys: [3] })

    const trigger = wrapper.find('[data-testid="ds-tree-select-trigger"]')
    await trigger.trigger('click')
    await nextTick()

    const rentRow = bodyFindAllRows().find((w) => w.text().includes('Rent'))
    expect(rentRow).toBeTruthy()

    await rentRow!.trigger('click')
    await nextTick()

    expect((trigger.element as HTMLInputElement).value).toBe('Home / Rent')

    wrapper.unmount()
  })

  it('фильтрует дерево (filterable)', async () => {
    const wrapper = await mountHarness({ filterable: true })

    await wrapper.find('[data-testid="ds-tree-select-trigger"]').trigger('click')
    await nextTick()

    const filter = bodyFind('[data-testid="ds-tree-select-filter"]')
    expect(bodyExists('[data-testid="ds-tree-select-filter"]')).toBe(true)

    await filter.setValue('Ren')
    await nextTick()

    const rowsText = bodyFindAllRows().map((w) => w.text())
    expect(rowsText.some((t) => t.includes('Rent'))).toBe(true)
    expect(rowsText.some((t) => t.includes('Food'))).toBe(false)
    expect(rowsText.some((t) => t.includes('Travel'))).toBe(false)

    wrapper.unmount()
  })

  it('при слоте value скрывает дефолтный текст в input (чтобы не было наложения)', async () => {
    const Harness = defineComponent({
      name: 'HarnessWithValueSlot',
      components: { DsTreeSelect },
      setup() {
        const value = ref<any>(null)
        const data = ref<Row[]>([
          { id: 1, label: 'Food' },
          { id: 2, label: 'Travel' },
        ])

        return { value, data }
      },
      template: `
        <DsTreeSelect
          v-model="value"
          :data="data"
          node-key="id"
          placeholder="Pick"
        >
          <template #value="{ labels }">
            <div data-testid="custom-value">Selected: {{ labels[0] ?? '—' }}</div>
          </template>
        </DsTreeSelect>
      `,
    })

    const wrapper = mount(Harness, { attachTo: document.body })

    const trigger = wrapper.find('[data-testid="ds-tree-select-trigger"]')
    await trigger.trigger('click')
    await nextTick()

    const travelRow = bodyFindAllRows().find((w) => w.text().includes('Travel'))
    expect(travelRow).toBeTruthy()

    await travelRow!.trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="custom-value"]').text()).toContain('Travel')
    expect((trigger.element as HTMLInputElement).value).toBe('Travel')
    expect(trigger.classes()).toContain('text-transparent')

    wrapper.unmount()
  })
})
