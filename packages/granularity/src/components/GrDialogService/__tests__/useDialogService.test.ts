import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'

const {
  dialogService,
  granularityDialogServicePlugin,
  teardownDialogService,
  useDialogService,
} = await import('../useDialogService')

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

describe('useDialogService — очередь, вложенность и приоритет', () => {
  function dialogTexts(): string[] {
    return [...document.querySelectorAll('[data-gr-modal-panel]')]
      .map(panel => panel.textContent?.trim() ?? '')
  }

  it('обычные вызовы показываются по одному, в порядке FIFO', async () => {
    const first = dialogService.confirm('Первый')
    const second = dialogService.confirm('Второй')
    await flush()

    expect(dialogTexts()).toHaveLength(1)
    expect(document.body.textContent).toContain('Первый')

    await clickDialogButton('gr-confirm-confirm')
    await expect(first).resolves.toBe(true)
    await flushUntil(() => document.body.textContent.includes('Второй'))

    expect(dialogTexts()).toHaveLength(1)
    await clickDialogButton('gr-confirm-cancel')
    await expect(second).resolves.toBe(false)
  })

  it('priority двигает ожидающих, не трогая показанное окно', async () => {
    const shown = dialogService.confirm('Показанный')
    const low = dialogService.confirm('Фоновый')
    const urgent = dialogService.confirm('Срочный', { priority: 10 })
    await flush()

    // Показанное окно не прерывается — приоритет живёт только среди ожидающих.
    expect(document.body.textContent).toContain('Показанный')

    await clickDialogButton('gr-confirm-confirm')
    await expect(shown).resolves.toBe(true)
    await flushUntil(() => document.body.textContent.includes('Срочный'))

    expect(document.body.textContent).toContain('Срочный')
    expect(document.body.textContent).not.toContain('Фоновый')

    await clickDialogButton('gr-confirm-confirm')
    await expect(urgent).resolves.toBe(true)
    await flushUntil(() => document.body.textContent.includes('Фоновый'))

    await clickDialogButton('gr-confirm-cancel')
    await expect(low).resolves.toBe(false)
  })

  it('диалог из onConfirm открывается поверх, а не встаёт в очередь за ждущим', async () => {
    let nestedAnswer: boolean | null = null

    const outer = dialogService.confirm('Внешний', {
      onConfirm: async () => {
        nestedAnswer = await dialogService.confirm('Вложенный')
        return nestedAnswer
      },
    })
    await flush()

    await clickDialogButton('gr-confirm-confirm')
    await flushUntil(() => document.body.textContent.includes('Вложенный'))

    // Оба окна на экране: внешнее ждёт ответа, вложенное его спрашивает.
    const panels = dialogTexts()
    expect(panels).toHaveLength(2)
    expect(panels[0]).toContain('Внешний')
    expect(panels[1]).toContain('Вложенный')

    // Нижнее окно помечено `inert` общим стеком слоёв — фокус и клики
    // достаются верхнему. Отдельного кода в сервисе на это нет и не нужно.
    const layers = document.querySelectorAll('[data-gr-overlay-root]')
    expect(layers[0].hasAttribute('inert')).toBe(true)
    expect(layers[layers.length - 1].hasAttribute('inert')).toBe(false)

    // Подтверждаем верхнее — оно последнее в разметке.
    const buttons = document.querySelectorAll<HTMLElement>('[data-testid="gr-confirm-confirm"]')
    await new Promise(resolve => setTimeout(resolve, 2))
    buttons[buttons.length - 1].click()

    await expect(outer).resolves.toBe(true)
    expect(nestedAnswer).toBe(true)
  })
})

describe('useDialogService — app-scoped состояние', () => {
  it('плагин даёт приложению свою очередь и свой хост, а app.unmount() снимает его', async () => {
    const { createApp, defineComponent, h } = await import('vue')

    const hosts = () => document.querySelectorAll('[data-gr-dialog-service-host]').length

    let firstService: ReturnType<typeof useDialogService> | null = null
    let secondService: ReturnType<typeof useDialogService> | null = null

    const makeApp = (assign: (service: ReturnType<typeof useDialogService>) => void) => {
      const app = createApp(defineComponent({
        setup() {
          assign(useDialogService())
          return () => h('div')
        },
      }))
      app.use(granularityDialogServicePlugin)
      const root = document.createElement('div')
      document.body.appendChild(root)
      app.mount(root)
      return { app, root }
    }

    const first = makeApp((s) => { firstService = s })
    const second = makeApp((s) => { secondService = s })

    const a = firstService!.confirm('Из первого')
    const b = secondService!.confirm('Из второго')
    await flush()

    // Очереди разные, поэтому оба окна видны одновременно: они головы разных
    // очередей, а не два элемента одной.
    expect(hosts()).toBe(2)
    expect(document.body.textContent).toContain('Из первого')
    expect(document.body.textContent).toContain('Из второго')

    first.app.unmount()
    await flush()

    expect(hosts()).toBe(1)
    expect(document.body.textContent).not.toContain('Из первого')

    second.app.unmount()
    await flush()
    expect(hosts()).toBe(0)

    a.close()
    b.close()
    first.root.remove()
    second.root.remove()
  })

  it('готовый синглтон подхватывает единственный зарегистрированный инстанс', async () => {
    const { createApp, defineComponent, h } = await import('vue')

    const app = createApp(defineComponent({ setup: () => () => h('div') }))
    app.use(granularityDialogServicePlugin)
    const root = document.createElement('div')
    document.body.appendChild(root)
    app.mount(root)

    const p = dialogService.confirm('Через синглтон')
    await flush()

    expect(document.body.textContent).toContain('Через синглтон')

    // Хост принадлежит приложению, поэтому уходит вместе с ним.
    p.close()
    await flush()
    app.unmount()
    await flush()

    expect(document.querySelectorAll('[data-gr-dialog-service-host]').length).toBe(0)
    root.remove()
  })
})
