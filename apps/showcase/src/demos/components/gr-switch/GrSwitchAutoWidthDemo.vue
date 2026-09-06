<script setup lang="ts">
import { ref } from 'vue'

import { GrSwitch } from '@feugene/granularity'

const shortLabels = ref(true)
const availability = ref(true)
const access = ref(false)
const schedule = ref(true)
</script>

<template>
  <div class="grid gap-6">
    <div class="flex flex-wrap items-center gap-6">
      <GrSwitch v-model="shortLabels" show-state-text auto-width>
        Короткая подпись
      </GrSwitch>
      <GrSwitch
          v-model="availability"
          show-state-text
          auto-width
          checked-text="Онлайн"
          unchecked-text="Офлайн"
      >
        Статус
      </GrSwitch>
      <GrSwitch
          v-model="access"
          show-state-text
          auto-width
          size="lg"
          checked-text="Включено"
          unchecked-text="Отключено"
      >
        Доступ по ссылке
      </GrSwitch>
    </div>

    <div class="flex flex-wrap items-center gap-6">
      <GrSwitch
          v-model="schedule"
          show-state-text
          auto-width
          size="lg"
          checked-text="24/7"
          unchecked-text="По расписанию"
      >
        Приём заявок
      </GrSwitch>
    </div>
  </div>
</template>
