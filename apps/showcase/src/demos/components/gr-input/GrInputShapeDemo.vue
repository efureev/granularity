<script setup lang="ts">
import { ref } from 'vue'

import type { GrComponentSize, GrControlShape } from '@feugene/granularity'
import { GrInput, GrSegmented } from '@feugene/granularity'

const shape = ref<GrControlShape>('pill')
const sizes: GrComponentSize[] = ['xs', 'sm', 'md', 'lg']

const values = ref<Record<string, string>>({ xs: '', sm: '', md: '', lg: '' })
const amount = ref('1200')
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
      Отступ идёт за формой: в пилюле он не меньше половины высоты, иначе текст
      заезжал бы в дугу. Видно на всех четырёх ступенях сразу.
    -->
    <div class="grid gap-3">
      <GrInput
        v-for="size in sizes"
        :key="size"
        v-model="values[size]"
        :size="size"
        :shape="shape"
        :placeholder="`Size ${size}`"
      />
    </div>

    <!-- Аддон-отсек обрезается по внешней дуге, а его разделитель остаётся прямым. -->
    <GrInput v-model="amount" :shape="shape" placeholder="Amount">
      <template #prefix>
        ₽
      </template>
      <template #suffix>
        .00
      </template>
    </GrInput>
  </div>
</template>
