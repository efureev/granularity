<script setup lang="ts">
import { computed, useSlots } from 'vue'

import { DsCard } from '@feugene/granularity'
import InlineRichText from "../content/InlineRichText.vue";

defineProps<{
  /** Small kicker/eyebrow above the title. */
  eyebrow?: string
  /** Main heading text. */
  title?: string
  /** Supporting description text under the title. */
  description?: string
}>()

const slots = useSlots()

const hasEyebrow = computed(() => Boolean(slots.eyebrow) || false)
const hasTitle = computed(() => Boolean(slots.title) || false)
const hasDescription = computed(() => Boolean(slots.description) || false)
</script>

<template>
  <DsCard class="showcase-panel rounded-3xl border p-8">
    <div v-if="eyebrow || hasEyebrow" class="flex flex-wrap items-center gap-3">
      <span class="showcase-kicker text-xs font-semibold tracking-[0.18em]">
        <slot name="eyebrow">{{ eyebrow }}</slot>
      </span>
    </div>

    <div :class="(eyebrow || hasEyebrow) ? 'mt-5 space-y-4' : 'space-y-4'">
      <h1 v-if="title || hasTitle" class="max-w-4xl text-3xl font-semibold leading-tight lg:text-4xl">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="description || hasDescription" class="showcase-text-muted max-w-3xl text-base leading-7">
        <InlineRichText :text="description" />
      </p>
    </div>

    <div v-if="slots.actions" class="mt-5 flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </DsCard>
</template>
