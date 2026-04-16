import type { ShowcaseEntityRegistryItem } from '../model'
import { packageDocOverrides } from './overrides'
import { createFallbackDoc } from './shared'

export type {
  PackageDocOverride,
  ShowcasePackageDocMeta,
  ShowcasePackageExampleDoc,
} from './types'

export function getShowcasePackageDoc(entity: ShowcaseEntityRegistryItem) {
  return packageDocOverrides[entity.name] ?? createFallbackDoc(entity)
}