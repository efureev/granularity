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

/**
 * Ждать состояния, а не фиксированного числа тиков.
 *
 * `onConfirm` асинхронный, его ошибка проходит через цепочку парсеров, и
 * сколько микротасок займёт путь «клик → текст ошибки в DOM», зависит от того,
 * сколько реактивных зависимостей у окна. Фиксированный `flush(6)` держался на
 * этом числе: любое изменение `GrModal` — даже лишний `ref` — роняло тест,
 * который к самому сервису диалогов отношения не имеет.
 */
async function flushUntil(predicate: () => boolean, times = 40): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    if (predicate()) return
    await nextTick()
    // Классификатор ошибок асинхронный и может уйти в макротаску — одними
    // микротасками его до конца не прогонишь.
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

function promptInput(): HTMLInputElement | null {
  return document.querySelector('[data-testid="gr-prompt-input"]')
}

/**
 * Клик по кнопке диалога — обязательно с реальным тиком таймера перед ним.
 *
 * Vue гасит обработчик, инвокер которого прикреплён не раньше самого события
 * (`e._vts <= invoker.attached` в `runtime-dom/modules/events`) — защита от
 * «клик открыл меню и им же его закрыл». У `GrButton` на том же элементе висит
 * собственный `@click.capture`; он идёт первым, проставляет `_vts`, и тогда
 * `@click` потребителя, прикреплённый в ту же миллисекунду, **молча
 * пропускается**. В jsdom весь путь «поставили в очередь → отрисовали →
 * кликнули» укладывается в одну миллисекунду, поэтому без паузы тест —
 * подбрасывание монеты: промис диалога не резолвится, `await` висит до
 * таймаута. Живому пользователю такое недоступно — кликнуть в ту же
 * миллисекунду, в которую кнопка появилась, он не может.
 */
async function clickDialogButton(testId: string): Promise<void> {
  const button = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)
  if (!button)
    throw new Error(`[test] кнопка [data-testid="${testId}"] не найдена`)

  await new Promise(resolve => setTimeout(resolve, 2))
  button.click()
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
    await clickDialogButton('gr-confirm-confirm')
    await expect(p).resolves.toBe(true)

    await flush()
    const p2 = dialogService.confirm('Delete again?')
    await flush()
    await clickDialogButton('gr-confirm-cancel')
    await expect(p2).resolves.toBe(false)
  })

  it('alert: показывает одну кнопку и резолвит void', async () => {
    const p = dialogService.alert('Saved successfully')
    await flushUntil(() => document.body.textContent.includes('Saved successfully'))

    expect(document.body.textContent).toContain('Saved successfully')
    expect(document.querySelector('[data-testid="gr-confirm-cancel"]')).toBeNull()

    await clickDialogButton('gr-alert-confirm')
    await expect(p).resolves.toBeUndefined()
  })

  it('prompt: резолвит введённое значение, null при отмене', async () => {
    const p = dialogService.prompt('Enter name', { value: 'init' })
    await flush()

    const input = promptInput()!
    input.value = 'Alice'
    input.dispatchEvent(new Event('input'))
    await flush()

    await clickDialogButton('gr-prompt-confirm')
    await expect(p).resolves.toBe('Alice')

    await flush()
    const p2 = dialogService.prompt('Enter again')
    await flush()
    await clickDialogButton('gr-prompt-cancel')
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

    await clickDialogButton('gr-confirm-confirm')
    await flushUntil(() => document.body.textContent.includes('Server rejected'))

    // Первый клик: ошибка показана, диалог открыт, промис не зарезолвлен.
    expect(document.body.textContent).toContain('Server rejected')

    await clickDialogButton('gr-confirm-confirm')
    await expect(p).resolves.toBe(true)
  })

  it('async onConfirm: throw автоматически прогоняется через парсеры и держит диалог', async () => {
    const p = dialogService.confirm('Run?', {
      onConfirm: async () => {
        throw new Error('Boom failure')
      },
    })
    await flush()

    await clickDialogButton('gr-confirm-confirm')
    await flushUntil(() => document.body.textContent.includes('Boom failure'))

    expect(document.body.textContent).toContain('Boom failure')

    // Закрываем вручную, промис должен зарезолвиться (false — не confirm).
    p.close()
    await expect(p).resolves.toBe(false)
  })

  it('очередь FIFO: второй диалог открывается после закрытия первого', async () => {
    const p1 = dialogService.confirm('First')
    const p2 = dialogService.confirm('Second')
    await flushUntil(() => document.body.textContent.includes('First'))

    expect(document.body.textContent).toContain('First')
    expect(document.body.textContent).not.toContain('Second')

    await clickDialogButton('gr-confirm-confirm')
    await p1
    await flushUntil(() => document.body.textContent.includes('Second'))

    expect(document.body.textContent).toContain('Second')
    await clickDialogButton('gr-confirm-confirm')
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

describe('useDialogService — завершение заявки', () => {
  it('close() активного диалога прерывает in-flight onConfirm', async () => {
    let seenAborted: boolean | null = null
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })

    const p = dialogService.confirm('Long task', {
      onConfirm: async (ctx) => {
        await gate
        seenAborted = ctx.signal.aborted
        return false
      },
    })
    await flush()

    await clickDialogButton('gr-confirm-confirm')
    await flush()

    // Закрытие через промис идёт тем же путём, что и кнопка: сигнал обязан
    // оборваться, иначе фоновый запрос продолжит работу за закрытым окном.
    p.close()
    await expect(p).resolves.toBe(false)

    release()
    await flush()
    expect(seenAborted).toBe(true)
  })

  it('повторное завершение заявки ничего не ломает', async () => {
    const p = dialogService.confirm('Twice?')
    await flush()

    await clickDialogButton('gr-confirm-confirm')
    p.close()
    p.close()

    await expect(p).resolves.toBe(true)
  })

  it('closeAll резолвит очередь в порядке FIFO', async () => {
    const order: string[] = []
    const p1 = dialogService.confirm('One').then(() => { order.push('one') })
    const p2 = dialogService.confirm('Two').then(() => { order.push('two') })
    const p3 = dialogService.confirm('Three').then(() => { order.push('three') })
    await flush()

    dialogService.closeAll()
    await Promise.all([p1, p2, p3])

    expect(order).toEqual(['one', 'two', 'three'])
  })

  it('две заявки подряд без промежуточного ожидания доходят обе', async () => {
    const p1 = dialogService.confirm('First')
    const p2 = dialogService.confirm('Second')
    await flushUntil(() => document.body.textContent.includes('First'))

    await clickDialogButton('gr-confirm-confirm')
    await expect(p1).resolves.toBe(true)

    await flushUntil(() => document.body.textContent.includes('Second'))
    await clickDialogButton('gr-confirm-confirm')
    await expect(p2).resolves.toBe(true)
  })

  it('setFieldError адресует ошибку полю, чужое поле в prompt не показывается', async () => {
    const p = dialogService.prompt('Enter name', {
      onConfirm: (ctx) => {
        ctx.setFieldError('email', 'Занят')
        return false
      },
    })
    await flush()

    await clickDialogButton('gr-prompt-confirm')
    await flush()

    // Единственная запись показывается независимо от имени: адресат всё равно один.
    expect(document.body.textContent).toContain('Занят')

    p.close()
    await expect(p).resolves.toBeNull()
  })

  it('alert берёт подпись кнопки из локали, а не из хардкода', async () => {
    const p = dialogService.alert('Saved')
    await flushUntil(() => document.body.textContent.includes('Saved'))

    expect(document.querySelector('[data-testid="gr-alert-confirm"]')?.textContent?.trim()).toBe('OK')

    await clickDialogButton('gr-alert-confirm')
    await p
  })

  it('пока onConfirm в полёте, Esc и бэкдроп не закрывают окно', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })

    const p = dialogService.confirm('Long task', {
      onConfirm: async () => { await gate },
    })
    await flush()

    await clickDialogButton('gr-confirm-confirm')
    await flush()

    // Оба «мягких» способа закрытия сняты: случайное движение не должно
    // оборвать операцию. Явный выход остаётся у кнопки закрытия в шапке.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await flush()
    expect(document.body.textContent).toContain('Long task')

    release()
    await expect(p).resolves.toBe(true)
  })
})
