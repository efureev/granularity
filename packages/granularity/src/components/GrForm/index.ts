import type { ComponentExposed } from '../shared/instance'
import type GrFormComponent from './GrForm.vue'

export { default } from './GrForm.vue'
export { default as GrForm } from './GrForm.vue'
export { grFormConfig } from './config'
export { type GrFormContext, useGrFormContext } from './context'
export type {
  GrFormFileRule,
  GrFormProps,
  GrFormRule,
  GrFormRules,
  GrFormTrigger,
  GrFormValidatorResult,
} from './GrForm.vue'
export {
  createGrFormMessageResolver,
  type GrFormMessageResolver,
  type GrFormMessageTranslate,
  type GrFormRuleFailure,
  runFieldRules,
} from './validation'
export type { GrFormEmits } from './GrForm.vue'
export type GrFormInstance = ComponentExposed<typeof GrFormComponent>
