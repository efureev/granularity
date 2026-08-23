import { computed, ref } from 'vue'

import {
  searchShowcaseEntries,
  showcaseSuggestedSearchEntries,
} from './showcaseDiscoverability'
import type { ShowcaseSearchEntry } from './showcaseSearch'

/**
 * Состояние общего поиска витрины — модульное, потому что палитра одна на
 * страницу, а кнопок-триггеров две: в шапке и в мобильном drawer'е. Смонтировать
 * палитру дважды нельзя: она вешает свой `mod+k` на `window`, и два слушателя
 * переключали бы её туда-обратно за одно нажатие.
 */
const isOpen = ref(false)
const query = ref('')

export function useShowcaseSearch() {
  /**
   * Порядок и лимит остаются за витриной: у палитры фильтр — плоский предикат без
   * ранжирования, а здесь работает скоринг индекса (точное совпадение, префикс,
   * вид записи). Поэтому палитра получает готовый список и `filterable: false`.
   */
  const entries = computed<ShowcaseSearchEntry[]>(() => {
    const normalized = query.value.trim()

    return normalized ? searchShowcaseEntries(normalized, 8) : showcaseSuggestedSearchEntries
  })

  /**
   * Заголовок группы приходит снаружи: `kindLabel` в сгенерированном индексе —
   * техническое значение (`component`, `Page`), а группа видна пользователю и
   * обязана быть локализованной.
   */
  function toItems(groupLabel: (kind: ShowcaseSearchEntry['kind'], entry: ShowcaseSearchEntry) => string) {
    return entries.value.map(entry => ({
      id: entry.id,
      label: entry.title,
      description: entry.description,
      group: groupLabel(entry.kind, entry),
      // Контекст («forms / component») не рисуем: вид записи уже стоит заголовком
      // группы. В ключевых словах он полезен — по нему тоже ищут.
      keywords: entry.context ? [entry.context] : undefined,
    }))
  }

  function hrefOf(id: string): string | undefined {
    return entries.value.find(entry => entry.id === id)?.href
  }

  function open(): void {
    isOpen.value = true
  }

  function close(): void {
    isOpen.value = false
    query.value = ''
  }

  function toggle(): void {
    if (isOpen.value)
      close()
    else open()
  }

  return {
    isOpen,
    query,
    entries,
    toItems,
    hrefOf,
    open,
    close,
    toggle,
  }
}
