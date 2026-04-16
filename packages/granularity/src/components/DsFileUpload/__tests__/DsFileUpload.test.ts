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

import DsFileUpload from '../DsFileUpload.vue'
import { maxSizeMbValidator } from '../maxSizeMbValidator'

function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

describe('DsFileUpload', () => {
  it('при drop файлов вызывает request и эмитит success/change', async () => {
    const request = vi.fn().mockResolvedValue({ ok: true })

    const wrapper = mount(DsFileUpload, {
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

    const wrapper = mount(DsFileUpload, {
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

    const wrapper = mount(DsFileUpload, {
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

    const wrapper = mount(DsFileUpload, {
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

    const wrapper = mount(DsFileUpload, {
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

    const wrapper = mount(DsFileUpload, {
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

    const wrapper = mount(DsFileUpload, {
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

    const originalFetch = globalThis.fetch
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    })
    ;(globalThis as any).fetch = fetchMock

    try {
      const actionWrapper = mount(DsFileUpload, {
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

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [, init] = fetchMock.mock.calls[0]
      expect(init?.body).toBeInstanceOf(FormData)
      const body = init?.body as FormData
      expect(body.get('file')).toBeInstanceOf(File)
      expect(body.get('folder')).toBe('inbox')
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})