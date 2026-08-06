import { inject, type ComputedRef, type InjectionKey } from 'vue'

/**
 * Контекст поля формы, который `GrFormField` предоставляет своим контролам
 * (`GrInput` / `GrSelect` / `GrTextarea`). Контролы читают его через
 * {@link useGrFormFieldContext} и используют как fallback для `id`,
 * `aria-describedby` и `aria-invalid` — без ручного прокидывания `forId`.
 */
export interface GrFormFieldContext {
  /** Сгенерированный (или переданный `forId`) id контрола. */
  id: ComputedRef<string | undefined>
  /**
   * Id элемента подписи. Нужен контролам, чей виджет — не labelable-элемент
   * (`span[role="checkbox"]`, `div[role="radiogroup"]`): к ним `<label for>`
   * не применяется, и имя приходит через `aria-labelledby`.
   */
  labelId: ComputedRef<string | undefined>
  /** `aria-describedby`: id подсказки и/или сообщения об ошибке. */
  describedById: ComputedRef<string | undefined>
  /** Невалидно ли поле (есть `error`). */
  invalid: ComputedRef<boolean>
  /** Обязательное ли поле. */
  required: ComputedRef<boolean>
  /**
   * Поле только для чтения. Отличается от `disabled`: значение видно, уходит в
   * форму и доступно скринридеру — просто не редактируется. Ставится на всё
   * поле целиком, чтобы «форма только на чтение» не требовала обходить контролы
   * по одному.
   */
  readonly: ComputedRef<boolean>
  /**
   * Поле недоступно: не фокусируется и не отправляется. Приходит от самого
   * поля или от формы целиком (`GrForm disabled`) — «выключить форму на время
   * отправки» не должно требовать обхода контролов по одному.
   */
  disabled: ComputedRef<boolean>
}

export const GR_FORM_FIELD_KEY: InjectionKey<GrFormFieldContext> = Symbol('gr-form-field')

/** Возвращает контекст поля формы или `null`, если контрол вне `GrFormField`. */
export function useGrFormFieldContext(): GrFormFieldContext | null {
  return inject(GR_FORM_FIELD_KEY, null)
}
