<script setup lang="ts">
import { ref } from 'vue'
import IconFlame from '~icons/lucide/flame'
import IconSnowflake from '~icons/lucide/snowflake'

import { GrCard, GrSlider } from '@feugene/granularity'

const temperature = ref(22)
const budget = ref<number[]>([30, 70])
</script>

<template>
  <div class="grid gap-6">
    <GrCard class="grid gap-4 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Значение внутри ручки, иконки на делениях
      </div>

      <GrSlider
          v-model="temperature"
          :min="16"
          :max="30"
          :marks="{ 16: 'холодно', 23: 'комфорт', 30: 'жарко' }"
          aria-label="Температура"
          class="pb-6"
          style="--gr-slider-thumb-size: 2rem"
      >
        <template #thumb="{ value }">
          <span class="text-[length:var(--gr-control-text-2xs)] leading-none font-semibold text-[var(--gr-fg)]">
            {{ value }}
          </span>
        </template>

        <template #mark="{ label, value, active }">
          <span
              class="inline-flex items-center gap-1"
              :class="active ? 'text-[var(--gr-primary-text)]' : 'text-[var(--gr-muted-fg)]'"
          >
            <IconSnowflake v-if="value === 16" class="h-3 w-3" aria-hidden="true" />
            <IconFlame v-else-if="value === 30" class="h-3 w-3" aria-hidden="true" />
            {{ label }}
          </span>
        </template>
      </GrSlider>

      <div class="text-sm text-[var(--gr-muted-fg)]">
        Ручка увеличена токеном <code>--gr-slider-thumb-size</code>: слот
        наполняет её, но размер остаётся за оформлением — «совсем другая ручка»
        собирается связкой «токены + слот». <code>role="slider"</code>,
        клавиатура и восемь <code>aria-*</code> при этом остаются за
        компонентом.
      </div>
    </GrCard>

    <GrCard class="grid gap-4 p-4">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Пройденные деления диапазона
      </div>

      <GrSlider
          v-model="budget"
          range
          :marks="[0, 25, 50, 75, 100]"
          aria-label="Бюджет"
          class="pb-6"
      >
        <template #mark="{ label, active }">
          <span :class="active ? 'font-semibold text-[var(--gr-primary-text)]' : 'text-[var(--gr-muted-fg)]'">
            {{ label }}
          </span>
        </template>
      </GrSlider>

      <div class="text-sm text-[var(--gr-muted-fg)]">
        У диапазона пройденным считается участок между бегунками, а не от нуля:
        <code>active</code> считается тем же способом, что и сама заливка.
      </div>
    </GrCard>
  </div>
</template>
