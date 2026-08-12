import { describe, expect, it } from 'vitest'

import { companionComponents, companionPackages, getCompanionComponentBySlug } from '../companion/companionPackages'

/**
 * Гейт реестра companion-пакетов.
 *
 * Страница компаньона живёт по `/extras/<slug>`, а поиск по слагу возвращает
 * **первое** совпадение. Значит дубль слага не ломает сборку и не роняет типы —
 * он просто прячет вторую страницу за первой, и заметить это можно только
 * открыв ссылку. Гейт заведён, когда в витрине жили два companion-пакета с
 * одноимёнными компонентами; пакет остался один, а правило — нет.
 */
describe('реестр companion-пакетов', () => {
  it('слаги компонентов уникальны на всю витрину', () => {
    const seen = new Map<string, string[]>()

    for (const component of companionComponents) {
      seen.set(component.slug, [...(seen.get(component.slug) ?? []), component.npmName])
    }

    const duplicates = [...seen.entries()]
      .filter(([, owners]) => owners.length > 1)
      .map(([slug, owners]) => `${slug}: ${owners.join(', ')}`)

    expect(duplicates, 'дубль слага прячет вторую страницу за первой — молча').toEqual([])
  })

  it('слаг — kebab-case и резолвится обратно в свой компонент', () => {
    for (const component of companionComponents) {
      expect(component.slug, `${component.name}: слаг не kebab-case`).toMatch(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/)
      expect(getCompanionComponentBySlug(component.slug)?.name).toBe(component.name)
    }
  })

  it('id пакетов уникальны, а версия не пустая', () => {
    const ids = companionPackages.map(pkg => pkg.id)

    expect(new Set(ids).size, 'id пакета участвует в группировке на `/extras`').toBe(ids.length)

    for (const pkg of companionPackages) {
      expect(pkg.version, `${pkg.npmName}: версия пустая`).toMatch(/^\d+\.\d+\.\d+/)
    }
  })

  it('у каждого компонента есть хотя бы один пример', () => {
    const empty = companionComponents.filter(component => component.examples.length === 0).map(c => c.name)

    expect(empty, 'страница компаньона без примеров — пустая страница').toEqual([])
  })
})
