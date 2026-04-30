import { describe, expect, it } from 'vitest'

import {
  showcaseComponentEntities,
  showcaseComposableEntities,
  showcaseDirectiveEntities,
  showcaseEntityRegistry,
  showcaseUtilityEntities,
} from '../../app/showcase'
import { getShowcasePackageDoc } from '../packageDocs'

describe('showcase content registry', () => {
  it('собирает component entities из package registry с зависимостями и pending API format', () => {
    expect(showcaseComponentEntities.length).toBeGreaterThan(20)
    expect(showcaseComponentEntities.every(entity => entity.kind === 'component')).toBe(true)
    expect(showcaseComponentEntities.every(entity => entity.apiSections.length === 4)).toBe(true)
    expect(showcaseComponentEntities.some(entity => entity.dependencies.length > 0)).toBe(true)
  })

  it('подтягивает package-level exports для directives, composables и fileValidation utilities', () => {
    expect(showcaseDirectiveEntities.map(entity => entity.name)).toContain('vLoading')
    expect(showcaseDirectiveEntities.map(entity => entity.name)).toContain('createLoading')
    expect(showcaseComposableEntities.map(entity => entity.name)).toEqual(['useTheme', 'useToast'])
    expect(showcaseUtilityEntities.map(entity => entity.name)).toContain('runFileValidators')
    expect(showcaseUtilityEntities.map(entity => entity.name)).toContain('maxTotalSizeBytesValidator')
  })

  it('накладывает hand-authored metadata поверх generated layer', () => {
    const buttonEntity = showcaseComponentEntities.find(entity => entity.name === 'GrButton')
    const themeEntity = showcaseComposableEntities.find(entity => entity.name === 'useTheme')

    expect(buttonEntity?.group).toBe('actions')
    expect(buttonEntity?.tags).toContain('featured')
    expect(buttonEntity?.examples[0]?.status).toBe('planned')
    expect(themeEntity?.tags).toContain('shell')
  })

  it('даёт каждому UI-компоненту краткое пользовательское summary без generated-заглушек', () => {
    expect(showcaseComponentEntities.length).toBeGreaterThan(20)
    expect(
      showcaseComponentEntities.every(entity => entity.summary.length >= 30),
    ).toBe(true)
    expect(
      showcaseComponentEntities.every(entity => !entity.summary.includes('Публичный компонент')),
    ).toBe(true)
    expect(
      showcaseComponentEntities.every(entity => !entity.summary.includes('registry пакета')),
    ).toBe(true)
  })

  it('формирует единый registry-слой для навигации и будущих doc/detail pages', () => {
    expect(showcaseEntityRegistry.length).toBe(
      showcaseComponentEntities.length
      + showcaseDirectiveEntities.length
      + showcaseComposableEntities.length
      + showcaseUtilityEntities.length,
    )
  })

  it('держит финальную coverage-матрицу package-level entities с runnable docs и не оставляет исключений', () => {
    const packageEntities = [
      ...showcaseDirectiveEntities,
      ...showcaseComposableEntities,
      ...showcaseUtilityEntities,
    ]
    const packagePreviewEntityNames = new Set([
      'vAutofocus',
      'vAutosize',
      'vClickOutside',
      'vDropzone',
      'vHotkey',
      'vLoading',
      'createLoading',
      'useTheme',
      'useToast',
      'acceptValidator',
      'allowedExtensionsValidator',
      'allowedMimeTypesValidator',
      'runFileValidators',
    ])
    const utilityNames = showcaseUtilityEntities.map(entity => entity.name)

    expect(showcaseComponentEntities.every(entity => entity.path.startsWith('/components/'))).toBe(true)
    expect(showcaseDirectiveEntities.map(entity => entity.name)).toEqual([
      'vAutofocus',
      'vAutosize',
      'vClickOutside',
      'vDropzone',
      'vHotkey',
      'vLoading',
      'createLoading',
    ])
    expect(showcaseComposableEntities.map(entity => entity.name)).toEqual(['useTheme', 'useToast'])
    expect(utilityNames).toEqual([
      'FileValidationError',
      'normalizeFiles',
      'runFileValidators',
      'matchAccept',
      'acceptValidator',
      'allowedExtensionsValidator',
      'allowedMimeTypesValidator',
      'maxFileSizeBytesValidator',
      'maxSizeMbValidator',
      'maxTotalSizeBytesValidator',
    ])

    for (const entity of packageEntities) {
      const doc = getShowcasePackageDoc(entity)

      expect(doc.examples.some(example => example.status === 'ready')).toBe(true)
      expect(doc.apiSections.some(section => section.origin !== 'pending' && section.items.length > 0)).toBe(true)

      if (packagePreviewEntityNames.has(entity.name))
        expect(doc.examples.some(example => Boolean(example.previewKey))).toBe(true)
    }
  })
})