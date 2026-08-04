import type { InjectionKey, Ref } from 'vue'

export type GranularityI18nParams = Record<string, unknown>

export type GranularityI18nAdapter = {
  /**
   * Перевод по ключу.
   *
   * Множественное число, форматирование чисел, дат и валют — целиком на стороне
   * переводчика: формы живут в самом сообщении
   * (`one:{n} файл | few:{n} файла | many:{n} файлов`), и какую выбрать, решает
   * он по параметру. Так устроены `@feugene/fint-i18n` и `vue-i18n`; `i18next`
   * читает `count`, поэтому пакет передаёт оба имени.
   *
   * Своей реализации ничего из этого в пакете нет и не должно быть: дублировать
   * `Intl` в UI-библиотеке значит однажды разойтись с приложением в правилах.
   * Без подключённого адаптера компонент показывает встроенный английский
   * fallback как есть — одной формой и без форматирования.
   */
  t: (key: string, params?: GranularityI18nParams) => string
  /**
   * Есть ли перевод для ключа. Необязателен — но если адаптер его умеет, пакет
   * спрашивает именно так.
   *
   * Без него «перевода нет» приходится выводить из `t(key) === key`, а это
   * враньё на словаре, где значение совпадает с ключом (технические словари
   * кодов и идентификаторов). Такой ключ считался бы отсутствующим, и вместо
   * перевода показался бы встроенный английский fallback.
   */
  te?: (key: string) => boolean
  locale?: Readonly<Ref<string>>
  syncLocale?: (locale: string) => void | Promise<void>
}

export const GRANULARITY_I18N_KEY: InjectionKey<GranularityI18nAdapter | null> = Symbol.for("@feugene/granularity")