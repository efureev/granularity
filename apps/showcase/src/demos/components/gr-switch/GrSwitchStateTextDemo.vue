<script setup lang="ts">
import { ref } from 'vue'

import { GrSwitch } from '@feugene/granularity'

const notifications = ref(true)
const digest = ref(false)
const large = ref(true)
const custom = ref(true)
</script>

<template>
  <div class="grid gap-6">
    <div class="flex flex-wrap items-center gap-6">
      <GrSwitch v-model="notifications" show-state-text>Уведомления</GrSwitch>
      <GrSwitch v-model="digest" show-state-text>Дайджест</GrSwitch>
      <GrSwitch v-model="large" show-state-text size="lg">Крупный размер</GrSwitch>
    </div>

    <div class="flex flex-wrap items-center gap-6">
      <GrSwitch
          v-model="custom"
          show-state-text
          checked-text="24/7"
          unchecked-text="OFF"
          size="lg"
      >
        Свои подписи
      </GrSwitch>
      <GrSwitch :model-value="true" show-state-text disabled>Недоступен</GrSwitch>
    </div>
  </div>
</template>
