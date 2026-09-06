<script setup lang="ts">
import { ref } from 'vue'
import IconCheck from '~icons/lucide/check'
import IconLock from '~icons/lucide/lock'
import IconMoon from '~icons/lucide/moon'
import IconSun from '~icons/lucide/sun'
import IconX from '~icons/lucide/x'

import { GrButton, GrSwitch } from '@feugene/granularity'

const autosave = ref(true)
const theme = ref(false)
const access = ref(true)
const sync = ref(false)
const saving = ref(false)

/** Задержка нарочно заметная: без неё спиннер на бегунке проскакивает. */
function save(next: boolean): void {
  sync.value = next
  saving.value = true
  setTimeout(() => {
    saving.value = false
  }, 1400)
}
</script>

<template>
  <div class="grid gap-6">
    <div class="flex flex-wrap items-center gap-6">
      <GrSwitch v-model="autosave">
        <template #checked-icon>
          <IconCheck class="h-full w-full" />
        </template>
        <template #unchecked-icon>
          <IconX class="h-full w-full" />
        </template>
        Автосохранение
      </GrSwitch>

      <GrSwitch v-model="theme" size="lg">
        <template #checked-icon>
          <IconMoon class="h-full w-full" />
        </template>
        <template #unchecked-icon>
          <IconSun class="h-full w-full" />
        </template>
        Тёмная тема
      </GrSwitch>

      <GrSwitch v-model="access">
        <template #checked-icon>
          <IconLock class="h-full w-full" />
        </template>
        Доступ по ссылке
      </GrSwitch>
    </div>

    <div class="flex flex-wrap items-center gap-6">
      <GrSwitch
          v-for="size in (['xs', 'sm', 'md', 'lg'] as const)"
          :key="size"
          :model-value="true"
          :size
      >
        <template #checked-icon>
          <IconCheck class="h-full w-full" />
        </template>
        {{ size }}
      </GrSwitch>
    </div>

    <div class="flex flex-wrap items-center gap-4">
      <GrSwitch
          :model-value="sync"
          :loading="saving"
          @update:model-value="save"
      >
        <template #checked-icon>
          <IconCheck class="h-full w-full" />
        </template>
        <template #unchecked-icon>
          <IconX class="h-full w-full" />
        </template>
        Синхронизация
      </GrSwitch>
      <GrButton size="xs" variant="ghost" :disabled="saving" @click="save(!sync)">
        Переключить и подождать
      </GrButton>
    </div>
  </div>
</template>
