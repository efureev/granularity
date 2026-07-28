import { onUnmounted, watch, type Ref } from 'vue'
import { useFintI18n } from '@feugene/fint-i18n/vue'

/**
 * Ленивое подключение i18n-блока страницы сущности.
 *
 * Переводы демо разложены по блокам (`components.GrModal`, `composables.useDialogService`).
 * Регистрировать их все в `i18n/index.ts` нельзя: тогда при старте грузились бы
 * переводы всех страниц сразу. Поэтому блок грузится при открытии страницы и
 * выгружается при уходе.
 *
 * Без этого вызова `t('composables.useDialogService.…')` вернёт сам ключ — загрузчик
 * в `messages.ts` объявлен, но никто не попросил блок загрузить.
 */
export function useEntityI18nBlock(blockName: Ref<string | null>): void {
  const i18n = useFintI18n()
  let active: string | null = null

  function setActive(next: string | null): void {
    if (next === active) return

    const previous = active
    active = next

    if (previous) {
      i18n.unregisterUsage(previous)
      for (const locale of i18n.getKnownLocales())
        i18n.unloadBlock(previous, locale)
    }

    if (next) {
      i18n.registerUsage(next)
      void i18n.loadBlock(next)
    }
  }

  watch(blockName, value => setActive(value), { immediate: true })

  onUnmounted(() => setActive(null))
}
