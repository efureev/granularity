/**
 * Строки интерфейса пакета — три локали, как требует конвенция репозитория.
 *
 * Здесь только то, чего не знает платформа: имена ручек, подписи режимов и
 * шаблоны объявлений для скринридера. Числа колонок и строк подставляются
 * параметрами, а не склеиваются в строку: порядок частей и падеж — дело языка.
 *
 * Ключи лежат под своим блоком `grDashboard`: компонент спрашивает
 * `grDashboard.item.moved`. Английский текст продублирован в компоненте вторым
 * аргументом `t(key, fallback)` — пакет обязан работать и без подключённого
 * адаптера i18n.
 *
 * Наружу отсюда уходят **лоадеры** (`en`, `ru`, `es`): приложение подключает
 * словарь через них, а не сырым JSON. Сам JSON остаётся доступен объектом
 * `grDashboardMessages` — он нужен инструментам локализации, а не рантайму.
 */
import en from './locales/en.json'
import es from './locales/es.json'
import ru from './locales/ru.json'

export const grDashboardMessages = { en, es, ru } as const

export type GrDashboardLocale = keyof typeof grDashboardMessages

export * from './messages'
