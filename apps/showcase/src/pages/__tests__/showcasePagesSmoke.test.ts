import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { describe, expect, it } from 'vitest'

import { showcaseChildRoutes } from '../../app/routeDefinitions'

const docPageSource = readFileSync(
  fileURLToPath(new URL('../../components/doc/DocPage.vue', import.meta.url)),
  'utf8',
)

const componentDetailPageSource = readFileSync(
  fileURLToPath(new URL('../ComponentDetailPage.vue', import.meta.url)),
  'utf8',
)

const componentsPageSource = readFileSync(
  fileURLToPath(new URL('../ComponentsPage.vue', import.meta.url)),
  'utf8',
)

const packageEntityDetailPageSource = readFileSync(
  fileURLToPath(new URL('../PackageEntityDetailPage.vue', import.meta.url)),
  'utf8',
)

const exampleCardSource = readFileSync(
  fileURLToPath(new URL('../../components/doc/ExampleCard.vue', import.meta.url)),
  'utf8',
)

const codeBlockSource = readFileSync(
  fileURLToPath(new URL('../../components/doc/CodeBlock.vue', import.meta.url)),
  'utf8',
)

describe('showcase page smoke coverage', () => {
  it('держит ключевые overview/catalog/detail routes для всех основных разделов витрины', () => {
    expect(showcaseChildRoutes.map(route => route.path)).toEqual(expect.arrayContaining([
      '',
      'foundations',
      'components',
      'components/:componentSlug',
      'directives',
      'directives/:entitySlug',
      'composables',
      'composables/:entitySlug',
      'utilities',
      'utilities/:entitySlug',
    ]))
  })

  it('рендерит ключевые doc primitives для component detail и сохраняет empty-state fallback', () => {
    expect(componentDetailPageSource).toContain('import ExampleCard from')
    expect(componentDetailPageSource).toContain('import PropsTable from')
    expect(componentDetailPageSource).toContain('import SlotsTable from')
    expect(componentDetailPageSource).toContain('import EventsTable from')
    expect(componentDetailPageSource).toContain('import MethodsTable from')
    expect(componentDetailPageSource).toContain("t('showcase.detailPage.notFoundComponent.action')")
    expect(componentDetailPageSource).toContain("t('showcase.detailPage.notFoundComponent.title')")
    expect(componentDetailPageSource).not.toContain('v-for="tag in componentEntity.tags"')
    expect(componentDetailPageSource).not.toContain('Component overview')
    expect(componentDetailPageSource).not.toContain('EntityActionBar')
  })

  it('делает основные doc-секции full-width и не рендерит отдельный Usage-блок на страницах компонентов', () => {
    expect(componentDetailPageSource).not.toContain('xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]')
    expect(componentDetailPageSource).toContain('<section id="integration-notes" class="scroll-mt-28 space-y-4">')
    expect(componentDetailPageSource).not.toContain('<section id="usage" class="scroll-mt-28 space-y-4">')

    expect(docPageSource).not.toContain('xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]')
    expect(docPageSource).not.toContain('<section v-if="usageCode" id="usage" class="space-y-4">')
    expect(docPageSource).toContain('<section class="space-y-4">')

    expect(exampleCardSource).toContain('class="showcase-panel min-w-0 rounded-3xl border p-6"')
    expect(codeBlockSource).toContain('class="showcase-code-surface min-w-0 max-w-full overflow-hidden rounded-3xl border"')
    expect(codeBlockSource).toContain('<pre class="max-w-full overflow-x-auto px-4 py-4 text-sm leading-6"><code>{{ code }}</code></pre>')
  })

  it('рендерит package-level api и сохраняет fallback для missing entity', () => {
    expect(packageEntityDetailPageSource).toContain('import ApiTable from')
    expect(packageEntityDetailPageSource).toContain('import ExampleCard from')
    expect(packageEntityDetailPageSource).not.toContain('EntityActionBar')
    expect(packageEntityDetailPageSource).not.toContain("t('showcase.detailPage.info.relatedLinksTitle')")
    expect(packageEntityDetailPageSource).toContain("t('showcase.detailPage.notFoundEntity.title')")
    expect(packageEntityDetailPageSource).toContain("t('showcase.detailPage.backTo', { target: page.shortTitle.toLowerCase() })")
  })

  it('не использует tag-based metadata в component catalog page', () => {
    expect(componentsPageSource).not.toContain("entity.tags.join(' ')")
    expect(componentsPageSource).not.toContain("component.tags.includes('featured')")
    expect(componentsPageSource).not.toContain('featuredComponents')
    expect(componentsPageSource).toContain('componentsWithExamples')
  })
})