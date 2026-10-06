import { expect, test } from '@playwright/test'

import { companionComponentNames, companionPath, componentNames, componentPath } from './components'

/**
 * Лист компонента не проигрывает утилите молча.
 *
 * granum кладёт CSS компонента в слой `granum.components`, а утилиты — в
 * `granum.utilities`. Более поздний слой побеждает при любой специфичности:
 * правило из `<style>` компонента, которое спорит с утилитой на том же элементе
 * и том же свойстве, не действует никогда, сколько бы классов ни стояло в его
 * селекторе. До 1.0 лист жил вне слоёв и такие споры выигрывал, поэтому после
 * переезда они стали тихими поломками: внутренние углы `GrButtonGroup`
 * скруглились, заливка поверх градиента `GrColorPicker`, отключённые кнопки
 * `GrTransfer` с видом активных.
 *
 * Здесь спор ищется прямо: для каждого элемента страницы — правило листа и
 * утилита, задающие одно свойство разными значениями. Совпавшие значения спором
 * не считаются. Состояния (`:hover`, `:focus`) статически не проверить, и они
 * пропускаются.
 */

/** Споры, где утилита побеждает по замыслу. Причина — обязательна. */
const INTENDED: { selector: string, property: RegExp, reason: string }[] = [
  {
    selector: '[data-gr-timeline-marker]',
    property: /^border-(top|right|bottom|left)-color$/,
    reason: 'прозрачная рамка — умолчание для `filled`; цвет кольца `outlined` задают утилиты тона',
  },
]

const pages = [
  ...componentNames.map(name => ({ name, path: componentPath(name) })),
  ...companionComponentNames.map(name => ({ name, path: companionPath(name) })),
]

for (const { name, path } of pages) {
  test(`${name}: лист компонента не спорит с утилитами`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')

    const conflicts = await page.evaluate(() => {
      const LOGICAL: Record<string, string> = {
        'border-start-start-radius': 'border-top-left-radius',
        'border-start-end-radius': 'border-top-right-radius',
        'border-end-start-radius': 'border-bottom-left-radius',
        'border-end-end-radius': 'border-bottom-right-radius',
        'margin-inline-start': 'margin-left',
        'margin-inline-end': 'margin-right',
        'margin-block-start': 'margin-top',
        'margin-block-end': 'margin-bottom',
        'padding-inline-start': 'padding-left',
        'padding-inline-end': 'padding-right',
        'padding-block-start': 'padding-top',
        'padding-block-end': 'padding-bottom',
        'inset-inline-start': 'left',
        'inset-inline-end': 'right',
        'inset-block-start': 'top',
        'inset-block-end': 'bottom',
        'inline-size': 'width',
        'block-size': 'height',
      }
      const STATE = /:(?:hover|focus|active|checked|disabled|invalid|placeholder-shown)/
      const norm = (property: string) => LOGICAL[property] ?? property

      interface Rule { selector: string, style: CSSStyleDeclaration, props: string[] }
      const own: Rule[] = []
      const utilities: Rule[] = []

      const walk = (rules: CSSRuleList, layer: string): void => {
        for (const rule of rules) {
          if (rule instanceof CSSLayerBlockRule) {
            walk(rule.cssRules, layer ? `${layer}.${rule.name}` : rule.name)
            continue
          }
          if (rule instanceof CSSStyleRule) {
            if (!STATE.test(rule.selectorText)) {
              const entry = { selector: rule.selectorText, style: rule.style, props: [...rule.style].map(norm) }
              if (layer.endsWith('granum.components'))
                own.push(entry)
              else if (layer.endsWith('granum.utilities'))
                utilities.push(entry)
            }
            continue
          }
          if ('cssRules' in rule && (rule as CSSGroupingRule).cssRules)
            walk((rule as CSSGroupingRule).cssRules, layer)
        }
      }
      for (const sheet of document.styleSheets) {
        try {
          walk(sheet.cssRules, '')
        }
        catch {}
      }

      const value = (rule: Rule, property: string) => {
        const raw = [...rule.style].find(name => norm(name) === property) ?? property
        return rule.style.getPropertyValue(raw).trim()
      }

      const found = new Set<string>()
      for (const rule of own) {
        let elements: Element[]
        try {
          elements = [...document.querySelectorAll(rule.selector)].slice(0, 40)
        }
        catch {
          continue
        }
        for (const element of elements) {
          for (const utility of utilities) {
            let matches = false
            try {
              matches = element.matches(utility.selector)
            }
            catch {}
            if (!matches)
              continue
            for (const property of rule.props) {
              if (!utility.props.includes(property))
                continue
              const mine = value(rule, property)
              const theirs = value(utility, property)
              if (mine !== theirs)
                found.add(JSON.stringify({ selector: rule.selector, property, mine, theirs, utility: utility.selector }))
            }
          }
        }
      }
      return [...found].map(entry => JSON.parse(entry) as { selector: string, property: string, mine: string, theirs: string, utility: string })
    })

    const unexpected = conflicts
      .filter(c => !INTENDED.some(allow => c.selector.includes(allow.selector) && allow.property.test(c.property)))
      .map(c => `${c.property}: «${c.mine}» в ${c.selector} перебит «${c.theirs}» утилиты ${c.utility}`)

    expect(unexpected).toEqual([])
  })
}

/*
 * Прицельные замеры тех мест, где лист компонента проигрывал. Общий тест выше
 * ловит сам спор; эти — что выбранное вместо него решение действительно рисует.
 */
test.describe('состояния, которые лист раньше проигрывал утилитам', () => {
  test('GrColorPicker: заливки у канала не видно, шкала — сама дорожка', async ({ page }) => {
    await page.goto(componentPath('GrColorPicker'))
    const fill = page.locator('[data-gr-color-picker-channel] [data-gr-slider-fill]').first()
    await fill.waitFor({ state: 'attached' })
    expect(await fill.evaluate(el => getComputedStyle(el).visibility)).toBe('hidden')

    // Градиент дорожки виден: рельс поверх неё прозрачен.
    const track = page.locator('[data-gr-color-picker-channel="hue"] [data-gr-slider-track]').first()
    const surface = await track.evaluate((el) => {
      const rail = el.firstElementChild as HTMLElement
      return { gradient: getComputedStyle(el).backgroundImage, rail: getComputedStyle(rail).backgroundColor }
    })
    expect(surface.gradient).toContain('linear-gradient')
    expect(surface.rail).toBe('rgba(0, 0, 0, 0)')
  })

  test('GrProgressBar: под reduce неопределённая полоса нейтральна, а не цвета тона', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(componentPath('GrProgressBar'))
    const fill = page.locator('[data-gr-progress-bar-indeterminate] [data-gr-progress-bar-fill]').first()
    await fill.waitFor({ state: 'attached' })
    const { fill: color, expected } = await fill.evaluate((el) => {
      const probe = document.createElement('span')
      probe.style.color = 'var(--gr-progress-indeterminate-bg, var(--gr-muted-fg))'
      el.appendChild(probe)
      const expected = getComputedStyle(probe).color
      probe.remove()
      return { fill: getComputedStyle(el).backgroundColor, expected }
    })
    expect(color).toBe(expected)
  })

  test('GrTransfer: перенос, которому некуда ехать, выглядит недоступным и остаётся в фокусе', async ({ page }) => {
    await page.goto(componentPath('GrTransfer'))
    const inert = page.locator('[data-gr-transfer] [data-gr-transfer-to-target][aria-disabled="true"], [data-gr-transfer] [data-gr-transfer-to-source][aria-disabled="true"]').first()
    await inert.waitFor({ state: 'attached' })
    const state = await inert.evaluate((el) => {
      const probe = document.createElement('span')
      probe.style.backgroundColor = 'var(--gr-button-disabled-bg)'
      document.body.appendChild(probe)
      const expected = getComputedStyle(probe).backgroundColor
      probe.remove()
      return { bg: getComputedStyle(el).backgroundColor, expected, disabled: (el as HTMLButtonElement).disabled }
    })
    expect(state.bg).toBe(state.expected)
    expect(state.disabled).toBe(false)
  })

  test('GrTree: цвет текущей строки сильнее цвета из `rowClass`', async ({ page }) => {
    await page.goto(componentPath('GrTree'))
    const row = page.locator('[data-gr-tree-row][data-current]').first()
    await row.waitFor({ state: 'attached' })
    const state = await row.evaluate((el) => {
      const probe = document.createElement('span')
      probe.style.color = 'var(--gr-tree-row-current-color)'
      el.appendChild(probe)
      const expected = getComputedStyle(probe).color
      probe.remove()
      return { color: getComputedStyle(el).color, expected }
    })
    expect(state.color).toBe(state.expected)
  })
})
