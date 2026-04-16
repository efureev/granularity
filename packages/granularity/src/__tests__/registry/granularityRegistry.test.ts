import { describe, expect, it } from 'vitest'

import {
  granularityComponentContracts,
  granularityComponentCssContracts,
  granularityStyleAssetContracts,
} from '../helpers/granularityComponentContracts'
import { getGranularityComponentCssUrls } from '../../registry/componentCss'
import { getGranularityComponentCssFiles } from '../../registry/componentCss.node'
import { granularityComponentConfigs, granularityComponents } from '../../registry/components'
import { granularityStyleAssets } from '../../registry/safelist'

describe('granularity registry contracts', () => {
  it('строит реестры из pure component config contracts', () => {
    const contractNames = granularityComponentContracts.map(({ name }) => name)

    expect(Object.keys(granularityComponentConfigs)).toEqual(contractNames)
    expect(Object.keys(granularityComponents)).toEqual(contractNames)

    for (const { name, config } of granularityComponentContracts) {
      expect(granularityComponentConfigs[name]).toEqual(config)
      expect(granularityComponents[name]).toEqual(config.safelist)
    }
  })

  it('сохраняет granular component contract для dependencies, safelist и css', () => {
    for (const { name, config, safelist, dependencies } of granularityComponentContracts) {
      expect(config.name).toBe(name)
      expect(config.safelist).toEqual(safelist)
      expect(config.dependencies).toEqual(dependencies)

      const cssContract = granularityComponentCssContracts[name]

      if (!cssContract) {
        expect(config.cssFiles).toEqual([])
        expect(config.cssFileAssetNames).toEqual([])
      }
      else {
        expect(config.cssFiles).toHaveLength(cssContract.files.length)

        for (const [index, file] of cssContract.files.entries()) {
          if (file.mustBeFileUrl)
            expect(config.cssFiles[index]).toMatch(/^file:\/\//)

          expect(config.cssFiles[index]).toMatch(file.pattern)
        }

        expect(config.cssFileAssetNames).toEqual(cssContract.assetNames)
      }

      expect(config.styleAssetFileName).toBe(`components/${name}/styles.css`)
    }
  })

  it('строит component css urls и style assets из component contracts', async () => {
    expect(getGranularityComponentCssUrls(['DsButton'])).toEqual(granularityComponentConfigs.DsButton.cssFiles)
    await expect(getGranularityComponentCssFiles(['DsButton'])).resolves.toEqual([
      expect.stringMatching(/packages\/granularity\/src\/components\/DsButton\/tokens\.css$/),
    ])
    expect(getGranularityComponentCssUrls(['DsIcon'])).toEqual(granularityComponentConfigs.DsIcon.cssFiles)
    await expect(getGranularityComponentCssFiles(['DsIcon'])).resolves.toEqual([
      expect.stringMatching(/packages\/granularity\/src\/components\/DsIcon\/tokens\.css$/),
      expect.stringMatching(/packages\/granularity\/src\/components\/DsIcon\/styles\.css$/),
    ])
    expect(granularityStyleAssets).toEqual(granularityStyleAssetContracts)
  })
})