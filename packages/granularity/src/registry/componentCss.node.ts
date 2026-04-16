import type { Preflight } from '@unocss/core'

import { access, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import {
  getGranularityComponentCssUrls,
} from './componentCss'
import type {
  GranularityComponentSelection,
  GranularityComponentName,
} from './components'
import {
  granularityComponentConfigs,
} from './components'

const granularityPackageAssetBase = import.meta.url.includes('/src/') ? '../' : './'

function resolveGranularityPackageAssetFile(fileName: string): string {
  return fileURLToPath(new URL(`${granularityPackageAssetBase}${fileName}`, import.meta.url))
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  }
  catch {
    return false
  }
}

async function resolveGranularityComponentCssFile(
  componentName: GranularityComponentName,
  fileUrl: string,
  index: number,
): Promise<string> {
  const sourceFile = fileURLToPath(fileUrl)

  if (await fileExists(sourceFile))
    return sourceFile

  return resolveGranularityPackageAssetFile(granularityComponentConfigs[componentName].cssFileAssetNames[index])
}

export async function getGranularityComponentCssFiles(
  selection: GranularityComponentSelection = 'all',
): Promise<string[]> {
  const componentNames = selection === 'all'
    ? Object.keys(granularityComponentConfigs) as GranularityComponentName[]
    : selection

  const files = await Promise.all(
    componentNames.flatMap(componentName =>
      granularityComponentConfigs[componentName].cssFiles.map((fileUrl, index) =>
        resolveGranularityComponentCssFile(componentName, fileUrl, index),
      ),
    ),
  )

  return [...new Set(files)]
}

export async function getGranularityComponentCss(
  selection: GranularityComponentSelection = 'all',
): Promise<string> {
  const files = await getGranularityComponentCssFiles(selection)
  const cssChunks = await Promise.all(files.map(file => readFile(file, 'utf8')))

  return cssChunks.join('\n')
}

export function getGranularityComponentPreflights(
  selection: GranularityComponentSelection = 'all',
): Preflight[] {
  const files = getGranularityComponentCssUrls(selection)

  if (!files.length)
    return []

  return [
    {
      getCSS: async () => getGranularityComponentCss(selection),
    },
  ]
}