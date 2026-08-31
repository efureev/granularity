import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { axeViolations } from '@feugene/granularity-test-kit/a11y'

import GrCodeBlock from '../components/GrCodeBlock/GrCodeBlock.vue'
import GrCodeEditor from '../components/GrCodeEditor/GrCodeEditor.vue'
import GrDiff from '../components/GrDiff/GrDiff.vue'

/**
 * Гейт axe на компонентах пакета.
 *
 * Витринный a11y-гейт снимает **страницу**, и до внутренностей редактора он не
 * дотягивается: CodeMirror поднимается только после монтирования, а в снимке
 * витрины кадр берётся с закрытого состояния. Интересное же живёт именно тут:
 * связка редактируемой области с подписью поля, роль области сравнения, имя
 * скроллера блока.
 *
 * `color-contrast` `axeViolations` гасит по умолчанию: в jsdom нет отрисовки, и
 * правилу нечего мерить. Цвета держит `grCodeBlockContrast.test.ts` — он считает
 * контраст по формуле WCAG на разобранной теме.
 */
describe('a11y', () => {
  it('GrCodeBlock: скроллер именован и достижим', async () => {
    const wrapper = mount(GrCodeBlock, {
      props: { code: { a: 1 }, ariaLabel: 'Ответ сервиса', maxHeight: '10rem' },
      attachTo: document.body,
    })

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
  })

  it('GrDiff: область сравнения именована', async () => {
    const wrapper = mount(GrDiff, {
      props: { before: 'a\nb', after: 'a\nc', ariaLabel: 'Сравнение ревизий' },
      attachTo: document.body,
    })

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
  })

  it('GrCodeEditor: редактируемая область именована', async () => {
    await import('../components/GrCodeEditor/codemirror')

    const wrapper = mount(GrCodeEditor, {
      props: { modelValue: 'const a = 1', ariaLabel: 'Конфигурация' },
      attachTo: document.body,
    })
    await flushPromises()

    expect(await axeViolations(wrapper.element as Element)).toEqual([])
  })

  it('GrCodeEditor: замечания связаны с полем, а не только окрашены', async () => {
    await import('../components/GrCodeEditor/codemirror')

    const wrapper = mount(GrCodeEditor, {
      props: {
        modelValue: 'сломано',
        ariaLabel: 'Конфигурация',
        validate: () => [{ from: 0, to: 3, severity: 'error' as const, message: 'ошибка разбора' }],
      },
      attachTo: document.body,
    })
    await flushPromises()

    const described = wrapper.get('[aria-describedby]').attributes('aria-describedby')

    expect(described).toBeTruthy()
    expect(wrapper.get(`#${described!.split(' ').at(-1)}`).text()).toContain('ошибка разбора')
    expect(await axeViolations(wrapper.element as Element)).toEqual([])
  })
})
