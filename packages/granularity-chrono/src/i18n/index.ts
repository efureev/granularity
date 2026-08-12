/**
 * Строки интерфейса пакета — три локали, как требует конвенция репозитория.
 *
 * Здесь только то, чего не знает платформа: подписи кнопок и aria-метки.
 * Названия месяцев и дней недели в локали **не кладутся** — их даёт `Intl` по
 * тегу локали, и держать их тут значило бы поддерживать столько языков,
 * сколько мы успели вписать, вместо всех, что умеет движок.
 *
 * Ключи лежат под неймспейсом `gr`, как у ядра: компонент спрашивает
 * `gr.calendar.previousMonth`. Английский текст продублирован в компоненте
 * как fallback — пакет обязан работать и без подключённого адаптера i18n.
 */
import en from './locales/en.json'
import es from './locales/es.json'
import ru from './locales/ru.json'

export const grChronoMessages = { en, es, ru } as const

export type GrChronoLocale = keyof typeof grChronoMessages

export { en, es, ru }
