import { inject, type ComputedRef, type InjectionKey, type Ref } from 'vue'

import type { GrFormTrigger } from './validation'

/**
 * Контекст формы, который `GrForm` предоставляет своим `GrFormField`.
 *
 * Ключевая идея архитектуры: контролы (`GrInput`/`GrSelect`/`GrAutocomplete`/…) НЕ
 * знают про форму — они, как и раньше, читают только контекст `GrFormField`
 * (`id`/`aria-describedby`/`invalid`/`required`). А `GrFormField`, находясь внутри
 * `GrForm`, подтягивает свою ошибку и признак обязательности из ЭТОГО контекста по
 * `name` и триггерит валидацию поля. Так оркестрация добавляется сверху, не трогая
 * ни один контрол.
 */
export interface GrFormFieldRegistration {
  /** Обязательно ли поле по собственному пропу `required`. */
  required?: () => boolean
}

export interface GrFormContext {
  /** Реактивная карта ошибок по имени поля. */
  errors: Ref<Record<string, string | undefined>>
  /** Имена полей, у которых в правилах есть `required` (для маркера `*`). */
  requiredFields: ComputedRef<Set<string>>
  /**
   * Поля, у которых прямо сейчас идёт асинхронная проверка. Необязательны:
   * тип публичный, и контекст строят руками (в тестах и в своих обёртках) —
   * старая форма контекста продолжает работать.
   */
  validatingFields?: ComputedRef<Set<string>>
  /** Форма выключена целиком: значение видно, но ничего не редактируется. */
  disabled?: ComputedRef<boolean>
  /** Есть ли для поля правила (тогда `GrFormField` берёт ошибку из формы). */
  hasField: (name: string) => boolean
  /**
   * Регистрирует поле: корневой элемент (для scroll-to-error) и собственную
   * обязательность. Возвращает unregister.
   *
   * Обязательность приходит именно отсюда, потому что источников у неё два:
   * правило в `rules` и проп `required` у поля. Без регистрации второй источник
   * рисовал бы звёздочку, но не мешал submit'у.
   */
  registerField: (
    name: string,
    getEl: () => HTMLElement | null,
    registration?: GrFormFieldRegistration,
  ) => () => void
  /** Валидирует одно поле (с учётом триггера и настроек формы). */
  validateField: (name: string, trigger?: GrFormTrigger) => Promise<boolean>
}

export const GR_FORM_KEY: InjectionKey<GrFormContext> = Symbol('gr-form')

/** Возвращает контекст формы или `null`, если поле вне `GrForm`. */
export function useGrFormContext(): GrFormContext | null {
  return inject(GR_FORM_KEY, null)
}
