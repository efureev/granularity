<script setup lang="ts">
import { ref } from 'vue'

import { GrTabPanel, GrTabsWithPanels, type GrTab } from '@feugene/granularity'

const active = ref('general')
const tabs: GrTab[] = [
  { value: 'general', label: 'Общие' },
  { value: 'members', label: 'Участники' },
  { value: 'integrations', label: 'Интеграции' },
]
</script>

<template>
  <GrTabsWithPanels v-model="active" :tabs="tabs" orientation="vertical" variant="line">
    <GrTabPanel value="general">Название рабочего пространства и его адрес.</GrTabPanel>
    <GrTabPanel value="members">Кто состоит в пространстве и с какими правами.</GrTabPanel>
    <GrTabPanel value="integrations">Подключённые сервисы и токены доступа.</GrTabPanel>
  </GrTabsWithPanels>
</template>
