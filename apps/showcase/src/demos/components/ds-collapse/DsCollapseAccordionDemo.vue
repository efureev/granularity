<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsBadge, DsCollapse, DsCollapseItem } from '@feugene/granularity'

const active = ref<string | number | undefined>('profile')

const activeLabel = computed(() => {
  if (active.value === 'profile')
    return 'Profile setup'

  if (active.value === 'notifications')
    return 'Notifications'

  if (active.value === 'security')
    return 'Security review'

  return 'Collapsed'
})
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-center gap-2 text-sm text-[var(--muted-fg)]">
      <span>Open panel:</span>
      <DsBadge tone="neutral">{{ activeLabel }}</DsBadge>
    </div>

    <DsCollapse v-model="active" accordion>
      <DsCollapseItem name="profile" title="Profile setup">
        Keep onboarding steps in a single accordion so only one block stays expanded at a time.
      </DsCollapseItem>
      <DsCollapseItem name="notifications" title="Notifications">
        Group less-frequent preferences into a secondary panel without overwhelming the main settings form.
      </DsCollapseItem>
      <DsCollapseItem name="security" title="Security review">
        Reserve the last section for sensitive actions or audit details.
      </DsCollapseItem>
    </DsCollapse>
  </div>
</template>