<script setup lang="ts">
import {DsAlert} from "@feugene/granularity";
</script>
<template>
  <div class="grid gap-3">
    <DsAlert title="Info" tone="info">
      Deploy preview URL is ready for the QA handoff.
    </DsAlert>
    <DsAlert title="Success" tone="success">
      Billing sync finished and no manual retries are required.
    </DsAlert>
    <DsAlert title="Warning" tone="warning">
      API quota is at 78%; consider moving heavy jobs to the night window.
    </DsAlert>
    <DsAlert title="Danger" tone="danger">
      Background worker lost connection to Redis and needs operator attention.
    </DsAlert>
    <DsAlert title="Slate" tone="slate">
      Runbook is archived and kept for passive operator context.
    </DsAlert>
    <DsAlert title="Azure" tone="azure">
      Release note references are ready for stakeholder review.
    </DsAlert>
  </div>
</template>
