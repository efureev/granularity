<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { GrButton } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3">
    <p class="text-sm text-[var(--muted-fg)]">
      Императивные вызовы диалогов (confirm / prompt / alert) из script/ts-секции без вставки
      компонента в шаблон вынесены на отдельную страницу сервиса useDialogService.
    </p>
    <RouterLink to="/composables/use-dialog-service" class="justify-self-start">
      <GrButton variant="primary">
        Открыть страницу useDialogService
      </GrButton>
    </RouterLink>
  </div>
</template>
