import { showcaseComponentDetailSections } from '../../app/showcase'

import type { ShowcaseExampleStatus } from '../model'

export type ShowcaseComponentExampleDoc = {
  id: string
  title: string
  description: string
  status: ShowcaseExampleStatus
  code: string
  note?: string
  previewKey?: string
}

export type ShowcaseComponentDocMeta = {
  sections: typeof showcaseComponentDetailSections
  examples: ShowcaseComponentExampleDoc[]
}
