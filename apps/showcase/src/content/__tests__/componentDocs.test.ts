import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { showcaseComponentEntities } from '../../app/showcase'
import { getShowcaseComponentDoc } from '../componentDocs'

describe('component docs metadata', () => {
  it('возвращает ready-сценарии для `GrButton` вместе с preview keys и snippets', () => {
    const buttonEntity = showcaseComponentEntities.find(entity => entity.name === 'GrButton')

    expect(buttonEntity).toBeDefined()

    const doc = getShowcaseComponentDoc(buttonEntity!)

    expect(doc.sections.map(section => section.id)).toEqual([
      'overview',
      'live-examples',
      'api',
      'integration-notes',
    ])
    expect(doc.examples).toHaveLength(2)
    expect(doc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(doc.examples.every(example => example.previewKey?.startsWith('ds-button'))).toBe(true)
  })

  it('возвращает live-scenarios для `GrSelect` и `GrFileUpload`, а не fallback metadata', () => {
    const selectEntity = showcaseComponentEntities.find(entity => entity.name === 'GrSelect')
    const fileUploadEntity = showcaseComponentEntities.find(entity => entity.name === 'GrFileUpload')

    expect(selectEntity).toBeDefined()
    expect(fileUploadEntity).toBeDefined()

    const selectDoc = getShowcaseComponentDoc(selectEntity!)
    const fileUploadDoc = getShowcaseComponentDoc(fileUploadEntity!)

    expect(selectDoc.examples).toHaveLength(3)
    expect(selectDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(selectDoc.examples.every(example => example.previewKey?.startsWith('ds-select'))).toBe(true)

    expect(fileUploadDoc.examples).toHaveLength(3)
    expect(fileUploadDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(fileUploadDoc.examples.every(example => example.previewKey?.startsWith('ds-file-upload'))).toBe(true)
  })

  it('возвращает live-scenarios для complex-компонентов `GrModal`, `GrDropdown` и `GrDataTable`', () => {
    const modalEntity = showcaseComponentEntities.find(entity => entity.name === 'GrModal')
    const dropdownEntity = showcaseComponentEntities.find(entity => entity.name === 'GrDropdown')
    const dataTableEntity = showcaseComponentEntities.find(entity => entity.name === 'GrDataTable')

    expect(modalEntity).toBeDefined()
    expect(dropdownEntity).toBeDefined()
    expect(dataTableEntity).toBeDefined()

    const modalDoc = getShowcaseComponentDoc(modalEntity!)
    const dropdownDoc = getShowcaseComponentDoc(dropdownEntity!)
    const dataTableDoc = getShowcaseComponentDoc(dataTableEntity!)

    expect(modalDoc.examples).toHaveLength(3)
    expect(modalDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(modalDoc.examples.every(example => example.previewKey?.startsWith('ds-modal'))).toBe(true)

    expect(dropdownDoc.examples).toHaveLength(3)
    expect(dropdownDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(dropdownDoc.examples.every(example => example.previewKey?.startsWith('ds-dropdown'))).toBe(true)

    expect(dataTableDoc.examples).toHaveLength(3)
    expect(dataTableDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(dataTableDoc.examples.every(example => example.previewKey?.startsWith('ds-data-table'))).toBe(true)
  })

  it('возвращает live-scenarios для `GrPagination`, `GrTabs` и `GrTooltip`', () => {
    const paginationEntity = showcaseComponentEntities.find(entity => entity.name === 'GrPagination')
    const tabsEntity = showcaseComponentEntities.find(entity => entity.name === 'GrTabs')
    const tooltipEntity = showcaseComponentEntities.find(entity => entity.name === 'GrTooltip')

    expect(paginationEntity).toBeDefined()
    expect(tabsEntity).toBeDefined()
    expect(tooltipEntity).toBeDefined()

    const paginationDoc = getShowcaseComponentDoc(paginationEntity!)
    const tabsDoc = getShowcaseComponentDoc(tabsEntity!)
    const tooltipDoc = getShowcaseComponentDoc(tooltipEntity!)

    expect(paginationDoc.examples).toHaveLength(3)
    expect(paginationDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(paginationDoc.examples.every(example => example.previewKey?.startsWith('ds-pagination'))).toBe(true)

    expect(tabsDoc.examples).toHaveLength(3)
    expect(tabsDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(tabsDoc.examples.every(example => example.previewKey?.startsWith('ds-tabs'))).toBe(true)

    expect(tooltipDoc.examples).toHaveLength(3)
    expect(tooltipDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(tooltipDoc.examples.every(example => example.previewKey?.startsWith('ds-tooltip'))).toBe(true)
  })

  it('возвращает live-scenarios для `GrTree` и `GrTreeSelect`', () => {
    const treeEntity = showcaseComponentEntities.find(entity => entity.name === 'GrTree')
    const treeSelectEntity = showcaseComponentEntities.find(entity => entity.name === 'GrTreeSelect')

    expect(treeEntity).toBeDefined()
    expect(treeSelectEntity).toBeDefined()

    const treeDoc = getShowcaseComponentDoc(treeEntity!)
    const treeSelectDoc = getShowcaseComponentDoc(treeSelectEntity!)

    expect(treeDoc.examples).toHaveLength(3)
    expect(treeDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(treeDoc.examples.every(example => example.previewKey?.startsWith('ds-tree'))).toBe(true)

    expect(treeSelectDoc.examples).toHaveLength(3)
    expect(treeSelectDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(treeSelectDoc.examples.every(example => example.previewKey?.startsWith('ds-tree-select'))).toBe(true)
  })

  it('выводит интерактивный builder первым live-example для `GrSwitch`', () => {
    const switchEntity = showcaseComponentEntities.find(entity => entity.name === 'GrSwitch')

    expect(switchEntity).toBeDefined()

    const doc = getShowcaseComponentDoc(switchEntity!)

    expect(doc.examples).toHaveLength(4)
    expect(doc.examples[0]).toMatchObject({
      id: 'switch-builder',
      previewKey: 'ds-switch-builder',
      code: '',
      status: 'ready',
    })
    expect(doc.examples.every(example => example.previewKey?.startsWith('ds-switch'))).toBe(true)
  })

  it('возвращает live-scenarios для `GrSegmented` с корректными preview keys', () => {
    const segmentedEntity = showcaseComponentEntities.find(entity => entity.name === 'GrSegmented')

    expect(segmentedEntity).toBeDefined()

    const doc = getShowcaseComponentDoc(segmentedEntity!)

    expect(doc.examples).toHaveLength(4)
    expect(doc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(doc.examples.every(example => example.previewKey?.startsWith('ds-segmented'))).toBe(true)
  })

  it('возвращает live-scenarios для form-controls `GrInput`, `GrNumberInput`, `GrTextarea` и `GrSwitch`', () => {
    const inputEntity = showcaseComponentEntities.find(entity => entity.name === 'GrInput')
    const numberInputEntity = showcaseComponentEntities.find(entity => entity.name === 'GrNumberInput')
    const textareaEntity = showcaseComponentEntities.find(entity => entity.name === 'GrTextarea')
    const switchEntity = showcaseComponentEntities.find(entity => entity.name === 'GrSwitch')

    expect(inputEntity).toBeDefined()
    expect(numberInputEntity).toBeDefined()
    expect(textareaEntity).toBeDefined()
    expect(switchEntity).toBeDefined()

    const inputDoc = getShowcaseComponentDoc(inputEntity!)
    const numberInputDoc = getShowcaseComponentDoc(numberInputEntity!)
    const textareaDoc = getShowcaseComponentDoc(textareaEntity!)
    const switchDoc = getShowcaseComponentDoc(switchEntity!)

    expect(inputDoc.examples).toHaveLength(3)
    expect(inputDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(inputDoc.examples.every(example => example.previewKey?.startsWith('ds-input'))).toBe(true)

    expect(numberInputDoc.examples).toHaveLength(3)
    expect(numberInputDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(numberInputDoc.examples.every(example => example.previewKey?.startsWith('ds-number-input'))).toBe(true)

    expect(textareaDoc.examples).toHaveLength(3)
    expect(textareaDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(textareaDoc.examples.every(example => example.previewKey?.startsWith('ds-textarea'))).toBe(true)

    expect(switchDoc.examples).toHaveLength(4)
    expect(switchDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(switchDoc.examples.every(example => example.previewKey?.startsWith('ds-switch'))).toBe(true)
  })

  it('возвращает live-scenarios для navigation batch `GrBottomNav`, `GrNavbar` и `GrSidebar`', () => {
    const bottomNavEntity = showcaseComponentEntities.find(entity => entity.name === 'GrBottomNav')
    const navbarEntity = showcaseComponentEntities.find(entity => entity.name === 'GrNavbar')
    const sidebarEntity = showcaseComponentEntities.find(entity => entity.name === 'GrSidebar')

    expect(bottomNavEntity).toBeDefined()
    expect(navbarEntity).toBeDefined()
    expect(sidebarEntity).toBeDefined()

    const bottomNavDoc = getShowcaseComponentDoc(bottomNavEntity!)
    const navbarDoc = getShowcaseComponentDoc(navbarEntity!)
    const sidebarDoc = getShowcaseComponentDoc(sidebarEntity!)

    expect(bottomNavDoc.examples).toHaveLength(3)
    expect(bottomNavDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(bottomNavDoc.examples.every(example => example.previewKey?.startsWith('ds-bottom-nav'))).toBe(true)

    expect(navbarDoc.examples).toHaveLength(3)
    expect(navbarDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(navbarDoc.examples.every(example => example.previewKey?.startsWith('ds-navbar'))).toBe(true)

    expect(sidebarDoc.examples).toHaveLength(3)
    expect(sidebarDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(sidebarDoc.examples.every(example => example.previewKey?.startsWith('ds-sidebar'))).toBe(true)
  })

  it('возвращает live-scenarios для overlay batch `GrDialog`, `GrDrawer`, `GrConfirmDialog`, `GrPromptDialog`, `GrToaster` и `GrLoading`', () => {
    const dialogEntity = showcaseComponentEntities.find(entity => entity.name === 'GrDialog')
    const drawerEntity = showcaseComponentEntities.find(entity => entity.name === 'GrDrawer')
    const confirmDialogEntity = showcaseComponentEntities.find(entity => entity.name === 'GrConfirmDialog')
    const promptDialogEntity = showcaseComponentEntities.find(entity => entity.name === 'GrPromptDialog')
    const toasterEntity = showcaseComponentEntities.find(entity => entity.name === 'GrToaster')
    const loadingEntity = showcaseComponentEntities.find(entity => entity.name === 'GrLoading')

    expect(dialogEntity).toBeDefined()
    expect(drawerEntity).toBeDefined()
    expect(confirmDialogEntity).toBeDefined()
    expect(promptDialogEntity).toBeDefined()
    expect(toasterEntity).toBeDefined()
    expect(loadingEntity).toBeDefined()

    const dialogDoc = getShowcaseComponentDoc(dialogEntity!)
    const drawerDoc = getShowcaseComponentDoc(drawerEntity!)
    const confirmDialogDoc = getShowcaseComponentDoc(confirmDialogEntity!)
    const promptDialogDoc = getShowcaseComponentDoc(promptDialogEntity!)
    const toasterDoc = getShowcaseComponentDoc(toasterEntity!)
    const loadingDoc = getShowcaseComponentDoc(loadingEntity!)

    expect(dialogDoc.examples).toHaveLength(3)
    expect(dialogDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(dialogDoc.examples.every(example => example.previewKey?.startsWith('ds-dialog'))).toBe(true)

    expect(drawerDoc.examples).toHaveLength(3)
    expect(drawerDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(drawerDoc.examples.every(example => example.previewKey?.startsWith('ds-drawer'))).toBe(true)

    expect(confirmDialogDoc.examples).toHaveLength(3)
    expect(confirmDialogDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(confirmDialogDoc.examples.every(example => example.previewKey?.startsWith('ds-confirm-dialog'))).toBe(true)

    expect(promptDialogDoc.examples).toHaveLength(3)
    expect(promptDialogDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(promptDialogDoc.examples.every(example => example.previewKey?.startsWith('ds-prompt-dialog'))).toBe(true)

    expect(toasterDoc.examples).toHaveLength(3)
    expect(toasterDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(toasterDoc.examples.every(example => example.previewKey?.startsWith('ds-toaster'))).toBe(true)

    expect(loadingDoc.examples).toHaveLength(3)
    expect(loadingDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(loadingDoc.examples.every(example => example.previewKey?.startsWith('ds-loading'))).toBe(true)
  })

  it('возвращает live-scenarios для feedback/state batch `GrCollapse`, `GrEmptyState`, `GrProgressBar` и `GrSkeleton`', () => {
    const collapseEntity = showcaseComponentEntities.find(entity => entity.name === 'GrCollapse')
    const emptyStateEntity = showcaseComponentEntities.find(entity => entity.name === 'GrEmptyState')
    const progressBarEntity = showcaseComponentEntities.find(entity => entity.name === 'GrProgressBar')
    const skeletonEntity = showcaseComponentEntities.find(entity => entity.name === 'GrSkeleton')

    expect(collapseEntity).toBeDefined()
    expect(emptyStateEntity).toBeDefined()
    expect(progressBarEntity).toBeDefined()
    expect(skeletonEntity).toBeDefined()

    const collapseDoc = getShowcaseComponentDoc(collapseEntity!)
    const emptyStateDoc = getShowcaseComponentDoc(emptyStateEntity!)
    const progressBarDoc = getShowcaseComponentDoc(progressBarEntity!)
    const skeletonDoc = getShowcaseComponentDoc(skeletonEntity!)

    expect(collapseDoc.examples).toHaveLength(3)
    expect(collapseDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(collapseDoc.examples.every(example => example.previewKey?.startsWith('ds-collapse'))).toBe(true)

    expect(emptyStateDoc.examples).toHaveLength(3)
    expect(emptyStateDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(emptyStateDoc.examples.every(example => example.previewKey?.startsWith('ds-empty-state'))).toBe(true)

    expect(progressBarDoc.examples).toHaveLength(3)
    expect(progressBarDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(progressBarDoc.examples.every(example => example.previewKey?.startsWith('ds-progress-bar'))).toBe(true)

    expect(skeletonDoc.examples).toHaveLength(3)
    expect(skeletonDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(skeletonDoc.examples.every(example => example.previewKey?.startsWith('ds-skeleton'))).toBe(true)
  })

  it('возвращает live-scenarios для remaining form/helper batch `GrFormFile`, `GrFormSection` и `GrInputTag`', () => {
    const formFileEntity = showcaseComponentEntities.find(entity => entity.name === 'GrFormFile')
    const formSectionEntity = showcaseComponentEntities.find(entity => entity.name === 'GrFormSection')
    const inputTagEntity = showcaseComponentEntities.find(entity => entity.name === 'GrInputTag')

    expect(formFileEntity).toBeDefined()
    expect(formSectionEntity).toBeDefined()
    expect(inputTagEntity).toBeDefined()

    const formFileDoc = getShowcaseComponentDoc(formFileEntity!)
    const formSectionDoc = getShowcaseComponentDoc(formSectionEntity!)
    const inputTagDoc = getShowcaseComponentDoc(inputTagEntity!)

    expect(formFileDoc.examples).toHaveLength(3)
    expect(formFileDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(formFileDoc.examples.every(example => example.previewKey?.startsWith('ds-form-file'))).toBe(true)

    expect(formSectionDoc.examples).toHaveLength(3)
    expect(formSectionDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(formSectionDoc.examples.every(example => example.previewKey?.startsWith('ds-form-section'))).toBe(true)

    expect(inputTagDoc.examples).toHaveLength(3)
    expect(inputTagDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(inputTagDoc.examples.every(example => example.previewKey?.startsWith('ds-input-tag'))).toBe(true)
  })

  it('возвращает live-scenarios для remaining composition/primitives batch `GrButtonGroup`, `GrDropdownMenu`, `GrIcon`, `GrLink`, `GrList` и `GrTable`', () => {
    const buttonGroupEntity = showcaseComponentEntities.find(entity => entity.name === 'GrButtonGroup')
    const dropdownMenuEntity = showcaseComponentEntities.find(entity => entity.name === 'GrDropdownMenu')
    const iconEntity = showcaseComponentEntities.find(entity => entity.name === 'GrIcon')
    const linkEntity = showcaseComponentEntities.find(entity => entity.name === 'GrLink')
    const listEntity = showcaseComponentEntities.find(entity => entity.name === 'GrList')
    const tableEntity = showcaseComponentEntities.find(entity => entity.name === 'GrTable')

    expect(buttonGroupEntity).toBeDefined()
    expect(dropdownMenuEntity).toBeDefined()
    expect(iconEntity).toBeDefined()
    expect(linkEntity).toBeDefined()
    expect(listEntity).toBeDefined()
    expect(tableEntity).toBeDefined()

    const buttonGroupDoc = getShowcaseComponentDoc(buttonGroupEntity!)
    const dropdownMenuDoc = getShowcaseComponentDoc(dropdownMenuEntity!)
    const iconDoc = getShowcaseComponentDoc(iconEntity!)
    const linkDoc = getShowcaseComponentDoc(linkEntity!)
    const listDoc = getShowcaseComponentDoc(listEntity!)
    const tableDoc = getShowcaseComponentDoc(tableEntity!)

    expect(buttonGroupDoc.examples).toHaveLength(3)
    expect(buttonGroupDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(buttonGroupDoc.examples.every(example => example.previewKey?.startsWith('ds-button-group'))).toBe(true)

    expect(dropdownMenuDoc.examples).toHaveLength(3)
    expect(dropdownMenuDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(dropdownMenuDoc.examples.every(example => example.previewKey?.startsWith('ds-dropdown-menu'))).toBe(true)

    expect(iconDoc.examples).toHaveLength(3)
    expect(iconDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(iconDoc.examples.every(example => example.previewKey?.startsWith('ds-icon'))).toBe(true)

    expect(linkDoc.examples).toHaveLength(4)
    expect(linkDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(linkDoc.examples.every(example => example.previewKey?.startsWith('ds-link'))).toBe(true)

    expect(listDoc.examples).toHaveLength(3)
    expect(listDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(listDoc.examples.every(example => example.previewKey?.startsWith('ds-list'))).toBe(true)

    expect(tableDoc.examples).toHaveLength(3)
    expect(tableDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(tableDoc.examples.every(example => example.previewKey?.startsWith('ds-table'))).toBe(true)
  })

  it('возвращает live-scenarios для remaining media/advanced batch `GrImageViewer`', () => {
    const imageViewerEntity = showcaseComponentEntities.find(entity => entity.name === 'GrImageViewer')

    expect(imageViewerEntity).toBeDefined()

    const imageViewerDoc = getShowcaseComponentDoc(imageViewerEntity!)

    expect(imageViewerDoc.examples).toHaveLength(3)
    expect(imageViewerDoc.examples.every(example => example.status === 'ready')).toBe(true)
    expect(imageViewerDoc.examples.every(example => example.previewKey?.startsWith('ds-image-viewer'))).toBe(true)
  })

  it('держит live previews ленивыми и не импортирует demo-слой статически в `ComponentDetailPage`', () => {
    const componentDetailPageSource = readFileSync(
      new URL('../../pages/ComponentDetailPage.vue', import.meta.url),
      'utf8',
    )

    expect(componentDetailPageSource).toContain('defineAsyncComponent(() => import(')
    expect(componentDetailPageSource).not.toMatch(/import\s+Ds[A-Za-z0-9]+Demo\s+from\s+'\.\.\/demos\/components\//)
    expect(componentDetailPageSource.match(/defineAsyncComponent\(\(\) => import\('\.\.\/demos\/components\//g)?.length ?? 0)
      .toBeGreaterThan(100)
  })
})