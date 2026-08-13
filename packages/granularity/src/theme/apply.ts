/**
 * Подключение темы в рантайме — `@feugene/granularity/theme/apply`.
 *
 * Отдельный подпуть от `@feugene/granularity/theme` не по вкусу, а по весу:
 * там справочник токенов (сотня килобайт данных), нужный, чтобы тему
 * **собрать**. Чтобы её **подключить**, не нужно ничего, кроме готовой строки,
 * — и приложению незачем платить за первое, если оно делает второе.
 *
 * Штатный путь всё же другой: собрать тему на сборке и отдать браузеру обычный
 * CSS-файл. Этот модуль — для случаев, когда тема появляется только в браузере:
 * редактор тем, превью, тема из пользовательских настроек.
 */

const ATTRIBUTE = 'data-gr-theme'

export interface ApplyThemeOptions {
  /**
   * Имя, под которым тема живёт в документе. Повторный вызов с тем же именем
   * заменяет её содержимое, а не добавляет второй `<style>`: иначе редактор
   * темы за минуту работы оставил бы в `<head>` сотню слоёв, и побеждал бы
   * последний — то есть результат зависел бы от истории правок.
   */
  name?: string
  /** Куда вставлять. По умолчанию `document.head`. */
  target?: HTMLElement | null
}

/** Подключает CSS темы и возвращает функцию, которая его снимает. */
export function applyTheme(css: string, options: ApplyThemeOptions = {}): () => void {
  const { name = 'custom', target } = options

  if (typeof document === 'undefined')
    return () => {}

  const host = target ?? document.head
  const existing = host.querySelector<HTMLStyleElement>(`style[${ATTRIBUTE}="${name}"]`)
  const style = existing ?? document.createElement('style')

  style.setAttribute(ATTRIBUTE, name)
  style.textContent = css

  if (!existing) host.append(style)

  return () => style.remove()
}

/** Снимает тему, подключённую `applyTheme`. */
export function removeTheme(name = 'custom', target?: HTMLElement | null): void {
  if (typeof document === 'undefined') return

  const host = target ?? document.head
  host.querySelector(`style[${ATTRIBUTE}="${name}"]`)?.remove()
}
