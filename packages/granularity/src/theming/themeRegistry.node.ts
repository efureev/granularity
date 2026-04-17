import type { Preflight } from '@unocss/core'

import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  granularityDefaultBaseCssUrl,
  granularityDefaultTokensCssUrl,
  granularityThemeUrls,
  type GranularityBaseFile,
  type GranularityThemeCssOptions,
  type GranularityTokensFile,
  resolveGranularityBuiltinThemeNames,
  resolveGranularityThemeFiles,
} from './themeRegistry'

export type GranularityNodeThemeCssOptions = GranularityThemeCssOptions & {
  baseFile?: GranularityBaseFile
  tokens?: GranularityTokensFile
}

const granularityCssDataUrlPrefix = 'data:text/css'

function resolveGranularityCssFilePath(file: string): string {
  if (file.startsWith(granularityCssDataUrlPrefix))
    return file

  if (/^[a-z]+:\/\//i.test(file)) {
    const url = new URL(file)

    if (url.protocol === 'file:')
      return fileURLToPath(url)

    return resolve(process.cwd(), url.pathname.replace(/^\/+/, ''))
  }

  if (isAbsolute(file))
    return file

  return resolve(process.cwd(), file)
}

function decodeGranularityCssDataUrl(file: string): string {
  const [, metadata = '', body = ''] = file.match(/^data:([^,]*),(.*)$/s) ?? []

  if (!metadata)
    throw new Error(`Unsupported CSS data URL: ${file.slice(0, 64)}...`)

  if (metadata.includes(';base64'))
    return Buffer.from(body, 'base64').toString('utf8')

  return decodeURIComponent(body)
}

async function readCssFile(file: string): Promise<string> {
  if (file.startsWith(granularityCssDataUrlPrefix))
    return decodeGranularityCssDataUrl(file)

  return readFile(file, 'utf8')
}

export function resolveGranularityBaseFile(
  baseFile?: GranularityBaseFile,
): string {
  return resolveGranularityCssFilePath(baseFile ?? granularityDefaultBaseCssUrl)
}

export function resolveGranularityTokensFile(
  tokens?: GranularityTokensFile,
): string {
  return resolveGranularityCssFilePath(tokens ?? granularityDefaultTokensCssUrl)
}

export async function getGranularityBaseCss(
  options: Pick<GranularityNodeThemeCssOptions, 'baseFile'> = {},
): Promise<string> {
  return readCssFile(resolveGranularityBaseFile(options.baseFile))
}

export async function getGranularityTokensCss(
  options: Pick<GranularityNodeThemeCssOptions, 'tokens'> = {},
): Promise<string> {
  return readCssFile(resolveGranularityTokensFile(options.tokens))
}

export async function getGranularityThemeCss(
  options: GranularityNodeThemeCssOptions = {},
): Promise<string> {
  const builtinThemeNames = resolveGranularityBuiltinThemeNames(options)
  const customThemeFiles = resolveGranularityThemeFiles(options.themeFiles)

  const cssChunks = await Promise.all([
    ...builtinThemeNames.map(themeName => readCssFile(resolveGranularityCssFilePath(granularityThemeUrls[themeName]))),
    ...customThemeFiles.map(themeFile => readCssFile(resolveGranularityCssFilePath(themeFile))),
  ])

  return cssChunks.join('\n')
}

export function getGranularityThemePreflights(
  options: GranularityNodeThemeCssOptions = {},
): Preflight[] {
  return [
    {
      getCSS: async () => {
        const [tokensCss, baseCss, themeCss] = await Promise.all([
          getGranularityTokensCss(options),
          getGranularityBaseCss(options),
          getGranularityThemeCss(options),
        ])

        return [tokensCss, baseCss, themeCss]
          .filter(Boolean)
          .join('\n')
      },
    },
  ]
}

export type {
  GranularityBaseFile,
  GranularityThemeCssOptions,
  GranularityThemeFile,
  GranularityThemeName,
  GranularityTokensFile,
} from './themeRegistry'
export {
  granularityDefaultThemes,
  granularityThemeNames,
  granularityThemeUrls,
  resolveGranularityBuiltinThemeNames,
  resolveGranularityThemeFiles,
  resolveGranularityThemeNames,
} from './themeRegistry'