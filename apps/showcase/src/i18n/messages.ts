import type { LocaleLoaderCollection } from '@feugene/fint-i18n/core'

export const SHOWCASE_I18N_BLOCK = 'showcase'

/**
 * `satisfies LocaleLoaderCollection` здесь не проходит, и это ограничение типа,
 * а не ошибка данных: в JSON витрины есть массивы (`bullets`), а `MessageValue`
 * описывает только примитивы и вложенные объекты. Рантайм с ними работает —
 * `useShowcasePageI18n` адресует их по индексу (`…bullets.0`), то есть массив
 * это законная запись нумерованного набора. Поэтому приведение, а не переделка
 * локалей под тип.
 */
export const showcaseLocaleLoaders = {
  en: {
    [SHOWCASE_I18N_BLOCK]: () => import('./locales/en/showcase.json'),
    'components.GrButton': () => import('./locales/en/components/GrButton.json'),
    'components.GrAlert': () => import('./locales/en/components/GrAlert.json'),
    'components.GrBadge': () => import('./locales/en/components/GrBadge.json'),
    'components.GrDialog': () => import('./locales/en/components/GrDialog.json'),
    'components.GrModal': () => import('./locales/en/components/GrModal.json'),
    'components.GrDropdown': () => import('./locales/en/components/GrDropdown.json'),
    'components.GrTree': () => import('./locales/en/components/GrTree.json'),
    'components.GrTable': () => import('./locales/en/components/GrTable.json'),
    'components.GrInput': () => import('./locales/en/components/GrInput.json'),
    'components.GrSegmented': () => import('./locales/en/components/GrSegmented.json'),
    'components.GrSwitch': () => import('./locales/en/components/GrSwitch.json'),
    'composables.useAnnouncer': () => import('./locales/en/composables/useAnnouncer.json'),
    'composables.useDialogService': () => import('./locales/en/composables/useDialogService.json'),
  },
  ru: {
    [SHOWCASE_I18N_BLOCK]: () => import('./locales/ru/showcase.json'),
    'components.GrButton': () => import('./locales/ru/components/GrButton.json'),
    'components.GrAlert': () => import('./locales/ru/components/GrAlert.json'),
    'components.GrBadge': () => import('./locales/ru/components/GrBadge.json'),
    'components.GrDialog': () => import('./locales/ru/components/GrDialog.json'),
    'components.GrModal': () => import('./locales/ru/components/GrModal.json'),
    'components.GrDropdown': () => import('./locales/ru/components/GrDropdown.json'),
    'components.GrTree': () => import('./locales/ru/components/GrTree.json'),
    'components.GrTable': () => import('./locales/ru/components/GrTable.json'),
    'components.GrInput': () => import('./locales/ru/components/GrInput.json'),
    'components.GrSegmented': () => import('./locales/ru/components/GrSegmented.json'),
    'components.GrSwitch': () => import('./locales/ru/components/GrSwitch.json'),
    'composables.useAnnouncer': () => import('./locales/ru/composables/useAnnouncer.json'),
    'composables.useDialogService': () => import('./locales/ru/composables/useDialogService.json'),
  },
} as unknown as LocaleLoaderCollection
