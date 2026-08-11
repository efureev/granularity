<script setup lang="ts">
import { GrTimeline, GrTimelineItem } from '@feugene/granularity'
</script>

<template>
  <div class="max-w-md">
    <GrTimeline>
      <GrTimelineItem
        time="10:24"
        datetime="2026-08-12T10:24"
        title="Заказ создан"
        description="Иванов И., через корзину"
        tone="primary"
      />
      <GrTimelineItem
        time="11:03"
        datetime="2026-08-12T11:03"
        title="Оплачен"
        description="Картой •• 4242"
        tone="success"
      />
      <GrTimelineItem
        time="14:47"
        datetime="2026-08-12T14:47"
        title="Передан в доставку"
        description="Трек-номер RU8412093"
        tone="info"
      />
      <GrTimelineItem
        time="ожидается"
        title="Вручение получателю"
        tone="neutral"
        pending
      />
    </GrTimeline>
  </div>
</template>
