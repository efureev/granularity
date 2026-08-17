/**
 * Полный текст обрезанной строки — нативной подсказкой по наведению.
 *
 * `truncate` прячет хвост **визуально**: в DOM и для скринридера подпись
 * остаётся целой, поэтому теряет её ровно один читатель — тот, кто смотрит
 * глазами. Он видит «Включе…» и узнать остальное не может ничем.
 *
 * Подсказка ставится **по факту обрезки**, а не всегда: тултип, дублирующий
 * видимую целиком подпись, — шум, которого никто не просил. Замер делается на
 * самом наведении, поэтому ни наблюдателей, ни подписок заводить не нужно.
 *
 * Ширина сравнивается с запасом в пиксель: браузеры считают `scrollWidth`
 * округлением вверх, и у необрезанной строки он бывает на единицу больше
 * `clientWidth` — без запаса подсказка появлялась бы на ровном месте.
 */
export function titleWhenTruncated(event: Event): void {
  const element = event.currentTarget

  if (!(element instanceof HTMLElement)) return

  // У поля ввода видимая строка живёт в `value`, а не в содержимом узла.
  const source = element instanceof HTMLInputElement ? element.value : element.textContent
  const text = source?.trim() ?? ''

  if (text && element.scrollWidth > element.clientWidth + 1)
    element.setAttribute('title', text)
  else
    element.removeAttribute('title')
}
