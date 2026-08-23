/**
 * Строки интерфейса пакета — три локали, как требует конвенция репозитория.
 *
 * Здесь только то, чего не знает платформа: подписи кнопок и aria-метки.
 * Английский текст продублирован в компоненте как fallback — пакет обязан
 * работать и без подключённого адаптера i18n.
 *
 * Наружу отсюда уходят **лоадеры** (`en`, `ru`, `es`): приложение подключает
 * словарь через них, а не сырым JSON. Сам JSON остаётся доступен объектом
 * `grMediaMessages` — он нужен инструментам локализации, а не рантайму.
 */
import en from './locales/en.json'
import es from './locales/es.json'
import ru from './locales/ru.json'

export const grMediaMessages = { en, es, ru } as const

export type GrMediaLocale = keyof typeof grMediaMessages

export * from './messages'
