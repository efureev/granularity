/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue" />

/**
 * Dev-гард пакета: разворачивается в текст условия на сборке (`define` в
 * `vite.config.ts`), в тестах равен `true` (`vitest.config.ts`). В рантайме
 * такого имени не существует — к потребителю уезжает уже подставленное
 * выражение, которое его бандлер сворачивает и выкидывает вместе с веткой.
 *
 * Форма выражения не косметика: почему в нём нет `typeof process` — в докблоке
 * у самого `define`.
 */
declare const __GR_DEV__: boolean
