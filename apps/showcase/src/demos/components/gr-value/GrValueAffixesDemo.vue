<script setup lang="ts">
import { GrCard, GrValue } from '@feugene/granularity'

const amount = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(1284500.5)
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-3">
    <GrCard variant="outlined" padding="md" body-class="grid gap-1">
      <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">Валюта слева</span>
      <span class="text-[length:var(--gr-text-2xl)] font-semibold">
        <GrValue :value="amount" prefix="$" />
      </span>
      <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
        Дефолт: приписка слева набирается как число
      </span>
    </GrCard>

    <!--
      Рубль пишут справа, но он такая же часть суммы. Дефолт суффикса ему не
      подходит, и его снимают токенами — компонент за потребителя не решает.
    -->
    <GrCard variant="outlined" padding="md" body-class="grid gap-1">
      <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">Валюта справа</span>
      <span
        class="text-[length:var(--gr-text-2xl)] font-semibold"
        style="--gr-value-suffix-color: currentColor; --gr-value-suffix-size: 1em"
      >
        <GrValue :value="amount" suffix="₽" />
      </span>
      <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
        Два токена — и приписка стала частью суммы
      </span>
    </GrCard>

    <GrCard variant="outlined" padding="md" body-class="grid gap-1">
      <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">Единица измерения</span>
      <span class="text-[length:var(--gr-text-2xl)] font-semibold">
        <GrValue :value="42" suffix="%" />
      </span>
      <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">
        Дефолт: приписка справа приглушена и отбита
      </span>
    </GrCard>
  </div>
</template>
