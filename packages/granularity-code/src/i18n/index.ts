/**
 * Строки интерфейса пакета — три локали, как требует конвенция репозитория.
 *
 * Здесь только подписи и aria-метки самого пакета. Текстов замечаний
 * `validate` тут нет и не будет: их даёт потребитель, и переводить их — его
 * работа, не наша.
 *
 * Наружу отсюда уходят **лоадеры** (`en`, `ru`, `es`): приложение подключает
 * словарь через них, а не сырым JSON. Сам JSON остаётся доступен объектом
 * `grCodeMessages` — он нужен инструментам локализации, а не рантайму.
 */
import en from './locales/en.json'
import es from './locales/es.json'
import ru from './locales/ru.json'

export const grCodeMessages = { en, es, ru } as const

export type GrCodeLocale = keyof typeof grCodeMessages

export * from './messages'
