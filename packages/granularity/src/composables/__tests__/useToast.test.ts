import { describe, expect, it, vi } from 'vitest'

import { useToast } from '../useToast'

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

  it('закрытый вручную тост промис не воскрешает', async () => {
    const { list, promise, dismiss, clear } = useToast()
    clear()

    const result = promise(Promise.resolve('ok'), { loading: 'Ждём', success: 'Готово', error: 'Ошибка' })
    dismiss(list.value[0].id)

    await result
    expect(list.value).toHaveLength(0)
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
