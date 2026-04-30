import type { ShowcaseEntityRegistryItem } from '../../content/model'
import type { ShowcasePageName } from '../../app/showcase'

type Translator = (key: string, params?: Record<string, unknown>) => string

const helperFallbacks: Record<string, string> = {
  'showcase.detailPage.helpers.importSnippetPlaceholder': '// Import snippet will be generated as soon as the first entity is selected.',
  'showcase.detailPage.helpers.usageSnippetPlaceholder': '// Usage snippet will be generated as soon as the first entity is selected.',
  'showcase.detailPage.helpers.accessibility.fallback': 'Accessibility notes will be added alongside the first concrete entity page.',
  'showcase.detailPage.helpers.accessibility.componentFocus': 'Document keyboard behavior and focus management.',
  'showcase.detailPage.helpers.accessibility.componentAria': 'Capture required aria attributes and usage constraints.',
  'showcase.detailPage.helpers.accessibility.componentTheme': 'Verify on-screen states for light and dark themes.',
  'showcase.detailPage.helpers.accessibility.directiveFocus': 'Describe the directive behavior for focus, keyboard shortcuts, and pointer interactions.',
  'showcase.detailPage.helpers.accessibility.directiveCaveats': 'Document caveats for overlay and dismissable behavior separately.',
  'showcase.detailPage.helpers.accessibility.generic': 'Document the UX effect on the interface and expected integration constraints.',
  'showcase.detailPage.helpers.dependencies.fallback': 'Dependencies will appear once entity-level docs are connected.',
  'showcase.detailPage.helpers.dependencies.empty': 'No direct package-level dependencies are recorded for this entity in the registry.',
  'showcase.detailPage.relatedLinks.packageSource': 'Package source',
  'showcase.detailPage.relatedLinks.publicExport': 'Public export entry',
  'showcase.detailPage.relatedLinks.showcaseRegistry': 'Showcase registry',
  'showcase.detailPage.relatedLinks.showcaseDocsOverride': 'Showcase docs override',
  'showcase.detailPage.relatedLinks.narrativeDocs': 'Narrative docs',
}

const fallbackTranslator: Translator = key => helperFallbacks[key] ?? key

function resolveTranslator(translator?: Translator): Translator {
  if (!translator)
    return fallbackTranslator

  return (key, params) => {
    const result = translator(key, params)
    if (result === key)
      return helperFallbacks[key] ?? key

    return result
  }
}

export const featuredEntityNamesByPage: Partial<Record<ShowcasePageName, string>> = {
  overview: 'GrButton',
  foundations: 'GrButton',
  components: 'GrButton',
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

export function createImportSnippet(entity?: ShowcaseEntityRegistryItem, translator?: Translator): string {
  const t = resolveTranslator(translator)
  if (!entity)
    return t('showcase.detailPage.helpers.importSnippetPlaceholder')

  if (entity.kind === 'directive')
    return `import { ${entity.name} } from '@feugene/granularity/directives'`

  if (entity.kind === 'utility')
    return `import { ${entity.name} } from '@feugene/granularity/fileValidation'`

  return `import { ${entity.name} } from '@feugene/granularity'`
}

export function createUsageSnippet(entity?: ShowcaseEntityRegistryItem, translator?: Translator): string {
  const t = resolveTranslator(translator)
  if (!entity)
    return t('showcase.detailPage.helpers.usageSnippetPlaceholder')

  const importSnippet = createImportSnippet(entity, translator)

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

export function createAccessibilityItems(entity?: ShowcaseEntityRegistryItem, translator?: Translator): string[] {
  const t = resolveTranslator(translator)

  if (!entity)
    return [t('showcase.detailPage.helpers.accessibility.fallback')]

  if (entity.kind === 'component') {
    return [
      t('showcase.detailPage.helpers.accessibility.componentFocus'),
      t('showcase.detailPage.helpers.accessibility.componentAria'),
      t('showcase.detailPage.helpers.accessibility.componentTheme'),
    ]
  }

  if (entity.kind === 'directive') {
    return [
      t('showcase.detailPage.helpers.accessibility.directiveFocus'),
      t('showcase.detailPage.helpers.accessibility.directiveCaveats'),
    ]
  }

  return [
    t('showcase.detailPage.helpers.accessibility.generic'),
  ]
}

export function createDependencyItems(entity?: ShowcaseEntityRegistryItem, translator?: Translator): string[] {
  const t = resolveTranslator(translator)

  if (!entity)
    return [t('showcase.detailPage.helpers.dependencies.fallback')]

  return entity.dependencies.length
    ? entity.dependencies.map(dependency => dependency)
    : [t('showcase.detailPage.helpers.dependencies.empty')]
}

export function createRelatedLinks(entity?: ShowcaseEntityRegistryItem, translator?: Translator): ShowcaseRelatedLink[] {
  if (!entity)
    return []

  const t = resolveTranslator(translator)
  const docsPath = packageDocsByGroup[entity.group] ?? packageDocsByExportPath[entity.source.exportPath]

  return [
    {
      label: t('showcase.detailPage.relatedLinks.packageSource'),
      href: `/${entity.source.packagePath}`,
    },
    {
      label: t('showcase.detailPage.relatedLinks.publicExport'),
      href: resolvePublicExportSourcePath(entity.source.exportPath),
    },
    {
      label: t('showcase.detailPage.relatedLinks.showcaseRegistry'),
      href: entity.kind === 'component'
        ? showcaseComponentRegistryPath
        : showcasePackageRegistryPath,
    },
    {
      label: t('showcase.detailPage.relatedLinks.showcaseDocsOverride'),
      href: entity.kind === 'component'
        ? componentDocsOverridePath
        : packageDocsOverridePath,
    },
    ...(docsPath
      ? [{
          label: t('showcase.detailPage.relatedLinks.narrativeDocs'),
          href: docsPath,
        }]
      : []),
  ]
}