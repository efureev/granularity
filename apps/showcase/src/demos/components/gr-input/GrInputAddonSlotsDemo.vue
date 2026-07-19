<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput, GrSwitch } from '@feugene/granularity'

// Два поля управляют содержимым prefix и suffix целевого инпута — реактивно.
const prefixText = ref('International account')
const suffixText = ref('Primary settlement account')
const targetValue = ref('DE89 3704 0044 0532 0130 00')
const fixed = ref(true)
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <div class="grid gap-3">
      <GrFormField label="Prefix content">
        <GrInput v-model="prefixText" placeholder="Prefix text" />
      </GrFormField>

      <GrFormField label="Suffix content">
        <GrInput v-model="suffixText" placeholder="Suffix text" />
      </GrFormField>

      <GrSwitch v-model="fixed" size="sm">
        Fixed width (clip content) — off = stretch to content
      </GrSwitch>
    </div>

    <div class="grid content-start gap-2">
      <div class="text-xs font-600 uppercase tracking-wide text-[var(--muted-fg)]">
        Target field
      </div>

      <GrInput
        v-model="targetValue"
        placeholder="IBAN"
        :prefix-fixed="fixed"
        :suffix-fixed="fixed"
        prefix-max-width="7rem"
        suffix-max-width="8rem"
      >
        <template #prefix>{{ prefixText }}</template>
        <template #suffix>{{ suffixText }}</template>
      </GrInput>

      <p class="text-sm text-[var(--muted-fg)]">
        <template v-if="fixed">
          Fixed: аддоны держат заданную ширину, лишний текст обрезается — prefix с правого
          края, suffix с левого. Контент никогда не вылезает за рамки поля.
        </template>
        <template v-else>
          Stretch: аддоны растягиваются под контент (в пределах max-width), а всё лишнее
          аккуратно клипается оболочкой поля.
        </template>
      </p>
    </div>
  </div>
</template>
