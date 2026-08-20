/// <reference types="vite/client" />

/**
 * Дев-гард. Разворачивается в условие на сборке (`define` в `vite.config.ts`),
 * в тестах равен `true`. Подробности — `.claude/rules/library-conventions.md`.
 */
declare const __GR_DEV__: boolean

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
