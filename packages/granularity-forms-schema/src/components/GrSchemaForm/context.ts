import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

import type { GrSchemaFieldInstance, GrSchemaNode, GrSchemaObjectNode } from '../../model'
import type { GrSchemaRendererRegistry } from '../../renderers'
import type { GrUiSchema } from '../../ui-schema'

/**
 * Контекст схемной формы.
 *
 * Через него поле узнаёт свой узел, реестр и `uiSchema`, не получая их пропами
 * с каждого уровня вложенности: у повторителя внутри секции таких уровней три,
 * и прокидывание руками расходилось бы при первой же правке.
 */
export interface GrSchemaFormContext {
  root: ComputedRef<GrSchemaObjectNode | undefined>
  model: ComputedRef<Record<string, unknown>>
  ui: ComputedRef<GrUiSchema>
  renderers: ComputedRef<GrSchemaRendererRegistry>
  disabled: ComputedRef<boolean>
  readonly: ComputedRef<boolean>
  /** Серверные ошибки по инстанс-пути — сильнее ошибки формы. */
  serverErrorAt: (name: string) => string[] | undefined
  /** Правка значения снимает серверную ошибку поля. */
  dismissServerError: (name: string) => void
  /** Узел по шаблонному пути — для поля, которому его не передали пропом. */
  nodeAt: (templatePath: string) => GrSchemaNode | undefined
  /** Значение по инстанс-пути. */
  valueAt: (name: string) => unknown
  setValueAt: (name: string, value: unknown) => void
  /**
   * Убирает ключ из модели совсем.
   *
   * Не `setValueAt(name, undefined)`: свободные ключи вводит пользователь, и
   * ключ, оставшийся со значением `undefined`, уехал бы на сервер и занял бы
   * имя, которое форма считает свободным.
   */
  deleteValueAt: (name: string) => void
  /** Развёрнутые поля контейнера — их рисуют объектный узел и повторитель. */
  fieldsOf: (name: string, templatePath: string, indices: number[]) => GrSchemaFieldInstance[]
  /** Строка повторителя добавлена, удалена или переставлена. */
  notifyRows: (path: string, action: 'add' | 'remove' | 'move', index: number) => void
  /** Снять валидацию с путей — зовётся до перестройки строк. */
  clearValidate: (names: string[]) => void
}

export const GR_SCHEMA_FORM_KEY: InjectionKey<GrSchemaFormContext> = Symbol('grSchemaForm')

export function provideSchemaForm(context: GrSchemaFormContext): void {
  provide(GR_SCHEMA_FORM_KEY, context)
}

export function useSchemaForm(): GrSchemaFormContext | null {
  return inject(GR_SCHEMA_FORM_KEY, null)
}
