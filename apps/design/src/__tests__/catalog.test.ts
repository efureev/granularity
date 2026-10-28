import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { grThemeCatalog } from '@feugene/granularity-tokens'
import chartsManifest from '@feugene/granularity-charts/granum.manifest.json'
import chronoManifest from '@feugene/granularity-chrono/granum.manifest.json'
import codeManifest from '@feugene/granularity-code/granum.manifest.json'
import dashboardManifest from '@feugene/granularity-dashboard/granum.manifest.json'
import editorManifest from '@feugene/granularity-editor/granum.manifest.json'
import formsSchemaManifest from '@feugene/granularity-forms-schema/granum.manifest.json'
import mediaManifest from '@feugene/granularity-media/granum.manifest.json'
import manifest from '@feugene/granularity/granum.manifest.json'
import { describe, expect, it } from 'vitest'

import { catalog, catalogGroups, componentSlug, OWN_PAGES } from '../app/catalog'
import { COMPONENT_TAGS } from '../app/catalogData'
import { comparisonRow, comparisonTable, componentDoc, designDoc, themeDocSection } from '../app/docs'

const SPECIMENS = fileURLToPath(new URL('../app/specimens/', import.meta.url))
/** Компоненты экосистемы: ядро и компонентные спутники — каталог показывает все. */
const manifests = [manifest, chronoManifest, chartsManifest, codeManifest, dashboardManifest, editorManifest, formsSchemaManifest, mediaManifest]
const packageComponents = manifests.flatMap(item => Object.keys(item.components)).sort()

describe('каталог компонентов', () => {
  it('каждый компонент пакета — ровно в одной группе', () => {
    const placed = catalogGroups.flatMap(group => group.components)
    expect(new Set(placed).size, 'компонент в двух группах').toBe(placed.length)
    expect([...placed].sort()).toEqual(packageComponents)
  })

  it('каждый компонент пакета — на одной странице', () => {
    const shown = catalog.flatMap(component => component.exports)
    expect(new Set(shown).size, 'компонент на двух страницах').toBe(shown.length)
    expect([...shown].sort()).toEqual(packageComponents)
  })

  it('адрес страницы — имя компонента без префикса', () => {
    expect(componentSlug('GrButton')).toBe('button')
    expect(componentSlug('GrTabsWithPanels')).toBe('tabs-with-panels')
    expect(catalog.map(component => component.id)).toEqual(catalog.map(component => componentSlug(component.exports[0])))
  })

  for (const component of catalog) {
    describe(component.name, () => {
      const name = component.exports[0]

      it('страница даёт строку «зачем», «Когда брать» и «Когда взять другое» из docs/components', () => {
        expect(component.summary).not.toBe('')
        const doc = componentDoc(name)
        expect(doc?.sections.has('Когда брать')).toBe(true)
        expect(doc?.sections.has('Когда взять другое')).toBe(true)
      })

      if (!OWN_PAGES.includes(component.id)) {
        it('образцы — файл компонента с одним состоянием для карточки', () => {
          const path = `${SPECIMENS}${name}Specimen.vue`
          expect(existsSync(path), `${name}Specimen.vue`).toBe(true)

          const source = readFileSync(path, 'utf8')
          expect(source).toMatch(new RegExp(`<${COMPONENT_TAGS[name] ?? name}[\\s/>]`))
          expect(source).toMatch(/preview\?: boolean/)
        })
      }

      if (designDoc(name)) {
        it('у каждой темы каталога есть раздел в docs/design', () => {
          for (const theme of grThemeCatalog)
            expect(themeDocSection(designDoc(name)!, theme.id), theme.id).toBeTruthy()
        })

        it('сравнение тем — столбец на каждую тему каталога и характер у каждой', () => {
          const table = comparisonTable(designDoc(name)!)
          expect([...table!.columns].sort()).toEqual(grThemeCatalog.map(theme => theme.title).sort())

          const traits = comparisonRow(table!, 'Характер')
          for (const theme of grThemeCatalog)
            expect(traits?.get(theme.title), theme.title).toBeTruthy()
        })
      }
    })
  }
})
