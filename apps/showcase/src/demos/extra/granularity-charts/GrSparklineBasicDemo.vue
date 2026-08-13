<script setup lang="ts">
// `GrSparkline` подставляется авто-импортом (`unplugin-vue-components`).

const rising = [12, 14, 13, 18, 22, 21, 28, 34]
const falling = [34, 30, 31, 24, 22, 18, 15, 11]
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <GrCard>
      <div class="grid gap-2">
        <span class="showcase-demo-text text-sm opacity-70">Signups</span>
        <strong class="text-xl">1 284</strong>
        <!-- Имя картинки собирается само: «рост, от 12 до 34, минимум 12, максимум 34». -->
        <GrSparkline :data="rising" />
      </div>
    </GrCard>

    <GrCard>
      <div class="grid gap-2">
        <span class="showcase-demo-text text-sm opacity-70">Churn</span>
        <strong class="text-xl">11</strong>
        <GrSparkline :data="falling" variant="area" />
      </div>
    </GrCard>
  </div>
</template>
