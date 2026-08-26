<script setup lang="ts">
import { ref } from 'vue'

import { GrSplitter } from '@feugene/granularity'

// Стартовый размер приходит пропом: замер контейнера доступен только клиенту.
const size = ref(30)
</script>

<template>
  <div class="h-48">
    <GrSplitter v-model="size" aria-label="Ширина панели">
      <template #start>
        <div>Левая панель</div>
      </template>
      <template #end>
        <div>Правая панель</div>
      </template>
    </GrSplitter>
  </div>
</template>
