/**
 * Изолированная проверка гранулярности контракта.
 *
 * Эта программа (`tsconfig.checks.json`) состоит из одного файла и импортирует
 * **только** `GrConfigProvider`. Ни один компонент не подключён — значит реестр
 * `GrComponentDefaultsRegistry` пуст, и `componentDefaults` не знает ни про
 * `GrButton`, ни про кого-либо ещё.
 *
 * Это и есть главное свойство варианта A: типы приезжают ровно за теми
 * компонентами, которые потребитель реально импортировал. Если реестр однажды
 * снова станет централизованным, `keyof` перестанет быть `never` и проверка
 * упадёт.
 *
 * Отдельно зафиксировано ограничение: на пустом реестре `GrComponentDefaults`
 * вырождается в `{}`, а такому типу TS разрешает присвоить любой объектный
 * литерал. То есть проверка ключей включается вместе с первым импортированным
 * настраиваемым компонентом, а не раньше. Практического вреда нет — настраивать
 * дефолты компонента, которого нет в сборке, незачем, и читать конфиг всё равно
 * некому, — но знать об этом стоит.
 */
import type { GrComponentDefaults } from '@feugene/granularity/components/GrConfigProvider'

type Expect<T extends true> = T
type IsNever<T> = [T] extends [never] ? true : false

/** Без импортов компонентов реестр пуст. */
export type RegistryIsEmptyWithoutComponentImports = Expect<IsNever<keyof GrComponentDefaults>>

/** Обратная сторона пустого реестра: `{}` принимает любой литерал. */
export const anythingGoesOnEmptyRegistry: GrComponentDefaults = { GrButton: { variant: 'outline' } }
