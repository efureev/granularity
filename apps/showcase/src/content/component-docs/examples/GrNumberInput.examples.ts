import type { ShowcaseComponentExampleDoc } from '../types'

export const grNumberInputExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'number-input-controls',
    title: 'Vertical and horizontal controls',
    description: 'Показываем базовый capability-scenario числового поля: инкремент/декремент, prefix/suffix slots и разную ориентацию controls.',
    status: 'ready',
    previewKey: 'gr-number-input-controls',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrNumberInput } from '@feugene/granularity'

const amount = ref('128.50')
const quantity = ref('3')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Vertical controls">
      <GrNumberInput v-model="amount" controls :precision="2" placeholder="0.00">
        <template #prefix>$</template>
      </GrNumberInput>
    </GrFormField>

    <GrFormField label="Horizontal controls">
      <GrNumberInput
        v-model="quantity"
        controls
        controls-direction="horizontal"
        :min="1"
        :max="10"
        placeholder="0"
      >
        <template #suffix>seats</template>
      </GrNumberInput>
    </GrFormField>
  </div>
</template>`,
  },
  {
    id: 'number-input-decimal-separator',
    title: 'Decimal separator, precision and range guards',
    description: 'Этот сценарий показывает локализованный ввод с запятой и одновременную работу `min`/`max`/`step`/`precision`.',
    status: 'ready',
    previewKey: 'gr-number-input-decimal-separator',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrNumberInput } from '@feugene/granularity'

const amountComma = ref('1,25')
const percentage = ref('42,5')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Comma decimal separator">
      <GrNumberInput
        v-model="amountComma"
        decimal-separator=","
        :precision="2"
        :step="0.25"
        placeholder="0,00"
      >
        <template #suffix>kg</template>
      </GrNumberInput>
    </GrFormField>

    <GrFormField label="Range guards">
      <GrNumberInput
        v-model="percentage"
        decimal-separator=","
        :min="0"
        :max="100"
        :step="0.5"
        :precision="1"
        placeholder="0,0"
      >
        <template #suffix>%</template>
      </GrNumberInput>
    </GrFormField>
  </div>
</template>`,
  },
  {
    id: 'number-input-alignment-addons',
    title: 'Text alignment with long add-ons',
    description: 'Карточка подчёркивает ещё один важный сценарий: числовое поле в финансовых формах с правым выравниванием и длинными suffix-элементами.',
    status: 'ready',
    previewKey: 'gr-number-input-alignment-addons',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrNumberInput, GrRadioGroup } from '@feugene/granularity'

const alignment = ref<'left' | 'center' | 'right'>('right')
const alignmentOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
]
const budget = ref('240000')
</script>

<template>
  <div class="grid gap-4">
    <GrRadioGroup v-model="alignment" :options="alignmentOptions" variant="button" size="sm" />

    <div class="grid gap-3 lg:grid-cols-2">
      <GrNumberInput
        v-model="budget"
        :text-align="alignment"
        suffix-min-width="3rem"
        suffix-max-width="8rem"
        placeholder="0"
      >
        <template #prefix>Budget</template>
        <template #suffix>Monthly recurring revenue</template>
      </GrNumberInput>

      <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] bg-[var(--gr-muted)]/40 p-4 text-sm text-[var(--gr-muted-fg)]">
        \`textAlign\` помогает согласовать числовые поля с табличными layout и формами с денежными значениями.
      </div>
    </div>
  </div>
</template>`,
  },
  {
    id: 'number-input-grouping',
    title: 'Locale-aware thousands grouping',
    description: 'С `useGrouping` поле показывает сгруппированное значение (тысячные разделители через `Intl.NumberFormat`) в состоянии blur и сырое — при фокусе для редактирования. Групповой разделитель берётся из `locale`, а десятичный уважает `decimalSeparator`.',
    status: 'ready',
    previewKey: 'gr-number-input-grouping',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrNumberInput } from '@feugene/granularity'

const usAmount = ref('1234567')
const euAmount = ref('1234567,89')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Grouped thousands (en-US)">
      <GrNumberInput v-model="usAmount" use-grouping locale="en-US" placeholder="0">
        <template #prefix>$</template>
      </GrNumberInput>
    </GrFormField>

    <GrFormField label="Locale grouping (de-DE, comma decimals)">
      <GrNumberInput
        v-model="euAmount"
        use-grouping
        locale="de-DE"
        decimal-separator=","
        :precision="2"
        placeholder="0,00"
      >
        <template #suffix>EUR</template>
      </GrNumberInput>
    </GrFormField>
  </div>
</template>`,
  },
]
