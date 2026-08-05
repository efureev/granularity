<script setup lang="ts">
import { GrLink } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 text-sm">
    <GrLink href="https://example.com/docs/showcase" external size="md">
      Open external documentation
    </GrLink>

    <!-- Условие — фактическое поведение ссылки, а не проп `external`. -->
    <GrLink href="https://example.com/changelog" target="_blank" size="md">
      Changelog в новой вкладке
    </GrLink>

    <GrLink href="https://example.com/rss" external :external-icon="false" size="md">
      Без иконки, но с предупреждением для скринридера
    </GrLink>

    <div class="rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-4 text-[var(--gr-muted-fg)]">
      Ссылка, открывающаяся в новой вкладке, сама получает иконку, безопасный `rel` и скрытую
      подсказку «откроется в новой вкладке» — предупреждение о смене контекста (WCAG 3.2.5).
    </div>
  </div>
</template>
