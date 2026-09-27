import { cp } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { granumProvider } from '@feugene/granum/build'
import { miniEngine } from '@feugene/granum-engine-mini'
import { granularityProvider } from './src/granular-provider'

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
 * Entry, которые строит не плагин: композаблы, директивы, i18n, темы и
 * служебные точки входа. Entry компонентов и `index` `granumProvider()`
 * собирает сам из реестра провайдера (B-4) — руками их больше не ведут,
 * поэтому в этом файле нет сгенерированного блока.
 */
const extraEntries: Record<string, string> = {
  'composables/useAnnouncer': 'src/composables/useAnnouncer.ts',
  'composables/useDismissible': 'src/composables/useDismissible.ts',
  'composables/useGrFormControl': 'src/composables/useGrFormControl.ts',
  'composables/useDragGesture': 'src/composables/useDragGesture.ts',
  'composables/useDragSort': 'src/composables/useDragSort.ts',
  'composables/useVirtualList': 'src/composables/useVirtualList.ts',
  'composables/useFloating': 'src/composables/useFloating.ts',
  'composables/useFocusTrap': 'src/composables/useFocusTrap.ts',
  'composables/usePortalTarget': 'src/composables/usePortalTarget.ts',
  'composables/useOverlayLayer': 'src/composables/useOverlayLayer.ts',
  'composables/useTree': 'src/composables/useTree.ts',
  'composables/useScrollSpy': 'src/composables/useScrollSpy.ts',
  'composables/useRovingFocus': 'src/composables/useRovingFocus.ts',
  'composables/useGrComponentConfig': 'src/composables/useGrComponentConfig.ts',
  'composables/useComboboxNavigation': 'src/composables/useComboboxNavigation.ts',
  'composables/useHotkeys': 'src/composables/useHotkeys.ts',
  'composables/useGranularityTranslations': 'src/composables/useGranularityTranslations.ts',
  'composables/useTheme': 'src/composables/useTheme.ts',
  'composables/useToast': 'src/composables/useToast.ts',
  'directives/index': 'src/directives/index.ts',
  'directives/autofocus': 'src/directives/autofocus.ts',
  'directives/autosize': 'src/directives/autosize.ts',
  'directives/clickOutside': 'src/directives/clickOutside.ts',
  'directives/dropzone': 'src/directives/dropzone.ts',
  'directives/hotkey': 'src/directives/hotkey.ts',
  'directives/loading': 'src/directives/loading.ts',
  'fileValidation/index': 'src/fileValidation/index.ts',
  'i18n/index': 'src/i18n/index.ts',
  'i18n/all': 'src/i18n/all.ts',
  'vue/index': 'src/vue/index.ts',
  'granular-provider': 'src/granular-provider/index.ts',
  'granular-provider-node': 'src/granular-provider/node.ts',
  // Справочник токенов (данные из `tokens/*.json`) — отдельной entry,
  // чтобы не попадать в основной бандл: он нужен докам и инструментам.
  'tokens': 'src/tokens/index.ts',
  // Тестовые утилиты — своей entry по той же причине: в бандл приложения
  // они попадать не должны, из root-barrel не реэкспортируются.
  'testing': 'src/testing/index.ts',
  // Композиция тем: сборочная часть тянет справочник токенов, рантайм —
  // нет. Отсюда две entry, а не одна.
  'theme': 'src/theme/index.ts',
  'theme-apply': 'src/theme/apply.ts',
}

/**
 * Build-конфиг пакета `@feugene/granularity`.
 *
 * Пакет НЕ собирает финальный CSS. Его собирает приложение из
 * `granum.manifest.json`, который пишет `granumProvider()` (см.
 * `src/granular-provider/`): раскладка `components/<Name>/`, извлечённые
 * классы, потребляемые токены, файлы темы и CSS компонентов.
 *
 * `libInjectCss` здесь намеренно НЕТ. Он вписывал CSS компонента в его
 * JS-чанк, а granum доставляет тот же CSS приложению через манифест — вместе
 * получилась бы двойная доставка, и сборка провайдера предупреждает о ней
 * (`css-double-delivery`, INV-CSS-5).
 */
export default defineConfig({
  /**
   * `__GR_DEV__` разворачивается в текст гарда **на нашей сборке**, а не
   * вычисляется в рантайме.
   *
   * Вынести проверку в хелпер нельзя: межмодульного инлайна бандлеры не делают
   * (замер на esbuild — `isDev()` сворачивается в `typeof process<"u"&&!1`, но
   * вызов остаётся, и вместе с ним в прод-бандл потребителя уезжают текст
   * предупреждения и дедуп-`Set`). Подстановка даёт то же, что и написанный
   * руками инлайн, — условие сворачивается в `false`, и вся ветка выкидывается
   * целиком, — но в исходниках остаётся один символ вместо повторяющегося
   * выражения.
   *
   * **Проверки `typeof process` здесь быть не должно.** Она выглядит как
   * страховка от `ReferenceError`, а на деле гасит гард целиком: в браузере
   * `process` не определён, и всё выражение схлопывается в `false` — в dev тоже.
   * Замерено на `apps/playground`: бандлер потребителя заменяет текст
   * `process.env.NODE_ENV` на `"development"`, но `typeof process` оставляет как
   * есть, поэтому ни одно предупреждение пакета до браузера не доходило.
   * Подстановка снимает и риск `ReferenceError`: к рантайму от выражения
   * остаётся литерал. Так же устроен `__DEV__` в esm-bundler-сборке Vue.
   *
   * Скобки обязательны: `!__GR_DEV__` без них развернулось бы в
   * `!process.env.NODE_ENV !== 'production'`.
   */
  define: {
    __GR_DEV__: '(process.env.NODE_ENV !== \'production\')',
  },
  plugins: [
    vue(),
    Icons({ compiler: 'vue3', autoInstall: false }),
    copyStylesPlugin(),
    // Строит entry компонентов и раскладку `dist`, извлекает классы и токены,
    // раскрывает `@apply`, материализует `tokenDefinitionsRef` в манифест и
    // пишет `dist/granum.manifest.json`.
    // Движок сборки задаётся явно и совпадает с диалектом, который провайдер
    // объявил: granum сверит это и не даст записать в манифест чужой словарь.
    // Список классов каждого компонента отфильтрован именно этой реализацией,
    // и её отпечаток уезжает в манифест как факт о списке.
    granumProvider({
      provider: granularityProvider,
      engine: miniEngine(),
      entries: extraEntries,
    }),
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
    rolldownOptions: {
      external: [
        /^node:/,
        'vue',
        /^@feugene\/fint-i18n(\/.*)?$/,
        // Держим снаружи бандла: это peer-зависимость. Иначе потребитель,
        // который сам её использует, получил бы вторую копию.
        /^@floating-ui\/dom(\/.*)?$/,
      ],
    },
  },
})
