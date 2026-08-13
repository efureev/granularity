/**
 * Пропы `GrSparkline`, настраиваемые глобально через
 * `<GrConfigProvider :component-defaults="{ GrSparkline: { … } }">`.
 *
 * Шкалы размеров у спарклайна нет: его размер — это его высота, а она задаётся
 * токеном `--gr-sparkline-height` либо контейнером.
 */
export interface GrSparklineConfigurableProps {
  variant: 'line' | 'area'
  showLastPoint: boolean
  summary: boolean
}

declare module '@feugene/granularity/composables/useGrComponentConfig' {
  interface GrComponentDefaultsRegistry {
    GrSparkline: GrSparklineConfigurableProps
  }
}
