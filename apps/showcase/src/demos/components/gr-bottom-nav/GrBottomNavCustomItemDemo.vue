<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrAvatar, GrBottomNav, GrSegmented } from '@feugene/granularity'
import type { GrComponentSize } from '@feugene/granularity'

const section = ref('chats')
const size = ref<GrComponentSize>('md')

const sizes = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'SM' },
  { value: 'md', label: 'MD' },
  { value: 'lg', label: 'LG' },
]

const items = [
  { label: 'Chats', value: 'chats', icon: 'i-lucide-message-circle', badge: 5 },
  { label: 'Calls', value: 'calls', icon: 'i-lucide-phone' },
  { label: 'Ann Lee', value: 'me' },
]

// Забрав разметку пункта, размер глифа компонент за вас уже не считает.
const glyphClass = computed(() => ({ xs: 'h-4 w-4', sm: 'h-5 w-5', md: 'h-5 w-5', lg: 'h-6 w-6' })[size.value])
const avatarSize = computed(() => ({ xs: 20, sm: 24, md: 24, lg: 28 })[size.value])
</script>

<template>
  <div class="grid gap-4">
    <GrSegmented
      :model-value="size"
      :options="sizes"
      size="sm"
      class="justify-self-start"
      @update:model-value="size = $event as GrComponentSize"
    />

    <GrBottomNav
      v-model="section"
      :items="items"
      :size="size"
      position="static"
      hide-above="none"
    >
      <template #item="{ item, badgeLabel }">
        <GrAvatar
          v-if="item.value === 'me'"
          :size="avatarSize"
          alt="Ann Lee"
        >
          AL
        </GrAvatar>
        <span
          v-else-if="item.icon"
          :class="[item.icon, glyphClass]"
          class="block shrink-0"
          aria-hidden="true"
        />

        <span class="max-w-full truncate leading-none">{{ item.label }}</span>

        <template v-if="item.badge">
          <span
            class="absolute right-1 top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-[var(--gr-radius-full)] bg-[var(--gr-danger)] px-1 text-[length:var(--gr-text-2xs)] font-700 text-[var(--gr-danger-fg)]"
            aria-hidden="true"
          >{{ item.badge }}</span>
          <span class="sr-only">{{ badgeLabel }}</span>
        </template>
      </template>
    </GrBottomNav>
  </div>
</template>
