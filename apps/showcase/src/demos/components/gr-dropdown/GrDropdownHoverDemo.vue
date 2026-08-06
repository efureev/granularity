<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrDropdown, GrSwitch } from '@feugene/granularity'

const disabled = ref(false)
const lastAction = ref('—')

const items = ['Экспорт в CSV', 'Экспорт в XLSX', 'Отправить на почту']
</script>

<template>
  <div class="grid gap-3">
    <GrSwitch v-model="disabled" class="justify-self-start">
      disabled
    </GrSwitch>

    <div class="flex flex-wrap items-center gap-3">
      <!-- Наведение открывает панель, но клик и клавиатура продолжают работать:
           меню, доступное только мышью, недоступно с клавиатуры вовсе. -->
      <GrDropdown trigger="hover" :disabled="disabled" width="14rem">
        <template #trigger="{ triggerProps }">
          <GrButton variant="outline" v-bind="triggerProps">
            Действия (наведение)
          </GrButton>
        </template>

        <template #content>
          <div class="grid gap-1">
            <button
              v-for="item in items"
              :key="item"
              type="button"
              role="menuitem"
              class="rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--gr-accent)]"
              @click="lastAction = item"
            >
              {{ item }}
            </button>
          </div>
        </template>
      </GrDropdown>

      <GrBadge>{{ lastAction }}</GrBadge>
    </div>
  </div>
</template>
