/**
 * Приведение произвольного значения к тексту для показа.
 *
 * Компонент показывает данные из БД, и они бывают любыми: `unknown`-поле ответа
 * модели, `meta` запуска, тело ошибки. Поэтому сериализация обязана пережить всё
 * — уронить страницу она права не имеет.
 */

/** Маркер повторной ссылки. Показывается вместо ветки, которая уже встречалась выше. */
export const CIRCULAR_MARKER = '[Circular]'

/** Что печатается, когда сериализовать не удалось вовсе. */
export const UNSERIALIZABLE_MARKER = '[Unserializable]'

/**
 * Замена значений, на которых штатный `JSON.stringify` спотыкается.
 *
 * Маркером помечается **повторная ссылка**, а не только настоящий цикл: объект,
 * положенный в дерево дважды, тоже её получит. Отличить одно от другого можно
 * лишь стеком предков, а `replacer` его не отдаёт — узнать, что обход вышел из
 * ветки, изнутри нечем. Размен осознанный: показать `[Circular]` там, где данные
 * просто переиспользуют объект, — неточность; зациклиться на настоящем цикле —
 * зависшая вкладка.
 */
function createSafeReplacer(): (key: string, value: unknown) => unknown {
  const seen = new WeakSet<object>()

  return function safeReplacer(_key: string, value: unknown): unknown {
    // `BigInt` не имеет представления в JSON, и `stringify` на нём бросает.
    if (typeof value === 'bigint') return `${value}n`

    if (typeof value !== 'object' || value === null) return value

    if (seen.has(value)) return CIRCULAR_MARKER

    seen.add(value)
    return value
  }
}

/**
 * Значение → текст.
 *
 * Строка проходит как есть: это уже готовый текст, и оборачивать его в кавычки
 * значило бы показать не то, что пришло. `undefined` даёт пустую строку —
 * показывать нечего. Всё остальное сериализуется с отступом.
 */
export function serializeCode(value: unknown, indent = 2): string {
  if (typeof value === 'string') return value
  if (value === undefined) return ''

  try {
    const serialized = JSON.stringify(value, createSafeReplacer(), indent)
    // `stringify` отдаёт `undefined` на функции и символе — печатать «undefined»
    // строкой было бы враньём про содержимое.
    return serialized ?? ''
  }
  catch {
    return UNSERIALIZABLE_MARKER
  }
}
