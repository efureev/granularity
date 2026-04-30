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
        'components/GrAlert/index': fileURLToPath(
          new URL('./src/components/GrAlert/index.ts', import.meta.url),
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
        'components/GrCollapse/index': fileURLToPath(
          new URL('./src/components/GrCollapse/index.ts', import.meta.url),
        ),
        'components/GrConfirmDialog/index': fileURLToPath(
          new URL('./src/components/GrConfirmDialog/index.ts', import.meta.url),
        ),
        'components/GrDataTable/index': fileURLToPath(
          new URL('./src/components/GrDataTable/index.ts', import.meta.url),
        ),
        'components/GrDialog/index': fileURLToPath(
          new URL('./src/components/GrDialog/index.ts', import.meta.url),
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
        'components/GrFileUpload/index': fileURLToPath(
          new URL('./src/components/GrFileUpload/index.ts', import.meta.url),
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
        'components/GrProgressBar/index': fileURLToPath(
          new URL('./src/components/GrProgressBar/index.ts', import.meta.url),
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
        'components/GrSwitch/index': fileURLToPath(
          new URL('./src/components/GrSwitch/index.ts', import.meta.url),
        ),
        'components/GrTable/index': fileURLToPath(
          new URL('./src/components/GrTable/index.ts', import.meta.url),
        ),
        'components/GrTabs/index': fileURLToPath(
          new URL('./src/components/GrTabs/index.ts', import.meta.url),
        ),
        'components/GrTextarea/index': fileURLToPath(
          new URL('./src/components/GrTextarea/index.ts', import.meta.url),
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
      ],
      output: {
        chunkFileNames: granularChunkFileNames(),
        assetFileNames: assetInfo => assetInfo.name ?? '[name][extname]',
      },
    },
  },
})
