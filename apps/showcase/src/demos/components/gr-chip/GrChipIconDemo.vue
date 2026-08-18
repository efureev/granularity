<script setup lang="ts">
import { ref } from 'vue'

import IconCheck from '~icons/lucide/check'
import IconUser from '~icons/lucide/user'

import { GrChip } from '@feugene/granularity'

const subscribed = ref(false)
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <GrChip label="Анна Петрова" tone="azure" closable>
      <template #icon>
        <IconUser class="h-full w-full" />
      </template>
    </GrChip>

    <GrChip
      v-model:selected="subscribed"
      label="Подписаться на изменения"
      tone="success"
      selectable
    >
      <template v-if="subscribed" #icon>
        <IconCheck class="h-full w-full" />
      </template>
    </GrChip>

    <GrChip label="Архивная метка" tone="neutral" closable disabled />
  </div>
</template>
