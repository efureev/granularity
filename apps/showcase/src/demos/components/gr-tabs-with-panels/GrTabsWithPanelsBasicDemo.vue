<script setup lang="ts">
import { ref } from 'vue'

import { GrTabPanel, GrTabsWithPanels, type GrTab } from '@feugene/granularity'

const active = ref('profile')
const tabs: GrTab[] = [
  { value: 'profile', label: 'Профиль' },
  { value: 'billing', label: 'Оплата', badge: '2' },
  { value: 'security', label: 'Безопасность' },
]
</script>

<template>
  <!-- Ни `id-base`, ни второго `v-model`: связка tab ↔ tabpanel собирается сама. -->
  <GrTabsWithPanels v-model="active" :tabs="tabs" class="max-w-lg">
    <GrTabPanel value="profile">Имя, почта и часовой пояс.</GrTabPanel>
    <GrTabPanel value="billing">Счета и способ оплаты.</GrTabPanel>
    <GrTabPanel value="security">Пароль, сессии и двухфакторная проверка.</GrTabPanel>
  </GrTabsWithPanels>
</template>
