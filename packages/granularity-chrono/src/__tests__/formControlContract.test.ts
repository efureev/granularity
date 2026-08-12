import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { describe, expect, it } from 'vitest'

import GrFormField from '@feugene/granularity/components/GrFormField'

import GrDatePicker from '../components/GrDatePicker/GrDatePicker.vue'
import GrDateRangePicker from '../components/GrDateRangePicker/GrDateRangePicker.vue'
import GrDateTimePicker from '../components/GrDateTimePicker/GrDateTimePicker.vue'
import GrTimePicker from '../components/GrTimePicker/GrTimePicker.vue'

/**
 * Гейт контракта форм-контрола — копия того, что живёт в ядре
 * (`packages/granularity/src/__tests__/formControlContract.test.ts`).
 *
 * Копия, а не параметризация оригинала списком внешних компонентов: связывать
 * ядро с companion ради вторичного функционала дороже, чем держать два файла.
 * Цена известна и принята — копия может отстать от оригинала.
 *
 * Контракт проверяется по объявленной поверхности компонента и по
 * отрендеренному DOM, а не по факту вызова композабла: необъявленный проп
 * «протекает» на корень через fallthrough и в разметке выглядит реализованным.
 */

interface Control {
  name: string
  component: unknown
  props: Record<string, unknown>
  /** Селектор элемента-виджета, на котором ожидаются ARIA-атрибуты. */
  widget: string
}

const controls: Control[] = [
  {
    name: 'GrDatePicker',
    component: GrDatePicker,
    props: { modelValue: null },
    widget: '[data-gr-date-picker-field]',
  },
  {
    name: 'GrDateTimePicker',
    component: GrDateTimePicker,
    props: { modelValue: null },
    widget: '[data-gr-date-time-picker-field]',
  },
  {
    name: 'GrDateRangePicker',
    component: GrDateRangePicker,
    props: { modelValue: null },
    widget: '[data-gr-date-range-picker-field]',
  },
  {
    name: 'GrTimePicker',
    component: GrTimePicker,
    props: { modelValue: null },
    widget: '[data-gr-time-picker-field]',
  },
]

/** Атрибут может стоять и на корне компонента, и на вложенном виджете. */
function hasAttr(root: Element, selector: string): boolean {
  return root.matches?.(selector) || root.querySelector?.(selector) !== null
}

function declaredEmits(component: unknown): string[] {
  const emits = (component as { emits?: string[] | Record<string, unknown> }).emits ?? []
  return Array.isArray(emits) ? emits : Object.keys(emits)
}

function declaredProps(component: unknown): string[] {
  return Object.keys((component as { props?: Record<string, unknown> }).props ?? {})
}

const BASE_EMITS = ['update:modelValue', 'change', 'focus', 'blur'] as const

describe('состав эмитов форм-контрола', () => {
  it.each(controls.map(control => [control.name, control.component] as const))(
    '%s объявляет update:modelValue, change, focus и blur',
    (_name, component) => {
      const emits = declaredEmits(component)

      for (const emitName of BASE_EMITS) {
        expect(emits, `нет эмита ${emitName}`).toContain(emitName)
      }
    },
  )

  it.each(controls.map(control => [control.name, control.component] as const))(
    '%s объявляет clear, если у него есть clearable',
    (_name, component) => {
      if (!declaredProps(component).includes('clearable')) return

      expect(declaredEmits(component)).toContain('clear')
    },
  )
})

describe('контракт форм-контрола', () => {
  for (const control of controls) {
    describe(control.name, () => {
      it('объявляет пропы контракта, а не полагается на fallthrough', () => {
        const declared = declaredProps(control.component)

        for (const prop of ['disabled', 'readonly', 'invalid', 'required', 'ariaLabel']) {
          expect(declared, `нет пропа ${prop}`).toContain(prop)
        }
      })

      it('принимает invalid и объявляет его через aria-invalid', async () => {
        const wrapper = mount(control.component as never, {
          props: { ...control.props, invalid: true } as never,
        })
        await nextTick()

        expect(
          hasAttr(wrapper.element as Element, '[aria-invalid="true"]'),
          'aria-invalid="true" не выставлен',
        ).toBe(true)
        wrapper.unmount()
      })

      it('принимает required и объявляет его', async () => {
        const wrapper = mount(control.component as never, {
          props: { ...control.props, required: true } as never,
        })
        await nextTick()

        expect(
          hasAttr(wrapper.element as Element, '[aria-required="true"]'),
          'aria-required="true" не выставлен',
        ).toBe(true)
        wrapper.unmount()
      })

      it('readonly не выключает контрол, в отличие от disabled', async () => {
        const wrapper = mount(control.component as never, {
          props: { ...control.props, readonly: true } as never,
        })
        await nextTick()

        // Значение readonly-контрола по-прежнему уходит в форму и читается AT.
        expect(wrapper.html().includes('disabled=""'), 'readonly не должен выключать контрол').toBe(false)
        wrapper.unmount()
      })

      it('наследует readonly от GrFormField', async () => {
        const wrapper = mount(defineComponent({
          render: () => h(GrFormField, { label: 'Поле', readonly: true }, {
            default: () => h(control.component as never, control.props),
          }),
        }))
        await nextTick()

        expect(
          /aria-readonly="true"|readonly=""|readonly="readonly"/.test(wrapper.html()),
          'контрол не прочитал readonly из контекста поля',
        ).toBe(true)
        wrapper.unmount()
      })

      it('наследует disabled от GrFormField', async () => {
        // У пикера `readonly` на поле стоит всегда (ручного ввода нет), поэтому
        // проверка выше проходит и без чтения контекста. Выключение — нет:
        // атрибут появляется только из объединённого состояния.
        const wrapper = mount(defineComponent({
          render: () => h(GrFormField, { label: 'Поле', disabled: true }, {
            default: () => h(control.component as never, control.props),
          }),
        }))
        await nextTick()

        expect(
          wrapper.find(`${control.widget}[disabled]`).exists(),
          'контрол не прочитал disabled из контекста поля',
        ).toBe(true)
        wrapper.unmount()
      })

      it('экспонирует focus() и blur()', () => {
        const wrapper = mount(control.component as never, { props: control.props as never })
        const vm = wrapper.vm as unknown as Record<string, unknown>

        expect(typeof vm.focus, 'focus() не экспонирован').toBe('function')
        expect(typeof vm.blur, 'blur() не экспонирован').toBe('function')
        wrapper.unmount()
      })
    })
  }
})

/**
 * Ошибка валидации и декоративный тон — разные каналы. В пакете декоративного
 * тона у полей пока нет, поэтому проверяется одна половина: `invalid` красится
 * ролью `--gr-invalid-*`, а не `--gr-danger` напрямую.
 */
describe('invalid красится своей ролью', () => {
  for (const control of controls) {
    it(`${control.name}: invalid даёт --gr-invalid-brd`, async () => {
      const wrapper = mount(control.component as never, {
        props: { ...control.props, invalid: true } as never,
      })
      await nextTick()

      expect(wrapper.html()).toContain('--gr-invalid-brd')
      expect(wrapper.html(), 'вердикт валидации не должен красить тоном danger').not.toContain('--gr-danger')
      wrapper.unmount()
    })
  }
})
