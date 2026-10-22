<script setup lang="ts">
const tones = ['primary', 'success', 'warning', 'danger', 'info'] as const
</script>

<template>
  <div class="flex flex-col gap-4 bg-[var(--gr-bg)] p-5 text-[var(--gr-fg)]">
    <div class="flex flex-col gap-3 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 shadow-[var(--gr-shadow-1)]">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 flex-col gap-0.5">
          <p class="text-[length:var(--gr-text-sm)] font-600 leading-[var(--gr-leading-sm)]">
            Отчёт за квартал
          </p>
          <p class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            Обновлён сегодня в 9:41
          </p>
        </div>
        <GrBadge tone="success" size="sm">
          Готов
        </GrBadge>
      </div>
      <GrProgressBar :value="72" size="sm" aria-label="Готовность отчёта" />
      <div class="flex flex-wrap items-center gap-2">
        <GrButton size="sm">
          Опубликовать
        </GrButton>
        <GrButton size="sm" variant="secondary" tone="neutral">
          Предпросмотр
        </GrButton>
      </div>
    </div>
    <div class="flex items-center gap-1.5">
      <span
        v-for="tone in tones"
        :key="tone"
        class="h-3 w-6 rounded-full"
        :style="{ background: `var(--gr-${tone})` }"
      />
    </div>
  </div>
</template>
