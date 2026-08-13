import GrAutocomplete from '../components/GrAutocomplete/GrAutocomplete.vue'
import GrCheckbox from '../components/GrCheckbox/GrCheckbox.vue'
import GrCheckboxGroup from '../components/GrCheckboxGroup/GrCheckboxGroup.vue'
import GrColorPicker from '../components/GrColorPicker/GrColorPicker.vue'
import GrFileUpload from '../components/GrFileUpload/GrFileUpload.vue'
import GrFormFile from '../components/GrFormFile/GrFormFile.vue'
import GrInput from '../components/GrInput/GrInput.vue'
import GrInputTag from '../components/GrInputTag/GrInputTag.vue'
import GrNumberInput from '../components/GrNumberInput/GrNumberInput.vue'
import GrRadioGroup from '../components/GrRadioGroup/GrRadioGroup.vue'
import GrRating from '../components/GrRating/GrRating.vue'
import GrSegmented from '../components/GrSegmented/GrSegmented.vue'
import GrSelect from '../components/GrSelect/GrSelect.vue'
import GrSlider from '../components/GrSlider/GrSlider.vue'
import GrSwitch from '../components/GrSwitch/GrSwitch.vue'
import GrTextarea from '../components/GrTextarea/GrTextarea.vue'
import GrTreeSelect from '../components/GrTreeSelect/GrTreeSelect.vue'

/**
 * Реестр форм-контролов и хелперы вокруг него — один на все параметризованные
 * гейты (`formControlContract`, `formControlNegative`).
 *
 * Файл не тест: держать реестр внутри одного из них значило бы вести запись
 * контрола в двух местах, а расхождение таких списков — ровно то, из-за чего
 * находки аудита 2026-08-08 прошли мимо всей сюиты.
 */

export type Control = {
  name: string
  props: Record<string, unknown>
  /** Селектор элемента-виджета, на котором ожидаются ARIA-атрибуты. */
  widget: string
  /** Контрол не редактируется в принципе — `readonly` к нему неприменим. */
  noReadonly?: boolean
  /**
   * Виджет — `<button>`, а роль `button` не поддерживает ни `aria-required`,
   * ни `aria-readonly`: axe роняет их как critical `aria-allowed-attr`.
   * Такие контролы объявляют состояние текстом в описании (`aria-describedby`).
   */
  stateInDescription?: boolean
  /**
   * Элемент, чьё описание проверяется при `stateInDescription`. Не задан —
   * сам `widget`; у `GrFormFile` виджет-корень, а подпись и описание живут на
   * кнопке выбора файла.
   */
  describedWidget?: string
  /**
   * Значение, при котором изменение заметно, и его модельный вид. Нужно
   * негативным гейтам: с пустым значением «ничего не изменилось» неотличимо от
   * «нечего было менять».
   */
  filled?: Record<string, unknown>
  /**
   * Элемент, который слушает клавиатуру, если это не `widget`. У составных
   * контролов ARIA-роль стоит на контейнере (`radiogroup`), а стрелки
   * обрабатывает сфокусированный пункт — тест, отправивший клавишу в
   * контейнер, не проверяет ничего и молча зеленеет.
   */
  keyboardTarget?: string
}

export const controls: { component: unknown, meta: Control }[] = [
  { component: GrInput, meta: { name: 'GrInput', props: { modelValue: '' }, widget: 'input', filled: { modelValue: 'текст' } } },
  { component: GrTextarea, meta: { name: 'GrTextarea', props: { modelValue: '' }, widget: 'textarea', filled: { modelValue: 'текст' } } },
  { component: GrNumberInput, meta: { name: 'GrNumberInput', props: { modelValue: '' }, widget: 'input', filled: { modelValue: 5 } } },
  { component: GrSelect, meta: { name: 'GrSelect', props: { modelValue: '', options: [] }, widget: '[data-gr-select-native]', keyboardTarget: '[data-gr-select-trigger]', filled: { modelValue: 'a', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] } } },
  { component: GrAutocomplete, meta: { name: 'GrAutocomplete', props: { modelValue: '', options: [] }, widget: 'input', filled: { modelValue: 'a', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] } } },
  { component: GrTreeSelect, meta: { name: 'GrTreeSelect', props: { modelValue: null, data: [], nodeKey: 'id' }, widget: '[data-gr-tree-select-trigger]', filled: { modelValue: '1', data: [{ id: '1', label: 'Один' }, { id: '2', label: 'Два' }], nodeKey: 'id' } } },
  { component: GrInputTag, meta: { name: 'GrInputTag', props: { modelValue: [] }, widget: 'input', filled: { modelValue: ['раз'] } } },
  { component: GrCheckbox, meta: { name: 'GrCheckbox', props: { modelValue: false }, widget: '[role="checkbox"]', filled: { modelValue: true } } },
  { component: GrCheckboxGroup, meta: { name: 'GrCheckboxGroup', props: { modelValue: [], options: [{ value: 'a', label: 'A' }] }, widget: '[role="group"]', filled: { modelValue: ['a'], options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] } } },
  { component: GrRadioGroup, meta: { name: 'GrRadioGroup', props: { modelValue: 'a', options: [{ value: 'a', label: 'A' }] }, widget: '[role="radiogroup"]', keyboardTarget: '[role="radio"]', filled: { modelValue: 'a', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] } } },
  { component: GrSwitch, meta: { name: 'GrSwitch', props: { modelValue: false }, widget: '[role="switch"]', filled: { modelValue: true } } },
  { component: GrSlider, meta: { name: 'GrSlider', props: { modelValue: 0 }, widget: '[role="slider"]', filled: { modelValue: 50 } } },
  { component: GrRating, meta: { name: 'GrRating', props: { modelValue: 0 }, widget: '[data-gr-rating]', keyboardTarget: '[data-gr-rating-scale]', filled: { modelValue: 3 } } },
  { component: GrSegmented, meta: { name: 'GrSegmented', props: { modelValue: 'a', options: [{ value: 'a', label: 'A' }] }, widget: '[role="radiogroup"]', keyboardTarget: '[role="radio"]', filled: { modelValue: 'a', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] } } },
  { component: GrColorPicker, meta: { name: 'GrColorPicker', props: { modelValue: '#3b82f6' }, widget: '[data-gr-color-picker-trigger]', stateInDescription: true, filled: { modelValue: '#3b82f6' } } },
  { component: GrFormFile, meta: { name: 'GrFormFile', props: { modelValue: null }, widget: '[data-gr-form-file]', stateInDescription: true, describedWidget: '[data-gr-form-file-upload-btn]' } },
  { component: GrFileUpload, meta: { name: 'GrFileUpload', props: {}, widget: '[data-gr-file-upload]' } },
]

/**
 * Атрибут может стоять и на корне компонента (у `GrTextarea` корень — сам
 * `<textarea>`), и на вложенном виджете. `querySelector` корень не проверяет.
 */
export function hasAttr(root: Element, selector: string): boolean {
  return root.matches?.(selector) || root.querySelector?.(selector) !== null
}

/**
 * Текст, на который ссылается `aria-describedby` виджета. Пусто — состояние
 * никем не объявлено.
 */
export function describedText(root: Element, widget: string): string {
  const node = root.matches?.(widget) ? root : root.querySelector(widget)
  const ids = node?.getAttribute('aria-describedby')?.split(/\s+/) ?? []

  // Селектор по атрибуту, а не `#id`: `CSS.escape` в jsdom нет, а авто-id
  // приходят из `useId()` и экранирования всё равно требовать не должны.
  return ids
    .map(id => root.querySelector(`[id="${id}"]`)?.textContent ?? '')
    .join(' ')
}

export function declaredEmits(component: unknown): string[] {
  const emits = (component as { emits?: string[] | Record<string, unknown> }).emits ?? []
  return Array.isArray(emits) ? emits : Object.keys(emits)
}

export function declaredProps(component: unknown): string[] {
  return Object.keys((component as { props?: Record<string, unknown> }).props ?? {})
}
