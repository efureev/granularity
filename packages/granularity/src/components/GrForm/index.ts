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
  // Адресация модели и признак пустоты — те же, по которым судит сама форма.
  // Публичны ради тех, кто строит правила снаружи: своя копия `isEmpty`
  // разошлась бы с формой молча, и правило `min` перестало бы срабатывать
  // там, где форма считает поле заполненным.
  getByPath,
  type GrFormMessageResolver,
  type GrFormMessageTranslate,
  type GrFormRuleFailure,
  isEmpty,
  runFieldRules,
  setByPath,
} from './validation'
export type { GrFormEmits } from './GrForm.vue'
export type GrFormInstance = ComponentExposed<typeof GrFormComponent>
