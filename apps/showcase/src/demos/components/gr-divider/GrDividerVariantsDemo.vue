<script setup lang="ts">
import { GrDivider } from '@feugene/granularity'
</script>

<template>
  <div class="grid max-w-md gap-4">
    <div class="showcase-demo-text text-sm">solid · dashed · dotted</div>
    <GrDivider />
    <GrDivider variant="dashed" />
    <GrDivider variant="dotted" :thickness="2" />

    <GrDivider label="spacing=md" variant="dashed" spacing="md" />

    <!-- Вне flex-родителя вертикальной линии не от чего растянуться — высоту
         задаёт `length`. -->
    <div class="flex items-center gap-1 text-sm">
      <span class="showcase-demo-text">Файл</span>
      <GrDivider orientation="vertical" spacing="sm" :length="20" />
      <span class="showcase-demo-text">Правка</span>
      <GrDivider orientation="vertical" spacing="sm" :length="20" variant="dashed" />
      <span class="showcase-demo-text">Вид</span>
    </div>
  </div>
</template>
