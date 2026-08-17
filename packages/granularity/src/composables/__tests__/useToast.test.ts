import { createApp, defineComponent } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { granularityToastPlugin, resetToastContextWarning, useToast } from '../useToast'

describe('useToast', () => {
  it('push добавляет toast, а dismiss удаляет его', () => {
    const { list, push, dismiss, clear } = useToast()

    clear()
    const id = push({ title: 'Hello', message: 'World', tone: 'info', timeoutMs: 0 })

    expect(list.value.length).toBe(1)
    expect(list.value[0]?.id).toBe(id)

    dismiss(id)
    expect(list.value.length).toBe(0)
  })

  it('автоматически удаляет toast после timeout', async () => {
    vi.useFakeTimers()

    const { list, push, clear } = useToast()
    clear()
    push({ title: 'Auto', timeoutMs: 100 })

    expect(list.value.length).toBe(1)
    await vi.advanceTimersByTimeAsync(120)
    expect(list.value.length).toBe(0)

    vi.useRealTimers()
  })
})
describe('useToast — update', () => {
  it('меняет поля показанного тоста на месте', () => {
    const { list, push, update, clear } = useToast()
    clear()

    const id = push({ title: 'Загружаем', tone: 'info', timeoutMs: 0 })
    expect(update(id, { title: 'Готово', message: 'Файл сохранён', tone: 'success' })).toBe(true)

    // Тот же тост, а не новый: стек не дёргается.
    expect(list.value).toHaveLength(1)
    expect(list.value[0]).toMatchObject({ id, title: 'Готово', message: 'Файл сохранён', tone: 'success' })
  })

  it('timeoutMs в патче перезапускает таймер, 0 делает тост вечным', async () => {
    vi.useFakeTimers()
    const { list, push, update, clear } = useToast()
    clear()

    const id = push({ title: 'Вечный', timeoutMs: 0 })
    update(id, { timeoutMs: 100 })

    await vi.advanceTimersByTimeAsync(120)
    expect(list.value).toHaveLength(0)

    const second = push({ title: 'Тикает', timeoutMs: 100 })
    update(second, { timeoutMs: 0 })
    await vi.advanceTimersByTimeAsync(300)
    expect(list.value).toHaveLength(1)

    clear()
    vi.useRealTimers()
  })

  it('по закрытому тосту возвращает false и ничего не воскрешает', () => {
    const { list, push, update, dismiss, clear } = useToast()
    clear()

    const id = push({ title: 'Закроют', timeoutMs: 0 })
    dismiss(id)

    expect(update(id, { title: 'Поздно' })).toBe(false)
    expect(list.value).toHaveLength(0)
  })
})

describe('useToast — promise', () => {
  it('успех переписывает тот же тост и включает автозакрытие', async () => {
    const { list, promise, clear } = useToast()
    clear()

    const result = promise(Promise.resolve({ name: 'report.pdf' }), {
      loading: 'Загружаем',
      success: value => ({ title: 'Готово', message: value.name }),
      error: 'Не вышло',
    })

    expect(list.value[0]).toMatchObject({ title: 'Загружаем', tone: 'info', timeoutMs: 0 })

    await result
    expect(list.value).toHaveLength(1)
    expect(list.value[0]).toMatchObject({ title: 'Готово', message: 'report.pdf', tone: 'success' })
    expect(list.value[0]?.timeoutMs).toBeGreaterThan(0)

    clear()
  })

  it('отказ красит тост в danger и пробрасывает ошибку наружу', async () => {
    const { list, promise, clear } = useToast()
    clear()

    const failure = new Error('403')
    // Тост не заменяет обработку отказа: промис обязан отклониться и дальше.
    await expect(promise(Promise.reject(failure), {
      loading: 'Отправляем',
      success: 'Отправлено',
      error: reason => `Ошибка: ${(reason as Error).message}`,
    })).rejects.toThrow('403')

    expect(list.value).toHaveLength(1)
    expect(list.value[0]).toMatchObject({ title: 'Ошибка: 403', tone: 'danger' })

    clear()
  })

  it('стадия заменяет предыдущую целиком: message и action загрузки не наследуются', async () => {
    const { list, promise, clear } = useToast()
    clear()

    const result = promise(Promise.resolve('ok'), {
      loading: { title: 'Сохраняем', message: 'Не закрывайте вкладку', action: { label: 'Отмена', onClick: () => {} } },
      success: 'Сохранено',
      error: 'Не вышло',
    })

    expect(list.value[0]).toMatchObject({ message: 'Не закрывайте вкладку' })

    await result

    // Успех без message/action: от loading-стадии не должно остаться ничего.
    expect(list.value[0]?.title).toBe('Сохранено')
    expect(list.value[0]?.message).toBeUndefined()
    expect(list.value[0]?.action).toBeUndefined()

    clear()
  })

  it('стадия с собственными message и tone применяет их', async () => {
    const { list, promise, clear } = useToast()
    clear()

    const failure = new Error('offline')
    await expect(promise(Promise.reject(failure), {
      loading: { title: 'Отправляем', message: 'ждём сеть' },
      success: 'Отправлено',
      error: () => ({ title: 'Не отправлено', message: 'Проверьте соединение', tone: 'warning' }),
    })).rejects.toThrow('offline')

    expect(list.value[0]).toMatchObject({
      title: 'Не отправлено',
      message: 'Проверьте соединение',
      tone: 'warning',
    })

    clear()
  })

  it('закрытый вручную тост промис не воскрешает', async () => {
    const { list, promise, dismiss, clear } = useToast()
    clear()

    const result = promise(Promise.resolve('ok'), { loading: 'Ждём', success: 'Готово', error: 'Ошибка' })
    dismiss(list.value[0].id)

    await result
    expect(list.value).toHaveLength(0)
  })
})

describe('useToast — вне setup-контекста', () => {
  it('app.runWithContext достаёт app-scoped состояние плагина', () => {
    let inSetup: ReturnType<typeof useToast> | null = null
    const app = createApp(defineComponent({
      setup() {
        inSetup = useToast()
        return () => null
      },
    }))
    app.use(granularityToastPlugin)
    app.mount(document.createElement('div'))

    // Router guard / интерцептор: setup-контекста нет, но контекст приложения есть.
    const fromGuard = app.runWithContext(() => useToast())
    fromGuard.push({ title: 'guard-toast', timeoutMs: 0 })

    expect(inSetup!.list.value.map(toast => toast.title)).toContain('guard-toast')

    // Модульный синглтон не тронут: тост ушёл в состояние приложения.
    expect(useToast().list.value.some(toast => toast.title === 'guard-toast')).toBe(false)

    app.unmount()
  })

  it('фолбэк в синглтон при установленном плагине предупреждает, и только один раз', () => {
    resetToastContextWarning()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const app = createApp({ render: () => null })
    app.use(granularityToastPlugin)

    useToast().clear()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('runWithContext')

    useToast().clear()
    expect(warn).toHaveBeenCalledTimes(1)

    warn.mockRestore()
    app.unmount()
  })
})

describe('useToast — потолок очереди', () => {
  it('вытесняет самые старые тосты и снимает их таймеры', async () => {
    vi.useFakeTimers()
    const { list, push, clear } = useToast()
    clear()

    // Дефолтный потолок — 20; 25 пушей должны оставить последние 20.
    const ids = Array.from({ length: 25 }, (_, index) => push({ title: `#${index}`, timeoutMs: 1000 }))

    expect(list.value).toHaveLength(20)
    expect(list.value[0]?.title).toBe('#24')
    expect(list.value.at(-1)?.title).toBe('#5')
    expect(list.value.some(toast => toast.id === ids[0])).toBe(false)

    // Таймеры вытесненных сняты: иначе через секунду сработал бы dismiss по
    // тостам, которых уже нет.
    await vi.advanceTimersByTimeAsync(1200)
    expect(list.value).toHaveLength(0)

    vi.useRealTimers()
  })
})

describe('useToast — схлопывание повторов', () => {
  it('push с занятым ключом обновляет живой тост, а не заводит второй', () => {
    const { list, push, clear } = useToast()
    clear()

    const first = push({ title: 'Сохранено', dedupeKey: 'save' })
    const second = push({ title: 'Сохранено ещё раз', dedupeKey: 'save' })

    expect(second).toBe(first)
    expect(list.value).toHaveLength(1)
    expect(list.value[0]?.title).toBe('Сохранено ещё раз')

    clear()
  })

  // Повтор — законченное высказывание, а не патч: `message` от прошлого раза
  // остался бы в тосте навсегда.
  it('повтор заменяет тост целиком, а не дописывает поля', () => {
    const { list, push, clear } = useToast()
    clear()

    push({ title: 'Загрузка', message: 'осталось 3 файла', tone: 'info', dedupeKey: 'upload' })
    push({ title: 'Готово', tone: 'success', dedupeKey: 'upload' })

    expect(list.value[0]?.message).toBeUndefined()
    expect(list.value[0]?.tone).toBe('success')

    clear()
  })

  // Тот самый дефект, ради которого ключ и заводится: приложение помнило
  // последний показанный текст, и повтор того же действия не показывался вовсе.
  it('ключ действует только пока тост жив — после закрытия повтор показывается снова', () => {
    const { list, push, dismiss, clear } = useToast()
    clear()

    const first = push({ title: 'Сохранено', dedupeKey: 'save' })
    dismiss(first)
    expect(list.value).toHaveLength(0)

    const second = push({ title: 'Сохранено', dedupeKey: 'save' })

    expect(second).not.toBe(first)
    expect(list.value).toHaveLength(1)

    clear()
  })

  it('повтор перезапускает автозакрытие', async () => {
    vi.useFakeTimers()
    const { list, push, clear } = useToast()
    clear()

    push({ title: 'Сохранено', timeoutMs: 1000, dedupeKey: 'save' })
    await vi.advanceTimersByTimeAsync(800)
    push({ title: 'Сохранено', timeoutMs: 1000, dedupeKey: 'save' })

    // Прошло 1600 мс от первого пуша — без перезапуска тост бы уже закрылся.
    await vi.advanceTimersByTimeAsync(800)
    expect(list.value).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(400)
    expect(list.value).toHaveLength(0)

    vi.useRealTimers()
  })

  it('без ключа повторы копятся, как и раньше', () => {
    const { list, push, clear } = useToast()
    clear()

    push({ title: 'Сохранено' })
    push({ title: 'Сохранено' })

    expect(list.value).toHaveLength(2)

    clear()
  })
})
