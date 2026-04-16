import type { ShowcaseEntityRegistryItem } from '../../content/model'
import type { ShowcasePageName } from '../../app/showcase'

export const featuredEntityNamesByPage: Partial<Record<ShowcasePageName, string>> = {
  overview: 'DsButton',
  foundations: 'DsButton',
  components: 'DsButton',
  directives: 'vLoading',
  composables: 'useTheme',
  utilities: 'runFileValidators',
}

export type ShowcaseRelatedLink = {
  label: string
  href: string
}

const showcaseComponentRegistryPath = '/apps/showcase/src/content/generated/componentEntities.generated.ts'
const showcasePackageRegistryPath = '/apps/showcase/src/content/generated/packageEntities.generated.ts'
const componentDocsOverridePath = '/apps/showcase/src/content/component-docs/overrides.ts'
const packageDocsOverridePath = '/apps/showcase/src/content/package-docs/overrides.ts'

const packageDocsByGroup: Partial<Record<ShowcaseEntityRegistryItem['group'], string>> = {
  fileValidation: '/packages/granularity/docs/file-validation.md',
}

const packageDocsByExportPath: Partial<Record<string, string>> = {
  '@feugene/granularity/fileValidation': '/packages/granularity/docs/file-validation.md',
}

function resolvePublicExportSourcePath(exportPath: string): string {
  if (exportPath.endsWith('/directives'))
    return '/packages/granularity/src/directives/index.ts'

  if (exportPath.endsWith('/fileValidation'))
    return '/packages/granularity/src/fileValidation/index.ts'

  return '/packages/granularity/src/index.ts'
}

export function resolveFeaturedEntity(
  pageName: ShowcasePageName,
  entities: ShowcaseEntityRegistryItem[],
): ShowcaseEntityRegistryItem | undefined {
  const entityName = featuredEntityNamesByPage[pageName]

  return entities.find(entity => entity.name === entityName)
}

export function createImportSnippet(entity?: ShowcaseEntityRegistryItem): string {
  if (!entity)
    return '// Import snippet will be generated as soon as the first entity is selected.'

  if (entity.kind === 'directive')
    return `import { ${entity.name} } from '@feugene/granularity/directives'`

  if (entity.kind === 'utility')
    return `import { ${entity.name} } from '@feugene/granularity/fileValidation'`

  return `import { ${entity.name} } from '@feugene/granularity'`
}

export function createUsageSnippet(entity?: ShowcaseEntityRegistryItem): string {
  if (!entity)
    return '// Usage snippet will be generated as soon as the first entity is selected.'

  const importSnippet = createImportSnippet(entity)

  if (entity.kind === 'component') {
    return [
      importSnippet,
      '',
      `<${entity.name}>`,
      '  Showcase content',
      `</${entity.name}>`,
    ].join('\n')
  }

  if (entity.kind === 'directive') {
    return [
      importSnippet,
      '',
      `app.directive('${entity.name.replace(/^v/, '').toLowerCase()}', ${entity.name})`,
    ].join('\n')
  }

  if (entity.kind === 'composable') {
    return [
      importSnippet,
      '',
      `const ${entity.name.replace(/^use/, '').toLowerCase()} = ${entity.name}()`,
    ].join('\n')
  }

  return [
    importSnippet,
    '',
    `const result = ${entity.name}(/* input */)`,
  ].join('\n')
}

export function createAccessibilityItems(entity?: ShowcaseEntityRegistryItem): string[] {
  if (!entity)
    return ['Accessibility notes will be added alongside the first concrete entity page.']

  if (entity.kind === 'component') {
    return [
      'Зафиксировать keyboard behavior и focus management.',
      'Отразить обязательные aria-атрибуты и ограничения usage.',
      'Проверить экранные состояния в светлой и тёмной теме.',
    ]
  }

  if (entity.kind === 'directive') {
    return [
      'Описать влияние директивы на focus, keyboard shortcuts и pointer interactions.',
      'Отдельно зафиксировать caveats для overlay и dismissable behavior.',
    ]
  }

  return [
    'Документировать UX-эффект на интерфейс и ожидаемые ограничения интеграции.',
  ]
}

export function createDependencyItems(entity?: ShowcaseEntityRegistryItem): string[] {
  if (!entity)
    return ['Dependencies will appear once entity-level docs are connected.']

  return entity.dependencies.length
    ? entity.dependencies.map(dependency => dependency)
    : ['Прямые package-level зависимости для этой сущности не зафиксированы в registry.']
}

export function createRelatedLinks(entity?: ShowcaseEntityRegistryItem): ShowcaseRelatedLink[] {
  if (!entity)
    return []

  const docsPath = packageDocsByGroup[entity.group] ?? packageDocsByExportPath[entity.source.exportPath]

  return [
    {
      label: 'Package source',
      href: `/${entity.source.packagePath}`,
    },
    {
      label: 'Public export entry',
      href: resolvePublicExportSourcePath(entity.source.exportPath),
    },
    {
      label: 'Showcase registry',
      href: entity.kind === 'component'
        ? showcaseComponentRegistryPath
        : showcasePackageRegistryPath,
    },
    {
      label: 'Showcase docs override',
      href: entity.kind === 'component'
        ? componentDocsOverridePath
        : packageDocsOverridePath,
    },
    ...(docsPath
      ? [{
          label: 'Narrative docs',
          href: docsPath,
        }]
      : []),
  ]
}