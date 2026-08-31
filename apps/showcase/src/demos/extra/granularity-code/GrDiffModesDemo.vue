<script setup lang="ts">
import { ref } from 'vue'

import { GrSegmented, GrSwitch } from '@feugene/granularity'

/** Две ревизии конфига окружения — типичный вход журнала аудита. */
const BEFORE = `service: billing
replicas: 2
resources:
  cpu: 500m
  memory: 512Mi
env:
  LOG_LEVEL: info
  TIMEOUT_MS: 3000
  RETRIES: 3
healthcheck:
  path: /health
  interval: 10s`

const AFTER = `service: billing
replicas: 4
resources:
  cpu: 1000m
  memory: 512Mi
env:
  LOG_LEVEL: debug
  TIMEOUT_MS: 3000
  RETRIES: 5
healthcheck:
  path: /health
  interval: 10s`

const mode = ref<'unified' | 'split'>('unified')
const collapse = ref(true)
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <GrSegmented
        v-model="mode"
        size="sm"
        :options="[
          { value: 'unified', label: 'Одной колонкой' },
          { value: 'split', label: 'Двумя' },
        ]"
      />
      <GrSwitch v-model="collapse" size="sm">
        Сворачивать неизменное
      </GrSwitch>
    </div>

    <GrDiff :before="BEFORE" :after="AFTER" :mode="mode" :context="collapse ? 1 : Infinity" />
  </div>
</template>
