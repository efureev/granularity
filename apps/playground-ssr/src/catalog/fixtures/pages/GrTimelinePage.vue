<script setup lang="ts">
import { GrTimeline, GrTimelineItem } from '@feugene/granularity'
</script>

<template>
  <GrTimeline>
    <GrTimelineItem time="10:24" datetime="2026-08-12T10:24" title="Заказ создан" tone="primary" />
    <GrTimelineItem time="11:03" datetime="2026-08-12T11:03" title="Оплачен" tone="success" />
  </GrTimeline>
</template>
