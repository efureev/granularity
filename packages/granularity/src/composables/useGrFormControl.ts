import type { ComputedRef } from 'vue'
import { computed } from 'vue'

import { useGrFormFieldContext } from '../components/GrFormField/context'

/**
 * Общий контракт форм-контрола.
 *
 * До него каждый контрол решал одно и то же по-своему: `invalid` был то своим
 * пропом, то только контекстом, то не был реализован вовсе; `readonly` жил у
 * трёх контролов из пятнадцати, `required` — у двух. Из-за этого «форма только
 * на чтение» приходилось делать через `disabled`, а это меняет и семантику
 * (значение не уходит в форму), и контраст.
 *
 * Композабл сводит два источника — собственные пропы контрола и контекст
 * `GrFormField` — в одно состояние. Правило одно: **проп контрола сильнее**,
 * контекст работает как fallback. Исключение — `invalid`, `required` и
 * `disabled`: там источники складываются по «или», потому что поле может
 * объявить ошибку, о которой контрол не знает (правило формы), а форма —
 * выключить себя целиком на время отправки.
 */

export interface GrFormControlProps {
  /** Контрол недоступен: не фокусируется, значение не отправляется. */
  disabled?: boolean
  /** Значение видно и отправляется, но не редактируется. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле. */
  required?: boolean
  /** Доступное имя вне `GrFormField`. */
  ariaLabel?: string
}

export interface GrFormControlState {
  /** Итоговый `disabled`. */
  disabled: ComputedRef<boolean>
  /** Итоговый `readonly`. */
  readonly: ComputedRef<boolean>
  /** Итоговый `invalid`: свой проп ИЛИ ошибка поля. */
  invalid: ComputedRef<boolean>
  /** Итоговый `required`: свой проп ИЛИ обязательность поля. */
  required: ComputedRef<boolean>
  /** Id контрола из поля (для `<label for>`). */
  id: ComputedRef<string | undefined>
  /** Id подписи поля — для виджетов с ARIA-ролью, к которым `<label for>` неприменим. */
  labelId: ComputedRef<string | undefined>
  /** `aria-describedby`: подсказка и/или текст ошибки поля. */
  describedBy: ComputedRef<string | undefined>
  /** `true`, когда контрол не принимает ввод (`disabled` или `readonly`). */
  locked: ComputedRef<boolean>
}

/**
 * @param source геттер собственных пропов контрола. Геттер, а не объект, —
 * чтобы не терять реактивность на `props`.
 */
export function useGrFormControl(source: () => GrFormControlProps = () => ({})): GrFormControlState {
  const field = useGrFormFieldContext()

  // Везде «или», а не `??`: у контролов эти пропы объявлены с дефолтом `false`,
  // и `??` до контекста просто не доходил бы — поле не смогло бы включить
  // `readonly` контролу, у которого свой проп не выставлен.
  const disabled = computed(() => Boolean(source().disabled) || Boolean(field?.disabled.value))
  const readonly = computed(() => Boolean(source().readonly) || Boolean(field?.readonly.value))
  const invalid = computed(() => Boolean(source().invalid) || Boolean(field?.invalid.value))
  const required = computed(() => Boolean(source().required) || Boolean(field?.required.value))

  return {
    disabled,
    readonly,
    invalid,
    required,
    id: computed(() => field?.id.value),
    labelId: computed(() => field?.labelId.value),
    describedBy: computed(() => field?.describedById.value),
    locked: computed(() => disabled.value || readonly.value),
  }
}
