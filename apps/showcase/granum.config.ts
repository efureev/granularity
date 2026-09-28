import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

/**
 * Конфиг витрины: девять провайдеров в одной резолюции — ядро, семь спутников и правила иконок.
 *
 * Это самый широкий стенд репозитория, и именно на нём проверяется то, чего
 * узкие стенды не проверяют: дедупликация фундамента (токены, база и темы
 * приезжают от каждого пакета, а в CSS обязаны лечь один раз), порядок слоёв на
 * восьми манифестах и замыкание кросс-пакетных зависимостей компонентов.
 *
 * `components: 'all'` намеренно: витрина рендерит всё, что пакеты отдают, и
 * селекция по списку маскировала бы пропуски в демо.
 *
 * Правила иконок `i-lucide-*` приезжают девятым провайдером, а не опцией фабрики
 * движка. Разница не косметическая: правило, переданное `windEngine({ rules })`,
 * меняет отпечаток словаря приложения, он перестаёт совпадать с пакетным, и
 * granum честно пересчитывает классы всех восьми пакетов по их файлам — 547 мс
 * каждой сборки при нулевой разнице в результате. Правила ОТ провайдера
 * отпечаток не трогают: они добавляются ко входу генератора, а словарь движка
 * остаётся ванильным, и манифестам снова верят (A-E3, E-9).
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
    '@feugene/granularity-forms-schema',
    '@feugene/granularity-media',
    '@feugene/granularity-showcase-icons',
  ],
  components: 'all',
  themes: { names: ['light', 'dark'] },
  appSources: { dirs: ['src'] },
})
