<script setup lang="ts">
import {DsAlert} from "@feugene/granularity";
</script>
<template>
  <div class="grid gap-3 lg:grid-cols-2">
    <DsAlert
      title="Custom brand banner"
      background-color="#ecfeff"
      border-color="#22d3ee"
      text-color="#155e75"
    >
      Teams often override colors to align alerts with domain-specific dashboards or tenant branding.
    </DsAlert>

    <DsAlert
      title="Muted reminder"
      background-color="#f8fafc"
      border-color="#cbd5e1"
      text-color="#334155"
    >
      The component still keeps the same layout, icon slotting and close mechanics while colors are fully customized.
    </DsAlert>
  </div>
</template>
