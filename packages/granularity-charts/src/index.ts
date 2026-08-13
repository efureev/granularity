// <granularity:components> — блок генерируется `yarn generate:registry`
export * from './components/GrChartArea'
export * from './components/GrChartBar'
export * from './components/GrChartLine'
export * from './components/GrChartPie'
export * from './components/GrChartRadar'
export * from './components/GrSparkline'
// </granularity:components>

// Арифметика графика: типы входа, шкалы, деления, геометрия, раскладка.
// Отдаётся наружу целиком — по ней строят свою разметку там, где готового
// компонента не хватает.
export * from './chart'

export { useChartScale } from './composables/useChartScale'
export { useChartTicks } from './composables/useChartTicks'
export { type GrChartActivePoint, useChartTooltip } from './composables/useChartTooltip'

export { type GrChartsLocale, grChartsMessages } from './i18n'
