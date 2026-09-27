import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

/**
 * Компоненты, чей CSS уезжает в сборку.
 *
 * Список обязан совпадать с тем, что стенд реально рендерит: granum берёт
 * классы, токены и CSS ровно по нему. Пока здесь была одна кнопка, у `GrModal`
 * не находилось правил для `shadow-[var(--gr-shadow-2)]` и `overflow-hidden`, а
 * у триггера `GrSelect` — для `rounded-[var(--gr-radius-control)]`: окно
 * рисовалось без панели, иконки селекта вываливались под поле. С granum такой
 * промах стал громким: класс без правила попадает в `classes.unmatched`
 * отчёта сборки с указанием компонента-источника.
 */
export const playgroundComponents = [
  'GrButton',
  'GrDialog',
  'GrModal',
  'GrPromptDialog',
  'GrSelect',
] as const

/**
 * Конфиг приложения для granum.
 *
 * Тема стенда подключается **импортом** `src/styles/light-app.css` в
 * `main.ts`, а не отсюда. Так надёжнее, чем через `themes.tokenOverrides`:
 * файл приложения не лежит ни в одном слое granum, а нелейерный CSS по правилам
 * каскада выигрывает у любого `@layer`. Порядок импортов на это больше не
 * влияет — раньше влиял, и тема тихо проигрывала базовым токенам пакета.
 *
 * Движок — `windEngine()`: тот же словарь, что объявил пакет. Пресеты
 * `attributify` и `icons`, а также трансформеры `directives` и `variant-group`
 * из прежнего конфига убраны: ни одной строки разметки, которая ими
 * пользовалась бы, в стенде нет. Иконки приезжают компонентами через
 * `unplugin-icons`, и этот плагин остался на месте.
 */
export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: [
    { provider: '@feugene/granularity', names: [...playgroundComponents] },
  ],
  appSources: { dirs: ['src'] },
})
