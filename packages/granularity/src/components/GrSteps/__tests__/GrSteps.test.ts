import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import GrConfigProvider from '../../GrConfigProvider/GrConfigProvider.vue'
import GrSteps from '../GrSteps.vue'
import type { GrStep } from '../stepsModel'

/**
 * Разметка здесь — контракт доступности, а не оформление: пройденный шаг обязан
 * быть кнопкой, текущий — нести `aria-current="step"`, будущий — выпадать из
 * таб-порядка. Перепутанный вариант выглядит одинаково и молча ломает мастер
 * для клавиатуры.
 */
const steps: GrStep[] = [
  { value: 'cart', label: 'Корзина' },
  { value: 'delivery', label: 'Доставка', description: 'Адрес и срок' },
  { value: 'payment', label: 'Оплата' },
  { value: 'done', label: 'Готово' },
]

function mountSteps(props: Record<string, unknown> = {}) {
  return mount(GrSteps, {
    props: { modelValue: 'delivery', steps, ...props },
    attachTo: document.body,
  })
}

const items = (wrapper: ReturnType<typeof mountSteps>) => wrapper.findAll('[data-gr-step-trigger]')

describe('GrSteps', () => {
  it('это навигация со списком, а не tablist', () => {
    const wrapper = mountSteps()

    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.get('[data-gr-steps-list]').element.tagName).toBe('OL')
    // `role="tab"` без `tabpanel` — сломанный паттерн; ролей здесь нет вовсе.
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(0)
    expect(wrapper.findAll('[role="tablist"]')).toHaveLength(0)
  })

  it('три состояния шага дают три разные разметки', () => {
    const wrapper = mountSteps()
    const list = items(wrapper)

    // Пройденный — кнопка со своей остановкой Tab.
    expect(list[0].element.tagName).toBe('BUTTON')
    expect(list[0].attributes('aria-current')).toBeUndefined()

    // Текущий — не кнопка: уходить на самого себя некуда.
    expect(list[1].element.tagName).toBe('SPAN')
    expect(list[1].attributes('aria-current')).toBe('step')

    // Следующий доступен, а дальний — нет.
    expect(list[2].element.tagName).toBe('BUTTON')
    expect(list[3].element.tagName).toBe('SPAN')
  })

  /**
   * `aria-current="step"` — новое для пакета значение: до сих пор в ядре
   * встречался только `page`. Здесь оно ровно то, что предписывает
   * спецификация, и тест держит его от «исправления» на привычное.
   */
  it('текущий шаг помечен именно step, а не page', () => {
    const wrapper = mountSteps()

    expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(0)
    expect(wrapper.findAll('[aria-current="step"]')).toHaveLength(1)
  })

  it('недоступный шаг вне таб-порядка и не активируется', async () => {
    const wrapper = mountSteps()
    const far = items(wrapper)[3]

    expect(far.attributes('tabindex')).toBeUndefined()
    await far.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('выключенный шаг объявлен и недостижим даже без linear', async () => {
    const withDisabled: GrStep[] = [steps[0], steps[1], { ...steps[2], disabled: true }, steps[3]]
    const wrapper = mountSteps({ steps: withDisabled, linear: false })
    const target = items(wrapper)[2]

    expect(target.element.tagName).toBe('SPAN')
    expect(target.attributes('aria-disabled')).toBe('true')

    await target.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('клик по доступному шагу меняет модель', async () => {
    const wrapper = mountSteps()

    await items(wrapper)[0].trigger('click')
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['cart'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['cart'])
  })

  it('clickable=false оставляет только индикатор', async () => {
    const wrapper = mountSteps({ clickable: false })

    expect(wrapper.findAll('button')).toHaveLength(0)

    await items(wrapper)[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  /**
   * Гейт — то, ради чего компонент вообще заводится: «валидация по шагам» из
   * роадмапа закрывается им, а не знанием про `GrForm`.
   */
  it('beforeLeave пропускает переход и блокирует его', async () => {
    const allow = vi.fn(() => true)
    const passing = mountSteps({ beforeLeave: allow })

    await items(passing)[0].trigger('click')
    await nextTick()

    expect(allow).toHaveBeenCalledWith('delivery', 'cart')
    expect(passing.emitted('update:modelValue')?.[0]).toEqual(['cart'])

    const block = vi.fn(() => false)
    const blocked = mountSteps({ beforeLeave: block })

    await items(blocked)[0].trigger('click')
    await nextTick()

    expect(block).toHaveBeenCalledTimes(1)
    expect(blocked.emitted('update:modelValue')).toBeUndefined()
  })

  it('асинхронный beforeLeave дожидается ответа', async () => {
    const gate = vi.fn(async () => false)
    const wrapper = mountSteps({ beforeLeave: gate })

    await items(wrapper)[0].trigger('click')
    await nextTick()
    await nextTick()

    expect(gate).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('next и back ходят по шагам и упираются в края', async () => {
    const wrapper = mountSteps({ modelValue: 'cart' })
    const vm = wrapper.vm as unknown as {
      next: () => Promise<boolean>
      back: () => Promise<boolean>
    }

    expect(await vm.back()).toBe(false)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    expect(await vm.next()).toBe(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['delivery'])
  })

  it('next тоже идёт через гейт', async () => {
    const gate = vi.fn(() => false)
    const wrapper = mountSteps({ beforeLeave: gate })
    const vm = wrapper.vm as unknown as { next: () => Promise<boolean> }

    expect(await vm.next()).toBe(false)
    expect(gate).toHaveBeenCalledWith('delivery', 'payment')
  })

  it('состояние шага объявлено словом, а не только цветом маркера', () => {
    const broken: GrStep[] = [{ ...steps[0], status: 'error' }, ...steps.slice(1)]
    const wrapper = mountSteps({ steps: broken })

    expect(items(wrapper)[0].text()).toContain('has errors')
    // Маркер декоративен: смысл несёт текст рядом.
    expect(wrapper.get('[data-gr-step-marker]').attributes('aria-hidden')).toBe('true')
  })

  it('«шаг N из M» живёт своим регионом в разметке', () => {
    const wrapper = mountSteps()
    const status = wrapper.get('[data-gr-steps-status]')

    expect(status.attributes('role')).toBe('status')
    expect(status.text()).toBe('Step 2 of 4')
  })

  it('компактный вариант показывает подпись, счётчик и полосу', () => {
    const wrapper = mountSteps({ variant: 'compact' })

    expect(wrapper.find('[data-gr-steps-list]').exists()).toBe(false)
    expect(wrapper.get('[data-gr-steps-compact]').text()).toContain('Доставка')
    expect(wrapper.get('[data-gr-steps-compact]').text()).toContain('2 / 4')
    // Полоса декоративна: прогресс уже сказан текстом и живым регионом, а
    // второй `progressbar` в дереве заставил бы диктора прочитать его дважды.
    // `aria-hidden` садится на корень полосы и прячет её поддерево целиком.
    const bar = wrapper.get('[data-gr-progress-bar]')
    expect(bar.attributes('aria-hidden')).toBe('true')
    expect(bar.find('[role="progressbar"]').exists()).toBe(true)
  })

  it('обе ориентации меняют раскладку и соединитель', () => {
    const horizontal = mountSteps()
    const vertical = mountSteps({ orientation: 'vertical' })

    expect(horizontal.attributes('data-orientation')).toBe('horizontal')
    expect(vertical.attributes('data-orientation')).toBe('vertical')
    expect(horizontal.get('[data-gr-steps-list]').attributes('class')).not.toBe(
      vertical.get('[data-gr-steps-list]').attributes('class'),
    )
    // Линия обязана лечь вдоль ленты: по горизонтали это высота, по вертикали
    // ширина. Перепутанная ось даёт полосу поперёк шагов.
    const horizontalConnector = horizontal.get('[data-gr-step-connector]').attributes('class') ?? ''
    const verticalConnector = vertical.get('[data-gr-step-connector]').attributes('class') ?? ''

    expect(horizontalConnector).toContain('h-[var(--gr-steps-connector-size,2px)]')
    expect(verticalConnector).toContain('w-[var(--gr-steps-connector-size,2px)]')
  })

  it('соединитель есть между шагами и отсутствует после последнего', () => {
    const wrapper = mountSteps()

    expect(wrapper.findAll('[data-gr-step-connector]')).toHaveLength(steps.length - 1)
  })

  it('описание шага рендерится своим узлом', () => {
    const wrapper = mountSteps()

    expect(wrapper.get('[data-gr-step-description]').text()).toBe('Адрес и срок')
  })

  it('оформление читается из GrConfigProvider, а проп сильнее', () => {
    const Harness = defineComponent({
      name: 'HarnessStepsConfig',
      components: { GrSteps, GrConfigProvider },
      props: { stepsProps: { type: Object, default: () => ({}) } },
      template: `
        <GrConfigProvider :component-defaults="{ GrSteps: { orientation: 'vertical' } }">
          <GrSteps model-value="delivery" :steps="steps" v-bind="stepsProps" />
        </GrConfigProvider>
      `,
      data: () => ({ steps }),
    })

    const fromConfig = mount(Harness)
    expect(fromConfig.get('[data-gr-steps]').attributes('data-orientation')).toBe('vertical')

    const fromProp = mount(Harness, { props: { stepsProps: { orientation: 'horizontal' } } })
    expect(fromProp.get('[data-gr-steps]').attributes('data-orientation')).toBe('horizontal')
  })
})
