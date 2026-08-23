import type { DOMWrapper } from '@vue/test-utils'
import { DOMWrapper as Wrapper } from '@vue/test-utils'

/**
 * Элемент по селектору — или исключение с этим селектором в тексте.
 *
 * `querySelector` отдаёт `null`, и тест падает строкой ниже на обращении к
 * свойству: сообщение говорит про `undefined`, а не про то, что разметка
 * изменилась и селектор больше ни во что не попадает.
 *
 * Корень по умолчанию — `document`, а не поддерево обёртки: панели оверлеев
 * уезжают в портал и из неё не видны.
 */
export function queryOne<T extends HTMLElement = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T {
  const element = root.querySelector<T>(selector)
  if (!element)
    throw new Error(`нет элемента ${selector}`)

  return element
}

/** То же, но обёрткой `@vue/test-utils` — когда дальше нужны `trigger` и `text`. */
export function queryWrapper<T extends HTMLElement = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): DOMWrapper<T> {
  return new Wrapper(queryOne<T>(selector, root))
}
