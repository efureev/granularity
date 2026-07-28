import { defineConfig, presetMini } from 'unocss'
import {
  granularContent,
  presetGranularNode,
  type PresetGranularNodeOptions,
} from '@feugene/unocss-preset-granular/node'
import granularityProvider from '@feugene/granularity/granular-provider/node'

/**
 * Тема приложения подключается НЕ здесь, а обычным импортом CSS в `src/main.ts`.
 *
 * Почему так, хотя у пресета есть `themes.themeFiles`: это карта
 * «имя темы → файл», и она **заменяет** CSS уже существующей темы провайдера,
 * а не добавляет новую. Темы приходят пересечением `themes.names` с тем, что
 * объявил провайдер, поэтому имени `ocean` там взяться неоткуда — проверено
 * сборкой: с `themeFiles: { dark: … }` пакетная тёмная тема из бандла пропадает.
 *
 * `themeFiles` — инструмент «перекрасить встроенную тему», и он уместен, когда
 * тем по-прежнему две. Для ТРЕТЬЕЙ темы нужен свой CSS-слой приложения.
 */
const granularOptions: PresetGranularNodeOptions = {
  providers: [granularityProvider],
  themes: { names: ['light', 'dark'] },
  layer: 'granular',
}

export default defineConfig({
  content: granularContent(granularOptions),
  presets: [
    presetMini(),
    presetGranularNode(granularOptions),
  ],
})
