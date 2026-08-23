import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/arrow-up', () => {
  return {
    default: defineComponent({
      name: 'IconArrowUp',
      template: '<svg data-icon="arrow-up" />',
    }),
  }
})

import GrFormField from '../../GrFormField/GrFormField.vue'
import GrFileUpload from '../GrFileUpload.vue'
import { maxFileSize } from '../maxFileSize'

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

describe('GrFileUpload', () => {
  it('при drop файлов вызывает request и эмитит success/change', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })

    const wrapper = mount(GrFileUpload, {
      props: {
        request,
        multiple: true,
      },
    })

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [file],
        dropEffect: 'copy',
      },
    })

    await flushPromises()

    expect(request).toHaveBeenCalledTimes(1)
    const [files, ctx] = request.mock.calls[0]
    expect(files).toHaveLength(1)
    expect(files[0].name).toBe('hello.txt')
    expect(ctx.signal).toBeInstanceOf(AbortSignal)

    expect(wrapper.emitted('success')).toBeTruthy()
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')![0][0]).toHaveLength(1)
  })

  it('maxFileSize блокирует слишком большой файл и эмитит error', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })

    const wrapper = mount(GrFileUpload, {
      props: {
        request,
        validators: [maxFileSize({ mb: 1 })],
      },
    })

    const bigFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'big.bin', { type: 'application/octet-stream' })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [bigFile],
      },
    })

    await flushPromises()

    expect(request).not.toHaveBeenCalled()
    expect(wrapper.emitted('error')).toBeTruthy()
    expect(wrapper.emitted('success')).toBeFalsy()
  })

  it('disabled не реагирует на click/drop', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click')

    const wrapper = mount(GrFileUpload, {
      props: {
        request,
        disabled: true,
      },
    })

    await wrapper.get('[data-gr-file-upload]').trigger('click')
    expect(clickSpy).not.toHaveBeenCalled()

    const file = new File(['x'], 'x.txt', { type: 'text/plain' })
    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [file],
      },
    })

    await flushPromises()

    expect(request).not.toHaveBeenCalled()
    expect(wrapper.emitted('success')).toBeFalsy()
    expect(wrapper.emitted('error')).toBeFalsy()
  })

  // Роль-виджет на drop-зоне объявляла бы потомков презентационными, и нативный
  // file-input внутри терялся для скринридеров (axe: `nested-interactive`).
  // Поэтому доступный контрол — сам input, а зона остаётся просто зоной.
  it('доступным контролом делает нативный input, а не drop-зону', () => {
    const wrapper = mount(GrFileUpload, {
      props: { request: vi.fn() },
    })

    const zone = wrapper.get('[data-gr-file-upload]')
    expect(zone.attributes('role')).toBeUndefined()
    expect(zone.attributes('tabindex')).toBeUndefined()

    const input = wrapper.get('[data-gr-file-upload-input]')
    expect(input.attributes('tabindex')).toBe('0')
    expect(input.attributes('aria-hidden')).toBeUndefined()
    expect(input.attributes('aria-label')).toBeTruthy()
  })

  it('в custom UI прячет input от таба и дерева доступности — контрол рисует слот', () => {
    const wrapper = mount(GrFileUpload, {
      props: { request: vi.fn() },
      slots: {
        default: ({ openDialog }: any) => h('button', { type: 'button', onClick: openDialog }, 'Upload'),
      },
    })

    const input = wrapper.get('[data-gr-file-upload-input]')
    expect(input.attributes('tabindex')).toBe('-1')
    expect(input.attributes('aria-hidden')).toBe('true')
    expect(input.attributes('aria-label')).toBeUndefined()
  })

  it('всплывший клик от самого input не открывает диалог повторно', async () => {
    // Спай общий на прототип, а `restoreMocks` в конфиге нет — считаем от своей отметки.
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click')
    clickSpy.mockClear()

    const wrapper = mount(GrFileUpload, {
      props: { request: vi.fn() },
    })

    await wrapper.get('[data-gr-file-upload-input]').trigger('click')
    expect(clickSpy).not.toHaveBeenCalled()

    await wrapper.get('[data-gr-file-upload]').trigger('click')
    expect(clickSpy).toHaveBeenCalledTimes(1)

    clickSpy.mockClear()
  })

  it('элементный default-slot переводит компонент в custom UI режим', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click')

    const wrapper = mount(GrFileUpload, {
      props: { request },
      slots: {
        default: ({ openDialog }: any) => h('button', { 'type': 'button', 'data-testid': 'btn', 'onClick': openDialog }, 'Upload'),
      },
    })

    expect(wrapper.get('[data-gr-file-upload]').attributes('role')).toBeUndefined()
    expect(wrapper.find('[data-icon="arrow-up"]').exists()).toBe(false)

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [file],
      },
    })
    await flushPromises()
    expect(request).not.toHaveBeenCalled()

    await wrapper.get('[data-testid="btn"]').trigger('click')
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('multiple+limit эмитит exceed и не стартует загрузку', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const onExceed = vi.fn()

    const wrapper = mount(GrFileUpload, {
      props: {
        request,
        multiple: true,
        limit: 1,
        onExceed,
      },
    })

    const a = new File(['a'], 'a.txt', { type: 'text/plain' })
    const b = new File(['b'], 'b.txt', { type: 'text/plain' })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [a, b],
      },
    })

    await flushPromises()

    // `:on-exceed` продолжает работать: у Vue эмит и приходит пропом-слушателем.
    expect(onExceed).toHaveBeenCalledTimes(1)
    expect(onExceed.mock.calls[0][0]).toHaveLength(2)
    expect(onExceed.mock.calls[0][1]).toBe(1)

    const exceed = wrapper.emitted('exceed') as [File[], number][]
    expect(exceed).toHaveLength(1)
    expect(exceed[0][0]).toHaveLength(2)
    expect(exceed[0][1]).toBe(1)

    expect(request).not.toHaveBeenCalled()
    expect(wrapper.emitted('error')).toBeTruthy()
  })

  it('beforeUpload=false отменяет загрузку до старта', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const beforeUpload = vi.fn().mockReturnValue(false)

    const wrapper = mount(GrFileUpload, {
      props: {
        request,
        beforeUpload,
      },
    })

    const file = new File(['x'], 'x.txt', { type: 'text/plain' })
    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [file],
      },
    })

    await flushPromises()

    expect(beforeUpload).toHaveBeenCalledWith(file)
    expect(request).not.toHaveBeenCalled()
    expect(wrapper.emitted('error')).toBeTruthy()
  })

  it('uploadExtraData прокидывает extraData в request ctx и FormData action-режима', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })

    const wrapper = mount(GrFileUpload, {
      props: {
        request,
        uploadExtraData: () => ({ foo: 'bar' }),
      },
    })

    const file = new File(['x'], 'x.txt', { type: 'text/plain' })
    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [file],
      },
    })

    await flushPromises()

    expect(request).toHaveBeenCalledTimes(1)
    expect(request.mock.calls[0][1].extraData).toEqual({ foo: 'bar' })

    const originalXhr = globalThis.XMLHttpRequest
    const lastInstance: any = {}
    class XhrMock {
      upload = { addEventListener: vi.fn() }
      status = 200
      responseText = '{"ok":true}'
      withCredentials = false
      private listeners: Record<string, ((event?: any) => void)[]> = {}
      open = vi.fn()
      setRequestHeader = vi.fn()
      abort = vi.fn()
      getResponseHeader(name: string) {
        return name.toLowerCase() === 'content-type' ? 'application/json' : null
      }

      addEventListener(name: string, cb: (event?: any) => void) {
        ;(this.listeners[name] ??= []).push(cb)
      }

      removeEventListener() {}
      send = vi.fn(function (this: XhrMock, body: any) {
        lastInstance.body = body
        lastInstance.instance = this
        setTimeout(() => this.listeners.load?.forEach(cb => cb()), 0)
      })
    }
    ;(globalThis as any).XMLHttpRequest = XhrMock

    try {
      const actionWrapper = mount(GrFileUpload, {
        props: {
          action: '/upload',
          name: 'file',
          uploadExtraData: () => ({ folder: 'inbox' }),
        },
      })

      await actionWrapper.get('[data-gr-file-upload]').trigger('drop', {
        dataTransfer: {
          files: [file],
        },
      })

      await flushPromises()

      expect(lastInstance.body).toBeInstanceOf(FormData)
      const body = lastInstance.body as FormData
      expect(body.get('file')).toBeInstanceOf(File)
      expect(body.get('folder')).toBe('inbox')
    }
    finally {
      ;(globalThis as any).XMLHttpRequest = originalXhr
    }
  })

  it('эмитит реальный прогресс через ctx.onProgress в кастомном request', async () => {
    let captured: any
    const request = vi.fn(async (_files: File[], ctx: any) => {
      captured = ctx
      ctx.onProgress?.({ percent: 25, loaded: 25, total: 100, indeterminate: false })
      ctx.onProgress?.({ percent: 75, loaded: 75, total: 100, indeterminate: false })
      return { ok: true }
    })

    const wrapper = mount(GrFileUpload, {
      props: { request },
    })

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [file] },
    })

    await flushPromises()

    expect(typeof captured.onProgress).toBe('function')
    const progressEvents = wrapper.emitted('progress') ?? []
    // 0 (старт) + 25 + 75 + 100 (по успешной загрузке)
    const percents = progressEvents.map(args => args[0])
    expect(percents).toContain(0)
    expect(percents).toContain(25)
    expect(percents).toContain(75)
    expect(percents).toContain(100)
    expect(wrapper.emitted('stateChange')).toBeTruthy()
  })

  it('прогресс без известного размера показывает полосу без значения', async () => {
    let release: (value: unknown) => void = () => {}
    const request = vi.fn((_files: File[], ctx: any) => {
      ctx.onProgress?.({ percent: 0, loaded: 0, total: 0, indeterminate: true })
      return new Promise((resolve) => {
        release = resolve
      })
    })

    const wrapper = mount(GrFileUpload, {
      props: { request, hideProgressOnSuccess: 0 },
    })

    const file = new File(['x'], 'x.txt', { type: 'text/plain' })
    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [file] },
    })
    await flushPromises()

    const track = wrapper.get('[data-gr-progress-bar-track]')
    expect(track.attributes('data-gr-progress-bar-indeterminate')).toBe('')
    expect(track.attributes('aria-valuenow')).toBeUndefined()

    release({ ok: true })
    await flushPromises()

    const settled = wrapper.get('[data-gr-progress-bar-track]')
    expect(settled.attributes('data-gr-progress-bar-indeterminate')).toBeUndefined()
    expect(settled.attributes('aria-valuenow')).toBe('100')
  })

  it('scoped-слот progress получает state и текущий процент', async () => {
    const request = vi.fn(async (_files: File[], ctx: any) => {
      ctx.onProgress?.({ percent: 42, loaded: 42, total: 100, indeterminate: false })
      return { ok: true }
    })

    const wrapper = mount(GrFileUpload, {
      props: { request, hideProgressOnSuccess: 0 },
      slots: {
        progress: (scope: any) => h(
          'div',
          { 'data-testid': 'progress-slot', 'data-phase': scope.phase },
          `${Math.round(scope.percent)}|${scope.state.phase}`,
        ),
      },
    })

    const file = new File(['x'], 'x.txt', { type: 'text/plain' })
    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [file] },
    })

    await flushPromises()

    const node = wrapper.get('[data-testid="progress-slot"]')
    expect(node.attributes('data-phase')).toBe('success')
    expect(node.text()).toContain('100')
    expect(node.text()).toContain('success')
  })
})

describe('GrFileUpload — размонтирование', () => {
  function dropFile(wrapper: ReturnType<typeof mount>, name = 'hello.txt') {
    return wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [new File(['hello'], name, { type: 'text/plain' })] },
    })
  }

  // XHR продолжал качать файл и по завершении дёргал `setStateSuccess`/`emit`
  // уже мёртвого компонента.
  it('аборт активной загрузки при размонтировании', async () => {
    let capturedSignal: AbortSignal | undefined
    const request = vi.fn((_files: File[], ctx: { signal: AbortSignal }) => {
      capturedSignal = ctx.signal
      return new Promise(() => {})
    })

    const wrapper = mount(GrFileUpload, { props: { request } })
    await dropFile(wrapper)
    await flushPromises()

    expect(capturedSignal?.aborted).toBe(false)

    wrapper.unmount()

    expect(capturedSignal?.aborted).toBe(true)
  })

  // Таймер на `hideProgressOnSuccess` переживал компонент и вызывал
  // `setStateIdle()` → `emit('stateChange')` на уничтоженном инстансе.
  it('таймер скрытия успеха снимается при размонтировании', async () => {
    vi.useFakeTimers()

    try {
      const request = vi.fn().mockResolvedValue({ ok: true })
      const wrapper = mount(GrFileUpload, { props: { request, hideProgressOnSuccess: 800 } })

      await dropFile(wrapper)
      await vi.advanceTimersByTimeAsync(0)

      // Массив событий VTU мутирует на месте, поэтому держим ссылку: после
      // `unmount()` сам `emitted()` уже недоступен.
      const events = wrapper.emitted('stateChange') as unknown[]
      const beforeUnmount = events.length
      expect(beforeUnmount).toBeGreaterThan(0)

      wrapper.unmount()
      await vi.advanceTimersByTimeAsync(1000)

      expect(events.length).toBe(beforeUnmount)
    }
    finally {
      vi.useRealTimers()
    }
  })
})

describe('GrFileUpload — accept', () => {
  // Атрибут не биндился вовсе, а `inheritAttrs` включён — `accept`, переданный
  // потребителем, оседал на корневом `<div>` и в системный диалог не попадал.
  it('accept доезжает до нативного input, а не до корневой зоны', () => {
    const wrapper = mount(GrFileUpload, { props: { accept: 'image/*,.pdf' } })

    expect(wrapper.get('[data-gr-file-upload-input]').attributes('accept')).toBe('image/*,.pdf')
    expect(wrapper.get('[data-gr-file-upload]').attributes('accept')).toBeUndefined()
  })

  // Диалог `accept` фильтрует, а drag&drop — нет: перетащить можно что угодно.
  it('accept отсеивает файл при drop, а не после отправки', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const wrapper = mount(GrFileUpload, { props: { request, accept: 'image/*' } })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [new File(['x'], 'notes.txt', { type: 'text/plain' })] },
    })
    await flushPromises()

    expect(request).not.toHaveBeenCalled()
    expect(wrapper.emitted('error')).toBeTruthy()
  })

  it('capture и webkitdirectory тоже уходят на input', () => {
    const wrapper = mount(GrFileUpload, { props: { capture: 'environment', directory: true } })
    const input = wrapper.get('[data-gr-file-upload-input]')

    expect(input.attributes('capture')).toBe('environment')
    expect(input.attributes('webkitdirectory')).toBeDefined()
  })
})

describe('GrFileUpload — гонка при повторном выборе', () => {
  function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // `lastFiles` писался до `await`-ов, а `abort()` вызывался после валидации:
  // если валидаторы второго набора отработают быстрее, «победит» первый —
  // он же оборвёт уже стартовавшую загрузку второго.
  it('выигрывает последний выбор, даже если его валидаторы быстрее', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const slowValidator = async ({ files }: { files: File[] }) => {
      await delay(files[0]?.name === 'slow.txt' ? 30 : 0)
      return []
    }

    const wrapper = mount(GrFileUpload, { props: { request, validators: [slowValidator] } })
    const zone = wrapper.get('[data-gr-file-upload]')

    void zone.trigger('drop', {
      dataTransfer: { files: [new File(['a'], 'slow.txt', { type: 'text/plain' })] },
    })
    void zone.trigger('drop', {
      dataTransfer: { files: [new File(['b'], 'fast.txt', { type: 'text/plain' })] },
    })

    await delay(60)

    expect(request).toHaveBeenCalledTimes(1)
    expect(request.mock.calls[0][0][0].name).toBe('fast.txt')

    const changes = wrapper.emitted('change') as File[][][]
    expect(changes).toHaveLength(1)
    expect(changes[0][0][0].name).toBe('fast.txt')
  })
})

describe('GrFileUpload — список файлов', () => {
  // `:key="file.name"` давал дубль ключа для двух одноимённых файлов из разных
  // папок: Vue переиспользовал не тот `<li>`, а в dev-режиме ругался на дубль.
  it('одноимённые файлы не путаются между собой при перевыборе', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      const request = vi.fn().mockResolvedValue({ ok: true })
      const wrapper = mount(GrFileUpload, {
        props: { request, multiple: true, showFileList: true },
      })
      const zone = wrapper.get('[data-gr-file-upload]')

      await zone.trigger('drop', {
        dataTransfer: {
          files: [
            new File(['a'], 'report.pdf', { type: 'application/pdf' }),
            new File(['bbbbb'], 'report.pdf', { type: 'application/pdf' }),
          ],
        },
      })
      await flushPromises()

      expect(wrapper.findAll('[data-gr-file-upload-item]')).toHaveLength(2)

      // Перевыбор: у Vue это patch списка, и на дублирующихся ключах он и
      // ругается, и переиспользует не тот `<li>`.
      await zone.trigger('drop', {
        dataTransfer: {
          files: [new File(['ccccccccc'], 'report.pdf', { type: 'application/pdf' })],
        },
      })
      await flushPromises()

      const items = wrapper.findAll('[data-gr-file-upload-item]')
      expect(items).toHaveLength(1)
      expect(items[0].text()).toContain('1 KB')
      expect(warn.mock.calls.map(call => String(call[0])).filter(text => text.includes('Duplicate keys'))).toEqual([])
    }
    finally {
      warn.mockRestore()
    }
  })
})

describe('GrFileUpload — объявление статуса', () => {
  // Прогресс-бар скрыт `aria-hidden`, а завершение и ошибка не объявлялись
  // ничем: пользователь скринридера не узнавал, чем кончилась загрузка.
  it('живой регион существует с первого рендера и объявляет фазы', async () => {
    let resolveRequest: ((value: unknown) => void) | undefined
    const request = vi.fn(() => new Promise((resolve) => {
      resolveRequest = resolve
    }))

    const wrapper = mount(GrFileUpload, { props: { request } })

    const live = wrapper.get('[data-gr-file-upload-live]')
    expect(live.attributes('role')).toBe('status')
    expect(live.text()).toBe('')

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] },
    })
    await flushPromises()

    expect(wrapper.get('[data-gr-file-upload-live]').text()).toBe('Uploading…')

    resolveRequest?.({ ok: true })
    await flushPromises()

    expect(wrapper.get('[data-gr-file-upload-live]').text()).toBe('Upload complete')
  })

  it('ошибка тоже объявляется', async () => {
    const request = vi.fn().mockRejectedValue(new Error('boom'))
    const wrapper = mount(GrFileUpload, { props: { request } })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] },
    })
    await flushPromises()

    expect(wrapper.get('[data-gr-file-upload-live]').text()).toBe('Upload failed')
  })
})

describe('GrFileUpload — итоговый объём', () => {
  // Кастомный `request` не обязан звать `onProgress`. Без замера байтов
  // «100%» при `loaded: 0, total: 0` потребитель прочитает как «загружено ноль».
  it('без onProgress итог берётся из размеров файлов, а не из нуля', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const wrapper = mount(GrFileUpload, { props: { request, multiple: true } })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [
          new File(['12345'], 'a.txt', { type: 'text/plain' }),
          new File(['123'], 'b.txt', { type: 'text/plain' }),
        ],
      },
    })
    await flushPromises()

    const states = wrapper.emitted('stateChange') as { phase: string, loaded: number, total: number }[][]
    const success = states.map(call => call[0]).find(item => item.phase === 'success')

    expect(success).toMatchObject({ loaded: 8, total: 8, percent: 100 })
  })
})

describe('GrFileUpload — управление набором файлов', () => {
  function dropTwo(wrapper: ReturnType<typeof mount>) {
    return wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [
          new File(['a'], 'a.txt', { type: 'text/plain' }),
          new File(['b'], 'b.txt', { type: 'text/plain' }),
        ],
      },
    })
  }

  // `showFileList` был декоративным списком имён: убрать лишний файл или
  // повторить упавшую загрузку было нечем — только выбирать всё заново.
  it('файл убирается из набора кнопкой в списке', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const wrapper = mount(GrFileUpload, {
      props: { request, multiple: true, showFileList: true },
    })

    await dropTwo(wrapper)
    await flushPromises()

    expect(wrapper.findAll('[data-gr-file-upload-item]')).toHaveLength(2)

    await wrapper.findAll('[data-gr-file-upload-remove]')[0].trigger('click')

    const items = wrapper.findAll('[data-gr-file-upload-item]')
    expect(items).toHaveLength(1)
    expect(items[0].text()).toContain('b.txt')
  })

  it('retry повторяет загрузку текущего набора', async () => {
    const request = vi.fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ ok: true })

    const wrapper = mount(GrFileUpload, { props: { request, multiple: true } })

    await dropTwo(wrapper)
    await flushPromises()

    expect(wrapper.emitted('error')).toBeTruthy()

    const api = wrapper.vm as unknown as { retry: () => Promise<void> }
    await api.retry()
    await flushPromises()

    expect(request).toHaveBeenCalledTimes(2)
    expect(request.mock.calls[1][0]).toHaveLength(2)
    expect(wrapper.emitted('success')).toBeTruthy()
  })

  it('удаление последнего файла возвращает состояние в idle', async () => {
    const request = vi.fn().mockRejectedValue(new Error('boom'))
    const wrapper = mount(GrFileUpload, { props: { request, showFileList: true } })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [new File(['a'], 'a.txt', { type: 'text/plain' })] },
    })
    await flushPromises()

    const api = wrapper.vm as unknown as {
      files: File[]
      removeFile: (file: File) => void
      state: { phase: string }
    }
    expect(api.state.phase).toBe('error')

    api.removeFile(api.files[0])
    await wrapper.vm.$nextTick()

    // Показывать ошибку от набора, которого больше нет, не о чем.
    expect(api.state.phase).toBe('idle')
    expect(wrapper.find('[data-gr-file-upload-item]').exists()).toBe(false)
  })
})

describe('GrFileUpload — пофайловая загрузка', () => {
  function dropFiles(wrapper: ReturnType<typeof mount>, files: File[]) {
    return wrapper.get('[data-gr-file-upload]').trigger('drop', { dataTransfer: { files } })
  }

  const png = (name: string) => new File(['x'], name, { type: 'image/png' })

  it('каждый файл уходит своим запросом, а `request` получает массив из одного', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const wrapper = mount(GrFileUpload, {
      props: { request, multiple: true, uploadMode: 'per-file', showFileList: true },
    })

    await dropFiles(wrapper, [png('a.png'), png('b.png')])
    await flushPromises()

    expect(request).toHaveBeenCalledTimes(2)
    // Контракт не меняется: тот же `(files, ctx)`, просто с одним файлом.
    expect(request.mock.calls.map(call => call[0].map((file: File) => file.name))).toEqual([['a.png'], ['b.png']])
    expect(wrapper.emitted('success')).toHaveLength(2)
    expect((wrapper.emitted('success')![0][1] as File).name).toBe('a.png')
  })

  it('concurrency ограничивает число одновременных запросов', async () => {
    let inFlight = 0
    let peak = 0
    const release: Array<() => void> = []

    const request = vi.fn(() => {
      inFlight += 1
      peak = Math.max(peak, inFlight)
      return new Promise<void>((resolve) => {
        release.push(() => {
          inFlight -= 1
          resolve()
        })
      })
    })

    const wrapper = mount(GrFileUpload, {
      props: { request, multiple: true, uploadMode: 'per-file', concurrency: 2 },
    })

    await dropFiles(wrapper, [png('a.png'), png('b.png'), png('c.png'), png('d.png')])
    await flushPromises()

    expect(peak).toBe(2)

    while (release.length) {
      release.shift()!()
      await flushPromises()
    }

    expect(request).toHaveBeenCalledTimes(4)
  })

  it('у каждого файла свой статус, а сводное состояние берёт худший исход', async () => {
    const request = vi.fn((files: File[]) =>
      files[0].name === 'bad.png' ? Promise.reject(new Error('boom')) : Promise.resolve({ ok: true }),
    )

    const wrapper = mount(GrFileUpload, {
      props: { request, multiple: true, uploadMode: 'per-file', showFileList: true },
    })

    await dropFiles(wrapper, [png('good.png'), png('bad.png')])
    await flushPromises()

    const statuses = wrapper.findAll('[data-gr-file-upload-status]').map(el => el.attributes('data-status'))
    expect(statuses).toEqual(['success', 'error'])

    // Один упал — набор считается упавшим, даже если остальные успешны.
    expect((wrapper.vm as any).state.phase).toBe('error')
    expect(wrapper.emitted('error')).toHaveLength(1)
    expect((wrapper.emitted('error')![0][1] as File).name).toBe('bad.png')
  })

  it('retryFile повторяет только свой файл', async () => {
    let attempt = 0
    const request = vi.fn((files: File[]) => {
      if (files[0].name !== 'bad.png')
        return Promise.resolve({ ok: true })
      attempt += 1
      return attempt === 1 ? Promise.reject(new Error('boom')) : Promise.resolve({ ok: true })
    })

    const wrapper = mount(GrFileUpload, {
      props: { request, multiple: true, uploadMode: 'per-file', showFileList: true },
    })

    await dropFiles(wrapper, [png('good.png'), png('bad.png')])
    await flushPromises()

    request.mockClear()
    await wrapper.get('[data-gr-file-upload-retry-file]').trigger('click')
    await flushPromises()

    expect(request).toHaveBeenCalledTimes(1)
    expect(request.mock.calls[0][0][0].name).toBe('bad.png')
    expect(wrapper.findAll('[data-gr-file-upload-status]').map(el => el.attributes('data-status')))
      .toEqual(['success', 'success'])
    expect((wrapper.vm as any).state.phase).toBe('success')
  })

  it('abortFile обрывает только свой файл, остальные догружаются', async () => {
    const controllers: AbortSignal[] = []
    const request = vi.fn((files: File[], ctx: { signal: AbortSignal }) => {
      controllers.push(ctx.signal)
      return new Promise((resolve, reject) => {
        ctx.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))
        if (files[0].name === 'fast.png')
          resolve({ ok: true })
      })
    })

    const wrapper = mount(GrFileUpload, {
      props: { request, multiple: true, uploadMode: 'per-file', showFileList: true },
    })

    await dropFiles(wrapper, [png('slow.png'), png('fast.png')])
    await flushPromises()

    await wrapper.get('[data-gr-file-upload-abort-file]').trigger('click')
    await flushPromises()

    // Отмена — не ошибка: строка возвращается в очередь, а сосед доезжает.
    const statuses = wrapper.findAll('[data-gr-file-upload-status]').map(el => el.attributes('data-status'))
    expect(statuses).toEqual(['pending', 'success'])
    expect(controllers[1].aborted).toBe(false)
  })

  it('батчевый режим статусов по файлам не заводит', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const wrapper = mount(GrFileUpload, {
      props: { request, multiple: true, showFileList: true },
    })

    await dropFiles(wrapper, [png('a.png'), png('b.png')])
    await flushPromises()

    expect(request).toHaveBeenCalledTimes(1)
    expect(wrapper.findAll('[data-gr-file-upload-status]')).toHaveLength(0)
    // Хвостового `file` в батче нет — говорить про отдельный файл нечем.
    expect(wrapper.emitted('success')![0][1]).toBeUndefined()
  })
})

describe('GrFileUpload — превью', () => {
  const png = (name: string) => new File(['x'], name, { type: 'image/png' })

  it('миниатюра создаётся для картинок и отзывается при удалении файла', async () => {
    const createObjectURL = vi.fn(() => 'blob:preview')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })

    try {
      const request = vi.fn().mockResolvedValue({ ok: true })
      const wrapper = mount(GrFileUpload, {
        props: { request, multiple: true, showFileList: true, preview: true },
      })

      await wrapper.get('[data-gr-file-upload]').trigger('drop', {
        dataTransfer: { files: [png('photo.png'), new File(['t'], 'notes.txt', { type: 'text/plain' })] },
      })
      await flushPromises()

      // Только для картинок: у текстового файла показывать нечего.
      expect(wrapper.findAll('[data-gr-file-upload-preview]')).toHaveLength(1)
      expect(createObjectURL).toHaveBeenCalledTimes(1)

      await wrapper.findAll('[data-gr-file-upload-remove]')[0].trigger('click')
      await flushPromises()

      // Без отзыва blob висел бы в памяти вкладки до перезагрузки.
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview')
    }
    finally {
      vi.unstubAllGlobals()
    }
  })

  it('размонтирование отзывает оставшиеся ссылки', async () => {
    const createObjectURL = vi.fn(() => 'blob:preview')
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })

    try {
      const request = vi.fn().mockResolvedValue({ ok: true })
      const wrapper = mount(GrFileUpload, {
        props: { request, showFileList: true, preview: true },
      })

      await wrapper.get('[data-gr-file-upload]').trigger('drop', { dataTransfer: { files: [png('photo.png')] } })
      await flushPromises()

      wrapper.unmount()

      expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview')
    }
    finally {
      vi.unstubAllGlobals()
    }
  })

  it('без preview миниатюр нет и object URL не создаётся', async () => {
    const createObjectURL = vi.fn(() => 'blob:preview')
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() })

    try {
      const wrapper = mount(GrFileUpload, {
        props: { request: vi.fn().mockResolvedValue({}), showFileList: true },
      })

      await wrapper.get('[data-gr-file-upload]').trigger('drop', { dataTransfer: { files: [png('photo.png')] } })
      await flushPromises()

      expect(wrapper.findAll('[data-gr-file-upload-preview]')).toHaveLength(0)
      expect(createObjectURL).not.toHaveBeenCalled()
    }
    finally {
      vi.unstubAllGlobals()
    }
  })
})

describe('GrFileUpload — readonly', () => {
  it('не открывает системный диалог ни зоной, ни самим input', async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click')
    const before = clickSpy.mock.calls.length

    const wrapper = mount(GrFileUpload, {
      props: { request: vi.fn(), readonly: true },
    })

    await wrapper.get('[data-gr-file-upload]').trigger('click')
    expect(clickSpy.mock.calls.length).toBe(before)

    // У `<input type="file">` атрибута `readonly` нет, поэтому диалог гасится
    // отменой действия по умолчанию — иначе Enter на input открыл бы его.
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    wrapper.get('[data-gr-file-upload-input]').element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('не принимает drop и не отправляет файлы', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const wrapper = mount(GrFileUpload, {
      props: { request, readonly: true, showFileList: true },
    })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [new File(['x'], 'x.txt', { type: 'text/plain' })] },
    })
    await flushPromises()

    expect(request).not.toHaveBeenCalled()
    expect(wrapper.emitted('success')).toBeFalsy()
  })

  it('остаётся в порядке Tab и объявляется как только чтение', () => {
    const wrapper = mount(GrFileUpload, {
      props: { request: vi.fn(), readonly: true },
    })
    const input = wrapper.get('[data-gr-file-upload-input]')

    // `readonly` — не `disabled`: контрол достижим, набор виден.
    expect(input.attributes('tabindex')).toBe('0')
    expect(input.attributes('disabled')).toBeUndefined()
    expect(input.attributes('aria-readonly')).toBe('true')
    expect(wrapper.get('[data-gr-file-upload]').classes()).not.toContain('cursor-pointer')
  })
})

describe('GrFileUpload — состояние из GrFormField', () => {
  async function mountInField(fieldProps: Record<string, unknown>) {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const wrapper = mount(defineComponent({
      render: () => h(GrFormField, { label: 'Документы', ...fieldProps }, {
        default: () => h(GrFileUpload, { request, showFileList: true }),
      }),
    }))
    return { wrapper, request }
  }

  it('disabled поля гасит зону, а не только нативный input', async () => {
    const { wrapper, request } = await mountInField({ disabled: true })
    const zone = wrapper.get('[data-gr-file-upload]')

    // Зона брала сырой проп компонента, поэтому выглядела рабочей: ховер,
    // курсор-палец и фокус-кольцо при выключенном поле.
    expect(zone.classes()).toContain('cursor-not-allowed')
    expect(zone.classes()).not.toContain('cursor-pointer')
    expect(wrapper.get('[data-gr-file-upload-input]').attributes('disabled')).toBeDefined()

    await zone.trigger('drop', {
      dataTransfer: { files: [new File(['x'], 'x.txt', { type: 'text/plain' })] },
    })
    await flushPromises()
    expect(request).not.toHaveBeenCalled()
  })

  it('readonly поля запрещает ввод так же, как собственный проп', async () => {
    const { wrapper, request } = await mountInField({ readonly: true })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [new File(['x'], 'x.txt', { type: 'text/plain' })] },
    })
    await flushPromises()

    expect(request).not.toHaveBeenCalled()
    expect(wrapper.get('[data-gr-file-upload-input]').attributes('aria-readonly')).toBe('true')
  })

  it('кнопки удаления и повтора исчезают вместе с disabled поля', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const disabled = ref(false)
    const wrapper = mount(defineComponent({
      render: () => h(GrFormField, { label: 'Документы', disabled: disabled.value }, {
        default: () => h(GrFileUpload, { request, showFileList: true }),
      }),
    }))

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [new File(['x'], 'x.txt', { type: 'text/plain' })] },
    })
    await flushPromises()
    expect(wrapper.find('[data-gr-file-upload-remove]').exists()).toBe(true)

    disabled.value = true
    await nextTick()
    // Кнопка, которая осталась бы на месте, кликалась бы вхолостую: обработчик
    // молча выходит по `locked`.
    expect(wrapper.find('[data-gr-file-upload-remove]').exists()).toBe(false)
  })
})

describe('GrFileUpload — modelValue', () => {
  const txt = (name: string) => new File(['x'], name, { type: 'text/plain' })

  it('без пропа компонент держит набор сам', async () => {
    const wrapper = mount(GrFileUpload, {
      props: { request: vi.fn().mockResolvedValue({}), showFileList: true },
    })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [txt('a.txt')] },
    })
    await flushPromises()

    expect(wrapper.get('[data-gr-file-upload-list]').text()).toContain('a.txt')
  })

  it('переданный набор показывается сразу, без выбора файлов', () => {
    const wrapper = mount(GrFileUpload, {
      props: { request: vi.fn(), showFileList: true, modelValue: [txt('report.pdf')] },
    })

    expect(wrapper.get('[data-gr-file-upload-list]').text()).toContain('report.pdf')
  })

  it('набор следует за пропом: снаружи его можно подменить и очистить', async () => {
    const wrapper = mount(GrFileUpload, {
      props: { request: vi.fn(), showFileList: true, modelValue: [txt('a.txt')] },
    })

    await wrapper.setProps({ modelValue: [txt('b.txt')] })
    expect(wrapper.get('[data-gr-file-upload-list]').text()).toContain('b.txt')

    await wrapper.setProps({ modelValue: [] })
    expect(wrapper.find('[data-gr-file-upload-list]').exists()).toBe(false)
  })

  it('update:modelValue эмитится на выбор и на удаление', async () => {
    const wrapper = mount(GrFileUpload, {
      props: { request: vi.fn().mockResolvedValue({}), showFileList: true },
    })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [txt('a.txt'), txt('b.txt')] },
    })
    await flushPromises()

    const selected = wrapper.emitted('update:modelValue')
    expect(selected).toHaveLength(1)
    expect(selected![0][0]).toHaveLength(1)

    await wrapper.get('[data-gr-file-upload-remove]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
    expect(wrapper.emitted('update:modelValue')![1][0]).toEqual([])
  })

  it('update:modelValue и change — разные моменты', async () => {
    let resolveUpload: (value: unknown) => void = () => {}
    const request = vi.fn(() => new Promise((resolve) => {
      resolveUpload = resolve
    }))

    const wrapper = mount(GrFileUpload, {
      props: { request, showFileList: true },
    })

    await wrapper.get('[data-gr-file-upload]').trigger('drop', {
      dataTransfer: { files: [txt('a.txt')] },
    })
    await flushPromises()

    // Набор уже сменился, а загрузка ещё идёт: `change` значит «загрузка
    // завершилась», и слить его с моделью нельзя.
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('change')).toBeFalsy()

    resolveUpload({ ok: true })
    await flushPromises()
    expect(wrapper.emitted('change')).toHaveLength(1)
  })
})
