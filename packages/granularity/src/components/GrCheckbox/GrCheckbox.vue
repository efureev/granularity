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
 * для чекбоксов). Фокус — на корневом элементе.
 * A11y: `role="checkbox"` + `aria-checked` (`true`/`false`/`mixed`) + `aria-disabled`.
 */
import { onMounted, ref, watch } from 'vue'
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
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// Держим `.checked` на нативном input синхронно с пропом — `:checked`-биндинг
// на скрытом элементе иногда отстаёт при программных обновлениях.
const nativeInput = ref<HTMLInputElement | null>(null)
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
    class="inline-flex items-center gap-2 select-none focus-visible:outline-none focus-visible:rounded-[8px] focus-visible:shadow-[0_0_0_2px_var(--gr-ring),0_0_0_4px_var(--gr-bg)]"
    role="checkbox"
    :aria-checked="indeterminate ? 'mixed' : (modelValue ? 'true' : 'false')"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled ? -1 : 0"
    :class="disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'"
    @click="onClick"
    @keydown.space.prevent="toggle"
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
    >
    <span
      data-gr-checkbox-indicator
      aria-hidden="true"
      class="h-4 w-4 rounded border flex items-center justify-center transition-colors duration-150"
      :class="(modelValue || indeterminate)
        ? 'border-[var(--gr-primary)] bg-[var(--gr-primary)]'
        : 'border-[var(--gr-brd)] bg-[var(--gr-bg)]'"
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
    <span class="text-sm text-[var(--gr-muted-fg)]">
      <slot />
    </span>
  </div>
</template>
