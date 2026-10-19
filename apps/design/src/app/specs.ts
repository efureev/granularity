import { defineAsyncComponent, type Component } from 'vue'

/** Живая спецификация реализованной версии — на настоящих компонентах пакета. */
export const implementedSpecs: Record<string, Component> = {
  button: defineAsyncComponent(() => import('./button/ButtonSpec.vue')),
}
