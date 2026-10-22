import { grThemeCatalog } from '@feugene/granularity-tokens'
import { grComponentTokens } from '@feugene/granularity/tokens'
import { describe, expect, it } from 'vitest'

import { catalog } from '../app/catalog'
import { comparisonRow, comparisonTable, componentDoc, designDoc, themeDocSection } from '../app/docs'

describe('каталог компонентов', () => {
  for (const component of catalog) {
    describe(component.name, () => {
      it('у каждой темы каталога есть раздел в docs/design', () => {
        const doc = designDoc(component.id)
        expect(doc).toBeDefined()

        for (const theme of grThemeCatalog)
          expect(themeDocSection(doc!, theme.id), theme.id).toBeTruthy()
      })

      it('сравнение тем — столбец на каждую тему каталога и характер у каждой', () => {
        const table = comparisonTable(designDoc(component.id)!)
        expect([...table!.columns].sort()).toEqual(grThemeCatalog.map(theme => theme.title).sort())

        const traits = comparisonRow(table!, 'Характер')
        for (const theme of grThemeCatalog)
          expect(traits?.get(theme.title), theme.title).toBeTruthy()
      })

      it('страница компонента даёт «Когда брать» и «Когда взять другое»', () => {
        const doc = componentDoc(component.id)
        expect(doc?.sections.has('Когда брать')).toBe(true)
        expect(doc?.sections.has('Когда взять другое')).toBe(true)
      })

      it('каждый компонент страницы — в реестре токенов пакета', () => {
        for (const name of component.exports)
          expect(grComponentTokens.some(token => token.owner === name), name).toBe(true)
      })
    })
  }
})
