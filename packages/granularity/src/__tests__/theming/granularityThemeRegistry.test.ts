import { createGenerator } from '@unocss/core'
import { presetMini } from 'unocss'
import { describe, expect, it } from 'vitest'

import {
  granularityDefaultBaseCssUrl,
  granularityDefaultThemes,
  granularityThemeNames,
  granularityThemeUrls,
  resolveGranularityBuiltinThemeNames,
  resolveGranularityThemeFiles,
  resolveGranularityThemeNames,
} from '../../theming/themeRegistry'
import {
  getGranularityBaseCss,
  getGranularityThemeCss,
  getGranularityTokensCss,
  resolveGranularityBaseFile,
  resolveGranularityTokensFile,
} from '../../theming/themeRegistry.node'
import { getGranularityComponentCss } from '../../registry/componentCss.node'
import { getGranularitySafelist } from '../../unocss/preset'
import { presetGranularityNode, resolvePresetGranularityNodePreflights } from '../../unocss/preset.node'
import {
  inlineBaseCssDataUrl,
  inlineThemeCssDataUrl,
  inlineTokensCssDataUrl,
  lightAppBaseFile,
  lightAppThemeFile,
  lightAppTokensFile,
  normalizeCss,
} from '../helpers/granularityTestUtils'

describe('granularity theming and node runtime', () => {
  it('резолвит pure theme metadata без доступа к node API', () => {
    expect(granularityDefaultThemes).toEqual(['light'])
    expect(granularityThemeNames).toEqual(['light', 'dark'])
    expect(granularityDefaultBaseCssUrl).toContain('/src/styles/base.css')
    expect(granularityThemeUrls.light).toContain('/src/styles/themes/light.css')
    expect(granularityThemeUrls.dark).toContain('/src/styles/themes/dark.css')
    expect(resolveGranularityThemeNames()).toEqual(['light'])
    expect(resolveGranularityThemeNames([])).toEqual(['light'])
    expect(resolveGranularityThemeNames(['dark', 'light', 'dark'])).toEqual(['dark', 'light'])
    expect(resolveGranularityThemeFiles([lightAppThemeFile, lightAppThemeFile])).toEqual([lightAppThemeFile])
    expect(resolveGranularityBuiltinThemeNames({ themeFiles: [lightAppThemeFile] })).toEqual([])
  })

  it('собирает node-only theme и component preflights через ./uno-node', async () => {
    const iconSafelist = getGranularitySafelist(['DsIcon'])
    const buttonSafelist = getGranularitySafelist(['DsButton'])
    const [componentCss, segmentedComponentCss, buttonGenerator, iconGenerator] = await Promise.all([
      getGranularityComponentCss(['DsIcon']),
      getGranularityComponentCss(['DsSegmented']),
      createGenerator({
        presets: [presetMini(), presetGranularityNode({ components: ['DsButton'] })],
      }),
      createGenerator({
        presets: [presetMini(), presetGranularityNode({ components: ['DsIcon'] })],
      }),
    ])

    const [{ css: buttonCss }, { css: iconCss }] = await Promise.all([
      buttonGenerator.generate(buttonSafelist.join(' ')),
      iconGenerator.generate(iconSafelist.join(' ')),
    ])

    const normalizedButtonCss = normalizeCss(buttonCss)
    const normalizedIconCss = normalizeCss(iconCss)
    const normalizedComponentCss = normalizeCss(componentCss)

    expect(resolvePresetGranularityNodePreflights({ components: ['DsIcon'] })).toHaveLength(2)
    expect(buttonCss).toContain('.bg-\\[var\\(--ds-button-primary-bg\\,var\\(--primary\\)\\)\\]')
    expect(buttonCss).toContain('@keyframes granularity-spin')
    expect(normalizedButtonCss).toContain('--ds-space-4:16px')
    expect(normalizedButtonCss).toContain('--primary:#4f46e5')

    expect(iconCss).not.toContain('.inline-flex')
    expect(iconCss).not.toContain('.items-center')
    expect(iconCss).not.toContain('.justify-center')
    expect(iconCss).not.toContain('.align-middle')
    expect(normalizedComponentCss).toContain('--ds-icon-size:18px')
    expect(normalizedComponentCss).toContain(':where(.ds-icon){width:var(--ds-icon-size);min-width:var(--ds-icon-size);height:var(--ds-icon-size);line-height:0;flex:none;}')
    expect(normalizedComponentCss).toContain(':where(.ds-iconsvg){width:100%;height:100%;display:block;}')
    expect(normalizeCss(segmentedComponentCss)).toContain('--ds-segmented-indicator-highlight-shadow:0001pxrgba(248,250,252,0.08)')
    expect(normalizedIconCss).toContain('--ds-icon-size:18px')
    expect(normalizedIconCss).toContain(':where(.ds-icon){width:var(--ds-icon-size);min-width:var(--ds-icon-size);height:var(--ds-icon-size);line-height:0;flex:none;}')
    expect(normalizedIconCss).toContain(':where(.ds-iconsvg){width:100%;height:100%;display:block;}')
  })

  it('читает theme css из node-only helper-ов и поддерживает пользовательские файлы', async () => {
    expect(resolveGranularityBaseFile()).toMatch(/packages\/granularity\/src\/styles\/base\.css$/)
    expect(resolveGranularityBaseFile(lightAppBaseFile)).toMatch(/apps\/playground\/src\/styles\/base\.css$/)
    expect(resolveGranularityTokensFile()).toMatch(/packages\/granularity\/src\/styles\/tokens\.css$/)
    expect(resolveGranularityTokensFile(lightAppTokensFile)).toMatch(/apps\/playground\/src\/styles\/tokens\.css$/)

    const [defaultBaseCss, customBaseCss, defaultTokensCss, customTokensCss, darkThemeCss, combinedThemeCss] = await Promise.all([
      getGranularityBaseCss(),
      getGranularityBaseCss({ baseFile: lightAppBaseFile }),
      getGranularityTokensCss(),
      getGranularityTokensCss({ tokens: lightAppTokensFile }),
      getGranularityThemeCss({ themes: ['dark'] }),
      getGranularityThemeCss({ themes: ['dark'], themeFiles: [lightAppThemeFile] }),
    ])

    const normalizedDefaultBaseCss = normalizeCss(defaultBaseCss)
    const normalizedCustomBaseCss = normalizeCss(customBaseCss)
    const normalizedDefaultTokensCss = normalizeCss(defaultTokensCss)
    const normalizedCustomTokensCss = normalizeCss(customTokensCss)
    const normalizedDarkThemeCss = normalizeCss(darkThemeCss)
    const normalizedCombinedThemeCss = normalizeCss(combinedThemeCss)

    expect(normalizedDefaultBaseCss).not.toContain('--ds-icon-size')
    expect(normalizedDefaultBaseCss).not.toContain(':where(.ds-icon)')
    expect(normalizedCustomBaseCss).toContain('background-color:transparent')
    expect(normalizedCustomBaseCss).not.toContain('--ds-icon-size')
    expect(normalizedDefaultTokensCss).not.toContain('--ds-icon-size:18px')
    expect(normalizedDefaultTokensCss).toContain('--primary-hover:color-mix(insrgb,var(--primary)92%,var(--fg))')
    expect(normalizedDefaultTokensCss).not.toContain('--bg:')
    expect(normalizedCustomTokensCss).toContain('--ds-font-ui:InterVar,system-ui,sans-serif')
    expect(normalizedCustomTokensCss).not.toContain('--ds-icon-size:18px')
    expect(normalizedDarkThemeCss).toContain("[data-theme='dark']")
    expect(normalizedDarkThemeCss).toContain('--bg:#0f172a')
    expect(normalizedDarkThemeCss).not.toContain('--ds-segmented-indicator-highlight-shadow:0001pxrgba(248,250,252,0.08)')
    expect(normalizedDarkThemeCss).not.toContain(':root{--bg:#f8fafc')
    expect(normalizedCombinedThemeCss).toContain("[data-theme='dark']")
    expect(normalizedCombinedThemeCss).toContain('--bg:#0f172a')
    expect(normalizedCombinedThemeCss).not.toContain('--ds-segmented-indicator-highlight-shadow:0001pxrgba(248,250,252,0.08)')
    expect(normalizedCombinedThemeCss).toContain('--bg:#f8fafc')
  })

  it('читает встроенные css data url в node-only helper-ах', async () => {
    const [inlineBaseCss, inlineTokensCss, inlineThemeCss] = await Promise.all([
      getGranularityBaseCss({ baseFile: inlineBaseCssDataUrl }),
      getGranularityTokensCss({ tokens: inlineTokensCssDataUrl }),
      getGranularityThemeCss({ themes: [], themeFiles: [inlineThemeCssDataUrl] }),
    ])

    const generator = await createGenerator({
      presets: [presetMini(), presetGranularityNode({ components: ['DsButton'] })],
    })
    const { css } = await generator.generate('inline-flex')
    const normalizedCss = normalizeCss(css)

    expect(normalizeCss(inlineBaseCss)).toContain('--inline-base:1;')
    expect(normalizeCss(inlineTokensCss)).toContain('--inline-token:1;')
    expect(normalizeCss(inlineThemeCss)).toContain("[data-theme='inline']{--inline-theme:1;}")
    expect(normalizedCss).toContain('--ds-space-4:16px')
    expect(normalizedCss).toContain('--primary:#4f46e5')
  })
})