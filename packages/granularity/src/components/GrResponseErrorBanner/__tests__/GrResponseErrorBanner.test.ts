import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GrFormErrorBanner from '../GrFormErrorBanner.vue'
import GrResponseErrorBanner from '../GrResponseErrorBanner.vue'
import GrUploadErrorBanner from '../GrUploadErrorBanner.vue'
import { DEFAULT_RESPONSE_ERROR_TEXTS } from '../responseError.defaults'
import type { ResponseErrorInfo, ResponseErrorKind } from '../responseError.types'

function info(partial: Partial<ResponseErrorInfo> = {}): ResponseErrorInfo {
  return {
    kind: partial.kind ?? 'server',
    message: partial.message ?? 'Boom',
    status: partial.status,
    details: partial.details,
    fieldErrors: partial.fieldErrors,
    isFallbackMessage: partial.isFallbackMessage,
    raw: partial.raw ?? null,
    meta: partial.meta,
  }
}

function textOf(wrapper: ReturnType<typeof mount>, testid: string): string {
  return wrapper.find(`[data-testid="${testid}"]`).text()
}

describe('GrResponseErrorBanner — сообщение', () => {
  it('серверное сообщение показывается как есть, даже если совпало с дефолтным текстом', () => {
    const wrapper = mount(GrResponseErrorBanner, {
      props: {
        error: info({ kind: 'network', message: DEFAULT_RESPONSE_ERROR_TEXTS.networkMessage }),
        texts: { networkMessage: 'Перевод фолбэка' },
      },
    })

    // Это ответ сервера, просто дословно совпавший с дефолтом. Прежняя проверка
    // по строке выбрасывала его молча.
    expect(textOf(wrapper, 'response-error-message')).toBe(DEFAULT_RESPONSE_ERROR_TEXTS.networkMessage)
  })

  it('подставленное классификатором сообщение заменяется переводом по флагу', () => {
    const wrapper = mount(GrResponseErrorBanner, {
      props: {
        error: info({
          kind: 'network',
          message: DEFAULT_RESPONSE_ERROR_TEXTS.networkMessage,
          isFallbackMessage: true,
        }),
        texts: { networkMessage: 'Перевод фолбэка' },
      },
    })

    expect(textOf(wrapper, 'response-error-message')).toBe('Перевод фолбэка')
  })

  it('пустое сообщение всегда заменяется текстом по kind', () => {
    const wrapper = mount(GrResponseErrorBanner, {
      props: {
        error: info({ kind: 'validation', message: '' }),
        texts: { validationMessage: 'Проверьте поля' },
      },
    })

    expect(textOf(wrapper, 'response-error-message')).toBe('Проверьте поля')
  })
})

describe('GrResponseErrorBanner — детали и статус', () => {
  it('fieldErrors важнее плоских details и рисуются с подписью поля', () => {
    const wrapper = mount(GrResponseErrorBanner, {
      props: {
        error: info({
          kind: 'validation',
          message: 'Проверьте данные',
          details: ['Плоская деталь'],
          fieldErrors: [{ field: 'email', messages: ['Email обязателен'] }],
        }),
        fieldLabels: { email: 'Почта' },
      },
    })

    const details = textOf(wrapper, 'response-error-details')
    expect(details).toContain('Почта')
    expect(details).toContain('Email обязателен')
    expect(details).not.toContain('Плоская деталь')
  })

  it('дедупликация убирает деталь, повторяющую основное сообщение', () => {
    const props = {
      error: info({ message: 'Повтор', details: ['Повтор', 'Уникальная'] }),
    }

    const deduped = mount(GrResponseErrorBanner, { props })
    expect(deduped.findAll('[data-testid="response-error-details"] li')).toHaveLength(1)

    const raw = mount(GrResponseErrorBanner, { props: { ...props, dedupeDetails: false } })
    expect(raw.findAll('[data-testid="response-error-details"] li')).toHaveLength(2)
  })

  it('showDetails=false скрывает блок целиком', () => {
    const wrapper = mount(GrResponseErrorBanner, {
      props: { error: info({ details: ['Деталь'] }), showDetails: false },
    })

    expect(wrapper.find('[data-testid="response-error-details"]').exists()).toBe(false)
  })

  it('бейдж статуса берёт подпись из текстов и подставляет код', () => {
    const wrapper = mount(GrResponseErrorBanner, {
      props: { error: info({ status: 503 }), texts: { statusLabel: 'Код {status}' } },
    })

    expect(textOf(wrapper, 'response-error-status')).toBe('Код 503')
  })

  it('без статуса и при showStatus=false бейджа нет', () => {
    expect(mount(GrResponseErrorBanner, { props: { error: info() } })
      .find('[data-testid="response-error-status"]').exists()).toBe(false)

    expect(mount(GrResponseErrorBanner, { props: { error: info({ status: 500 }), showStatus: false } })
      .find('[data-testid="response-error-status"]').exists()).toBe(false)
  })
})

describe('GrResponseErrorBanner — видимость, тон и события', () => {
  it('без ошибки и для скрытых kind ничего не рендерится', () => {
    expect(mount(GrResponseErrorBanner, { props: { error: null } })
      .find('[data-testid="response-error-banner"]').exists()).toBe(false)

    expect(mount(GrResponseErrorBanner, {
      props: { error: info({ kind: 'aborted' }), autoHideKinds: ['aborted'] },
    }).find('[data-testid="response-error-banner"]').exists()).toBe(false)
  })

  it('тон выводится из kind, а проп tone его перебивает', () => {
    const byKind = mount(GrResponseErrorBanner, { props: { error: info({ kind: 'validation' }) } })
    expect(byKind.findComponent({ name: 'GrAlert' }).props('tone')).toBe('warning')

    const overridden = mount(GrResponseErrorBanner, {
      props: { error: info({ kind: 'validation' }), tone: 'info' },
    })
    expect(overridden.findComponent({ name: 'GrAlert' }).props('tone')).toBe('info')

    const perKind = mount(GrResponseErrorBanner, {
      props: { error: info({ kind: 'server' }), toneByKind: { server: 'warning' } },
    })
    expect(perKind.findComponent({ name: 'GrAlert' }).props('tone')).toBe('warning')
  })

  it('retry отдаёт наружу текущую ошибку, dismiss — только факт закрытия', async () => {
    const error = info({ kind: 'server' })
    const wrapper = mount(GrResponseErrorBanner, { props: { error, canRetry: true } })

    await wrapper.find('[data-testid="response-error-retry"]').trigger('click')
    expect(wrapper.emitted('retry')?.[0]?.[0]).toMatchObject({ kind: 'server', message: 'Boom' })

    wrapper.findComponent({ name: 'GrAlert' }).vm.$emit('close')
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
  })

  it('кнопки повтора нет, пока её не разрешили', () => {
    expect(mount(GrResponseErrorBanner, { props: { error: info() } })
      .find('[data-testid="response-error-retry"]').exists()).toBe(false)
  })

  it('кнопка повтора берёт тон баннера, а не собственный primary', () => {
    const cases: Array<[ResponseErrorKind, string]> = [
      ['server', 'danger'],
      ['network', 'danger'],
      ['validation', 'warning'],
      ['aborted', 'info'],
    ]

    for (const [kind, expected] of cases) {
      const wrapper = mount(GrResponseErrorBanner, { props: { error: info({ kind }), canRetry: true } })
      const retry = wrapper.findAllComponents({ name: 'GrButton' })
        .find(button => button.attributes('data-testid') === 'response-error-retry')

      expect(retry?.props('tone'), `kind=${kind}`).toBe(expected)
    }

    // Свой тон баннера уезжает в кнопку так же, как и выведенный из `kind`.
    const custom = mount(GrResponseErrorBanner, {
      props: { error: info({ kind: 'server' }), canRetry: true, tone: 'slate' },
    })
    const retry = custom.findAllComponents({ name: 'GrButton' })
      .find(button => button.attributes('data-testid') === 'response-error-retry')

    expect(retry?.props('tone')).toBe('slate')
  })
})

describe('пресеты поверх базового баннера', () => {
  it('GrFormErrorBanner: без повтора, с подписями полей и warning на валидации', () => {
    const wrapper = mount(GrFormErrorBanner, {
      props: {
        error: info({
          kind: 'validation',
          message: 'Проверьте данные',
          fieldErrors: [{ field: 'email', messages: ['Email обязателен'] }],
        }),
        fieldLabels: { email: 'Почта' },
      },
    })

    expect(wrapper.find('[data-testid="form-error-retry"]').exists()).toBe(false)
    expect(textOf(wrapper, 'form-error-details')).toContain('Почта')
    expect(wrapper.findComponent({ name: 'GrAlert' }).props('tone')).toBe('warning')
  })

  it('GrUploadErrorBanner: повтор включён и отдаёт файлы вместе с ошибкой', async () => {
    const files = [new File(['x'], 'a.pdf')]
    const wrapper = mount(GrUploadErrorBanner, { props: { error: info({ kind: 'server' }), files } })

    await wrapper.find('[data-testid="upload-error-retry"]').trigger('click')

    // У пресета своя форма payload — `{ error, files }`: контекст загрузки
    // нужен обработчику повтора, а базовый баннер о файлах не знает.
    expect(wrapper.emitted('retry')?.[0]?.[0]).toMatchObject({
      error: { kind: 'server' },
      files: [{ name: 'a.pdf' }],
    })
  })
})
