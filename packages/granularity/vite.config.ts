import { cp } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { granularAssetFileNames, granularChunkFileNames, granularCssAssetsPlugin } from '@feugene/unocss-preset-granular/vite'
import { granularityProvider } from './src/granular-provider'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

/**
 * Копирует сырые CSS-токены/темы/preflight (`src/styles/*`) в `dist/styles/`,
 * чтобы потребитель мог подключить тему без UnoCSS-провайдера —
 * `import '@feugene/granularity/styles/index.css'` (см. `exports` в package.json).
 */
function copyStylesPlugin() {
  return {
    name: 'gr-copy-styles',
    apply: 'build' as const,
    async closeBundle() {
      const src = fileURLToPath(new URL('./src/styles', import.meta.url))
      const dest = fileURLToPath(new URL('./dist/styles', import.meta.url))
      await cp(src, dest, {
        recursive: true,
        // Документацию (`abbreviations.md`) в дистрибутив не тащим.
        filter: source => !source.endsWith('.md'),
      })
    },
  }
}

/**
 * Build-конфиг пакета `@feugene/granularity`.
 *
 * Пакет НЕ собирает CSS самостоятельно. Финальный CSS формируется на стороне
 * приложения через `@feugene/unocss-preset-granular`, которому передаётся
 * `granularityProvider` (см. `src/granular-provider/`).
 *
 * SFC‑чанки укладываются в `components/<Name>/chunks/` через хелпер
 * `granularChunkFileNames`, чтобы UnoCSS в приложении мог просканировать
 * исходники компонента через автоматический `content.filesystem` пресета
 * `presetGranularNode`.
 */
export default defineConfig({
  plugins: [
    vue(),
    libInjectCss(),
    Icons({ compiler: 'vue3', autoInstall: false }),
    copyStylesPlugin(),
    // Кладёт в `dist` CSS, объявленный в `tokenDefinitionsRef` строкой:
    // бандлер такие ссылки не эмитит, а node-слой пресета ищет файл по
    // `assetName`.
    granularCssAssetsPlugin({ providers: [granularityProvider] }),
  ],
  build: {
    target: 'esnext',
    // Намеренно НЕ минифицируем JS библиотеки:
    // - финальную минификацию делает приложение-потребитель (esbuild/oxc/terser)
    //   уже после tree-shaking, что эффективнее двойной минификации;
    // - сохраняем читаемые имена идентификаторов и `/*#__PURE__*/`-аннотации,
    //   чтобы у потребителя корректно работал tree-shaking Vue/SFC;
    // - избегаем класса багов с переименованием локальных переменных в `h`/`t`
    //   (конфликты с render-функцией Vue `h` и i18n-хелпером `t`),
    //   что особенно критично для модулей переводов (`src/i18n/*`).
    // Для CSS такой проблемы нет — его жмём через `cssMinify`.
    minify: false,
    sourcemap: 'hidden',
    cssMinify: true,
    cssCodeSplit: true,
    reportCompressedSize: true,
    emptyOutDir: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        // <granularity:components> — блок генерируется `yarn generate:registry`
        'components/GrAlert/index': fileURLToPath(
          new URL('./src/components/GrAlert/index.ts', import.meta.url),
        ),
        'components/GrAutocomplete/index': fileURLToPath(
          new URL('./src/components/GrAutocomplete/index.ts', import.meta.url),
        ),
        'components/GrAvatar/index': fileURLToPath(
          new URL('./src/components/GrAvatar/index.ts', import.meta.url),
        ),
        'components/GrBadge/index': fileURLToPath(
          new URL('./src/components/GrBadge/index.ts', import.meta.url),
        ),
        'components/GrBadgeWrap/index': fileURLToPath(
          new URL('./src/components/GrBadgeWrap/index.ts', import.meta.url),
        ),
        'components/GrBottomNav/index': fileURLToPath(
          new URL('./src/components/GrBottomNav/index.ts', import.meta.url),
        ),
        'components/GrBreadcrumbs/index': fileURLToPath(
          new URL('./src/components/GrBreadcrumbs/index.ts', import.meta.url),
        ),
        'components/GrButton/index': fileURLToPath(
          new URL('./src/components/GrButton/index.ts', import.meta.url),
        ),
        'components/GrButtonGroup/index': fileURLToPath(
          new URL('./src/components/GrButtonGroup/index.ts', import.meta.url),
        ),
        'components/GrCard/index': fileURLToPath(
          new URL('./src/components/GrCard/index.ts', import.meta.url),
        ),
        'components/GrCheckbox/index': fileURLToPath(
          new URL('./src/components/GrCheckbox/index.ts', import.meta.url),
        ),
        'components/GrCheckboxGroup/index': fileURLToPath(
          new URL('./src/components/GrCheckboxGroup/index.ts', import.meta.url),
        ),
        'components/GrCodeBlock/index': fileURLToPath(
          new URL('./src/components/GrCodeBlock/index.ts', import.meta.url),
        ),
        'components/GrCollapse/index': fileURLToPath(
          new URL('./src/components/GrCollapse/index.ts', import.meta.url),
        ),
        'components/GrColorPicker/index': fileURLToPath(
          new URL('./src/components/GrColorPicker/index.ts', import.meta.url),
        ),
        'components/GrCommandPalette/index': fileURLToPath(
          new URL('./src/components/GrCommandPalette/index.ts', import.meta.url),
        ),
        'components/GrConfigProvider/index': fileURLToPath(
          new URL('./src/components/GrConfigProvider/index.ts', import.meta.url),
        ),
        'components/GrConfirmDialog/index': fileURLToPath(
          new URL('./src/components/GrConfirmDialog/index.ts', import.meta.url),
        ),
        'components/GrDataTable/index': fileURLToPath(
          new URL('./src/components/GrDataTable/index.ts', import.meta.url),
        ),
        'components/GrDelta/index': fileURLToPath(
          new URL('./src/components/GrDelta/index.ts', import.meta.url),
        ),
        'components/GrDescriptionList/index': fileURLToPath(
          new URL('./src/components/GrDescriptionList/index.ts', import.meta.url),
        ),
        'components/GrDialog/index': fileURLToPath(
          new URL('./src/components/GrDialog/index.ts', import.meta.url),
        ),
        'components/GrDialogService/index': fileURLToPath(
          new URL('./src/components/GrDialogService/index.ts', import.meta.url),
        ),
        'components/GrDivider/index': fileURLToPath(
          new URL('./src/components/GrDivider/index.ts', import.meta.url),
        ),
        'components/GrDrawer/index': fileURLToPath(
          new URL('./src/components/GrDrawer/index.ts', import.meta.url),
        ),
        'components/GrDropdown/index': fileURLToPath(
          new URL('./src/components/GrDropdown/index.ts', import.meta.url),
        ),
        'components/GrDropdownMenu/index': fileURLToPath(
          new URL('./src/components/GrDropdownMenu/index.ts', import.meta.url),
        ),
        'components/GrEmptyState/index': fileURLToPath(
          new URL('./src/components/GrEmptyState/index.ts', import.meta.url),
        ),
        'components/GrFilePreview/index': fileURLToPath(
          new URL('./src/components/GrFilePreview/index.ts', import.meta.url),
        ),
        'components/GrFileUpload/index': fileURLToPath(
          new URL('./src/components/GrFileUpload/index.ts', import.meta.url),
        ),
        'components/GrForm/index': fileURLToPath(
          new URL('./src/components/GrForm/index.ts', import.meta.url),
        ),
        'components/GrFormField/index': fileURLToPath(
          new URL('./src/components/GrFormField/index.ts', import.meta.url),
        ),
        'components/GrFormFile/index': fileURLToPath(
          new URL('./src/components/GrFormFile/index.ts', import.meta.url),
        ),
        'components/GrFormSection/index': fileURLToPath(
          new URL('./src/components/GrFormSection/index.ts', import.meta.url),
        ),
        'components/GrIcon/index': fileURLToPath(
          new URL('./src/components/GrIcon/index.ts', import.meta.url),
        ),
        'components/GrImageViewer/index': fileURLToPath(
          new URL('./src/components/GrImageViewer/index.ts', import.meta.url),
        ),
        'components/GrInput/index': fileURLToPath(
          new URL('./src/components/GrInput/index.ts', import.meta.url),
        ),
        'components/GrInputTag/index': fileURLToPath(
          new URL('./src/components/GrInputTag/index.ts', import.meta.url),
        ),
        'components/GrJsonViewer/index': fileURLToPath(
          new URL('./src/components/GrJsonViewer/index.ts', import.meta.url),
        ),
        'components/GrKbd/index': fileURLToPath(
          new URL('./src/components/GrKbd/index.ts', import.meta.url),
        ),
        'components/GrLink/index': fileURLToPath(
          new URL('./src/components/GrLink/index.ts', import.meta.url),
        ),
        'components/GrList/index': fileURLToPath(
          new URL('./src/components/GrList/index.ts', import.meta.url),
        ),
        'components/GrLoading/index': fileURLToPath(
          new URL('./src/components/GrLoading/index.ts', import.meta.url),
        ),
        'components/GrModal/index': fileURLToPath(
          new URL('./src/components/GrModal/index.ts', import.meta.url),
        ),
        'components/GrNavbar/index': fileURLToPath(
          new URL('./src/components/GrNavbar/index.ts', import.meta.url),
        ),
        'components/GrNumberInput/index': fileURLToPath(
          new URL('./src/components/GrNumberInput/index.ts', import.meta.url),
        ),
        'components/GrPagination/index': fileURLToPath(
          new URL('./src/components/GrPagination/index.ts', import.meta.url),
        ),
        'components/GrPopover/index': fileURLToPath(
          new URL('./src/components/GrPopover/index.ts', import.meta.url),
        ),
        'components/GrProgressBar/index': fileURLToPath(
          new URL('./src/components/GrProgressBar/index.ts', import.meta.url),
        ),
        'components/GrProgressCircle/index': fileURLToPath(
          new URL('./src/components/GrProgressCircle/index.ts', import.meta.url),
        ),
        'components/GrPromptDialog/index': fileURLToPath(
          new URL('./src/components/GrPromptDialog/index.ts', import.meta.url),
        ),
        'components/GrRadio/index': fileURLToPath(
          new URL('./src/components/GrRadio/index.ts', import.meta.url),
        ),
        'components/GrRadioGroup/index': fileURLToPath(
          new URL('./src/components/GrRadioGroup/index.ts', import.meta.url),
        ),
        'components/GrRating/index': fileURLToPath(
          new URL('./src/components/GrRating/index.ts', import.meta.url),
        ),
        'components/GrResponseErrorBanner/index': fileURLToPath(
          new URL('./src/components/GrResponseErrorBanner/index.ts', import.meta.url),
        ),
        'components/GrSegmented/index': fileURLToPath(
          new URL('./src/components/GrSegmented/index.ts', import.meta.url),
        ),
        'components/GrSelect/index': fileURLToPath(
          new URL('./src/components/GrSelect/index.ts', import.meta.url),
        ),
        'components/GrSidebar/index': fileURLToPath(
          new URL('./src/components/GrSidebar/index.ts', import.meta.url),
        ),
        'components/GrSkeleton/index': fileURLToPath(
          new URL('./src/components/GrSkeleton/index.ts', import.meta.url),
        ),
        'components/GrSlider/index': fileURLToPath(
          new URL('./src/components/GrSlider/index.ts', import.meta.url),
        ),
        'components/GrSortableList/index': fileURLToPath(
          new URL('./src/components/GrSortableList/index.ts', import.meta.url),
        ),
        'components/GrSplitter/index': fileURLToPath(
          new URL('./src/components/GrSplitter/index.ts', import.meta.url),
        ),
        'components/GrStatistic/index': fileURLToPath(
          new URL('./src/components/GrStatistic/index.ts', import.meta.url),
        ),
        'components/GrSwitch/index': fileURLToPath(
          new URL('./src/components/GrSwitch/index.ts', import.meta.url),
        ),
        'components/GrTable/index': fileURLToPath(
          new URL('./src/components/GrTable/index.ts', import.meta.url),
        ),
        'components/GrTabPanels/index': fileURLToPath(
          new URL('./src/components/GrTabPanels/index.ts', import.meta.url),
        ),
        'components/GrTabs/index': fileURLToPath(
          new URL('./src/components/GrTabs/index.ts', import.meta.url),
        ),
        'components/GrTextarea/index': fileURLToPath(
          new URL('./src/components/GrTextarea/index.ts', import.meta.url),
        ),
        'components/GrTimeline/index': fileURLToPath(
          new URL('./src/components/GrTimeline/index.ts', import.meta.url),
        ),
        'components/GrToaster/index': fileURLToPath(
          new URL('./src/components/GrToaster/index.ts', import.meta.url),
        ),
        'components/GrTooltip/index': fileURLToPath(
          new URL('./src/components/GrTooltip/index.ts', import.meta.url),
        ),
        'components/GrTree/index': fileURLToPath(
          new URL('./src/components/GrTree/index.ts', import.meta.url),
        ),
        'components/GrTreeSelect/index': fileURLToPath(
          new URL('./src/components/GrTreeSelect/index.ts', import.meta.url),
        ),
        'components/GrValue/index': fileURLToPath(
          new URL('./src/components/GrValue/index.ts', import.meta.url),
        ),
        // </granularity:components>
        'composables/useAnnouncer': fileURLToPath(
          new URL('./src/composables/useAnnouncer.ts', import.meta.url),
        ),
        'composables/useDismissible': fileURLToPath(
          new URL('./src/composables/useDismissible.ts', import.meta.url),
        ),
        'composables/useGrFormControl': fileURLToPath(
          new URL('./src/composables/useGrFormControl.ts', import.meta.url),
        ),
        'composables/useDragGesture': fileURLToPath(
          new URL('./src/composables/useDragGesture.ts', import.meta.url),
        ),
        'composables/useDragSort': fileURLToPath(
          new URL('./src/composables/useDragSort.ts', import.meta.url),
        ),
        'composables/useVirtualList': fileURLToPath(
          new URL('./src/composables/useVirtualList.ts', import.meta.url),
        ),
        'composables/useFloating': fileURLToPath(
          new URL('./src/composables/useFloating.ts', import.meta.url),
        ),
        'composables/useFocusTrap': fileURLToPath(
          new URL('./src/composables/useFocusTrap.ts', import.meta.url),
        ),
        'composables/usePortalTarget': fileURLToPath(
          new URL('./src/composables/usePortalTarget.ts', import.meta.url),
        ),
        'composables/useOverlayLayer': fileURLToPath(
          new URL('./src/composables/useOverlayLayer.ts', import.meta.url),
        ),
        'composables/useRovingFocus': fileURLToPath(
          new URL('./src/composables/useRovingFocus.ts', import.meta.url),
        ),
        'composables/useGrComponentConfig': fileURLToPath(
          new URL('./src/composables/useGrComponentConfig.ts', import.meta.url),
        ),
        'composables/useComboboxNavigation': fileURLToPath(
          new URL('./src/composables/useComboboxNavigation.ts', import.meta.url),
        ),
        'composables/useGranularityTranslations': fileURLToPath(
          new URL('./src/composables/useGranularityTranslations.ts', import.meta.url),
        ),
        'composables/useTheme': fileURLToPath(
          new URL('./src/composables/useTheme.ts', import.meta.url),
        ),
        'composables/useToast': fileURLToPath(
          new URL('./src/composables/useToast.ts', import.meta.url),
        ),
        'directives/index': fileURLToPath(
          new URL('./src/directives/index.ts', import.meta.url),
        ),
        'directives/autofocus': fileURLToPath(
          new URL('./src/directives/autofocus.ts', import.meta.url),
        ),
        'directives/autosize': fileURLToPath(
          new URL('./src/directives/autosize.ts', import.meta.url),
        ),
        'directives/clickOutside': fileURLToPath(
          new URL('./src/directives/clickOutside.ts', import.meta.url),
        ),
        'directives/dropzone': fileURLToPath(
          new URL('./src/directives/dropzone.ts', import.meta.url),
        ),
        'directives/hotkey': fileURLToPath(
          new URL('./src/directives/hotkey.ts', import.meta.url),
        ),
        'directives/loading': fileURLToPath(
          new URL('./src/directives/loading.ts', import.meta.url),
        ),
        'fileValidation/index': fileURLToPath(
          new URL('./src/fileValidation/index.ts', import.meta.url),
        ),
        'i18n/index': fileURLToPath(
          new URL('./src/i18n/index.ts', import.meta.url),
        ),
        'i18n/all': fileURLToPath(
          new URL('./src/i18n/all.ts', import.meta.url),
        ),
        'vue/index': fileURLToPath(
          new URL('./src/vue/index.ts', import.meta.url),
        ),
        'granular-provider': fileURLToPath(
          new URL('./src/granular-provider/index.ts', import.meta.url),
        ),
        'granular-provider-node': fileURLToPath(
          new URL('./src/granular-provider/node.ts', import.meta.url),
        ),
        // Справочник токенов (данные из `tokens/*.json`) — отдельной entry,
        // чтобы не попадать в основной бандл: он нужен докам и инструментам.
        'tokens': fileURLToPath(
          new URL('./src/tokens/index.ts', import.meta.url),
        ),
        // Тестовые утилиты — своей entry по той же причине: в бандл приложения
        // они попадать не должны, из root-barrel не реэкспортируются.
        'testing': fileURLToPath(
          new URL('./src/testing/index.ts', import.meta.url),
        ),
        // Композиция тем: сборочная часть тянет справочник токенов, рантайм —
        // нет. Отсюда две entry, а не одна.
        'theme': fileURLToPath(
          new URL('./src/theme/index.ts', import.meta.url),
        ),
        'theme-apply': fileURLToPath(
          new URL('./src/theme/apply.ts', import.meta.url),
        ),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: [
        /^node:/,
        'vue',
        /^@feugene\/unocss-preset-granular(\/.*)?$/,
        /^@feugene\/fint-i18n(\/.*)?$/,
        // Держим снаружи бандла: это peer-зависимость. Иначе потребитель,
        // который сам её использует, получил бы вторую копию.
        /^@floating-ui\/dom(\/.*)?$/,
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        // Без списка компонентов: дефолтная эвристика `^[A-Z][\w-]*\.css$`
        // покрывает все `Gr*`, а `index.css` оставляет на месте.
        assetFileNames: granularAssetFileNames(),
      },
    },
  },
})
