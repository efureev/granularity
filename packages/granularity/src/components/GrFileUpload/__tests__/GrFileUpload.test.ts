import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~icons/lucide/arrow-up', () => {
  return {
    default: defineComponent({
      name: 'IconArrowUp',
      template: '<svg data-icon="arrow-up" />',
    }),
  }
})

import GrFileUpload from '../GrFileUpload.vue'
import { maxSizeMbValidator } from '../maxSizeMbValidator'

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

    await wrapper.get('[data-ds-file-upload]').trigger('drop', {
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

  it('maxSizeMb блокирует слишком большой файл и эмитит error', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })

    const wrapper = mount(GrFileUpload, {
      props: {
        request,
        validators: [maxSizeMbValidator(1)],
      },
    })

    const bigFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'big.bin', { type: 'application/octet-stream' })

    await wrapper.get('[data-ds-file-upload]').trigger('drop', {
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

    await wrapper.get('[data-ds-file-upload]').trigger('click')
    expect(clickSpy).not.toHaveBeenCalled()

    const file = new File(['x'], 'x.txt', { type: 'text/plain' })
    await wrapper.get('[data-ds-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [file],
      },
    })

    await flushPromises()

    expect(request).not.toHaveBeenCalled()
    expect(wrapper.emitted('success')).toBeFalsy()
    expect(wrapper.emitted('error')).toBeFalsy()
  })

  it('элементный default-slot переводит компонент в custom UI режим', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click')

    const wrapper = mount(GrFileUpload, {
      props: { request },
      slots: {
        default: ({ openDialog }: any) => h('button', { type: 'button', 'data-testid': 'btn', onClick: openDialog }, 'Upload'),
      },
    })

    expect(wrapper.get('[data-ds-file-upload]').attributes('role')).toBeUndefined()
    expect(wrapper.find('[data-icon="arrow-up"]').exists()).toBe(false)

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    await wrapper.get('[data-ds-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [file],
      },
    })
    await flushPromises()
    expect(request).not.toHaveBeenCalled()

    await wrapper.get('[data-testid="btn"]').trigger('click')
    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('multiple+limit вызывает onExceed и не стартует загрузку', async () => {
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

    await wrapper.get('[data-ds-file-upload]').trigger('drop', {
      dataTransfer: {
        files: [a, b],
      },
    })

    await flushPromises()

    expect(onExceed).toHaveBeenCalledTimes(1)
    expect(onExceed.mock.calls[0][0]).toHaveLength(2)
    expect(onExceed.mock.calls[0][1]).toBe(1)
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
    await wrapper.get('[data-ds-file-upload]').trigger('drop', {
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
    await wrapper.get('[data-ds-file-upload]').trigger('drop', {
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

      await actionWrapper.get('[data-ds-file-upload]').trigger('drop', {
        dataTransfer: {
          files: [file],
        },
      })

      await flushPromises()

      expect(lastInstance.body).toBeInstanceOf(FormData)
      const body = lastInstance.body as FormData
      expect(body.get('file')).toBeInstanceOf(File)
      expect(body.get('folder')).toBe('inbox')
    } finally {
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
    await wrapper.get('[data-ds-file-upload]').trigger('drop', {
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
    expect(wrapper.emitted('state-change')).toBeTruthy()
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
    await wrapper.get('[data-ds-file-upload]').trigger('drop', {
      dataTransfer: { files: [file] },
    })

    await flushPromises()

    const node = wrapper.get('[data-testid="progress-slot"]')
    expect(node.attributes('data-phase')).toBe('success')
    expect(node.text()).toContain('100')
    expect(node.text()).toContain('success')
  })
})