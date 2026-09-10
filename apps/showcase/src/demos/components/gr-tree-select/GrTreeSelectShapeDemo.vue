<script setup lang="ts">
import { ref } from 'vue'

import type { GrControlShape } from '@feugene/granularity'
import { GrSegmented, GrTreeSelect } from '@feugene/granularity'

interface CostCentre {
  id: number
  label: string
  children?: CostCentre[]
}

const costCentres: CostCentre[] = [
  {
    id: 1,
    label: 'Marketing',
    children: [
      { id: 11, label: 'Paid acquisition' },
      { id: 12, label: 'Events' },
    ],
  },
  {
    id: 2,
    label: 'Engineering',
    children: [
      { id: 21, label: 'Platform' },
      { id: 22, label: 'Mobile' },
    ],
  },
]

const shape = ref<GrControlShape>('pill')
const plain = ref<number | null>(11)
const withPrefix = ref<number | null>(21)
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      v-model="shape"
      :options="[{ value: 'box', label: 'box' }, { value: 'pill', label: 'pill' }]"
      size="sm"
      aria-label="Border shape"
    />

    <GrTreeSelect
      v-model="plain"
      :data="costCentres"
      :shape="shape"
      :default-expanded-keys="[1]"
      clearable
      placeholder="Cost centre"
      aria-label="Cost centre"
    />

    <!--
      Приставка прижата к левому краю, и её угол в пилюле обязан повторить дугу
      оболочки, а не остаться прямым.
    -->
    <GrTreeSelect
      v-model="withPrefix"
      :data="costCentres"
      :shape="shape"
      :default-expanded-keys="[2]"
      placeholder="Cost centre"
      aria-label="Cost centre with prefix"
      prefix-fixed
    >
      <template #prefix>
        <span class="i-lucide-wallet block h-4 w-4" />
      </template>
      <template #suffix>
        EUR
      </template>
    </GrTreeSelect>
  </div>
</template>
