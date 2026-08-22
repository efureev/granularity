<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCard, GrDropdownMenu, GrDropdownMenuItem } from '@feugene/granularity'

const lastAction = ref('—')
</script>

<template>
  <!--
    Заголовок остаётся заголовком карточки — настоящим `h3` со своим уровнем и
    отступами, — а кнопка живёт в `#actions` справа от него. До этого слота
    карточке с действием приходилось забирать `#header` целиком и переписывать
    заголовок вручную.
  -->
  <GrCard title="Продажи за неделю" description="Обновлено 5 минут назад" :heading-level="3">
    <template #actions>
      <GrButton size="xs" variant="ghost" @click="lastAction = 'Обновить'">
        Обновить
      </GrButton>

      <GrDropdownMenu placement="bottom-end">
        <template #trigger="{ triggerProps }">
          <GrButton v-bind="triggerProps" size="xs" variant="ghost" square aria-label="Ещё">
            ⋯
          </GrButton>
        </template>

        <GrDropdownMenuItem @click="lastAction = 'Экспорт'">
          Экспорт в CSV
        </GrDropdownMenuItem>
        <GrDropdownMenuItem @click="lastAction = 'Настройки'">
          Настроить период
        </GrDropdownMenuItem>
      </GrDropdownMenu>
    </template>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Последнее действие: <strong>{{ lastAction }}</strong>
    </p>
  </GrCard>
</template>
