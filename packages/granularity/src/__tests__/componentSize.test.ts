import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'

// HeadlessUI-диалог (его использует `GrDrawer`) требует `ResizeObserver`, которого
// в jsdom нет. Гейт смотрит на размерные классы, а не на механику оверлея, —
// поэтому подменяем прозрачными обёртками, как в тестах самого `GrDrawer`.
vi.mock('@headlessui/vue', async () => {
  const { defineComponent: define } = await import('vue')
  const passthrough = (name: string) => define({ name, template: '<div><slot /></div>' })

  return {
    // `initialFocus` обязан быть объявлен пропом, как у настоящего `Dialog`:
    // необъявленный он уезжает на `<div>` атрибутом, а `setAttribute` с
    // template-ref роняет jsdom необработанным исключением.
    Dialog: define({
      name: 'Dialog',
      props: { initialFocus: { type: Object, default: undefined } },
      emits: ['close'],
      template: '<div><slot /></div>',
    }),
    DialogPanel: passthrough('DialogPanel'),
    DialogTitle: passthrough('DialogTitle'),
    DialogDescription: passthrough('DialogDescription'),
    TransitionRoot: define({
      name: 'TransitionRoot',
      props: { show: { type: Boolean, default: false } },
      template: '<div v-if="show"><slot /></div>',
    }),
    TransitionChild: passthrough('TransitionChild'),
  }
})

import GrAutocomplete from '../components/GrAutocomplete/GrAutocomplete.vue'
import GrAvatar from '../components/GrAvatar/GrAvatar.vue'
import GrBadge from '../components/GrBadge/GrBadge.vue'
import GrButton from '../components/GrButton/GrButton.vue'
import GrCheckbox from '../components/GrCheckbox/GrCheckbox.vue'
import GrCheckboxGroup from '../components/GrCheckboxGroup/GrCheckboxGroup.vue'
import GrCollapse from '../components/GrCollapse/GrCollapse.vue'
import GrCollapseItem from '../components/GrCollapse/GrCollapseItem.vue'
import GrConfigProvider from '../components/GrConfigProvider/GrConfigProvider.vue'
import GrDataTable from '../components/GrDataTable/GrDataTable.vue'
import GrCommandPalette from '../components/GrCommandPalette/GrCommandPalette.vue'
import GrConfirmDialog from '../components/GrConfirmDialog/GrConfirmDialog.vue'
import GrDialog from '../components/GrDialog/GrDialog.vue'
import GrDrawer from '../components/GrDrawer/GrDrawer.vue'
import GrModal from '../components/GrModal/GrModal.vue'
import GrPromptDialog from '../components/GrPromptDialog/GrPromptDialog.vue'
import GrFileUpload from '../components/GrFileUpload/GrFileUpload.vue'
import GrFormField from '../components/GrFormField/GrFormField.vue'
import GrFormFile from '../components/GrFormFile/GrFormFile.vue'
import GrIcon from '../components/GrIcon/GrIcon.vue'
import GrInput from '../components/GrInput/GrInput.vue'
import GrInputTag from '../components/GrInputTag/GrInputTag.vue'
import GrKbd from '../components/GrKbd/GrKbd.vue'
import GrLink from '../components/GrLink/GrLink.vue'
import GrNumberInput from '../components/GrNumberInput/GrNumberInput.vue'
import GrPagination from '../components/GrPagination/GrPagination.vue'
import GrPopover from '../components/GrPopover/GrPopover.vue'
import GrProgressBar from '../components/GrProgressBar/GrProgressBar.vue'
import GrRadio from '../components/GrRadio/GrRadio.vue'
import GrRadioGroup from '../components/GrRadioGroup/GrRadioGroup.vue'
import GrRating from '../components/GrRating/GrRating.vue'
import GrSegmented from '../components/GrSegmented/GrSegmented.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrSlider from '../components/GrSlider/GrSlider.vue'
import GrStatistic from '../components/GrStatistic/GrStatistic.vue'
import GrSwitch from '../components/GrSwitch/GrSwitch.vue'
import GrTable from '../components/GrTable/GrTable.vue'
import GrTabs from '../components/GrTabs/GrTabs.vue'
import GrTextarea from '../components/GrTextarea/GrTextarea.vue'
import GrTooltip from '../components/GrTooltip/GrTooltip.vue'
import GrTree from '../components/GrTree/GrTree.vue'
import GrTreeSelect from '../components/GrTreeSelect/GrTreeSelect.vue'

/**
 * Гейт контракта размера.
 *
 * `GrConfigProvider` задаёт размер всему поддереву, но канал этот односторонний
 * и молчаливый: компонент, не читающий `useGrComponentSize()`, ошибки не даёт —
 * он просто остаётся своего размера. Так и получилось у девяти компонентов
 * (`AUDIT.md`, задача 6): `<GrConfigProvider size="sm">` масштабировал `GrInput`
 * и не трогал стоящий рядом `GrTextarea`, из-за чего форма визуально рассыпалась.
 *
 * Проверяем не факт вызова композабла, а отрендеренный DOM: важно, что размер
 * реально доехал до разметки.
 */

const componentsDir = resolve(process.cwd(), 'src/components')

/** Размеры, которые обязаны различаться в разметке у любого участника шкалы. */
const PROBE_SIZES = ['xs', 'lg'] as const

/**
 * Компоненты, объявившие шкалу, но не реализующие её целиком. Найдены этим же
 * гейтом и вынесены в `AUDIT.md`; каждый требует отдельного решения по внешнему
 * виду, поэтому чинить их заодно с задачей 6 нельзя:
 *
 * - `GrBadge` читает только `componentDefaults`, глобальный `size` провайдера
 *   до него не доходит (`useGrComponentProp` вместо `useGrComponentSize`);
 * - `GrKbd` типизирован на `xs…lg`, а реализует две ступени: `sm` и «все
 *   остальные»;
 * - `GrRadio` и `GrRadioGroup` масштабируются только в `variant="button"` —
 *   у radiobox по умолчанию коробка и точка заданы фиксированными пикселями.
 *
 * Список закрытый и проверяется на протухание: как только компонент начинает
 * различать края шкалы, тест требует убрать его отсюда.
 */
const KNOWN_FLAT_SIZE = new Set(['GrBadge', 'GrRadio', 'GrRadioGroup'])

const harnesses: { name: string, render: () => unknown }[] = [
  { name: 'GrAutocomplete', render: () => h(GrAutocomplete, { modelValue: '', options: [] }) },
  { name: 'GrAvatar', render: () => h(GrAvatar, { alt: 'A' }) },
  { name: 'GrBadge', render: () => h(GrBadge, null, { default: () => 'B' }) },
  { name: 'GrButton', render: () => h(GrButton, null, { default: () => 'B' }) },
  { name: 'GrCheckbox', render: () => h(GrCheckbox, { modelValue: false }) },
  {
    name: 'GrCheckboxGroup',
    render: () => h(GrCheckboxGroup, {
      modelValue: [],
      options: [{ value: 'a', label: 'A' }],
    }),
  },
  {
    name: 'GrCollapse',
    render: () => h(GrCollapse, { modelValue: ['a'] }, {
      default: () => h(GrCollapseItem, { name: 'a', title: 'A' }, { default: () => 'body' }),
    }),
  },
  {
    name: 'GrDataTable',
    render: () => h(GrDataTable, {
      rows: [{ id: 1, name: 'A' }],
      columns: [{ key: 'name', label: 'Name' }],
    }),
  },
  { name: 'GrFileUpload', render: () => h(GrFileUpload) },
  {
    name: 'GrFormField',
    render: () => h(GrFormField, { label: 'L', hint: 'H', error: 'E' }, { default: () => h('input') }),
  },
  { name: 'GrFormFile', render: () => h(GrFormFile, { modelValue: null }) },
  { name: 'GrIcon', render: () => h(GrIcon) },
  { name: 'GrInput', render: () => h(GrInput, { modelValue: '' }) },
  { name: 'GrInputTag', render: () => h(GrInputTag, { modelValue: ['a'] }) },
  { name: 'GrKbd', render: () => h(GrKbd, null, { default: () => 'K' }) },
  { name: 'GrLink', render: () => h(GrLink, { href: '#' }, { default: () => 'L' }) },
  { name: 'GrNumberInput', render: () => h(GrNumberInput, { modelValue: '' }) },
  { name: 'GrPagination', render: () => h(GrPagination, { page: 1, pageSize: 10, total: 100 }) },
  {
    name: 'GrPopover',
    render: () => h(GrPopover, { open: true, ariaLabel: 'P' }, { content: () => 'C' }),
  },
  { name: 'GrProgressBar', render: () => h(GrProgressBar, { value: 50 }) },
  { name: 'GrRadio', render: () => h(GrRadio, { modelValue: 'a', value: 'a' }) },
  {
    name: 'GrRadioGroup',
    render: () => h(GrRadioGroup, {
      modelValue: 'a',
      options: [{ value: 'a', label: 'A' }],
    }),
  },
  { name: 'GrRating', render: () => h(GrRating, { modelValue: 0 }) },
  {
    name: 'GrSegmented',
    render: () => h(GrSegmented, {
      modelValue: 'a',
      options: [{ value: 'a', label: 'A' }],
    }),
  },
  { name: 'GrSelect', render: () => h(GrSelect, { modelValue: '', options: [] }) },
  { name: 'GrSlider', render: () => h(GrSlider, { modelValue: 0 }) },
  { name: 'GrStatistic', render: () => h(GrStatistic, { value: 42 }) },
  { name: 'GrSwitch', render: () => h(GrSwitch, { modelValue: false }) },
  { name: 'GrTable', render: () => h(GrTable, null, { default: () => h('tr', h('td', 'x')) }) },
  {
    name: 'GrTabs',
    render: () => h(GrTabs, { modelValue: 'a', tabs: [{ value: 'a', label: 'A' }] }),
  },
  { name: 'GrTextarea', render: () => h(GrTextarea, { modelValue: '' }) },
  { name: 'GrTooltip', render: () => h(GrTooltip, { text: 'T' }) },
  { name: 'GrTree', render: () => h(GrTree, { data: [{ id: '1', label: 'A' }] }) },
  {
    name: 'GrTreeSelect',
    render: () => h(GrTreeSelect, { modelValue: null, data: [{ id: '1', label: 'A' }] }),
  },
]

/**
 * Компоненты на шкале **оверлеев** (`sm…full`), а не контролов. Глобальный
 * `size` провайдера к ним неприменим по построению: он про кегль контролов, а
 * не про ширину панели, и `<GrConfigProvider size="xs">` не обязан ничего
 * менять у выезжающей панели. Канал у них один — точечный `componentDefaults`,
 * поэтому и проверяются они иначе.
 */
const overlayHarnesses: { name: string, render: () => unknown }[] = [
  {
    name: 'GrDrawer',
    render: () => h(GrDrawer, { modelValue: true, title: 'D' }, { default: () => 'content' }),
  },
  {
    name: 'GrModal',
    render: () => h(GrModal, { modelValue: true, ariaLabel: 'M' }, { default: () => 'content' }),
  },
  {
    name: 'GrDialog',
    render: () => h(GrDialog, { modelValue: true, title: 'D' }, { default: () => 'content' }),
  },
  {
    name: 'GrConfirmDialog',
    render: () => h(GrConfirmDialog, { modelValue: true, title: 'C', description: 'D' }),
  },
  {
    name: 'GrPromptDialog',
    render: () => h(GrPromptDialog, { modelValue: true, value: '', title: 'P', label: 'L' }),
  },
  {
    name: 'GrCommandPalette',
    render: () => h(GrCommandPalette, { modelValue: true, items: [{ id: 'a', label: 'A' }] }),
  },
]

/** Края оверлейной шкалы. */
const OVERLAY_PROBE_SIZES = ['sm', 'full'] as const

/**
 * Компоненты, объявившие `size` в `defaults.ts`, — это ровно те, кто обещал
 * потребителю настройку через провайдер. Список берём из файловой системы,
 * иначе следующий такой компонент снова тихо выпадет из шкалы.
 */
function componentsWithConfigurableSize(): string[] {
  return readdirSync(componentsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('Gr'))
    .filter((entry) => {
      const path = resolve(componentsDir, entry.name, 'defaults.ts')
      try {
        return /^\s*size\??:/m.test(readFileSync(path, 'utf8'))
      }
      catch {
        return false
      }
    })
    .map(entry => entry.name)
}

// `teleport` стабится: оверлеи уносят панель в `body`, и без стаба `html()`
// вернул бы пустую обёртку — сравнение размеров стало бы всегда истинным.
const MOUNT_OPTIONS = { attachTo: document.body, global: { stubs: { teleport: true } } }

function renderWithConfig(render: () => unknown, config: Record<string, unknown>): string {
  const Harness = defineComponent({
    render: () => h(GrConfigProvider, config, { default: () => render() }),
  })

  return mount(Harness, MOUNT_OPTIONS).html()
}

/**
 * Класс панели оверлея из отрендеренной разметки. Размерная шкала оверлея живёт
 * именно на панели, а всё остальное в окне — обычные контролы со своей шкалой.
 */
function panelMarkup(html: string): string {
  const panel = html.match(/<[^>]*data-gr-(?:modal|drawer)-panel[^>]*>/)
  return panel ? panel[0] : html
}

describe('контракт размера', () => {
  it('каждый компонент с настраиваемым `size` покрыт гейтом', () => {
    const covered = new Set([...harnesses, ...overlayHarnesses].map(item => item.name))
    const missing = componentsWithConfigurableSize().filter(name => !covered.has(name))

    expect(missing, `нет стенда в этом гейте: ${missing.join(', ')}`).toEqual([])
  })

  it('список неполных шкал не протух', () => {
    const stale = harnesses
      .filter(({ name }) => KNOWN_FLAT_SIZE.has(name))
      .filter(({ render }) => {
        const [small, large] = PROBE_SIZES.map(size => renderWithConfig(render, { size }))
        return small !== large
      })
      .map(({ name }) => name)

    expect(stale, `шкала реализована — убрать из KNOWN_FLAT_SIZE: ${stale.join(', ')}`).toEqual([])
  })

  const scaled = harnesses.filter(({ name }) => !KNOWN_FLAT_SIZE.has(name))

  it.each(scaled)('$name наследует размер от GrConfigProvider', ({ render }) => {
    const [small, large] = PROBE_SIZES.map(size => renderWithConfig(render, { size }))

    expect(small).not.toBe(large)
  })

  it.each(scaled)('$name: componentDefaults побеждает глобальный size', ({ name, render }) => {
    const global = renderWithConfig(render, { size: 'xs' })
    const pointed = renderWithConfig(render, {
      size: 'xs',
      componentDefaults: { [name]: { size: 'lg' } },
    })
    const expected = renderWithConfig(render, { size: 'lg' })

    expect(pointed).not.toBe(global)
    expect(pointed).toBe(expected)
  })

  it.each(scaled)('$name: локальный проп побеждает провайдер', ({ render }) => {
    const fromConfig = renderWithConfig(render, { size: 'xs' })
    const local = mount(defineComponent({
      render: () => h(GrConfigProvider, { size: 'xs' }, {
        default: () => {
          const vnode = render() as { props?: Record<string, unknown> }
          vnode.props = { ...vnode.props, size: 'lg' }
          return vnode
        },
      }),
    }), MOUNT_OPTIONS).html()

    expect(local).not.toBe(fromConfig)
  })

  describe('шкала оверлеев', () => {
    it.each(overlayHarnesses)('$name: componentDefaults задаёт размер панели', ({ name, render }) => {
      const [small, large] = OVERLAY_PROBE_SIZES.map(size =>
        renderWithConfig(render, { componentDefaults: { [name]: { size } } }),
      )

      expect(small).not.toBe(large)
    })

    it.each(overlayHarnesses)('$name: локальный проп побеждает componentDefaults', ({ name, render }) => {
      const fromConfig = renderWithConfig(render, { componentDefaults: { [name]: { size: 'sm' } } })
      const local = mount(defineComponent({
        render: () => h(GrConfigProvider, { componentDefaults: { [name]: { size: 'sm' } } }, {
          default: () => {
            const vnode = render() as { props?: Record<string, unknown> }
            vnode.props = { ...vnode.props, size: 'full' }
            return vnode
          },
        }),
      }), MOUNT_OPTIONS).html()

      expect(local).not.toBe(fromConfig)
    })

    // Шкалы не смешиваются: `size="xs"` у провайдера — про контролы, и панель
    // оверлея он менять не должен, иначе `xs` пришлось бы объявлять и здесь.
    //
    // Сравниваем класс панели, а не всю разметку: внутри диалогов живут обычные
    // контролы (кнопки подвала), и они обязаны глобальный размер слушаться —
    // сравнение целиком запрещало бы им ровно то, ради чего провайдер и нужен.
    it.each(overlayHarnesses)('$name: глобальный size провайдера его не трогает', ({ render }) => {
      const [small, large] = PROBE_SIZES.map(size => panelMarkup(renderWithConfig(render, { size })))

      expect(small).toBe(large)
    })
  })
})
