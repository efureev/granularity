<script setup lang="ts">
import { ref } from 'vue'

import { GrCheckbox } from '@feugene/granularity'

const accepted = ref(false)
const previewOpens = ref(0)
</script>

<template>
  <div class="grid gap-4">
    <GrCheckbox v-model="accepted">
      <span class="inline-flex flex-wrap items-center gap-2 text-sm">
        I accept the rollout policy and reviewed the
        <a
          class="font-medium text-[var(--primary)] underline underline-offset-2"
          href="https://example.com/policy"
          target="_blank"
          rel="noreferrer"
          @click.stop
        >
          privacy policy
        </a>
        <button
          type="button"
          class="rounded-full border border-[var(--brd)] px-2 py-1 text-xs font-medium text-[var(--fg)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          @click.stop="previewOpens += 1"
        >
          Preview changes
        </button>
      </span>
    </GrCheckbox>

    <div class="rounded-2xl border border-dashed border-[var(--brd)] bg-[var(--muted)]/35 p-4 text-sm text-[var(--muted-fg)]">
      Checkbox value: <span class="font-semibold text-[var(--fg)]">{{ accepted ? 'accepted' : 'pending' }}</span> ·
      Preview clicked {{ previewOpens }} times.
    </div>
  </div>
</template>