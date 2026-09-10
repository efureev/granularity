<script setup lang="ts">
import { ref } from 'vue'

import type { GrControlShape } from '@feugene/granularity'
import { GrFormField, GrNumberInput, GrSegmented } from '@feugene/granularity'

const shape = ref<GrControlShape>('pill')
const amount = ref<number | null>(1240.5)
const quantity = ref<number | null>(3)
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="shape"
      :options="[{ value: 'box', label: 'box' }, { value: 'pill', label: 'pill' }]"
      size="sm"
      aria-label="Border shape"
    />

    <!--
      Кнопки ± прижаты к краю оболочки, и в пилюле их обрезает её дуга: у
      оболочки `overflow-hidden`, поэтому внешний контур получается сам, а прямая
      граница между степпером и полем остаётся прямой.
    -->
    <div class="grid items-start gap-3 lg:grid-cols-2">
      <GrFormField label="Vertical steppers">
        <GrNumberInput
          v-model="amount"
          :shape="shape"
          controls
          clearable
          :precision="2"
          placeholder="0.00"
        />
      </GrFormField>

      <GrFormField label="Horizontal steppers">
        <GrNumberInput
          v-model="quantity"
          :shape="shape"
          controls
          controls-direction="horizontal"
          :min="1"
          placeholder="1"
        />
      </GrFormField>
    </div>
  </div>
</template>
