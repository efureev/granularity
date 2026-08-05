<script setup lang="ts">
import { ref } from 'vue'

import { GrCard } from '@feugene/granularity'

const opened = ref('—')
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-3 md:grid-cols-3">
      <GrCard padding="md" body-class="grid gap-1">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          elevated
        </div>
        <div class="text-sm text-[var(--gr-muted-fg)]">
          Рамка, фон и тень — вид по умолчанию.
        </div>
      </GrCard>

      <GrCard padding="md" variant="outlined" body-class="grid gap-1">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          outlined
        </div>
        <div class="text-sm text-[var(--gr-muted-fg)]">
          Без тени: плотные сетки не рябят.
        </div>
      </GrCard>

      <GrCard padding="md" variant="ghost" body-class="grid gap-1">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          ghost
        </div>
        <div class="text-sm text-[var(--gr-muted-fg)]">
          Без рамки: карточка внутри карточки.
        </div>
      </GrCard>
    </div>

    <!-- Внутри кликабельной карточки не должно быть кнопок и ссылок:
         интерактив внутри интерактива ломает и клавиатуру, и скринридер. -->
    <GrCard clickable padding="md" body-class="grid gap-1" @click="opened = 'Отчёт за июль'">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Отчёт за июль
      </div>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Вся поверхность кликабельна и достижима `Tab`.
      </div>
    </GrCard>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Открыто: <span class="font-semibold text-[var(--gr-fg)]">{{ opened }}</span>
    </div>
  </div>
</template>
