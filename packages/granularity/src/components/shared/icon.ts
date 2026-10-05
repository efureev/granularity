import type { Component } from 'vue'
import { markRaw } from 'vue'

/**
 * Иконку компонент получает двумя способами, и рисуются они разными тегами.
 *
 * Vue-компонент пакет рисует сам — он ни от чего не зависит. Класс иконки
 * (`i-lucide-*`) генерирует не пакет: правило для него заводит приложение
 * (фабрике движка или провайдером), без правила потребитель получит пустое
 * место вместо картинки (`docs/installation.md#иконки`). Поэтому класс уезжает
 * в `:class` пустого `span`, а компонент — в `:is`.
 */
export function iconTag(
  icon: string | Component | undefined,
  fallback: string | Component = 'span',
): string | Component {
  if (!icon)
    return fallback

  return typeof icon === 'string' ? 'span' : markRaw(icon)
}

/** Класс иконки, если она задана строкой; для компонента классов нет. */
export function iconClass(icon: string | Component | undefined): string {
  return typeof icon === 'string' ? icon : ''
}
