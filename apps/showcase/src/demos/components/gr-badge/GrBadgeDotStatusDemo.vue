<script setup lang="ts">
import { GrBadge, GrCard } from '@feugene/granularity'

const orders = [
  { id: 'A-1041', customer: 'Ada Lovelace', status: 'Активен', dot: 'success' as const },
  { id: 'A-1042', customer: 'Grace Hopper', status: 'Ждёт оплаты', dot: 'warning' as const },
  { id: 'A-1043', customer: 'Alan Turing', status: 'Заблокирован', dot: 'danger' as const },
  { id: 'A-1044', customer: 'Ken Thompson', status: 'Черновик', dot: 'neutral' as const },
]
</script>

<template>
  <div class="grid gap-6">
    <GrCard class="grid gap-3 p-4">
      <div class="grid gap-2">
        <div
            v-for="order in orders"
            :key="order.id"
            class="flex items-center gap-3 text-sm"
        >
          <span class="w-16 text-[var(--gr-muted-fg)]">{{ order.id }}</span>
          <span class="w-40 text-[var(--gr-fg)]">{{ order.customer }}</span>
          <GrBadge tone="neutral" :dot="order.dot">
            {{ order.status }}
          </GrBadge>
        </div>
      </div>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Тихая плашка с цветным маркером: в плотном списке десяток цветных плашек
        соревнуется за внимание, а серая с точкой читается построчно.
      </div>
    </GrCard>

    <div class="flex flex-wrap items-center gap-2">
      <GrBadge tone="success" dot>
        Оплачено
      </GrBadge>
      <GrBadge tone="warning" dot>
        На проверке
      </GrBadge>
      <GrBadge tone="danger" dot>
        Просрочено
      </GrBadge>
      <GrBadge tone="info" dot>
        В работе
      </GrBadge>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <GrBadge
          v-for="size in (['xs', 'sm', 'md', 'lg'] as const)"
          :key="size"
          :size
          tone="neutral"
          dot="success"
      >
        {{ size }} — активен
      </GrBadge>
    </div>
  </div>
</template>
