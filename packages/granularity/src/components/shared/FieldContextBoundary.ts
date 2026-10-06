import { defineComponent, provide } from 'vue'

import { GR_FORM_FIELD_KEY, type GrFormFieldContext } from './formFieldContext'

/**
 * Граница контекста `GrFormField`: контролы внутри его не видят.
 *
 * Нужна вспомогательным полям внутри панели — поиску `GrTreeSelect` и ему
 * подобным. Иначе такой `GrInput` забирал контекст поля целиком: id контрола
 * (тот же, что у триггера, — дубль в DOM), `aria-describedby` подсказки и
 * ошибки, `aria-required` и `aria-invalid`, и скринридер объявлял поиск
 * «обязательным, с ошибкой».
 */
export const FieldContextBoundary = defineComponent({
  name: 'GrFieldContextBoundary',
  setup(_props, { slots }) {
    provide(GR_FORM_FIELD_KEY, null as unknown as GrFormFieldContext)
    return () => slots.default?.()
  },
})
