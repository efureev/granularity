import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import GrConfirmDialog from '../GrConfirmDialog.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('GrConfirmDialog', () => {
  it('рендерит описание и дефолтные тексты, а confirm/cancel закрывают диалог', async () => {
    const Harness = defineComponent({
      name: 'HarnessConfirmDialogActions',
      components: { GrConfirmDialog },
      setup() {
        const open = ref(true)
        const onConfirm = vi.fn()
        const onCancel = vi.fn()

        return { open, onConfirm, onCancel }
      },
      template: `
        <GrConfirmDialog
          v-model="open"
          description="Delete the current item?"
          @confirm="onConfirm"
          @cancel="onCancel"
        />
      `,
    })

    const wrapper = mount(Harness, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    // Телепорт застабан: содержимое остаётся в дереве обёртки и появляется на
    // такт позже монтирования.
    await nextTick()

    expect(wrapper.text()).toContain('Confirm')
    expect(wrapper.text()).toContain('Delete the current item?')
    expect(wrapper.find('[data-testid="gr-confirm-cancel"]').text()).toBe('Cancel')
    expect(wrapper.find('[data-testid="gr-confirm-confirm"]').text()).toBe('Confirm')

    await wrapper.find('[data-testid="gr-confirm-cancel"]').trigger('click')
    await nextTick()

    expect((wrapper.vm as any).onCancel).toHaveBeenCalledTimes(1)
    expect((wrapper.vm as any).open).toBe(false)

    ;(wrapper.vm as any).open = true
    await nextTick()
    await wrapper.find('[data-testid="gr-confirm-confirm"]').trigger('click')
    await nextTick()

    expect((wrapper.vm as any).onConfirm).toHaveBeenCalledTimes(1)
    expect((wrapper.vm as any).open).toBe(false)

    wrapper.unmount()
  })

  it('пробрасывает headerConfig, footerConfig и buttonSize в базовые компоненты', async () => {
    const wrapper = mount(
      defineComponent({
        name: 'HarnessConfirmDialogConfig',
        components: { GrConfirmDialog },
        setup() {
          const open = ref(true)

          return { open }
        },
        template: `
          <GrConfirmDialog
            v-model="open"
            title="Archive item"
            button-size="xs"
            :header-config="{ paddingX: 'px-4', paddingY: 'py-2', bordered: false }"
            :footer-config="{ paddingX: 'px-3', paddingY: 'py-1', bordered: false }"
          />
        `,
      }),
      {
        global: {
          stubs: {
            teleport: true,
          },
        },
      },
    )

    // Телепорт застабан: содержимое остаётся в дереве обёртки, но появляется
    // на такт позже монтирования.
    await nextTick()

    expect(wrapper.find('[data-gr-dialog-header]').classes()).toContain('px-4')
    expect(wrapper.find('[data-gr-dialog-header]').classes()).toContain('py-2')
    expect(wrapper.find('[data-gr-dialog-header]').classes()).not.toContain('border-b')

    expect(wrapper.find('[data-gr-dialog-footer]').classes()).toContain('px-3')
    expect(wrapper.find('[data-gr-dialog-footer]').classes()).toContain('py-1')
    expect(wrapper.find('[data-gr-dialog-footer]').classes()).not.toContain('border-t')

    expect(wrapper.find('[data-testid="gr-confirm-cancel"]').classes()).toContain('h-7')
    expect(wrapper.find('[data-testid="gr-confirm-cancel"]').classes()).toContain('px-2.5')
    expect(wrapper.find('[data-testid="gr-confirm-confirm"]').classes()).toContain('h-7')
    expect(wrapper.find('[data-testid="gr-confirm-confirm"]').classes()).toContain('px-2.5')

    wrapper.unmount()
  })
})
/**
 * Стенд для сценариев с фокусом и async-веткой.
 *
 * `teleport` намеренно **не** стабится: стаб VTU пересоздаёт поддерево на
 * ре-рендере, и в тесте остаются мёртвые инстансы — шаблонный `ref` смотрит на
 * один, а в документе висит другой, из-за чего молча не работает программный
 * фокус. Ищем поэтому по документу.
 *
 * Открываем окно **после** монтирования, как в жизни: телепорт включается
 * только после mount, и содержимое, отрисованное до него, переезжает в `body`,
 * а переезд узла сбрасывает фокус.
 */
async function mountConfirm(attrs = '', slots = '') {
  const Harness = defineComponent({
    name: 'HarnessConfirm',
    components: { GrConfirmDialog },
    setup() {
      const open = ref(false)
      const onConfirm = vi.fn()
      const onCancel = vi.fn()
      return { open, onConfirm, onCancel }
    },
    template: `
      <GrConfirmDialog v-model="open" ${attrs} @confirm="onConfirm" @cancel="onCancel">
        ${slots}
      </GrConfirmDialog>
    `,
  })

  const wrapper = mount(Harness, { attachTo: document.body })
  ;(wrapper.vm as unknown as { open: boolean }).open = true
  // Тактов три: телепорт включается после маунта, затем появляется поддерево
  // окна, и только потом содержимое диалога ставит фокус.
  await nextTick()
  await nextTick()
  await nextTick()

  return wrapper
}

const byTestId = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)


describe('GrConfirmDialog — фокус при открытии', () => {
  it('по умолчанию фокус на «Отмена»: Enter сразу после открытия ничего не разрушает', async () => {
    const wrapper = await mountConfirm()

    expect(document.activeElement).toBe(byTestId('gr-confirm-cancel'))

    wrapper.unmount()
  })

  it('focusAction="confirm" уводит фокус на подтверждение', async () => {
    const wrapper = await mountConfirm('focus-action="confirm"')

    expect(document.activeElement).toBe(byTestId('gr-confirm-confirm'))

    wrapper.unmount()
  })

  it('focusAction="none" не уводит фокус на кнопки', async () => {
    // Фокус на панель ставит ловушка `GrModal` —
    // проверяем то, за что отвечает компонент: он не трогает фокус вовсе.
    const wrapper = await mountConfirm('focus-action="none"')

    expect(document.activeElement).not.toBe(byTestId('gr-confirm-cancel'))
    expect(document.activeElement).not.toBe(byTestId('gr-confirm-confirm'))

    wrapper.unmount()
  })

  it('со своим слотом #footer фокусировать нечего — молчим, а не падаем', async () => {
    const wrapper = await mountConfirm('', '<template #footer><button data-testid="own">Своя</button></template>')

    expect(byTestId('gr-confirm-cancel')).toBeNull()
    expect(byTestId('own')).not.toBeNull()
    // Ничего не сфокусировано насильно — фокус остаётся там, куда его поставит
    // фокус-ловушка окна.
    expect(document.activeElement).not.toBe(byTestId('own'))

    wrapper.unmount()
  })
})

describe('GrConfirmDialog — async-ветка', () => {
  it('closeOnConfirm=false оставляет окно открытым и отдаёт закрытие наружу', async () => {
    const wrapper = await mountConfirm(':close-on-confirm="false"')

    byTestId('gr-confirm-confirm')!.click()
    await nextTick()

    expect((wrapper.vm as unknown as { onConfirm: ReturnType<typeof vi.fn> }).onConfirm).toHaveBeenCalledTimes(1)
    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(true)

    wrapper.unmount()
  })

  it('persistent снимает Esc и бэкдроп, пока идёт подтверждение', async () => {
    const wrapper = await mountConfirm('persistent :confirm-loading="true" :close-on-confirm="false"')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await nextTick()
    await nextTick()

    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(true)
    // Явный выход остаётся: «Отмена» и крестик работают.
    expect(byTestId('gr-confirm-cancel')).not.toBeNull()

    wrapper.unmount()
  })

  it('без persistent Esc закрывает окно даже во время загрузки', async () => {
    const wrapper = await mountConfirm(':confirm-loading="true" :close-on-confirm="false"')

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await nextTick()
    await nextTick()

    expect((wrapper.vm as unknown as { open: boolean }).open).toBe(false)

    wrapper.unmount()
  })

  it('confirmLoading и confirmDisabled доходят до кнопки подтверждения', async () => {
    const loadingWrapper = await mountConfirm(':confirm-loading="true"')
    expect(byTestId('gr-confirm-confirm')?.getAttribute('aria-busy')).toBe('true')
    loadingWrapper.unmount()

    const disabledWrapper = await mountConfirm(':confirm-disabled="true"')
    expect((byTestId('gr-confirm-confirm') as HTMLButtonElement).disabled).toBe(true)
    disabledWrapper.unmount()
  })

  it('баннер ошибки рисуется из пропа и переопределяется слотом', async () => {
    const withBanner = await mountConfirm(':error="{ kind: \'unknown\', message: \'Сервер отказал\', raw: null }"')
    expect(document.body.textContent).toContain('Сервер отказал')
    withBanner.unmount()

    const withSlot = await mountConfirm(
      ':error="{ kind: \'unknown\', message: \'Сервер отказал\', raw: null }"',
      '<template #error="{ error }"><div data-testid="own-error">Своя подача: {{ error.message }}</div></template>',
    )
    expect(byTestId('own-error')?.textContent).toContain('Своя подача: Сервер отказал')
    withSlot.unmount()
  })
})
