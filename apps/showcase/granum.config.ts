import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

import { lucideIconRules } from './granum.icons'

/**
 * Конфиг витрины: восемь провайдеров в одной резолюции — ядро и семь спутников.
 *
 * Это самый широкий стенд репозитория, и именно на нём проверяется то, чего
 * узкие стенды не проверяют: дедупликация фундамента (токены, база и темы
 * приезжают от каждого пакета, а в CSS обязаны лечь один раз), порядок слоёв на
 * восьми манифестах и замыкание кросс-пакетных зависимостей компонентов.
 *
 * `components: 'all'` намеренно: витрина рендерит всё, что пакеты отдают, и
 * селекция по списку маскировала бы пропуски в демо.
 *
 * Правило иконок передано фабрике движка, а не конфигу: у конфига поля для
 * правил нет и не будет — правила принадлежат движку (см. `granum.icons.ts`).
 * Из-за него отпечаток словаря витрины отличается от записанного в манифестах
 * пакетов, поэтому granum пересчитает их классы своим движком. Наборы обязаны
 * совпасть: диалект тот же, а лишнее правило добавляет имена, которых в пакетах
 * нет.
 */
export default defineGranumConfig({
  engine: windEngine({ rules: lucideIconRules }),
  providers: [
    '@feugene/granularity',
    '@feugene/granularity-charts',
    '@feugene/granularity-chrono',
    '@feugene/granularity-code',
    '@feugene/granularity-dashboard',
    '@feugene/granularity-editor',
    '@feugene/granularity-forms-schema',
    '@feugene/granularity-media',
  ],
  components: 'all',
  themes: { names: ['light', 'dark'] },
  appSources: { dirs: ['src'] },
})
