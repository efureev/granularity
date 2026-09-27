import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

/**
 * Конфиг SSR-стенда: шесть провайдеров в одной резолюции.
 *
 * До переезда на granum стенд подключал к пресету только ядро, а компоненты
 * пакетов-спутников рендерились без своих утилит: скан пресета ходил по
 * директориям ядра, и классов спутников в CSS попросту не было. Проверки стенда
 * это не ловили — они сверяют гидрацию, а не вид, — и расхождение жило молча.
 *
 * granum эту дыру закрывает по построению: каждый пакет приезжает своим
 * манифестом, классы в нём посчитаны на сборке пакета, и сканировать ничего не
 * нужно. Достаточно перечислить пакеты.
 *
 * `components: 'all'` намеренно: стенд рендерит каталог всего, что пакеты
 * отдают, и селекция по списку здесь маскировала бы пропуски.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: [
    '@feugene/granularity',
    '@feugene/granularity-charts',
    '@feugene/granularity-chrono',
    '@feugene/granularity-code',
    '@feugene/granularity-dashboard',
    '@feugene/granularity-editor',
  ],
  components: 'all',
  themes: { names: ['light', 'dark'] },
  appSources: { dirs: ['src'] },
})
