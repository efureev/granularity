<script setup lang="ts">
import { ref } from 'vue'

/**
 * Два крайних случая, о которых обычно забывают: величины нет вовсе и величина
 * вышла за шкалу.
 *
 * Ни то, ни другое нельзя показать нулём или обрезанной полосой — оба варианта
 * нарисовали бы число, которого в данных нет.
 */
const state = ref<'normal' | 'missing' | 'overflow'>('missing')

const value = { normal: 0.031, missing: null, overflow: 0.12 }
const hint = {
  normal: 'Обычный случай: полоса внутри шкалы, цель рядом.',
  missing: 'Нет managed-списаний — нет и себестоимости. Полосы нет, цель на месте, в таблице прочерк. Роль `meter` при этом снимается: без `aria-valuenow` она невалидна.',
  overflow: 'Значение за верхом шкалы: полоса упирается в край и получает маркер переполнения, а настоящая величина уходит в тултип, таблицу и объявление.',
}
</script>

<template>
  <div class="grid gap-3">
    <GrSegmented
      v-model="state"
      size="sm"
      :options="[
        { value: 'normal', label: 'В норме' },
        { value: 'missing', label: 'Нет значения' },
        { value: 'overflow', label: 'За шкалой' },
      ]"
      aria-label="Состояние метрики"
    />

    <GrChartBullet
      :value="value[state]"
      :target="0.04"
      :ranges="[0.03, 0.04]"
      :max="0.05"
      label="Себестоимость кредита"
      :height="48"
      data-table="visible"
    />

    <p class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      {{ hint[state] }}
    </p>
  </div>
</template>
