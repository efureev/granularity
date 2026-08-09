<script setup lang="ts">
import {GrAlert} from "@feugene/granularity";
</script>
<template>
  <div class="grid gap-3">
    <GrAlert title="Info" tone="info">
      Deploy preview URL is ready for the QA handoff.
    </GrAlert>
    <GrAlert title="Success" tone="success">
      Billing sync finished and no manual retries are required.
    </GrAlert>
    <GrAlert title="Warning" tone="warning">
      API quota is at 78%; consider moving heavy jobs to the night window.
    </GrAlert>
    <GrAlert title="Danger" tone="danger">
      Background worker lost connection to Redis and needs operator attention.
    </GrAlert>
    <GrAlert title="Slate" tone="slate">
      Runbook is archived and kept for passive operator context.
    </GrAlert>
    <GrAlert title="Azure" tone="azure">
      Release note references are ready for stakeholder review.
    </GrAlert>
  </div>
</template>
