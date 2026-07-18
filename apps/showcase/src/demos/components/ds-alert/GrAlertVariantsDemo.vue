<script setup lang="ts">
import {GrAlert} from "@feugene/granularity";
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
</script>
<template>
  <div class="grid gap-3">
    <GrAlert :title="t('components.GrAlert.variants.infoTitle')" tone="info">
      {{ t('components.GrAlert.variants.infoMessage') }}
    </GrAlert>
    <GrAlert :title="t('components.GrAlert.variants.successTitle')" tone="success">
      {{ t('components.GrAlert.variants.successMessage') }}
    </GrAlert>
    <GrAlert :title="t('components.GrAlert.variants.warningTitle')" tone="warning">
      {{ t('components.GrAlert.variants.warningMessage') }}
    </GrAlert>
    <GrAlert :title="t('components.GrAlert.variants.dangerTitle')" tone="danger">
      {{ t('components.GrAlert.variants.dangerMessage') }}
    </GrAlert>
    <GrAlert :title="t('components.GrAlert.variants.slateTitle')" tone="slate">
      {{ t('components.GrAlert.variants.slateMessage') }}
    </GrAlert>
    <GrAlert :title="t('components.GrAlert.variants.azureTitle')" tone="azure">
      {{ t('components.GrAlert.variants.azureMessage') }}
    </GrAlert>
  </div>
</template>
