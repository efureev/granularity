<script setup lang="ts">
import {GrAlert} from "@feugene/granularity";
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
</script>
<template>
  <div class="grid gap-3 lg:grid-cols-2">
    <GrAlert
      :title="t('components.GrAlert.customColors.brandTitle')"
      background-color="#ecfeff"
      border-color="#22d3ee"
      text-color="#155e75"
    >
      {{ t('components.GrAlert.customColors.brandMessage') }}
    </GrAlert>

    <GrAlert
      :title="t('components.GrAlert.customColors.mutedTitle')"
      background-color="#f8fafc"
      border-color="#cbd5e1"
      text-color="#334155"
    >
      {{ t('components.GrAlert.customColors.mutedMessage') }}
    </GrAlert>
  </div>
</template>
