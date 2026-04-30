<script setup lang="ts">
import { useId } from 'vue'

/**
 * GrFormSection — секция формы с заголовком, опциональным описанием и контентом.
 *
 * - `section` связан с заголовком через `aria-labelledby` и c описанием
 *   (если есть) через `aria-describedby` — для a11y.
 */
export interface GrFormSectionProps {
  title: string
  description?: string
}

withDefaults(defineProps<GrFormSectionProps>(), {
  description: undefined,
})

const titleId = useId()
const descriptionId = useId()
</script>

<template>
  <section
    data-ds-form-section
    class="grid gap-4"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descriptionId : undefined"
  >
    <div>
      <div :id="titleId" class="text-[14px] font-700">
        {{ title }}
      </div>
      <div
        v-if="description"
        :id="descriptionId"
        class="mt-1 text-[13px] text-[var(--muted-fg)]"
      >
        {{ description }}
      </div>
    </div>
    <slot />
  </section>
</template>
