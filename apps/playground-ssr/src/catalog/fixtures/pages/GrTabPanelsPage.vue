<script setup lang="ts">
import { ref } from 'vue'

import { GrTabPanel, GrTabPanels, GrTabs } from '@feugene/granularity'

const active = ref('overview')
const tabs = [
  { value: 'overview', label: 'Обзор' },
  { value: 'activity', label: 'Активность' },
]
</script>

<template>
  <div>
    <GrTabs v-model="active" :tabs="tabs" id-base="ssr-tabs" />
    <GrTabPanels v-model="active" id-base="ssr-tabs">
      <GrTabPanel value="overview">
        Обзор рабочей области
      </GrTabPanel>
      <GrTabPanel value="activity">
        Событий с прошлого визита: 3
      </GrTabPanel>
    </GrTabPanels>
  </div>
</template>
