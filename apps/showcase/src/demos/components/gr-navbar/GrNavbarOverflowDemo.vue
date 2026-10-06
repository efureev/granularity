<script setup lang="ts">
import { GrAvatar, GrButton, GrKbd, GrNavbar } from '@feugene/granularity'

// Разделов больше, чем помещается в 600px: уступает `left`, а не действия.
const sections = ['Overview', 'Invoices', 'Customers', 'Reports', 'Settings']
</script>

<template>
  <div data-demo="navbar-overflow" class="max-w-[600px] overflow-hidden rounded-xl border border-[var(--gr-brd)]">
    <GrNavbar title="Ledger">
      <template #left>
        <nav aria-label="Разделы" class="flex items-center gap-1">
          <GrButton v-for="section in sections" :key="section" variant="ghost" href="#">
            {{ section }}
          </GrButton>
        </nav>
      </template>

      <GrButton data-demo-search variant="ghost-border" tone="neutral" size="sm">
        Search <GrKbd keys="⌘K" size="xs" />
      </GrButton>
      <GrButton variant="ghost" size="sm" square aria-label="Уведомления">
        🔔
      </GrButton>
      <GrAvatar name="Ada Lovelace" size="sm" />
    </GrNavbar>
  </div>
</template>
