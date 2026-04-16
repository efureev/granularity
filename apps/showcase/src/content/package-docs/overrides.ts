import { composablePackageDocOverrides } from './composables'
import { directivePackageDocOverrides } from './directives'
import { utilityPackageDocOverrides } from './utilities'
import type { PackageDocOverride } from './types'

export const packageDocOverrides: Record<string, PackageDocOverride> = {
  ...directivePackageDocOverrides,
  ...composablePackageDocOverrides,
  ...utilityPackageDocOverrides,
}