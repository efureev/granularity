import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import { composingKeydown, keydown } from '../testing/keyboard'
import { controls } from './formControls'

/**
 * Негативный контракт форм-контрола: чего контрол делать **не должен**.
 *
 * Вся остальная сюита проверяет, что компонент что-то делает. Ровно поэтому
 * находки аудита 2026-08-08 — обходы `readonly` и коммит по Enter во время
 * IME-композиции — прошли мимо 3000 тестов: сломанное поведение выглядело как
 * отсутствие теста, а не как красный тест.
 *
 * Оба класса проверяются **в обе стороны**. «Эмита нет» само по себе ничего не
 * стоит: контрол, который вообще не слушает клавиатуру, проходит такую проверку
 * идеально. Поэтому сначала фиксируется, что клавиша значение меняет, и только
 * потом — что `readonly` и композиция её глушат.
 */

/** Клавиши, за которыми у контролов пакета закреплено изменение значения. */
const VALUE_KEYS = [
  'Enter',
  ' ',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Backspace',
  'Delete',
  'a',
]

const MODEL_EMITS = ['update:modelValue', 'change']

/** Контролы со значением, которое можно заполнить: иначе «не изменилось» неотличимо от «нечего менять». */
const fillable = controls.filter(({ meta }) => meta.filled && !meta.noReadonly)

type Wrapper = ReturnType<typeof mount>

function widgetOf(wrapper: Wrapper, selector: string): Element {
  const root = wrapper.element as Element
  return root.matches?.(selector) ? root : (root.querySelector(selector) ?? root)
}

function modelEmits(wrapper: Wrapper): number {
  return MODEL_EMITS.reduce((total, name) => total + (wrapper.emitted(name)?.length ?? 0), 0)
}

/** Прогоняет весь набор клавиш и клик по виджету, возвращает число модельных эмитов. */
async function pokeEveryKey(component: unknown, props: Record<string, unknown>, selector: string): Promise<number> {
  const wrapper = mount(component as never, { props: props as never, attachTo: document.body })
  await nextTick()

  const target = widgetOf(wrapper, selector)
  for (const key of VALUE_KEYS) {
    keydown(target, key)
    await nextTick()
  }
  ;(target as HTMLElement).click?.()
  await nextTick()

  const count = modelEmits(wrapper)
  wrapper.unmount()
  return count
}

describe('readonly: ни одна клавиша не меняет значение', () => {
  /**
   * Контролы, которые меняют значение прямо с клавиши. Список не задан руками,
   * а измеряется и сверяется со снимком: потеряй компонент клавиатурное
   * управление — негативная проверка ниже стала бы вакуумной, и заметить это
   * было бы нечем.
   *
   * Кого здесь нет и почему: у текстовых (`GrInput`, `GrTextarea`,
   * `GrAutocomplete`) значение меняет ввод, а не клавиша, и в jsdom `keydown`
   * текст не набирает; у панельных (`GrSelect`, `GrTreeSelect`,
   * `GrColorPicker`) Enter открывает панель, а выбирает уже она; у
   * `GrCheckboxGroup` роль контейнера, а нажатия принимают сами чекбоксы.
   * Негативная проверка всё равно прогоняется по всем — она дешёвая.
   */
  const KEY_DRIVEN = [
    'GrCheckbox',
    'GrInputTag',
    'GrNumberInput',
    'GrRadioGroup',
    'GrRating',
    'GrSegmented',
    'GrSlider',
    'GrSwitch',
    'GrTransfer',
  ]

  it('состав клавиатурно-управляемых контролов не изменился', async () => {
    const measured: string[] = []

    for (const { component, meta } of fillable) {
      const emits = await pokeEveryKey(
        component,
        { ...meta.filled, ariaLabel: meta.name },
        meta.keyboardTarget ?? meta.widget,
      )
      if (emits > 0)
        measured.push(meta.name)
    }

    expect(
      measured.sort(),
      'состав изменился: либо компонент потерял клавиатуру, либо приобрёл — обновите список осознанно',
    ).toEqual(KEY_DRIVEN)
  })

  for (const { component, meta } of fillable) {
    it(`${meta.name}: с readonly значение не меняется ни одной клавишей`, async () => {
      const emits = await pokeEveryKey(
        component,
        { ...meta.filled, readonly: true, ariaLabel: meta.name },
        meta.keyboardTarget ?? meta.widget,
      )

      expect(emits, 'readonly-контрол изменил значение с клавиатуры').toBe(0)
    })
  }
})

/**
 * IME-композиция.
 *
 * Пока идёт набор через IME, `Enter` подтверждает выбор иероглифа, а не
 * действие виджета. Контрол, который на нём коммитит, у такого пользователя
 * неработоспособен: он не может ввести ни одного слова, не выбрав случайную
 * опцию. Предикат в пакете один — `isComposingEvent`, и здесь проверяются все
 * его потребители со значением.
 */
describe('IME-композиция: Enter не коммитит', () => {
  type ImeCase = {
    name: string
    component: unknown
    props: Record<string, unknown>
    /** Подготовка: открыть панель, набрать текст, встать на опцию. */
    prepare: (wrapper: Wrapper) => Promise<Element>
  }

  /**
   * Здесь только контролы, у которых Enter коммитит из голого монтирования.
   * `GrSelect` и `GrCommandPalette` коммитят из открытой панели с активной
   * опцией — это сценарий их собственных сюит (`GrSelect.panel.test.ts`,
   * `GrCommandPalette.test.ts`), и воспроизводить его здесь значило бы держать
   * вторую копию их разметки.
   */
  const IME_CONTROLS = ['GrAutocomplete', 'GrInputTag']

  const cases: ImeCase[] = fillable
    .filter(({ meta }) => IME_CONTROLS.includes(meta.name))
    .map(({ component, meta }) => ({
      name: meta.name,
      component,
      props: {
        ...meta.props,
        ariaLabel: meta.name,
        ...(meta.name === 'GrInputTag' ? {} : { options: (meta.filled as { options?: unknown }).options }),
      },
      prepare: async (wrapper: Wrapper) => {
        const input = wrapper.find('input')
        await input.trigger('focus')
        await input.setValue(meta.name === 'GrInputTag' ? 'тег' : 'A')
        await nextTick()
        return input.element
      },
    }))

  it('набор случаев не опустел', () => {
    // Фильтр по именам легко разъезжается с реестром — пустой список означал бы
    // зелёный describe без единой проверки.
    expect(cases.map(c => c.name).sort()).toEqual([...IME_CONTROLS].sort())
  })

  for (const testCase of cases) {
    it(`${testCase.name}: обычный Enter коммитит, Enter в композиции — нет`, async () => {
      const plain = mount(testCase.component as never, { props: testCase.props as never, attachTo: document.body })
      const plainTarget = await testCase.prepare(plain)
      keydown(plainTarget, 'Enter')
      await nextTick()
      const committed = modelEmits(plain)
      plain.unmount()

      expect(committed, 'без композиции Enter обязан коммитить — иначе проверка ниже вакуумна').toBeGreaterThan(0)

      const composing = mount(testCase.component as never, { props: testCase.props as never, attachTo: document.body })
      const composingTarget = await testCase.prepare(composing)
      composingKeydown(composingTarget, 'Enter')
      await nextTick()
      const leaked = modelEmits(composing)
      composing.unmount()

      expect(leaked, 'Enter во время IME-композиции не должен коммитить').toBe(0)
    })
  }
})
