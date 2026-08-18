/**
 * Компоненты ядра, которые рисует дефолтный набор рендереров.
 *
 * Отдельным модулем без единого импорта — по той же причине, по которой
 * отдельно живёт `componentNames.ts`: этот список читает `config.ts`, а его
 * загружает `granular doctor` в Node. Возьми он список из самого реестра —
 * подтянулись бы SFC вместе с их CSS-импортами, и загрузка упала бы на первом
 * же `.css`, которого Node не понимает.
 */
export const CORE_RENDERER_COMPONENTS = [
  'GrCheckbox',
  'GrCheckboxGroup',
  'GrFormFile',
  'GrInput',
  'GrInputTag',
  'GrNumberInput',
  'GrRadioGroup',
  'GrSelect',
  'GrTextarea',
] as const

/** Компоненты, из которых собрана сама форма, помимо контролов. */
export const FORM_SHELL_COMPONENTS = [
  'GrAlert',
  'GrButton',
  'GrForm',
  'GrFormField',
  'GrFormSection',
] as const
