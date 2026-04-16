import { describe, expect, it } from 'vitest'

import { dsButtonSafelist } from '../../components/DsButton/safelist'
import { dsDialogSafelist } from '../../components/DsDialog/dsDialogStyles'
import { dsFormFieldSafelist } from '../../components/DsFormField/dsFormFieldStyles'
import { dsInputSafelist } from '../../components/DsInput/dsInputStyles'
import { dsNumberInputSafelist } from '../../components/DsNumberInput/safelist'
import { dsModalSafelist } from '../../components/DsModal/safelist'
import { dsPromptDialogSafelist } from '../../components/DsPromptDialog/safelist'
import { dsSelectSafelist } from '../../components/DsSelect/safelist'
import { granularityComponents, type GranularityComponentName } from '../../registry/components'
import { getGranularitySafelist, resolvePresetGranularitySafelist } from '../../unocss/preset'

function uniqueTokens(tokens: readonly string[]): string[] {
  return [...new Set(tokens)]
}

describe('granularity safelist selection', () => {
  const leafCases: readonly {
    name: GranularityComponentName
    expected: readonly string[]
    requiredTokens: readonly string[]
  }[] = [
    {
      name: 'DsButton',
      expected: dsButtonSafelist,
      requiredTokens: [
        'bg-[var(--ds-button-primary-bg,var(--primary))]',
        'focus-visible:ring-[var(--ring)]',
        'animate-spin',
        'border-transparent',
        'hover:border-[var(--brd-hover,var(--brd))]',
        'active:border-[var(--brd-active,var(--brd))]',
      ],
    },
    {
      name: 'DsFormField',
      expected: dsFormFieldSafelist,
      requiredTokens: ['flex', 'gap-2', 'text-[var(--ds-danger)]'],
    },
    {
      name: 'DsIcon',
      expected: [],
      requiredTokens: [],
    },
    {
      name: 'DsInput',
      expected: dsInputSafelist,
      requiredTokens: ['w-full', 'focus-visible:ring-[var(--ring)]', 'text-right'],
    },
    {
      name: 'DsNumberInput',
      expected: dsNumberInputSafelist,
      requiredTokens: ['overflow-hidden', 'focus-within:ring-[var(--ring)]', 'text-center'],
    },
    {
      name: 'DsModal',
      expected: dsModalSafelist,
      requiredTokens: ['fixed', 'bg-black/40', 'max-w-[560px]', 'rounded-none', 'h-[100svh]'],
    },
  ]

  for (const { name, expected, requiredTokens } of leafCases) {
    it(`резолвит leaf safelist для ${name}`, () => {
      const safelist = resolvePresetGranularitySafelist({ components: [name] })

      expect(safelist).toEqual(expected)
      expect(safelist).toEqual(granularityComponents[name])
      expect(safelist).toEqual(getGranularitySafelist([name]))
      expect(new Set(safelist).size).toBe(safelist.length)

      for (const token of requiredTokens)
        expect(safelist).toContain(token)
    })
  }

  it('добавляет зависимости в composite safelist-ы', () => {
    const dialogSafelist = resolvePresetGranularitySafelist({ components: ['DsDialog'] })
    const promptDialogSafelist = resolvePresetGranularitySafelist({ components: ['DsPromptDialog'] })
    const selectSafelist = resolvePresetGranularitySafelist({ components: ['DsSelect'] })

    expect(dsDialogSafelist).toEqual(granularityComponents.DsDialog)
    expect(dialogSafelist).toEqual(getGranularitySafelist(['DsDialog']))
    expect(new Set(dialogSafelist).size).toBe(dialogSafelist.length)
    expect(dialogSafelist).toEqual(uniqueTokens([
      ...dsButtonSafelist,
      ...dsModalSafelist,
      ...dsDialogSafelist,
    ]))
    expect(dialogSafelist).toContain('overflow-hidden')
    expect(dialogSafelist).toContain('rounded-[inherit]')
    expect(dialogSafelist).toContain('px-5')

    expect(dsPromptDialogSafelist).toEqual(granularityComponents.DsPromptDialog)
    expect(promptDialogSafelist).toEqual(getGranularitySafelist(['DsPromptDialog']))
    expect(new Set(promptDialogSafelist).size).toBe(promptDialogSafelist.length)
    expect(promptDialogSafelist).toEqual(uniqueTokens([
      ...dsButtonSafelist,
      ...dsModalSafelist,
      ...dsDialogSafelist,
      ...dsFormFieldSafelist,
      ...dsInputSafelist,
      ...dsPromptDialogSafelist,
    ]))
    expect(promptDialogSafelist).toContain('grid')
    expect(promptDialogSafelist).toContain('gap-4')
    expect(promptDialogSafelist).toContain('justify-end')

    expect(dsSelectSafelist).toEqual(granularityComponents.DsSelect)
    expect(selectSafelist).toEqual(getGranularitySafelist(['DsSelect']))
    expect(new Set(selectSafelist).size).toBe(selectSafelist.length)
    expect(selectSafelist).toEqual(uniqueTokens([
      ...dsInputSafelist,
      ...dsSelectSafelist,
    ]))
    expect(selectSafelist).toContain('appearance-none')
    expect(selectSafelist).toContain('i-lucide-chevron-down')
    expect(selectSafelist).toContain('rounded-[10px]')
  })

  it('не меняет safelist DsPromptDialog при явном добавлении зависимых компонентов', () => {
    const promptDialogOnlySafelist = resolvePresetGranularitySafelist({ components: ['DsPromptDialog'] })
    const promptDialogWithDependenciesSafelist = resolvePresetGranularitySafelist({
      components: ['DsPromptDialog', 'DsButton', 'DsDialog', 'DsFormField', 'DsInput', 'DsModal'],
    })

    expect([...new Set(promptDialogOnlySafelist)].sort()).toEqual(
      [...new Set(promptDialogWithDependenciesSafelist)].sort(),
    )
  })
})