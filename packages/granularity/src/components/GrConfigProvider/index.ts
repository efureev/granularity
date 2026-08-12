export { default } from './GrConfigProvider.vue'
export { default as GrConfigProvider } from './GrConfigProvider.vue'
export type { GrComponentDefaults, GrComponentSize } from './GrConfigProvider.vue'
export {
  GR_COMPONENT_SIZES,
  GR_CONFIG_KEY,
  type GrComponentDefaultsRegistry,
  type GrConfigContext,
  type GrConfigSource,
  type GrConfigurableComponent,
  resolveGrConfig,
  useGrComponentDefaults,
  useGrComponentProp,
  useGrComponentSize,
  type UseGrComponentSizeOptions,
  useGrConfig,
  // Нужен всем, кто рендерит панель в портал: `data-theme` через телепорт не
  // наследуется, и панель обязана проставить тему себе сама.
  useGrThemeAttrs,
} from './context'
export { grConfigProviderConfig } from './config'
export type { GrConfigProviderProps } from './GrConfigProvider.vue'
