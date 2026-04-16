import type {
  ShowcaseApiSectionMeta,
  ShowcaseExampleStatus,
} from '../model'

export type ShowcasePackageExampleDoc = {
  id: string
  title: string
  description: string
  status: ShowcaseExampleStatus
  code: string
  note?: string
  previewKey?: string
}

export type ShowcasePackageDocMeta = {
  overview: string[]
  examples: ShowcasePackageExampleDoc[]
  apiSections: ShowcaseApiSectionMeta[]
  usage: string[]
  caveats: string[]
  integrationNotes: string[]
}

export type PackageDocOverride = ShowcasePackageDocMeta