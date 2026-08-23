/**
 * Снимок модели формы: клон для `resetFields` и отпечаток для `isDirty`.
 *
 * Чистый модуль без Vue: обе операции читают «сквозь» reactive-прокси и
 * тестируются без монтирования.
 *
 * Почему не `JSON.parse(JSON.stringify(...))` и не `structuredClone`: первый
 * теряет `File` (у файла нет ни перечислимых собственных свойств, ни `toJSON`,
 * поэтому в снимок попадал `{}`), второй падает на прокси с `DataCloneError`.
 */

/** `File` и прочие `Blob` — двоичные значения, для которых клон бессмыслен. */
function isBinary(value: unknown): value is Blob {
  return typeof Blob !== 'undefined' && value instanceof Blob
}

function cloneValue(value: unknown): unknown {
  if (typeof value === 'function' || typeof value === 'symbol')
    return undefined
  if (value === null || typeof value !== 'object')
    return value

  // По ссылке: содержимое файла клонировать нечем, а идентичность как раз и
  // нужна — `resetFields` обязан вернуть тот самый файл, а не его подобие.
  if (isBinary(value))
    return value

  if (Array.isArray(value)) {
    // Как у `JSON.stringify`: не-сериализуемый элемент массива становится `null`,
    // иначе сброс сдвинул бы индексы.
    return value.map((item) => {
      const cloned = cloneValue(item)
      return cloned === undefined ? null : cloned
    })
  }

  // `Date` и прочие носители `toJSON` ведут себя ровно как раньше.
  const toJSON = (value as { toJSON?: unknown }).toJSON
  if (typeof toJSON === 'function')
    return cloneValue((value as { toJSON: () => unknown }).toJSON())

  const out: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    const cloned = cloneValue(item)
    if (cloned !== undefined)
      out[key] = cloned
  }
  return out
}

/** Клон значения модели: JSON-семантика плюс сохранённые по ссылке файлы. */
export function cloneModelValue<T>(value: T): T {
  return value === undefined ? value : (cloneValue(value) as T)
}

/**
 * Отпечаток файла для сравнения. Тождество здесь не годится: `resetFields`
 * кладёт в модель клон снимка, и сравнение по ссылке считало бы форму грязной
 * сразу после сброса. Тройки «имя, размер, время» достаточно, чтобы отличить
 * один выбранный файл от другого.
 */
function binaryFingerprint(value: Blob): string {
  if (typeof File !== 'undefined' && value instanceof File)
    return `gr-file:${value.name}:${value.size}:${value.lastModified}`

  return `gr-blob:${value.size}:${value.type}`
}

/**
 * Строка, по которой сравниваются модель и снимок. Без неё любой `File`
 * сериализовался в `{}`, и «выбрал документ» было неотличимо от «не трогал».
 */
export function modelFingerprint(value: unknown): string {
  return JSON.stringify(value, (_key, item) => isBinary(item) ? binaryFingerprint(item) : item) ?? ''
}
