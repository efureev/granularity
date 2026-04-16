import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { createGenerator } from '@unocss/core'
import { presetMini } from 'unocss'
import { describe, expect, it } from 'vitest'

import { dsButtonSafelist } from '../components/DsButton/safelist'
import { dsCardSafelist } from '../components/DsCard/safelist'
import { dsCollapseSafelist } from '../components/DsCollapse/safelist'
import { dsConfirmDialogSafelist } from '../components/DsConfirmDialog/safelist'
import { dsDataTableSafelist } from '../components/DsDataTable/safelist'
import { dsDropdownSafelist } from '../components/DsDropdown/safelist'
import { dsDialogSafelist } from '../components/DsDialog/dsDialogStyles'
import { dsFormFileSafelist } from '../components/DsFormFile/safelist'
import { dsFormFieldSafelist } from '../components/DsFormField/dsFormFieldStyles'
import { dsFormSectionSafelist } from '../components/DsFormSection/safelist'
import { dsIconConfig } from '../components/DsIcon/config'
import { dsImageViewerSafelist } from '../components/DsImageViewer/safelist'
import { dsInputSafelist } from '../components/DsInput/dsInputStyles'
import { dsListSafelist } from '../components/DsList/safelist'
import { dsModalSafelist } from '../components/DsModal/safelist'
import { dsNavbarSafelist } from '../components/DsNavbar/safelist'
import { dsPaginationSafelist } from '../components/DsPagination/safelist'
import { dsPromptDialogSafelist } from '../components/DsPromptDialog/safelist'
import { dsSelectSafelist } from '../components/DsSelect/safelist'
import { dsSidebarSafelist } from '../components/DsSidebar/safelist'
import { dsSwitchSafelist } from '../components/DsSwitch/safelist'
import { dsTableSafelist } from '../components/DsTable/safelist'
import { dsTabsSafelist } from '../components/DsTabs/safelist'
import { dsToasterSafelist } from '../components/DsToaster/safelist'
import { dsTooltipSafelist } from '../components/DsTooltip/safelist'
import { dsTreeSafelist } from '../components/DsTree/safelist'
import { dsTreeSelectSafelist } from '../components/DsTreeSelect/safelist'
import { normalizeCss } from './helpers/granularityTestUtils'
import { getGranularityComponentCssUrls } from '../registry/componentCss'
import { getGranularityComponentCss } from '../registry/componentCss.node'
import { resolveGranularityComponentNames } from '../registry/components'
import { granularityThemeNames } from '../theming/themeRegistry'
import { getGranularitySafelist, presetGranularity } from '../unocss/preset'
import { presetGranularityNode, resolvePresetGranularityNodePreflights } from '../unocss/preset.node'

function uniqueTokens(tokens: readonly string[]): string[] {
  return [...new Set(tokens)]
}

describe('granularity preset integration', () => {
  it('рекурсивно интегрирует granular dependencies для safelist и component css', async () => {
    expect(resolveGranularityComponentNames(['DsSelect'])).toEqual(['DsInput', 'DsSelect'])
    expect(resolveGranularityComponentNames(['DsDialog'])).toEqual(['DsButton', 'DsModal', 'DsDialog'])
    expect(resolveGranularityComponentNames(['DsCollapse'])).toEqual(['DsCard', 'DsCollapse'])
    expect(resolveGranularityComponentNames(['DsConfirmDialog'])).toEqual(['DsButton', 'DsModal', 'DsDialog', 'DsConfirmDialog'])
    expect(resolveGranularityComponentNames(['DsDataTable'])).toEqual(['DsTable', 'DsDataTable'])
    expect(resolveGranularityComponentNames(['DsDropdown'])).toEqual(['DsDropdown'])
    expect(resolveGranularityComponentNames(['DsList'])).toEqual(['DsCard', 'DsList'])
    expect(resolveGranularityComponentNames(['DsNavbar'])).toEqual(['DsButton', 'DsNavbar'])
    expect(resolveGranularityComponentNames(['DsPagination'])).toEqual(['DsButton', 'DsInput', 'DsSelect', 'DsPagination'])
    expect(resolveGranularityComponentNames(['DsPromptDialog'])).toEqual([
      'DsButton',
      'DsModal',
      'DsDialog',
      'DsFormField',
      'DsInput',
      'DsPromptDialog',
    ])
    expect(resolveGranularityComponentNames(['DsSwitch'])).toEqual(['DsSwitch'])
    expect(resolveGranularityComponentNames(['DsTable'])).toEqual(['DsTable'])
    expect(resolveGranularityComponentNames(['DsTabs'])).toEqual(['DsTabs'])
    expect(resolveGranularityComponentNames(['DsToaster'])).toEqual(['DsButton', 'DsToaster'])
    expect(resolveGranularityComponentNames(['DsTree'])).toEqual(['DsTree'])
    expect(resolveGranularityComponentNames(['DsTooltip'])).toEqual(['DsTooltip'])
    expect(resolveGranularityComponentNames(['DsTreeSelect'])).toEqual(['DsInput', 'DsTree', 'DsTreeSelect'])
    expect(resolveGranularityComponentNames(['DsFormFile'])).toEqual(['DsButton', 'DsFormFile'])
    expect(resolveGranularityComponentNames(['DsFormSection'])).toEqual(['DsFormSection'])
    expect(resolveGranularityComponentNames(['DsImageViewer'])).toEqual(['DsImageViewer'])

    expect(getGranularitySafelist(['DsSelect'])).toEqual(uniqueTokens([
      ...dsInputSafelist,
      ...dsSelectSafelist,
    ]))
    expect(getGranularitySafelist(['DsDialog'])).toEqual(uniqueTokens([
      ...dsButtonSafelist,
      ...dsModalSafelist,
      ...dsDialogSafelist,
    ]))
    expect(getGranularitySafelist(['DsCollapse'])).toEqual(uniqueTokens([
      ...dsCardSafelist,
      ...dsCollapseSafelist,
    ]))
    expect(getGranularitySafelist(['DsConfirmDialog'])).toEqual(uniqueTokens([
      ...dsButtonSafelist,
      ...dsModalSafelist,
      ...dsDialogSafelist,
      ...dsConfirmDialogSafelist,
    ]))
    expect(getGranularitySafelist(['DsDataTable'])).toEqual(uniqueTokens([
      ...dsTableSafelist,
      ...dsDataTableSafelist,
    ]))
    expect(getGranularitySafelist(['DsDropdown'])).toEqual(uniqueTokens(dsDropdownSafelist))
    expect(getGranularitySafelist(['DsList'])).toEqual(uniqueTokens([
      ...dsCardSafelist,
      ...dsListSafelist,
    ]))
    expect(getGranularitySafelist(['DsNavbar'])).toEqual(uniqueTokens([
      ...dsButtonSafelist,
      ...dsNavbarSafelist,
    ]))
    expect(getGranularitySafelist(['DsPagination'])).toEqual(uniqueTokens([
      ...dsButtonSafelist,
      ...dsInputSafelist,
      ...dsSelectSafelist,
      ...dsPaginationSafelist,
    ]))
    expect(getGranularitySafelist(['DsPromptDialog'])).toEqual(uniqueTokens([
      ...dsButtonSafelist,
      ...dsModalSafelist,
      ...dsDialogSafelist,
      ...dsFormFieldSafelist,
      ...dsInputSafelist,
      ...dsPromptDialogSafelist,
    ]))
    expect(getGranularitySafelist(['DsSwitch'])).toEqual(uniqueTokens(dsSwitchSafelist))
    expect(getGranularitySafelist(['DsTable'])).toEqual(uniqueTokens(dsTableSafelist))
    expect(getGranularitySafelist(['DsTabs'])).toEqual(uniqueTokens(dsTabsSafelist))
    expect(getGranularitySafelist(['DsToaster'])).toEqual(uniqueTokens([
      ...dsButtonSafelist,
      ...dsToasterSafelist,
    ]))
    expect(getGranularitySafelist(['DsTree'])).toEqual(uniqueTokens(dsTreeSafelist))
    expect(getGranularitySafelist(['DsTooltip'])).toEqual(uniqueTokens(dsTooltipSafelist))
    expect(getGranularitySafelist(['DsTreeSelect'])).toEqual(uniqueTokens([
      ...dsInputSafelist,
      ...dsTreeSafelist,
      ...dsTreeSelectSafelist,
    ]))
    expect(getGranularitySafelist(['DsFormFile'])).toEqual(uniqueTokens([
      ...dsButtonSafelist,
      ...dsFormFileSafelist,
    ]))
    expect(getGranularitySafelist(['DsFormSection'])).toEqual(uniqueTokens(dsFormSectionSafelist))
    expect(getGranularitySafelist(['DsImageViewer'])).toEqual(uniqueTokens(dsImageViewerSafelist))
    expect(getGranularitySafelist(['DsSidebar'])).toEqual(uniqueTokens(dsSidebarSafelist))

    expect(getGranularityComponentCssUrls(['DsSelect'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsCollapse'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsConfirmDialog'])).toEqual(dsButtonSafelist.length > 0 ? getGranularityComponentCssUrls(['DsButton']) : [])
    expect(getGranularityComponentCssUrls(['DsDataTable'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsDropdown'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsList'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsNavbar'])).toEqual(getGranularityComponentCssUrls(['DsButton']))
    expect(getGranularityComponentCssUrls(['DsPagination'])).toEqual(getGranularityComponentCssUrls(['DsButton']))
    expect(getGranularityComponentCssUrls(['DsPromptDialog'])).toEqual(getGranularityComponentCssUrls(['DsButton']))
    expect(getGranularityComponentCssUrls(['DsSwitch'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsToaster'])).toEqual(getGranularityComponentCssUrls(['DsButton']))
    expect(getGranularityComponentCssUrls(['DsTabs'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsTree'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsTooltip'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsTreeSelect'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsFormFile'])).toEqual(getGranularityComponentCssUrls(['DsButton']))
    expect(getGranularityComponentCssUrls(['DsFormSection'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsImageViewer'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsSidebar'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsTable'])).toEqual([])
    expect(getGranularityComponentCssUrls(['DsIcon'])).toEqual(dsIconConfig.cssFiles)
    expect(getGranularityComponentCssUrls(['DsIcon', 'DsPromptDialog'])).toEqual([
      ...dsIconConfig.cssFiles,
      ...getGranularityComponentCssUrls(['DsButton']),
    ])

    await expect(getGranularityComponentCss(['DsIcon', 'DsPromptDialog'])).resolves.toContain('--ds-icon-size: 18px;')
  })

  it('генерирует browser-safe css без node-only preflights по умолчанию', async () => {
    const safelist = getGranularitySafelist(['DsButton'])
    const uno = await createGenerator({
      presets: [presetMini(), presetGranularity({ components: ['DsButton'] })],
    })

    const { css } = await uno.generate(safelist.join(' '))
    const normalizedCss = normalizeCss(css)

    expect(css).toContain('.bg-\\[var\\(--ds-button-primary-bg\\,var\\(--primary\\)\\)\\]')
    expect(css).toContain('.focus-visible\\:ring-\\[var\\(--ring\\)\\]')
    expect(css).toContain('.animate-spin')
    expect(css).toContain('@keyframes granularity-spin')
    expect(normalizedCss).toContain('background-color:transparent')
    expect(normalizedCss).toContain('border-color:transparent')
    expect(normalizedCss).not.toContain('--ds-space-4:16px')
    expect(normalizedCss).not.toContain('--primary:#4f46e5')
  })

  it('публикует DsButton semantic tone utilities и локальные button tokens', async () => {
    const safelist = getGranularitySafelist(['DsButton'])
    const generator = await createGenerator({
      presets: [presetMini(), presetGranularity({ components: ['DsButton'] })],
    })

    expect(safelist).toContain('bg-[var(--ds-button-success-bg,var(--ds-success))]')
    expect(safelist).toContain('hover:bg-[var(--ds-button-success-bg-hover,var(--ds-success-hover))]')
    expect(safelist).toContain('hover:active:bg-[var(--ds-button-success-bg-active,var(--ds-success-active))]')
    expect(safelist).toContain('text-[var(--ds-button-success-fg,var(--ds-success-fg,var(--fg)))]')
    expect(safelist).toContain('hover:bg-[var(--ds-button-success-soft-bg-hover)]')
    expect(safelist).toContain('hover:active:bg-[var(--ds-button-success-soft-bg-active)]')
    expect(safelist).toContain('bg-[var(--ds-button-warning-bg,var(--ds-warning))]')
    expect(safelist).toContain('text-[var(--ds-button-warning-fg,var(--ds-warning-fg,var(--fg)))]')
    expect(safelist).toContain('bg-[var(--ds-button-slate-bg,var(--ds-slate))]')
    expect(safelist).toContain('text-[var(--ds-button-slate-fg,var(--ds-slate-fg,var(--fg)))]')
    expect(safelist).toContain('bg-[var(--ds-button-azure-bg,var(--ds-azure))]')
    expect(safelist).toContain('hover:active:bg-[var(--ds-button-azure-soft-bg-active)]')

    const generatedCss = normalizeCss((await generator.generate(safelist.join(' '))).css)
    const dsButtonComponentCss = normalizeCss(await getGranularityComponentCss(['DsButton']))

    expect(generatedCss).toContain('background-color:var(--ds-button-success-bg,var(--ds-success))')
    expect(generatedCss).toContain('background-color:var(--ds-button-success-bg-hover,var(--ds-success-hover))')
    expect(generatedCss).toContain(':active:hover{background-color:var(--ds-button-success-bg-active,var(--ds-success-active));}')
    expect(generatedCss).toContain('background-color:var(--ds-button-success-soft-bg-hover)')
    expect(generatedCss).toContain(':active:hover{background-color:var(--ds-button-success-soft-bg-active);}')
    expect(dsButtonComponentCss).toContain('--ds-button-success-bg:#047857;')
    expect(dsButtonComponentCss).toContain('--ds-button-success-bg-hover:#036c4d;')
    expect(dsButtonComponentCss).toContain('--ds-button-success-bg-active:#025f44;')
    expect(dsButtonComponentCss).toContain('--ds-button-success-fg:var(--ds-success-fg);')
    expect(dsButtonComponentCss).toContain('--ds-button-success-soft-bg-hover:color-mix(insrgb,var(--ds-success)20%,var(--bg));')
    expect(dsButtonComponentCss).toContain('--ds-button-success-soft-bg-active:color-mix(insrgb,var(--ds-success)26%,var(--bg));')
    expect(dsButtonComponentCss).toContain('--ds-button-warning-bg:#c2410c;')
    expect(dsButtonComponentCss).toContain('--ds-button-warning-bg-hover:#b53b0a;')
    expect(dsButtonComponentCss).toContain('--ds-button-warning-bg-active:#9f3307;')
    expect(dsButtonComponentCss).toContain('--ds-button-warning-fg:var(--ds-warning-fg);')
    expect(dsButtonComponentCss).toContain('--ds-button-slate-bg:var(--ds-slate);')
    expect(dsButtonComponentCss).toContain('--ds-button-slate-soft-bg-active:color-mix(insrgb,var(--ds-slate)26%,var(--bg));')
    expect(dsButtonComponentCss).toContain('--ds-button-azure-bg:#0369a1;')
    expect(dsButtonComponentCss).toContain('--ds-button-azure-bg-active:#0c4a6e;')
    expect(dsButtonComponentCss).toContain('--ds-button-azure-soft-bg-hover:color-mix(insrgb,var(--ds-azure)20%,var(--bg));')
    expect(dsButtonComponentCss).toContain('.theme-dark,')
    expect(dsButtonComponentCss).toContain('--ds-button-success-bg:#047857;')
    expect(dsButtonComponentCss).toContain('--ds-button-slate-bg:#475569;')
    expect(dsButtonComponentCss).toContain('--ds-button-azure-bg:#0369a1;')
  })

  it('подмешивает node-only preflights через uno-node preset', async () => {
    const generator = await createGenerator({
      presets: [presetMini(), presetGranularityNode({ components: ['DsIcon'] })],
    })
    const { css } = await generator.generate(getGranularitySafelist(['DsIcon']).join(' '))
    const normalizedCss = normalizeCss(css)

    expect(resolvePresetGranularityNodePreflights({ components: ['DsIcon'] })).toHaveLength(2)
    expect(normalizedCss).toContain('--ds-space-4:16px')
    expect(normalizedCss).toContain('--primary:#4f46e5')
    expect(normalizedCss).toContain('--ds-icon-size:18px')
    expect(normalizedCss).toContain(':where(.ds-icon){width:var(--ds-icon-size);min-width:var(--ds-icon-size);height:var(--ds-icon-size);line-height:0;flex:none;}')
  })

  it('собирает foundation-only и full package CSS через uno-node preset', async () => {
    const foundationStylesSource = readFileSync('src/styles/index.css', 'utf8')
    const generator = await createGenerator({
      presets: [presetMini(), presetGranularityNode({ components: 'all', themes: granularityThemeNames })],
    })
    const extracted = new Set(getGranularitySafelist('all'))

    await generator.applyExtractors(
      readFileSync(join('src', 'components', 'DsButton', 'DsButton.vue'), 'utf8'),
      join('src', 'components', 'DsButton', 'DsButton.vue'),
      extracted,
    )

    const foundationOnlyGenerator = await createGenerator({
      presets: [presetMini(), presetGranularityNode({ components: [], themes: granularityThemeNames })],
    })
    const foundationCss = normalizeCss((await foundationOnlyGenerator.generate(new Set())).css)
    const fullCss = normalizeCss((await generator.generate(extracted)).css)

    expect(foundationStylesSource).toContain("@import './tokens.css';")
    expect(foundationStylesSource).toContain("@import './themes/light.css';")
    expect(foundationStylesSource).toContain("@import './themes/dark.css';")
    expect(foundationStylesSource).toContain("@import './base.css';")
    expect(foundationCss).toContain('--ds-shadow-1:01px2pxrgba(15,23,42,0.08)')
    expect(foundationCss).toContain('--primary:#4f46e5')
    expect(fullCss).toContain('--ds-shadow-1:01px2pxrgba(15,23,42,0.08)')
    expect(fullCss).toContain("[data-theme='dark']")
    expect(fullCss).toContain('.inline-flex{display:inline-flex;}')
    expect(fullCss).toContain('[data-ds-button-group][data-ds-button]{border-radius:0!important;position:relative;}')
    expect(fullCss).toContain(':where(.ds-icon){width:var(--ds-icon-size);min-width:var(--ds-icon-size);height:var(--ds-icon-size);line-height:0;flex:none;}')
  })
})