/**
 * Сравнение значений `GrSelect` — чистая арифметика без Vue и без пропов.
 *
 * Вынесено отдельным модулем, потому что от состояния компонента здесь не
 * зависит ничего: только само значение и имя поля-идентификатора. Тестируется
 * напрямую, без монтирования.
 */

/**
 * Ключ значения: для объектов — поле `valueKey`, иначе само значение строкой.
 * Через него идут все сравнения — `===` для объектов означал бы сравнение
 * ссылок, а модель обычно приходит снаружи отдельной копией.
 */
export function selectValueKey(value: unknown, valueKey?: string): string {
  if (value !== null && typeof value === 'object') {
    const own = valueKey ? (value as Record<string, unknown>)[valueKey] : undefined

    if (own === undefined && __GR_DEV__) {
      console.warn(
        '[granularity] GrSelect: объектные значения требуют `valueKey` с именем поля-идентификатора; '
        + 'без него опции неотличимы друг от друга.',
      )
    }

    return String(own ?? JSON.stringify(value))
  }

  return String(value)
}

/**
 * `0` — валидное значение, поэтому «пусто» проверяется явно, а не через falsy:
 * прежняя проверка `if (!value)` теряла ноль вместе с пустой строкой.
 */
export function isEmptySelectValue(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

/** Модель к массиву: скаляр становится набором из одного, пустое — пустым. */
export function toSelectArray<TValue>(value: TValue | TValue[] | ''): TValue[] {
  if (Array.isArray(value))
    return value
  if (isEmptySelectValue(value))
    return []
  return [value as TValue]
}
