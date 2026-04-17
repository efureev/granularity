import { extname } from 'node:path'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createGenerator, presetMini } from 'unocss'
import Icons from 'unplugin-icons/vite'
import UnoCSS from 'unocss/vite'

import { isTestArtifactPath } from './scripts/distArtifacts.mjs'
import type { GranularityComponentName, GranularityComponentSelection } from './src/registry/components'
import { granularityComponentConfigs, resolveGranularityComponentNames } from './src/registry/components'
import { granularityStyleAssets, getGranularitySafelist } from './src/registry/safelist'
import { granularityThemeNames } from './src/theming/themeRegistry'
import { presetGranularityNode } from './src/unocss/preset.node'

const DIST_PREFIX_RE = /^\.\/dist\//
const GRANULARITY_FOUNDATION_FILE_NAME = 'foundation.css'
const GRANULARITY_SOURCE_EXTENSIONS = new Set(['.ts', '.vue'])
export const granularityInternalChunkFileName = 'chunks/[name]-[hash].js'

function stripDistPrefix(path: string) {
  return path.replace(DIST_PREFIX_RE, './')
}

function rewriteExports(value: unknown): unknown {
  if (typeof value === 'string')
    return stripDistPrefix(value)

  if (Array.isArray(value))
    return value.map(rewriteExports)

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, rewriteExports(val)]),
    )
  }

  return value
}

function getDistPackageJson() {
  const pkg = JSON.parse(
    readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8'),
  )

  return {
    name: pkg.name,
    version: pkg.version,
    private: pkg.private,
    type: pkg.type,
    sideEffects: pkg.sideEffects,
    exports: rewriteExports(pkg.exports),
    peerDependencies: pkg.peerDependencies,
    dependencies: pkg.dependencies,
  }
}

function isGranularitySourceEntry(entryName: string): boolean {
  if (!GRANULARITY_SOURCE_EXTENSIONS.has(extname(entryName)))
    return false

  return !entryName.endsWith('.d.ts')
    && !entryName.endsWith('.test.ts')
    && !entryName.endsWith('.spec.ts')
}

function collectGranularitySourceFiles(dirUrl: URL): string[] {
  return readdirSync(fileURLToPath(dirUrl), { withFileTypes: true })
    .flatMap((entry) => {
      const entryUrl = new URL(`./${entry.name}`, dirUrl)

      if (entry.isDirectory())
        return collectGranularitySourceFiles(new URL(`./${entry.name}/`, dirUrl))

      return isGranularitySourceEntry(entry.name)
        ? [fileURLToPath(entryUrl)]
        : []
    })
    .sort((left, right) => left.localeCompare(right))
}

function getGranularityComponentSourceFiles(selection: GranularityComponentSelection = 'all'): string[] {
  const componentNames = selection === 'all'
    ? Object.keys(granularityComponentConfigs) as GranularityComponentName[]
    : resolveGranularityComponentNames([...selection] as GranularityComponentName[])

  return componentNames.flatMap(componentName => collectGranularitySourceFiles(new URL(`./src/components/${componentName}/`, import.meta.url)))
}

const granularityComponentEntries = Object.fromEntries(
  Object.keys(granularityComponentConfigs).map(componentName => [
    `components/${componentName}/index`,
    fileURLToPath(new URL(`./src/components/${componentName}/index.ts`, import.meta.url)),
  ]),
)

const granularityComposableEntries = Object.fromEntries(
  readdirSync(fileURLToPath(new URL('./src/composables', import.meta.url)), { withFileTypes: true })
    .filter(entry => (
      entry.isFile()
      && entry.name.endsWith('.ts')
      && !entry.name.endsWith('.d.ts')
      && entry.name !== 'index.ts'
      && !entry.name.endsWith('.test.ts')
      && !entry.name.endsWith('.spec.ts')
    ))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(entry => [
      `composables/${entry.name.slice(0, -'.ts'.length)}`,
      fileURLToPath(new URL(`./src/composables/${entry.name}`, import.meta.url)),
    ]),
)

const granularityDirectiveEntries = Object.fromEntries(
  readdirSync(fileURLToPath(new URL('./src/directives', import.meta.url)), { withFileTypes: true })
    .filter(entry => (
      entry.isFile()
      && entry.name.endsWith('.ts')
      && !entry.name.endsWith('.d.ts')
      && entry.name !== 'index.ts'
      && !entry.name.endsWith('.test.ts')
      && !entry.name.endsWith('.spec.ts')
    ))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(entry => [
      `directives/${entry.name.slice(0, -'.ts'.length)}`,
      fileURLToPath(new URL(`./src/directives/${entry.name}`, import.meta.url)),
    ]),
)

async function createGranularityCssGenerator(selection: GranularityComponentSelection = 'all') {
  const components = selection === 'all'
    ? 'all'
    : [...selection] as GranularityComponentName[]

  return createGenerator({
    presets: [
      presetMini(),
      presetGranularityNode({
        components,
        themes: granularityThemeNames,
      }),
    ],
  })
}

async function generateGranularityCss(selection: GranularityComponentSelection = 'all'): Promise<string> {
  const components = selection === 'all'
    ? 'all'
    : [...selection] as GranularityComponentName[]
  const uno = await createGranularityCssGenerator(components)
  const extracted = new Set(getGranularitySafelist(components))

  for (const sourceFile of getGranularityComponentSourceFiles(components))
    await uno.applyExtractors(readFileSync(sourceFile, 'utf8'), sourceFile, extracted)

  const { css } = await uno.generate(extracted)

  return css
}

async function generateGranularityPackageCss(
  selection: GranularityComponentSelection = 'all',
): Promise<string> {
  return generateGranularityCss(selection)
}

async function generateGranularityFoundationLayerCss(): Promise<string> {
  const uno = await createGranularityCssGenerator([])
  const { css } = await uno.generate(new Set())

  return css
}

export default defineConfig({
  plugins: [
    vue(),
    Icons({
      compiler: 'vue3',
      autoInstall: false,
    }),
    UnoCSS({
      configFile: false,
    }),
    {
      name: 'granularity:emit-extra-css-assets',
      apply: 'build',
      async generateBundle() {
        const granularityFoundationLayerCss = await generateGranularityFoundationLayerCss()

        this.emitFile({
          type: 'asset',
          fileName: 'styles/base.css',
          source: readFileSync(fileURLToPath(new URL('./src/styles/base.css', import.meta.url)), 'utf8'),
        })

        this.emitFile({
          type: 'asset',
          fileName: 'styles/tokens.css',
          source: readFileSync(fileURLToPath(new URL('./src/styles/tokens.css', import.meta.url)), 'utf8'),
        })

        this.emitFile({
          type: 'asset',
          fileName: 'styles/themes/light.css',
          source: readFileSync(fileURLToPath(new URL('./src/styles/themes/light.css', import.meta.url)), 'utf8'),
        })

        this.emitFile({
          type: 'asset',
          fileName: 'styles/themes/dark.css',
          source: readFileSync(fileURLToPath(new URL('./src/styles/themes/dark.css', import.meta.url)), 'utf8'),
        })

        this.emitFile({
          type: 'asset',
          fileName: GRANULARITY_FOUNDATION_FILE_NAME,
          source: granularityFoundationLayerCss,
        })

        for (const styleAsset of granularityStyleAssets) {
          this.emitFile({
            type: 'asset',
            fileName: styleAsset.fileName,
            source: await generateGranularityPackageCss(styleAsset.components),
          })
        }

        for (const componentConfig of Object.values(granularityComponentConfigs)) {
          componentConfig.cssFiles.forEach((fileUrl, index) => {
            this.emitFile({
              type: 'asset',
              fileName: componentConfig.cssFileAssetNames[index],
              source: readFileSync(fileURLToPath(fileUrl), 'utf8'),
            })
          })
        }

        this.emitFile({
          type: 'asset',
          fileName: 'package.json',
          source: `${JSON.stringify(getDistPackageJson(), null, 2)}\n`,
        })
      },
    },
    {
      name: 'granularity:strip-test-artifacts',
      apply: 'build',
      generateBundle(_, bundle) {
        for (const fileName of Object.keys(bundle)) {
          if (isTestArtifactPath(fileName))
            delete bundle[fileName]
        }
      },
    },
  ],
  build: {
    target: 'esnext',
    reportCompressedSize: true,
    minify: 'oxc',
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        ...granularityComposableEntries,
        ...granularityDirectiveEntries,
        directives: fileURLToPath(new URL('./src/directives/index.ts', import.meta.url)),
        fileValidation: fileURLToPath(new URL('./src/fileValidation/index.ts', import.meta.url)),
        i18n: fileURLToPath(new URL('./src/i18n/index.ts', import.meta.url)),
        vue: fileURLToPath(new URL('./src/vue/index.ts', import.meta.url)),
        uno: fileURLToPath(new URL('./src/unocss/preset.ts', import.meta.url)),
        'uno-node': fileURLToPath(new URL('./src/unocss/preset.node.ts', import.meta.url)),
        ...granularityComponentEntries,
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: [
        'node:buffer',
        'node:fs/promises',
        'node:path',
        'node:url',
        'vue',
      ],
      output: {
        chunkFileNames: granularityInternalChunkFileName,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css'))
            return 'assets/[name]-[hash][extname]'

          return assetInfo.name ?? '[name][extname]'
        },
      },
    },
  },
})