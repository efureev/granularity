import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

// HeadlessUI в jsdom не поднимается — та же заглушка, что в тестах `GrModal`.
vi.mock('@headlessui/vue', async () => {
  const { defineComponent } = await import('vue')

  return {
    Dialog: defineComponent({
      name: 'Dialog',
      emits: ['close'],
      props: { as: { type: String, default: 'div' }, initialFocus: { type: Object, default: null } },
      setup(_, { emit }) {
        function onKeydown(event: KeyboardEvent) {
          if (event.key === 'Escape') emit('close')
        }
        return { onKeydown }
      },
      template: '<div data-testid="hu-dialog" @keydown="onKeydown"><slot /></div>',
    }),
    DialogPanel: defineComponent({ name: 'DialogPanel', template: '<div><slot /></div>' }),
    DialogTitle: defineComponent({ name: 'DialogTitle', template: '<div><slot /></div>' }),
    DialogDescription: defineComponent({ name: 'DialogDescription', template: '<div><slot /></div>' }),
    TransitionRoot: defineComponent({
      name: 'TransitionRoot',
      props: { show: { type: Boolean, default: false } },
      template: '<div v-if="show"><slot /></div>',
    }),
    TransitionChild: defineComponent({ name: 'TransitionChild', template: '<div><slot /></div>' }),
  }
})

const GrDropdown = (await import('../components/GrDropdown/GrDropdown.vue')).default
const GrModal = (await import('../components/GrModal/GrModal.vue')).default

/**
 * Гейт слоения dismissible-оверлеев.
 *
 * Инвариант один: Esc адресуется **верхнему** слою — тому, что открыт последним,
 * — и ниже не проваливается. Без него дропдаун, открытый внутри модалки, по Esc
 * не закрывался: модалка слушала `window` в capture и глушила событие
 * `stopImmediatePropagation`, а дропдаун слушал `document` в bubble и до него
 * очередь не доходила. Один дефект ломал пять компонентов.
 */

function pressEscape(): void {
  document.body.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  }))
}

const Harness = defineComponent({
  components: { GrModal, GrDropdown },
  setup() {
    const modalOpen = ref(true)
    return { modalOpen }
  },
  template: `
    <GrModal v-model="modalOpen">
      <GrDropdown>
        <!-- Клик обрабатывает сама обёртка GrDropdown, свой @click тут не нужен. -->
        <template #trigger="{ triggerProps }">
          <button v-bind="triggerProps" data-testid="dd-trigger">Меню</button>
        </template>
        <template #content>
          <div data-testid="dd-item">Пункт</div>
        </template>
      </GrDropdown>
    </GrModal>
  `,
})

/** Панель телепортируется в `body`, поэтому ищем её в документе, а не в wrapper. */
function dropdownVisible(): boolean {
  const panel = document.querySelector<HTMLElement>('[data-gr-dropdown-panel]')
  return panel !== null && panel.style.display !== 'none'
}

describe('слоение dismissible-оверлеев', () => {
  it('Esc закрывает дропдаун внутри модалки, а не модалку', async () => {
    const wrapper = mount(Harness, { attachTo: document.body })

    await wrapper.get('[data-testid="dd-trigger"]').trigger('click')
    await nextTick()
    expect(dropdownVisible(), 'дропдаун открылся').toBe(true)

    pressEscape()
    await nextTick()

    expect(dropdownVisible(), 'дропдаун обязан закрыться').toBe(false)
    expect(wrapper.vm.modalOpen, 'модалка обязана остаться открытой').toBe(true)

    wrapper.unmount()
  })

  it('следующий Esc закрывает уже модалку', async () => {
    const wrapper = mount(Harness, { attachTo: document.body })

    await wrapper.get('[data-testid="dd-trigger"]').trigger('click')
    await nextTick()

    pressEscape()
    await nextTick()
    // Проверяем именно порядок: после первого Esc модалка ещё открыта.
    expect(wrapper.vm.modalOpen, 'первый Esc адресован дропдауну').toBe(true)

    pressEscape()
    await nextTick()
    expect(wrapper.vm.modalOpen, 'второй Esc адресуется модалке').toBe(false)

    wrapper.unmount()
  })
})
