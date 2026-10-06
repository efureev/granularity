import type { Component } from 'vue'
import { describe, expect, it } from 'vitest'

/**
 * Голый атрибут флага работает у каждого пропа-флага, который принимает и строку.
 *
 * `<GrBadge dot>` в шаблоне — это `dot=""`. Флагом пустая строка становится,
 * только если `Boolean` в рантайм-типе пропа стоит раньше `String`; иначе Vue
 * оставляет `''`, и проп читается ложью. Порядок рантайм-типа повторяет порядок
 * объединения в TypeScript, поэтому `GrBadgeDotTone | boolean` молча ломал
 * пример из документации: точка не рисовалась.
 *
 * Флаг — проп, выключенный по умолчанию (`default: false`). У пропа-значения
 * (`value`, `modelValue` радио и чипа) пустая строка — законное значение, а не
 * включение, и там `String` впереди по праву.
 */
const modules = import.meta.glob<{ default: Component }>('../components/**/*.vue', { eager: true })

type RuntimeProp = { type?: unknown, default?: unknown } | null | undefined

describe('каст булевых пропов', () => {
  it('у флага, который принимает и строку, `Boolean` стоит раньше `String`', () => {
    const violations = Object.entries(modules).flatMap(([path, module]) => {
      const props = (module.default as { props?: Record<string, RuntimeProp> }).props ?? {}

      return Object.entries(props).flatMap(([name, prop]) => {
        const types = Array.isArray(prop?.type) ? prop.type : []
        const bool = types.indexOf(Boolean)
        const str = types.indexOf(String)

        const flag = prop?.default === false

        return flag && bool >= 0 && str >= 0 && str < bool ? [`${path.replace('../components/', '')}: ${name}`] : []
      })
    })

    expect(violations).toEqual([])
  })

  it('находит компоненты — иначе проверка выше зелена всегда', () => {
    expect(Object.keys(modules).length).toBeGreaterThan(100)
  })
})
