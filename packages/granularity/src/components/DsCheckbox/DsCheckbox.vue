<script setup lang="ts">
/**
 * DsCheckbox — DS-примитив чекбокса с нативным скрытым `<input type="checkbox">`
 * для интеграции с HTML-формами (`FormData`, `required`, `form`).
 *
 * Клавиатура: `Space`/`Enter` переключают значение, фокус — на корневом элементе.
 * A11y: `role="checkbox"` + `aria-checked`/`aria-disabled`.
 */
import { ref, watch } from 'vue'
import IconCheck from '~icons/lucide/check'

export interface DsCheckboxProps {
  modelValue?: boolean
  disabled?: boolean
  name?: string
  value?: string
  required?: boolean
  form?: string
  /** Пробрасывается на скрытый нативный `<input>`, чтобы работал `<label for="...">`. */
  id?: string
}

const hiddenInputStyle = {
  position: 'absolute',
  opacity: '0',
  width: '0',
  height: '0',
  pointerEvents: 'none',
} as const

const props = withDefaults(defineProps<DsCheckboxProps>(), {
  modelValue: false,
  disabled: false,
  name: undefined,
  value: 'on',
  required: false,
  form: undefined,
  id: undefined,
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

function toggle(): void {
  if (props.disabled)
    return
  emit('update:modelValue', !props.modelValue)
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
    data-ds-checkbox
    class="inline-flex items-center gap-2 select-none focus-visible:outline-none focus-visible:rounded-[8px] focus-visible:shadow-[0_0_0_2px_var(--ring),0_0_0_4px_var(--bg)]"
    role="checkbox"
    :aria-checked="modelValue ? 'true' : 'false'"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled ? -1 : 0"
    :class="disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'"
    @click="onClick"
    @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle"
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
    >
    <span
      data-ds-checkbox-indicator
      aria-hidden="true"
      class="h-4 w-4 rounded border flex items-center justify-center transition-colors duration-150"
      :class="modelValue
        ? 'border-[var(--primary)] bg-[var(--primary)]'
        : 'border-[var(--brd)] bg-[var(--bg)]'"
    >
      <IconCheck
        class="ds-checkbox-icon h-3.5 w-3.5 transition-transform transition-opacity duration-150"
        :class="modelValue
          ? 'opacity-100 scale-100 text-[var(--primary-fg)]'
          : 'opacity-0 scale-75 text-transparent'"
      />
    </span>
    <span class="text-sm text-[var(--muted-fg)]">
      <slot />
    </span>
  </div>
</template>
