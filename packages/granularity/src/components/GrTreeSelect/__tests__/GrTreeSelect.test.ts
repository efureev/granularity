import { DOMWrapper, mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

import { GRANULARITY_I18N_KEY, type GranularityI18nAdapter } from '../../../i18n/adapter'
import GrTreeSelect from '../GrTreeSelect.vue'
import type { GrTreeSelectProps } from '../grTreeSelectTypes'

type Row = { id: number; label: string; children?: Row[] }

function createGranularityTestI18n(locale: 'en' | 'ru'): GranularityI18nAdapter {
  const messages = {
    en: {
      'gr.treeSelect.filterPlaceholder': 'Search…',
      'gr.treeSelect.empty': 'No data',
      'gr.common.clear': 'Clear',
    },
    ru: {
      'gr.treeSelect.filterPlaceholder': 'Поиск…',
      'gr.treeSelect.empty': 'Нет данных',
      'gr.common.clear': 'Очистить',
    },
  } as const

  return {
    t(key) {
      return messages[locale][key as keyof typeof messages.en] ?? key
    },
  }
}

async function mountHarness(
  props?: Partial<GrTreeSelectProps>,
  options?: { locale?: 'en' | 'ru'; data?: Row[] },
) {
  const i18n = options?.locale
    ? createGranularityTestI18n(options.locale)
    : undefined

  const initialData = options?.data

  const Harness = defineComponent({
    name: 'Harness',
    components: { GrTreeSelect },
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
        <GrTreeSelect
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
  return new DOMWrapper((el ?? document.createElement('i')))
}

function bodyExists(selector: string): boolean {
  return document.body.querySelector(selector) !== null
}

function bodyFindAllRows(): DOMWrapper<Element>[] {
  return [...document.body.querySelectorAll('.gr-tree__row')].map((el) => new DOMWrapper(el))
}

describe('GrTreeSelect (unit)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('показывает шеврон когда нет значения, переворачивает его при open и заменяет на крестик при выбранном значении (clearable)', async () => {
    const wrapper = await mountHarness({ clearable: true })

    expect(wrapper.find('[data-testid="gr-tree-select-clear"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="gr-tree-select-chevron"]').exists()).toBe(true)

    await wrapper.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()

    const chevronIcon = wrapper.find('[data-testid="gr-tree-select-chevron"] > span')
    expect(chevronIcon.exists()).toBe(true)
    expect(chevronIcon.classes()).toContain('rotate-180')

    const travelRow = bodyFindAllRows().find((w) => w.text().includes('Travel'))
    expect(travelRow).toBeTruthy()

    await travelRow!.trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="gr-tree-select-clear"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="gr-tree-select-chevron"]').exists()).toBe(false)

    await wrapper.find('[data-testid="gr-tree-select-clear"]').trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="model"]').text()).toBe('')
    expect(wrapper.find('[data-testid="gr-tree-select-clear"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="gr-tree-select-chevron"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('локализует дефолтные строки (ru): empty state, placeholder фильтра и aria-label кнопки очистки', async () => {
    const wrapperEmpty = await mountHarness(
      { filterable: true },
      { locale: 'ru', data: [] },
    )

    await wrapperEmpty.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()

    const filter = bodyFind('[data-testid="gr-tree-select-filter"]')
    expect(bodyExists('[data-testid="gr-tree-select-filter"]')).toBe(true)
    expect(filter.attributes('placeholder')).toBe('Поиск…')

    expect(document.body.textContent ?? '').toContain('Нет данных')

    wrapperEmpty.unmount()

    const wrapperClear = await mountHarness({ clearable: true }, { locale: 'ru' })
    await wrapperClear.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()

    const travelRow = bodyFindAllRows().find((w) => w.text().includes('Travel'))
    expect(travelRow).toBeTruthy()

    await travelRow!.trigger('click')
    await nextTick()

    const clearBtn = wrapperClear.find('[data-testid="gr-tree-select-clear"]')
    expect(clearBtn.exists()).toBe(true)
    expect(clearBtn.attributes('aria-label')).toBe('Очистить')

    wrapperClear.unmount()
  })

  it('не закрывается сразу при клике (реальный порядок событий: pointerdown -> focus -> click)', async () => {
    const wrapper = await mountHarness()

    const trigger = wrapper.find('[data-testid="gr-tree-select-trigger"]')

    await trigger.trigger('pointerdown')
    await trigger.trigger('focus')
    await trigger.trigger('click')
    await nextTick()
    expect(bodyExists('[data-testid="gr-tree-select-panel"]')).toBe(true)
    expect(bodyFind('[data-testid="gr-tree-select-panel"]').isVisible()).toBe(true)

    wrapper.unmount()
  })

  it('открывается и закрывается по клику вне / ESC', async () => {
    const wrapper = await mountHarness()

    const panel = () => bodyFind('[data-testid="gr-tree-select-panel"]')
    expect(bodyExists('[data-testid="gr-tree-select-panel"]')).toBe(true)
    expect(panel().isVisible()).toBe(false)

    await wrapper.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()
    expect(panel().isVisible()).toBe(true)

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(panel().isVisible()).toBe(false)

    await wrapper.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()
    expect(panel().isVisible()).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(panel().isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('выбирает узел и обновляет v-model (single)', async () => {
    const wrapper = await mountHarness()

    await wrapper.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()

    const travelRow = bodyFindAllRows().find((w) => w.text().includes('Travel'))
    expect(travelRow).toBeTruthy()

    await travelRow!.trigger('click')
    await nextTick()

    expect(wrapper.find('[data-testid="model"]').text()).toBe('2')
    expect(bodyFind('[data-testid="gr-tree-select-panel"]').isVisible()).toBe(false)

    wrapper.unmount()
  })

  it('обновляет значение в input при асинхронном изменении v-model (single)', async () => {
    const wrapper = await mountHarness()

    const trigger = wrapper.find('[data-testid="gr-tree-select-trigger"]')
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

    const trigger = wrapper.find('[data-testid="gr-tree-select-trigger"]')
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

    await wrapper.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()

    const filter = bodyFind('[data-testid="gr-tree-select-filter"]')
    expect(bodyExists('[data-testid="gr-tree-select-filter"]')).toBe(true)

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
      components: { GrTreeSelect },
      setup() {
        const value = ref<any>(null)
        const data = ref<Row[]>([
          { id: 1, label: 'Food' },
          { id: 2, label: 'Travel' },
        ])

        return { value, data }
      },
      template: `
        <GrTreeSelect
          v-model="value"
          :data="data"
          node-key="id"
          placeholder="Pick"
        >
          <template #value="{ labels }">
            <div data-testid="custom-value">Selected: {{ labels[0] ?? '—' }}</div>
          </template>
        </GrTreeSelect>
      `,
    })

    const wrapper = mount(Harness, { attachTo: document.body })

    const trigger = wrapper.find('[data-testid="gr-tree-select-trigger"]')
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

describe('GrTreeSelect — клавиатура ведёт в дерево', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('ArrowDown с триггера открывает панель и отдаёт фокус дереву', async () => {
    const wrapper = await mountHarness()

    const trigger = wrapper.find('[data-testid="gr-tree-select-trigger"]')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await nextTick()

    expect(bodyExists('[data-gr-tree-select-panel]')).toBe(true)
    const active = document.activeElement as HTMLElement
    expect(active.getAttribute('role')).toBe('treeitem')

    wrapper.unmount()
  })

  it('Enter с триггера ведёт туда же — дальше работают клавиши GrTree', async () => {
    const wrapper = await mountHarness()

    const trigger = wrapper.find('[data-testid="gr-tree-select-trigger"]')
    await trigger.trigger('keydown', { key: 'Enter' })
    await nextTick()
    await nextTick()

    const tree = document.body.querySelector('[role="tree"]') as HTMLElement
    tree.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    await nextTick()

    expect((document.activeElement as HTMLElement).getAttribute('data-gr-tree-node-key')).toBe('2')

    wrapper.unmount()
  })

  it('при filterable фокус идёт в поле поиска, а стрелка оттуда — в дерево', async () => {
    const wrapper = await mountHarness({ filterable: true })

    const trigger = wrapper.find('[data-testid="gr-tree-select-trigger"]')
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await nextTick()

    const filter = document.body.querySelector('input[data-gr-tree-select-filter]') as HTMLInputElement
    expect(document.activeElement).toBe(filter)

    filter.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    await nextTick()
    await nextTick()

    expect((document.activeElement as HTMLElement).getAttribute('role')).toBe('treeitem')

    wrapper.unmount()
  })

  it('Tab из панели закрывает её', async () => {
    const wrapper = await mountHarness()

    await wrapper.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()

    const panel = document.body.querySelector('[data-gr-tree-select-panel]') as HTMLElement
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    await nextTick()

    expect(panel.style.display).toBe('none')

    wrapper.unmount()
  })
})

describe('GrTreeSelect — ARIA и состояния', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('комбобокс объявляет, что откроется дерево, и чем он управляет', async () => {
    const wrapper = await mountHarness()

    const trigger = wrapper.find('[data-testid="gr-tree-select-trigger"]')
    expect(trigger.attributes('aria-haspopup')).toBe('tree')
    // Пока панель закрыта — ссылаться не на что.
    expect(trigger.attributes('aria-controls')).toBeUndefined()

    await trigger.trigger('click')
    await nextTick()

    const controls = trigger.attributes('aria-controls')
    expect(controls).toBeTruthy()
    expect(document.body.querySelector(`#${controls}`)?.getAttribute('role')).toBe('tree')

    wrapper.unmount()
  })

  it('disabled красится токенами, а не прозрачностью', async () => {
    const wrapper = await mountHarness({ disabled: true })

    const trigger = wrapper.find('[data-testid="gr-tree-select-trigger"]')
    expect(trigger.classes()).toContain('bg-[var(--gr-muted)]')
    expect(trigger.classes()).toContain('text-[var(--gr-muted-fg)]')
    expect(trigger.classes().join(' ')).not.toContain('opacity-50')

    wrapper.unmount()
  })

  it('readonly не даёт очистить значение', async () => {
    const wrapper = await mountHarness({ clearable: true, readonly: true, modelValue: 2 })
    await nextTick()

    expect(wrapper.find('[data-testid="gr-tree-select-clear"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('loading показывает индикатор вместо «нет данных»', async () => {
    const wrapper = await mountHarness({ loading: true }, { data: [] })

    await wrapper.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()

    expect(bodyExists('[data-gr-tree-select-loading]')).toBe(true)
    expect(document.body.textContent).not.toContain('No data')

    wrapper.unmount()
  })
})

describe('GrTreeSelect — Escape из дерева', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('закрывает панель и не открывает её возвращённым фокусом', async () => {
    const wrapper = await mountHarness()

    const trigger = wrapper.find('[data-testid="gr-tree-select-trigger"]')
    // Настоящий фокус на триггере: именно его стек слоёв запоминает при открытии.
    ;(trigger.element as HTMLInputElement).focus()
    await trigger.trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await nextTick()

    expect((document.activeElement as HTMLElement).getAttribute('role')).toBe('treeitem')

    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(trigger.element)
    expect(trigger.attributes('aria-expanded')).toBe('false')

    wrapper.unmount()
  })
})

describe('GrTreeSelect — чекбоксы при multiple', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  async function openWithCheckboxes(props: Partial<GrTreeSelectProps> = {}) {
    const wrapper = await mountHarness({ multiple: true, showCheckbox: true, ...props })
    await wrapper.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()
    return wrapper
  }

  function rowByLabel(label: string): DOMWrapper<Element> {
    const row = bodyFindAllRows().find(candidate => candidate.text().includes(label))
    return row ?? new DOMWrapper(document.createElement('i'))
  }

  it('чекбоксы появляются только вместе с multiple', async () => {
    const single = await mountHarness({ showCheckbox: true })
    await single.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()
    expect(bodyExists('[data-gr-tree-checkbox]')).toBe(false)
    document.body.innerHTML = ''

    await openWithCheckboxes()
    expect(bodyExists('[data-gr-tree-checkbox]')).toBe(true)
  })

  it('отметка родителя каскадом уводит поддерево в modelValue', async () => {
    const wrapper = await openWithCheckboxes()

    await rowByLabel('Home').trigger('click')
    await nextTick()

    // Родитель и оба ребёнка: каскад считает `GrTree`, а не сам селект.
    const model = wrapper.find('[data-testid="model"]').text()
    for (const key of ['3', '31', '32'])
      expect(model).toContain(key)
  })

  it('checkStrictly отвязывает родителя от детей', async () => {
    const wrapper = await openWithCheckboxes({ checkStrictly: true })

    await rowByLabel('Home').trigger('click')
    await nextTick()

    const model = JSON.parse(wrapper.find('[data-testid="model"]').text())
    expect(model).toEqual([3])
  })

  it('полувыбранный родитель объявлен mixed', async () => {
    // Поддерево должно быть раскрыто: иначе строки ребёнка в панели нет.
    await openWithCheckboxes({ defaultExpandedKeys: [3] })

    await rowByLabel('Rent').trigger('click')
    await nextTick()

    // `aria-checked` живёт на самом `treeitem`, а не на строке внутри него.
    const parent = [...document.body.querySelectorAll('[data-gr-tree-node]')]
      .find(node => node.textContent?.includes('Home'))
    expect(parent?.getAttribute('aria-checked')).toBe('mixed')
  })

  it('клик по строке переключает отметку ровно один раз', async () => {
    const wrapper = await openWithCheckboxes()
    const model = () => wrapper.find('[data-testid="model"]').text()

    await rowByLabel('Travel').trigger('click')
    await nextTick()
    expect(model()).toContain('2')

    // Двойного переключения быть не должно: значение приходит одним путём —
    // через `update:checkedKeys`.
    await rowByLabel('Travel').trigger('click')
    await nextTick()
    expect(model()).not.toContain('2')
  })

  it('своя галочка при чекбоксах не рендерится', async () => {
    await openWithCheckboxes()
    await rowByLabel('Travel').trigger('click')
    await nextTick()

    // Галочка чекбокса `GrTree` остаётся — проверяем, что нет второй, своей.
    expect(bodyExists('[data-gr-tree-select-check]')).toBe(false)
  })

  it('строки панели идут от токена --gr-text-sm', async () => {
    const wrapper = await mountHarness({ loading: true })
    await wrapper.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()

    expect(document.body.innerHTML).toContain('text-[length:var(--gr-text-sm)]')
    expect(document.body.innerHTML).not.toContain('text-[13px]')
  })

  // Скроллер должен быть один: при виртуализации его берёт дерево, и вторая
  // полоса прокрутки на том же списке появиться не должна.
  it('при `virtual` скроллит дерево, а не контейнер панели', async () => {
    const wrapper = await mountHarness({ virtual: true, dropdownMaxHeight: 240 })
    await wrapper.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()

    const tree = document.querySelector('[data-gr-tree]') as HTMLElement
    expect(tree.getAttribute('data-gr-virtual')).toBe('')
    expect(tree.getAttribute('style')).toContain('max-height: 240px')

    const container = tree.parentElement!
    expect(container.className).not.toContain('overflow-auto')
  })

  it('без `virtual` скроллит контейнер панели, как и раньше', async () => {
    const wrapper = await mountHarness({ dropdownMaxHeight: 240 })
    await wrapper.find('[data-testid="gr-tree-select-trigger"]').trigger('click')
    await nextTick()

    const container = (document.querySelector('[data-gr-tree]') as HTMLElement).parentElement!
    expect(container.className).toContain('overflow-auto')
    expect(container.getAttribute('style')).toContain('max-height: 240px')
  })
})
