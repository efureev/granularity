<script setup lang="ts">
import IconCheck from '~icons/lucide/check'

const hiddenInputStyle = {
  position: 'absolute',
  opacity: '0',
  width: '0',
  height: '0',
  pointerEvents: 'none',
} as const

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    disabled?: boolean
    name?: string
    value?: string
    required?: boolean
    form?: string
  }>(),
  {
    modelValue: false,
    disabled: false,
    name: undefined,
    value: 'on',
    required: false,
    form: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

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
    class="ds-checkbox inline-flex items-center gap-2 select-none focus-visible:outline-none focus-visible:rounded-[8px] focus-visible:shadow-[0_0_0_2px_var(--ring),0_0_0_4px_var(--bg)]"
    role="checkbox"
    :aria-checked="props.modelValue ? 'true' : 'false'"
    :aria-disabled="props.disabled ? 'true' : undefined"
    :tabindex="props.disabled ? -1 : 0"
    :class="props.disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'"
    @click="onClick"
    @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle"
  >
    <input
      type="checkbox"
      :checked="props.modelValue"
      :disabled="props.disabled"
      :name="props.name"
      :value="props.value"
      :required="props.required"
      :form="props.form"
      tabindex="-1"
      aria-hidden="true"
      :style="hiddenInputStyle"
    >

    <span
      aria-hidden="true"
      class="ds-checkbox-box h-4 w-4 rounded border flex items-center justify-center transition-colors duration-150"
      :class="props.modelValue
        ? 'border-[var(--primary)] bg-[var(--primary)]'
        : 'border-[var(--brd)] bg-[var(--bg)]'"
    >
      <IconCheck
        class="ds-checkbox-icon h-3.5 w-3.5 transition-transform transition-opacity duration-150"
        :class="props.modelValue
          ? 'opacity-100 scale-100 text-[var(--primary-fg)]'
          : 'opacity-0 scale-75 text-transparent'"
      />
    </span>

    <span class="text-sm text-[var(--muted-fg)]">
      <slot />
    </span>
  </div>
</template>