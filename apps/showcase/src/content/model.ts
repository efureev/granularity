export type ShowcaseEntityKind = 'component' | 'directive' | 'composable' | 'utility'
export type ShowcaseApiSectionKey = 'props' | 'slots' | 'events' | 'methods' | 'parameters' | 'returns'
export type ShowcaseApiSectionOrigin = 'generated' | 'manual' | 'pending'
export type ShowcaseExampleStatus = 'ready' | 'planned'

export type ShowcaseExampleMeta = {
  id: string
  title: string
  description: string
  status: ShowcaseExampleStatus
}

export type ShowcaseApiItemMeta = {
  name: string
  description: string
  type?: string
  required?: boolean
  default?: string
  signature?: string
}

export type ShowcaseApiSectionMeta = {
  key: ShowcaseApiSectionKey
  title: string
  origin: ShowcaseApiSectionOrigin
  items: ShowcaseApiItemMeta[]
}

export type ShowcaseEntitySourceMeta = {
  packagePath: string
  exportPath: string
}

export type ShowcaseEntityRegistryItem = {
  id: string
  kind: ShowcaseEntityKind
  name: string
  title: string
  path: string
  group: string
  summary: string
  tags: string[]
  source: ShowcaseEntitySourceMeta
  dependencies: string[]
  examples: ShowcaseExampleMeta[]
  apiSections: ShowcaseApiSectionMeta[]
}

export type ShowcaseEntityMetadataOverride = Partial<Pick<ShowcaseEntityRegistryItem, 'group' | 'summary' | 'tags' | 'examples'>>