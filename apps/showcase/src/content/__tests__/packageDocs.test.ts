import { describe, expect, it } from 'vitest'

import {
  getShowcaseEntityByPath,
  showcaseComposableEntities,
  showcaseDirectiveEntities,
  showcaseUtilityEntities,
} from '../../app/showcase'
import { getShowcasePackageDoc } from '../packageDocs'

describe('package docs metadata', () => {
  it('возвращает ready-docs для `vAutofocus` с runnable preview key и ручным API', () => {
    const entity = showcaseDirectiveEntities.find(item => item.name === 'vAutofocus')

    expect(entity).toBeDefined()

    const doc = getShowcasePackageDoc(entity!)

    expect(doc.examples).toHaveLength(1)
    expect(doc.examples[0]?.status).toBe('ready')
    expect(doc.examples[0]?.previewKey).toBe('v-autofocus-dialog')
    expect(doc.apiSections.map(section => section.key)).toEqual(['parameters', 'returns'])
    expect(doc.caveats.length).toBeGreaterThan(0)
    expect(doc.integrationNotes.length).toBeGreaterThan(0)
  })

  it('возвращает ручной override для `useTheme` с runtime preview и bootstrap helper', () => {
    const entity = showcaseComposableEntities.find(item => item.name === 'useTheme')

    expect(entity).toBeDefined()

    const doc = getShowcasePackageDoc(entity!)

    expect(doc.examples).toHaveLength(1)
    expect(doc.examples[0]?.status).toBe('ready')
    expect(doc.examples[0]?.previewKey).toBe('use-theme-runtime')
    expect(doc.apiSections.at(-1)?.items.map(item => item.name)).toContain('initThemeEarly(options)')
    expect(doc.integrationNotes.join(' ')).toContain('bootstrap')
  })

  it('возвращает ручной override для `runFileValidators` с shape `{ files, issues }`', () => {
    const entity = showcaseUtilityEntities.find(item => item.name === 'runFileValidators')

    expect(entity).toBeDefined()

    const doc = getShowcasePackageDoc(entity!)

    expect(doc.examples).toHaveLength(1)
    expect(doc.examples[0]?.previewKey).toBe('run-file-validators-pipeline')
    expect(doc.examples[0]?.code).toContain('result.issues')
    expect(doc.apiSections[1]?.items.map(item => item.name)).toContain('issues')
    expect(doc.caveats.join(' ')).toContain('не выбрасывает `FileValidationError`')
  })

  it('возвращает ручной override для `acceptValidator` и подчёркивает bridge с `DsFileUpload`', () => {
    const entity = showcaseUtilityEntities.find(item => item.name === 'acceptValidator')

    expect(entity).toBeDefined()

    const doc = getShowcasePackageDoc(entity!)

    expect(doc.examples[0]?.previewKey).toBe('accept-validator-preview')
    expect(doc.apiSections.map(section => section.origin)).toEqual(['manual', 'manual'])
    expect(doc.integrationNotes.join(' ')).toContain('DsFileUpload')
  })

  it('возвращает ручной override для MIME/extension validators с runnable preview keys', () => {
    const extensionEntity = showcaseUtilityEntities.find(item => item.name === 'allowedExtensionsValidator')
    const mimeEntity = showcaseUtilityEntities.find(item => item.name === 'allowedMimeTypesValidator')

    expect(extensionEntity).toBeDefined()
    expect(mimeEntity).toBeDefined()

    const extensionDoc = getShowcasePackageDoc(extensionEntity!)
    const mimeDoc = getShowcasePackageDoc(mimeEntity!)

    expect(extensionDoc.examples[0]?.previewKey).toBe('allowed-extensions-validator-preview')
    expect(extensionDoc.caveats.join(' ')).toContain('Файлы без расширения')
    expect(mimeDoc.examples[0]?.previewKey).toBe('allowed-mime-types-validator-preview')
    expect(mimeDoc.integrationNotes.join(' ')).toContain('UX vs строгость')
  })

  it('позволяет находить package-level detail entity по итоговому пути', () => {
    const directive = getShowcaseEntityByPath('/directives/v-autofocus')
    const utility = getShowcaseEntityByPath('/utilities/run-file-validators')
    const utilityEntity = showcaseUtilityEntities.find(item => item.name === 'runFileValidators')

    expect(directive?.kind).toBe('directive')
    expect(directive?.name).toBe('vAutofocus')
    expect(utility?.kind).toBe('utility')
    expect(utility?.path).toBe(utilityEntity?.path)
  })
})