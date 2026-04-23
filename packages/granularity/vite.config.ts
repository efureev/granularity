import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { granularChunkFileNames } from '@feugene/unocss-preset-granular/vite'
import {libInjectCss} from "vite-plugin-lib-inject-css";

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
  ],
  build: {
    target: 'esnext',
    minify: 'oxc',
    cssCodeSplit: true,
    reportCompressedSize: true,
    emptyOutDir: true,
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'components/DsAlert/index': fileURLToPath(
          new URL('./src/components/DsAlert/index.ts', import.meta.url),
        ),
        'components/DsAvatar/index': fileURLToPath(
          new URL('./src/components/DsAvatar/index.ts', import.meta.url),
        ),
        'components/DsBadge/index': fileURLToPath(
          new URL('./src/components/DsBadge/index.ts', import.meta.url),
        ),
        'components/DsBadgeWrap/index': fileURLToPath(
          new URL('./src/components/DsBadgeWrap/index.ts', import.meta.url),
        ),
        'components/DsBottomNav/index': fileURLToPath(
          new URL('./src/components/DsBottomNav/index.ts', import.meta.url),
        ),
        'components/DsButton/index': fileURLToPath(
          new URL('./src/components/DsButton/index.ts', import.meta.url),
        ),
        'components/DsButtonGroup/index': fileURLToPath(
          new URL('./src/components/DsButtonGroup/index.ts', import.meta.url),
        ),
        'components/DsCard/index': fileURLToPath(
          new URL('./src/components/DsCard/index.ts', import.meta.url),
        ),
        'components/DsCheckbox/index': fileURLToPath(
          new URL('./src/components/DsCheckbox/index.ts', import.meta.url),
        ),
        'components/DsCollapse/index': fileURLToPath(
          new URL('./src/components/DsCollapse/index.ts', import.meta.url),
        ),
        'components/DsConfirmDialog/index': fileURLToPath(
          new URL('./src/components/DsConfirmDialog/index.ts', import.meta.url),
        ),
        'components/DsDataTable/index': fileURLToPath(
          new URL('./src/components/DsDataTable/index.ts', import.meta.url),
        ),
        'components/DsDialog/index': fileURLToPath(
          new URL('./src/components/DsDialog/index.ts', import.meta.url),
        ),
        'components/DsDrawer/index': fileURLToPath(
          new URL('./src/components/DsDrawer/index.ts', import.meta.url),
        ),
        'components/DsDropdown/index': fileURLToPath(
          new URL('./src/components/DsDropdown/index.ts', import.meta.url),
        ),
        'components/DsDropdownMenu/index': fileURLToPath(
          new URL('./src/components/DsDropdownMenu/index.ts', import.meta.url),
        ),
        'components/DsEmptyState/index': fileURLToPath(
          new URL('./src/components/DsEmptyState/index.ts', import.meta.url),
        ),
        'components/DsFileUpload/index': fileURLToPath(
          new URL('./src/components/DsFileUpload/index.ts', import.meta.url),
        ),
        'components/DsFormField/index': fileURLToPath(
          new URL('./src/components/DsFormField/index.ts', import.meta.url),
        ),
        'components/DsFormFile/index': fileURLToPath(
          new URL('./src/components/DsFormFile/index.ts', import.meta.url),
        ),
        'components/DsFormSection/index': fileURLToPath(
          new URL('./src/components/DsFormSection/index.ts', import.meta.url),
        ),
        'components/DsIcon/index': fileURLToPath(
          new URL('./src/components/DsIcon/index.ts', import.meta.url),
        ),
        'components/DsImageViewer/index': fileURLToPath(
          new URL('./src/components/DsImageViewer/index.ts', import.meta.url),
        ),
        'components/DsInput/index': fileURLToPath(
          new URL('./src/components/DsInput/index.ts', import.meta.url),
        ),
        'components/DsInputTag/index': fileURLToPath(
          new URL('./src/components/DsInputTag/index.ts', import.meta.url),
        ),
        'components/DsLink/index': fileURLToPath(
          new URL('./src/components/DsLink/index.ts', import.meta.url),
        ),
        'components/DsList/index': fileURLToPath(
          new URL('./src/components/DsList/index.ts', import.meta.url),
        ),
        'components/DsLoading/index': fileURLToPath(
          new URL('./src/components/DsLoading/index.ts', import.meta.url),
        ),
        'components/DsModal/index': fileURLToPath(
          new URL('./src/components/DsModal/index.ts', import.meta.url),
        ),
        'components/DsNavbar/index': fileURLToPath(
          new URL('./src/components/DsNavbar/index.ts', import.meta.url),
        ),
        'components/DsNumberInput/index': fileURLToPath(
          new URL('./src/components/DsNumberInput/index.ts', import.meta.url),
        ),
        'components/DsPagination/index': fileURLToPath(
          new URL('./src/components/DsPagination/index.ts', import.meta.url),
        ),
        'components/DsProgressBar/index': fileURLToPath(
          new URL('./src/components/DsProgressBar/index.ts', import.meta.url),
        ),
        'components/DsPromptDialog/index': fileURLToPath(
          new URL('./src/components/DsPromptDialog/index.ts', import.meta.url),
        ),
        'components/DsRadio/index': fileURLToPath(
          new URL('./src/components/DsRadio/index.ts', import.meta.url),
        ),
        'components/DsRadioGroup/index': fileURLToPath(
          new URL('./src/components/DsRadioGroup/index.ts', import.meta.url),
        ),
        'components/DsSegmented/index': fileURLToPath(
          new URL('./src/components/DsSegmented/index.ts', import.meta.url),
        ),
        'components/DsSelect/index': fileURLToPath(
          new URL('./src/components/DsSelect/index.ts', import.meta.url),
        ),
        'components/DsSidebar/index': fileURLToPath(
          new URL('./src/components/DsSidebar/index.ts', import.meta.url),
        ),
        'components/DsSkeleton/index': fileURLToPath(
          new URL('./src/components/DsSkeleton/index.ts', import.meta.url),
        ),
        'components/DsSwitch/index': fileURLToPath(
          new URL('./src/components/DsSwitch/index.ts', import.meta.url),
        ),
        'components/DsTable/index': fileURLToPath(
          new URL('./src/components/DsTable/index.ts', import.meta.url),
        ),
        'components/DsTabs/index': fileURLToPath(
          new URL('./src/components/DsTabs/index.ts', import.meta.url),
        ),
        'components/DsTextarea/index': fileURLToPath(
          new URL('./src/components/DsTextarea/index.ts', import.meta.url),
        ),
        'components/DsToaster/index': fileURLToPath(
          new URL('./src/components/DsToaster/index.ts', import.meta.url),
        ),
        'components/DsTooltip/index': fileURLToPath(
          new URL('./src/components/DsTooltip/index.ts', import.meta.url),
        ),
        'components/DsTree/index': fileURLToPath(
          new URL('./src/components/DsTree/index.ts', import.meta.url),
        ),
        'components/DsTreeSelect/index': fileURLToPath(
          new URL('./src/components/DsTreeSelect/index.ts', import.meta.url),
        ),
        'directives/index': fileURLToPath(
          new URL('./src/directives/index.ts', import.meta.url),
        ),
        'fileValidation/index': fileURLToPath(
          new URL('./src/fileValidation/index.ts', import.meta.url),
        ),
        'i18n/index': fileURLToPath(
          new URL('./src/i18n/index.ts', import.meta.url),
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
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rolldownOptions: {
      external: [
        /^node:/,
        'vue',
        /^@feugene\/unocss-preset-granular(\/.*)?$/,
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        assetFileNames: assetInfo => assetInfo.name ?? '[name][extname]',
      },
    },
  },
})
