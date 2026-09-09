<script setup lang="ts">
import { ref } from 'vue'

import { GrTabPanel, GrTabsWithPanels } from '@feugene/granularity'

const active = ref('overview')
const tabs = [
  { value: 'overview', label: 'Обзор' },
  { value: 'activity', label: 'Активность' },
]
</script>

<template>
  <!-- `id-base` не задан намеренно: он генерируется `useId()`, и сервер с клиентом
       обязаны получить одну и ту же базу — иначе связка разъедется на гидрации. -->
  <GrTabsWithPanels v-model="active" :tabs="tabs">
    <GrTabPanel value="overview">
      Обзор рабочей области
    </GrTabPanel>
    <GrTabPanel value="activity">
      Событий с прошлого визита: 3
    </GrTabPanel>
  </GrTabsWithPanels>
</template>
