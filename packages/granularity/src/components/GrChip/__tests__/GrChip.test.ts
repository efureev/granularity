import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrChip from '../GrChip.vue'

/**
 * Главное, что проверяет этот файл, — **разметка меняется вместе с природой
 * чипа**. Не виджет: корень `<span>`, крестик кнопка. Виджет: корень `<button>`,
 * крестик `aria-hidden`-`<span>`, снятие с клавиатуры. Перепутанный вариант не
 * даёт ни ошибки сборки, ни падения — он даёт `nested-interactive` в axe и
 * недостижимый с клавиатуры крестик.
 */
describe('GrChip', () => {
  it('без интерактива это метка: ни роли, ни таб-остановки', () => {
    const wrapper = mount(GrChip, { props: { label: 'Черновик' } })

    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.attributes('role')).toBeUndefined()
    expect(wrapper.attributes('tabindex')).toBeUndefined()
    expect(wrapper.attributes('aria-pressed')).toBeUndefined()
    expect(wrapper.get('[data-gr-chip-label]').text()).toBe('Черновик')
  })

  it('у метки крестик — настоящая кнопка со своим именем', () => {
    const wrapper = mount(GrChip, { props: { label: 'Срочно', closable: true } })
    const close = wrapper.get('[data-gr-chip-close]')

    expect(close.element.tagName).toBe('BUTTON')
    // Имя называет сам тег: «Убрать» на двадцати кнопках подряд не даёт выбрать нужную.
    expect(close.attributes('aria-label')).toBe('Remove Срочно')
    expect(close.attributes('aria-hidden')).toBeUndefined()
  })

  it('selectable делает чип кнопкой-переключателем', async () => {
    const wrapper = mount(GrChip, { props: { label: 'Открытые', selectable: true } })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.attributes('aria-pressed')).toBe('false')
    expect(wrapper.attributes('tabindex')).toBe('0')

    await wrapper.trigger('click')
    expect(wrapper.emitted('update:selected')?.[0]).toEqual([true])
  })

  it('v-model:selected работает в обе стороны', async () => {
    const wrapper = mount(GrChip, { props: { label: 'A', selectable: true, selected: true } })

    expect(wrapper.attributes('aria-pressed')).toBe('true')

    await wrapper.trigger('click')
    expect(wrapper.emitted('update:selected')?.[0]).toEqual([false])

    await wrapper.setProps({ selected: false })
    expect(wrapper.attributes('aria-pressed')).toBe('false')
  })

  /**
   * Внутрь виджета вложенная кнопка запрещена: роль объявляет потомков
   * презентационными (axe: `nested-interactive`), а `<button>` внутри
   * `<button>` невалиден и по контент-модели HTML.
   */
  it('у виджета крестик перестаёт быть кнопкой и уходит из таб-порядка', () => {
    const wrapper = mount(GrChip, {
      props: { label: 'Срочно', selectable: true, closable: true },
    })
    const close = wrapper.get('[data-gr-chip-close]')

    expect(close.element.tagName).toBe('SPAN')
    expect(close.attributes('aria-hidden')).toBe('true')
    expect(close.attributes('tabindex')).toBeUndefined()
    expect(wrapper.findAll('button')).toHaveLength(1)

    // Раз кнопки нет — способ снять с клавиатуры обязан быть объявлен.
    expect(wrapper.attributes('aria-keyshortcuts')).toBe('Delete')
    expect(close.attributes('title')).toBe('Remove Срочно')
  })

  it('клик по крестику снимает чип и не переключает выбор', async () => {
    const wrapper = mount(GrChip, {
      props: { label: 'A', selectable: true, closable: true },
    })

    await wrapper.get('[data-gr-chip-close]').trigger('click')

    expect(wrapper.emitted('remove')).toHaveLength(1)
    // Обратная сторона: выбор не должен меняться заодно со снятием.
    expect(wrapper.emitted('update:selected')).toBeUndefined()
  })

  it.each(['Delete', 'Backspace'])('%s снимает закрываемый чип-виджет', async (key) => {
    const wrapper = mount(GrChip, {
      props: { label: 'A', selectable: true, closable: true },
    })

    await wrapper.trigger('keydown', { key })
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('незакрываемый чип на Delete молчит', async () => {
    const wrapper = mount(GrChip, { props: { label: 'A', selectable: true } })

    await wrapper.trigger('keydown', { key: 'Delete' })

    expect(wrapper.emitted('remove')).toBeUndefined()
    expect(wrapper.attributes('aria-keyshortcuts')).toBeUndefined()
  })

  it('выключенный чип не переключается, не снимается и объявлен выключенным', async () => {
    const wrapper = mount(GrChip, {
      props: { label: 'A', selectable: true, closable: true, disabled: true },
    })

    expect(wrapper.attributes('aria-disabled')).toBe('true')
    expect(wrapper.attributes('disabled')).toBeDefined()
    // Крестика у выключенного чипа нет вовсе: снять его всё равно нельзя.
    expect(wrapper.find('[data-gr-chip-close]').exists()).toBe(false)

    await wrapper.trigger('click')
    await wrapper.trigger('keydown', { key: 'Delete' })

    expect(wrapper.emitted('update:selected')).toBeUndefined()
    expect(wrapper.emitted('remove')).toBeUndefined()
  })

  it('тон приходит из GrConfigProvider, а локальный проп сильнее конфига', () => {
    const Harness = defineComponent({
      name: 'HarnessChipConfig',
      components: { GrChip, GrConfigProvider },
      props: { chipProps: { type: Object, default: () => ({}) } },
      template: `
        <GrConfigProvider :component-defaults="{ GrChip: { tone: 'success' } }">
          <GrChip label="A" v-bind="chipProps" />
        </GrConfigProvider>
      `,
    })

    const fromConfig = mount(Harness)
    expect(fromConfig.get('[data-gr-chip]').attributes('class')).toContain('var(--gr-success-light)')

    const fromProp = mount(Harness, { props: { chipProps: { tone: 'danger' } } })
    expect(fromProp.get('[data-gr-chip]').attributes('class')).toContain('var(--gr-danger-light)')

    // Без провайдера остаётся собственный дефолт компонента.
    const bare = mount(GrChip, { props: { label: 'A' } })
    expect(bare.attributes('class')).toContain('var(--gr-muted)')
  })

  /**
   * Выбор виден перепадом светлоты, а не одним лишь контуром.
   *
   * Кольцо и жирность различали чипы слишком слабо: в ряду фильтров выбранный
   * не читался с одного взгляда. Теперь выбранный берёт плотный вариант того же
   * тона — оттенок не меняется, меняется вес заливки.
   */
  it('выбранный чип берёт плотную заливку своего тона', async () => {
    const wrapper = mount(GrChip, {
      props: { label: 'A', tone: 'primary', selectable: true, selected: false },
    })

    expect(wrapper.attributes('class')).toContain('var(--gr-accent)')
    expect(wrapper.attributes('class')).not.toContain('--gr-badge-primary-bg')

    await wrapper.setProps({ selected: true })

    expect(wrapper.attributes('class')).toContain('--gr-badge-primary-bg')
    // Второй, нецветовой канал: одной заливки для WCAG 1.4.1 мало.
    expect(wrapper.attributes('class')).toContain('font-600')
  })

  it('иконка рендерится в своём узле перед подписью', () => {
    const wrapper = mount(GrChip, {
      props: { label: 'A' },
      slots: { icon: '<i data-icon />' },
    })

    const icon = wrapper.get('[data-gr-chip-icon]')
    expect(icon.find('[data-icon]').exists()).toBe(true)
    expect(icon.element.compareDocumentPosition(wrapper.get('[data-gr-chip-label]').element))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })
})
