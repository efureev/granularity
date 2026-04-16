import {
  useTheme,
  useToast,
} from '@feugene/granularity'
import * as granularityDirectives from '@feugene/granularity/directives'
import * as granularityFileValidation from '@feugene/granularity/fileValidation'

import type {
  ShowcaseApiSectionMeta,
  ShowcaseEntityKind,
  ShowcaseEntityRegistryItem,
} from '../model.ts'

const preferredDirectiveExportOrder = [
  'vAutofocus',
  'vAutosize',
  'vClickOutside',
  'vDropzone',
  'vHotkey',
  'vLoading',
  'createLoading',
] as const

const preferredUtilityExportOrder = [
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
] as const

const publicComposableExports = {
  useTheme,
  useToast,
} as const

function toKebabCase(value: string): string {
  return value
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

function createPendingPackageApiSections(kind: ShowcaseEntityKind): ShowcaseApiSectionMeta[] {
  return kind === 'utility'
    ? [
        {
          key: 'parameters',
          title: 'Parameters',
          origin: 'pending',
          items: [],
        },
        {
          key: 'returns',
          title: 'Returns / Errors',
          origin: 'pending',
          items: [],
        },
      ]
    : [
        {
          key: 'parameters',
          title: 'Parameters',
          origin: 'pending',
          items: [],
        },
        {
          key: 'returns',
          title: 'Returns',
          origin: 'pending',
          items: [],
        },
      ]
}

function createPackageEntity(
  kind: ShowcaseEntityKind,
  name: string,
  packagePath: string,
  exportPath: string,
  summary: string,
): ShowcaseEntityRegistryItem {
  return {
    id: `${kind}:${name}`,
    kind,
    name,
    title: name,
    path: `/${kind === 'utility' ? 'utilities' : `${kind}s`}/${toKebabCase(name)}`,
    group: 'ungrouped',
    summary,
    tags: ['generated', 'public-api'],
    source: {
      packagePath,
      exportPath,
    },
    dependencies: [],
    examples: [],
    apiSections: createPendingPackageApiSections(kind),
  }
}

export const generatedDirectiveEntities: ShowcaseEntityRegistryItem[] = preferredDirectiveExportOrder
  .filter(name => name in granularityDirectives)
  .map(name => createPackageEntity(
    'directive',
    name,
    'packages/granularity/src/directives/index.ts',
    name === 'createLoading'
      ? '@feugene/granularity/directives'
      : '@feugene/granularity/directives',
    `Публичная директива или helper ${name} из package exports.`,
  ))

export const generatedComposableEntities: ShowcaseEntityRegistryItem[] = Object.keys(publicComposableExports)
  .map(name => createPackageEntity(
    'composable',
    name,
    'packages/granularity/src/index.ts',
    `@feugene/granularity`,
    `Публичный composable ${name}, доступный из root exports пакета.`,
  ))

export const generatedUtilityEntities: ShowcaseEntityRegistryItem[] = preferredUtilityExportOrder
  .filter(name => name in granularityFileValidation)
  .map(name => createPackageEntity(
    'utility',
    name,
    'packages/granularity/src/fileValidation/index.ts',
    '@feugene/granularity/fileValidation',
    `Публичная file validation utility ${name} из package exports.`,
  ))