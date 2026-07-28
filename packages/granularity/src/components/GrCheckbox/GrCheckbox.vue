<script setup lang="ts">
/**
 * GrCheckbox — GR-примитив чекбокса с нативным скрытым `<input type="checkbox">`
 * для интеграции с HTML-формами (`FormData`, `required`, `form`).
 *
 * Источник истины — нативный input: клик по нему (в т.ч. по внешнему
 * `<label for="...">`) слушается через `@change` и эмитит модель. Клик по видимой
 * части компонента переключает через корневой обработчик.
 *
 * Клавиатура: `Space` переключает значение (Enter — намеренно нет, это нестандартно
 * для чекбоксов). Фокус — на самом контроле (квадратике), как у нативного чекбокса.
 *
 * A11y: `role="checkbox"` + `aria-checked` (`true`/`false`/`mixed`) + `aria-disabled`.
 * Роль висит **только на контроле**, а не на всей строке с подписью — по двум причинам:
 *  - роль объявляет своих потомков презентационными, поэтому ни нативный input, ни
 *    интерактивная подпись (ссылка на политику, кнопка «показать изменения») не могут
 *    жить внутри: скринридер теряет их, axe падает на `nested-interactive`;
 *  - имя виджета берётся из подписи через `aria-labelledby`, что и позволяет держать
 *    её снаружи вместе со всем её интерактивным содержимым.
 */
import { computed, onMounted, ref, useId, useSlots, watch } from 'vue'
import IconCheck from '~icons/lucide/check'
import IconMinus from '~icons/lucide/minus'

export interface GrCheckboxProps {
  modelValue?: boolean
  disabled?: boolean
  name?: string
  value?: string
  required?: boolean
  form?: string
  /** Пробрасывается на скрытый нативный `<input>`, чтобы работал `<label for="...">`. */
  id?: string
  /** Промежуточное («смешанное») состояние: `aria-checked="mixed"`, индикатор — тире. */
  indeterminate?: boolean
  /** Имя контрола, когда подписи в слоте нет (или она чисто визуальная). */
  ariaLabel?: string
}

const hiddenInputStyle = {
  position: 'absolute',
  opacity: '0',
  width: '0',
  height: '0',
  pointerEvents: 'none',
} as const

const props = withDefaults(defineProps<GrCheckboxProps>(), {
  modelValue: false,
  disabled: false,
  name: undefined,
  value: 'on',
  required: false,
  form: undefined,
  id: undefined,
  indeterminate: false,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const slots = useSlots()

const labelId = useId()
const hasLabel = computed(() => Boolean(slots.default))

// Держим `.checked` на нативном input синхронно с пропом — `:checked`-биндинг
// на скрытом элементе иногда отстаёт при программных обновлениях.
const nativeInput = ref<HTMLInputElement | null>(null)
const control = ref<HTMLElement | null>(null)
watch(
  () => props.modelValue,
  (value) => {
    if (nativeInput.value && nativeInput.value.checked !== value)
      nativeInput.value.checked = value
  },
)

// `indeterminate` можно выставить только через JS-свойство (не атрибут).
function syncIndeterminate(): void {
  if (nativeInput.value)
    nativeInput.value.indeterminate = props.indeterminate
}
watch(() => props.indeterminate, syncIndeterminate)
onMounted(syncIndeterminate)

function setChecked(next: boolean): void {
  if (props.disabled)
    return
  emit('update:modelValue', next)
}

function toggle(): void {
  // Из промежуточного состояния переключаемся во «включено» (стандартное поведение).
  setChecked(props.indeterminate ? true : !props.modelValue)
}

// Клик по нативному input (в т.ч. по внешнему `<label for="...">`) уже переключил его
// `.checked` — берём значение как источник истины и эмитим модель.
function onNativeChange(e: Event): void {
  setChecked((e.target as HTMLInputElement).checked)
}

// `<label for>` уводит фокус на скрытый input — визуально фокус пропадает. Возвращаем
// его на контрол, который этот фокус и показывает.
function onNativeFocus(): void {
  control.value?.focus()
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el)
    return false
  return !!el.closest('a,button,input,select,textarea,label,[role="button"],[role="link"]')
}

function onClick(e: MouseEvent): void {
  if (isInteractiveTarget(e.target))
    return
  toggle()
}
</script>
<template>
  <div
    data-gr-checkbox
    class="inline-flex items-center gap-2 select-none"
    :class="disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'"
    @click="onClick"
  >
    <input
      :id="id"
      ref="nativeInput"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :name="name"
      :value="value"
      :required="required"
      :form="form"
      tabindex="-1"
      aria-hidden="true"
      :style="hiddenInputStyle"
      @change="onNativeChange"
      @focus="onNativeFocus"
    >
    <span
      ref="control"
      data-gr-checkbox-indicator
      role="checkbox"
      :aria-checked="indeterminate ? 'mixed' : (modelValue ? 'true' : 'false')"
      :aria-disabled="disabled ? 'true' : undefined"
      :aria-required="required ? 'true' : undefined"
      :aria-label="ariaLabel"
      :aria-labelledby="!ariaLabel && hasLabel ? labelId : undefined"
      :tabindex="disabled ? -1 : 0"
      class="h-4 w-4 rounded border flex items-center justify-center transition-colors duration-150 focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--gr-ring),0_0_0_4px_var(--gr-bg)]"
      :class="(modelValue || indeterminate)
        ? 'border-[var(--gr-primary)] bg-[var(--gr-primary)]'
        : 'border-[var(--gr-brd)] bg-[var(--gr-bg)]'"
      @keydown.space.prevent="toggle"
    >
      <IconMinus
        v-if="indeterminate"
        class="gr-checkbox-icon h-3.5 w-3.5 text-[var(--gr-primary-fg)]"
      />
      <IconCheck
        v-else
        class="gr-checkbox-icon h-3.5 w-3.5 transition-transform transition-opacity duration-150"
        :class="modelValue
          ? 'opacity-100 scale-100 text-[var(--gr-primary-fg)]'
          : 'opacity-0 scale-75 text-transparent'"
      />
    </span>
    <span
      v-if="hasLabel"
      :id="labelId"
      class="text-sm text-[var(--gr-muted-fg)]"
    >
      <slot />
    </span>
  </div>
</template>
