import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@headlessui/vue', async () => {
  const { defineComponent } = await import('vue')

  return {
    Dialog: defineComponent({
      name: 'Dialog',
      emits: ['close'],
      props: { initialFocus: { type: Object, default: null } },
      template: '<div data-testid="hu-dialog"><slot /></div>',
    }),
    DialogPanel: defineComponent({
      name: 'DialogPanel',
      template: '<div data-testid="hu-panel"><slot /></div>',
    }),
    DialogTitle: defineComponent({
      name: 'DialogTitle',
      template: '<div data-testid="hu-title"><slot /></div>',
    }),
    TransitionRoot: defineComponent({
      name: 'TransitionRoot',
      props: { show: { type: Boolean, default: false } },
      template: '<div v-if="show"><slot /></div>',
    }),
    TransitionChild: defineComponent({
      name: 'TransitionChild',
      template: '<div><slot /></div>',
    }),
    // Teleport-подобные обёртки не нужны: хост сам в body.
  }
})

const { dialogService, teardownDialogService } = await import('../useDialogService')

/** Дать движку прогнать монтирование/рендер и микротаски. */
async function flush(times = 4): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await nextTick()
    await Promise.resolve()
  }
}

function confirmButton(): HTMLElement | null {
  return document.querySelector('[data-testid="ds-confirm-confirm"]')
}
function cancelButton(): HTMLElement | null {
  return document.querySelector('[data-testid="ds-confirm-cancel"]')
}
function promptInput(): HTMLInputElement | null {
  return document.querySelector('[data-testid="ds-prompt-input"]')
}
function promptConfirm(): HTMLElement | null {
  return document.querySelector('[data-testid="ds-prompt-confirm"]')
}

afterEach(() => {
  teardownDialogService()
  document.body.innerHTML = ''
})

describe('useDialogService', () => {
  it('confirm: резолвит true по Confirm и false по Cancel', async () => {
    const p = dialogService.confirm('Delete item?')
    await flush()

    expect(document.body.textContent).toContain('Delete item?')
    confirmButton()!.click()
    await expect(p).resolves.toBe(true)

    await flush()
    const p2 = dialogService.confirm('Delete again?')
    await flush()
    cancelButton()!.click()
    await expect(p2).resolves.toBe(false)
  })

  it('alert: показывает одну кнопку и резолвит void', async () => {
    const p = dialogService.alert('Saved successfully')
    await flush()

    expect(document.body.textContent).toContain('Saved successfully')
    expect(document.querySelector('[data-testid="ds-confirm-cancel"]')).toBeNull()

    document.querySelector<HTMLElement>('[data-testid="ds-alert-confirm"]')!.click()
    await expect(p).resolves.toBeUndefined()
  })

  it('prompt: резолвит введённое значение, null при отмене', async () => {
    const p = dialogService.prompt('Enter name', { value: 'init' })
    await flush()

    const input = promptInput()!
    input.value = 'Alice'
    input.dispatchEvent(new Event('input'))
    await flush()

    promptConfirm()!.click()
    await expect(p).resolves.toBe('Alice')

    await flush()
    const p2 = dialogService.prompt('Enter again')
    await flush()
    document.querySelector<HTMLElement>('[data-testid="ds-prompt-cancel"]')!.click()
    await expect(p2).resolves.toBeNull()
  })

  it('async onConfirm: ошибка оставляет диалог открытым, успех закрывает', async () => {
    let attempt = 0
    const p = dialogService.confirm('Submit?', {
      onConfirm: async (ctx) => {
        attempt += 1
        if (attempt === 1) {
          ctx.setError('Server rejected')
          return false
        }
      },
    })
    await flush()

    confirmButton()!.click()
    await flush(6)

    // Первый клик: ошибка показана, диалог открыт, промис не зарезолвлен.
    expect(document.body.textContent).toContain('Server rejected')

    confirmButton()!.click()
    await expect(p).resolves.toBe(true)
  })

  it('async onConfirm: throw автоматически прогоняется через парсеры и держит диалог', async () => {
    const p = dialogService.confirm('Run?', {
      onConfirm: async () => {
        throw new Error('Boom failure')
      },
    })
    await flush()

    confirmButton()!.click()
    await flush(6)

    expect(document.body.textContent).toContain('Boom failure')

    // Закрываем вручную, промис должен зарезолвиться (false — не confirm).
    p.close()
    await expect(p).resolves.toBe(false)
  })

  it('очередь FIFO: второй диалог открывается после закрытия первого', async () => {
    const p1 = dialogService.confirm('First')
    const p2 = dialogService.confirm('Second')
    await flush()

    expect(document.body.textContent).toContain('First')
    expect(document.body.textContent).not.toContain('Second')

    confirmButton()!.click()
    await p1
    await flush()

    expect(document.body.textContent).toContain('Second')
    confirmButton()!.click()
    await expect(p2).resolves.toBe(true)
  })

  it('closeAll: закрывает все ожидающие диалоги', async () => {
    const p1 = dialogService.confirm('One')
    const p2 = dialogService.confirm('Two')
    await flush()

    dialogService.closeAll()
    await expect(p1).resolves.toBe(false)
    await expect(p2).resolves.toBe(false)
  })

  it('lifecycle: хост удаляется из DOM после teardown', async () => {
    const p = dialogService.confirm('Cleanup?')
    await flush()
    expect(document.querySelector('[data-gr-dialog-service-host]')).not.toBeNull()
    p.close()
    await flush()

    teardownDialogService()
    expect(document.querySelector('[data-gr-dialog-service-host]')).toBeNull()
  })
})
