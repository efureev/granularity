<script setup lang="ts">
import { ref } from 'vue'

import { GrAvatar, GrBadge, GrButton, GrNavbar } from '@feugene/granularity'

const notifications = ref(3)
</script>

<template>
  <!--
    GrNavbar — это ГЛОБАЛЬНЫЙ верхний хедер приложения (`<header>`-landmark),
    который тянется на всю ширину над маршрутизируемым контентом. Здесь он показан
    в контексте настоящего app-shell: хедер сверху + контент под ним.
    Не путайте с секционными заголовками страниц и marketing-навигацией.
  -->
  <div class="overflow-hidden rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-bg)] shadow-[var(--gr-shadow-1)]">
    <GrNavbar title="Acme Console">
      <GrButton size="sm" variant="ghost" square aria-label="Search">
        <span class="i-lucide-search block h-4 w-4" aria-hidden="true" />
      </GrButton>

      <GrButton size="sm" variant="ghost" square aria-label="Notifications" @click="notifications = 0">
        <span class="relative inline-flex">
          <span class="i-lucide-bell block h-4 w-4" aria-hidden="true" />
          <GrBadge v-if="notifications" size="xs" tone="danger" dark class="absolute -right-2 -top-2">
            {{ notifications }}
          </GrBadge>
        </span>
      </GrButton>

      <GrAvatar :size="28" alt="Ada Lovelace" />
    </GrNavbar>

    <!-- Условный контент приложения под хедером -->
    <div class="grid gap-3 p-5">
      <div class="h-3 w-40 rounded bg-[var(--gr-muted)]" />
      <div class="grid gap-2 sm:grid-cols-3">
        <div class="h-16 rounded-lg border border-[var(--gr-brd)] bg-[var(--gr-card)]" />
        <div class="h-16 rounded-lg border border-[var(--gr-brd)] bg-[var(--gr-card)]" />
        <div class="h-16 rounded-lg border border-[var(--gr-brd)] bg-[var(--gr-card)]" />
      </div>
    </div>
  </div>

  <p class="mt-3 text-sm text-[var(--gr-muted-fg)]">
    Правый слот — для глобальных действий уровня приложения: поиск, уведомления, аккаунт.
    Для навигации по разделам используйте <code>GrSidebar</code> (десктоп) или
    <code>GrBottomNav</code> (мобайл), а не сам хедер.
  </p>
</template>
