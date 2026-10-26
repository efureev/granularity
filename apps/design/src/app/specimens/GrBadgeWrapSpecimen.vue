<script setup lang="ts">
import { computed, ref } from 'vue'

import { GR_TONES } from '@feugene/granularity'
import type { GrBadgeWrapPlacement } from '@feugene/granularity'

import IconBell from '~icons/lucide/bell'
import IconMessageSquare from '~icons/lucide/message-square'

import { plural } from '../plural'
import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const unread = ref(3)
const unreadLabel = computed(() => plural(unread.value, ['непрочитанное уведомление', 'непрочитанных уведомления', 'непрочитанных уведомлений']))

function eventsLabel(count: number): string {
  return plural(count, ['новое событие', 'новых события', 'новых событий'])
}

const PLACEMENTS: readonly GrBadgeWrapPlacement[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <div class="flex flex-wrap items-center gap-6">
      <GrBadgeWrap :value="3" aria-label="3 непрочитанных уведомления">
        <GrButton variant="outline" tone="neutral" square aria-label="Уведомления">
          <GrIcon><IconBell /></GrIcon>
        </GrButton>
      </GrBadgeWrap>
      <GrBadgeWrap :value="120" :max="99" tone="primary" aria-label="120 писем ждут ответа">
        <GrButton variant="outline" tone="neutral">
          Входящие
        </GrButton>
      </GrBadgeWrap>
      <GrBadgeWrap dot tone="success" aria-label="Есть новые сообщения">
        <GrButton variant="outline" tone="neutral" square aria-label="Сообщения">
          <GrIcon><IconMessageSquare /></GrIcon>
        </GrButton>
      </GrBadgeWrap>
    </div>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Счётчик и точка" note="120 при max 99 рисуется «99+», а озвучивается настоящее число. Рост счётчика отмечается «попом», убыль — молча.">
      <div class="flex flex-wrap items-center gap-6">
        <GrBadgeWrap :value="unread" animate :aria-label="unreadLabel">
          <GrButton variant="outline" tone="neutral" square aria-label="Уведомления">
            <GrIcon><IconBell /></GrIcon>
          </GrButton>
        </GrBadgeWrap>
        <GrBadgeWrap :value="120" :max="99" tone="primary" aria-label="120 писем ждут ответа">
          <GrButton variant="outline" tone="neutral">
            Входящие
          </GrButton>
        </GrBadgeWrap>
        <GrBadgeWrap dot tone="success" aria-label="Есть новые сообщения">
          <GrButton variant="outline" tone="neutral" square aria-label="Сообщения">
            <GrIcon><IconMessageSquare /></GrIcon>
          </GrButton>
        </GrBadgeWrap>
      </div>
      <div class="flex flex-wrap gap-2">
        <GrButton size="sm" variant="ghost" tone="neutral" @click="unread++">
          Пришло уведомление
        </GrButton>
        <GrButton size="sm" variant="ghost" tone="neutral" :disabled="unread === 0" @click="unread = 0">
          Прочитать все
        </GrButton>
      </div>
    </Specimen>

    <Specimen title="Ноль" note="По умолчанию ноль прячет счётчик: пустой кружок читается как ошибка. showZero — когда ноль что-то значит.">
      <div class="flex flex-wrap items-center gap-6">
        <div class="flex flex-col items-start gap-2">
          <GrBadgeWrap :value="0">
            <GrButton variant="outline" tone="neutral">
              Входящие
            </GrButton>
          </GrBadgeWrap>
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">value · 0</code>
        </div>
        <div class="flex flex-col items-start gap-2">
          <GrBadgeWrap :value="0" show-zero tone="neutral" aria-label="0 черновиков">
            <GrButton variant="outline" tone="neutral">
              Черновики
            </GrButton>
          </GrBadgeWrap>
          <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">showZero</code>
        </div>
      </div>
    </Specimen>

    <Specimen title="Угол" note="placement — угол контрола; сдвиг от угла тема задаёт через --gr-badge-wrap-offset-x и -y.">
      <div class="flex flex-wrap items-center gap-6">
        <GrBadgeWrap v-for="placement in PLACEMENTS" :key="placement" :value="2" :placement="placement">
          <span class="flex h-10 w-24 items-center justify-center rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-card)] font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ placement }}
          </span>
        </GrBadgeWrap>
      </div>
    </Specimen>

    <Specimen title="Тоны" note="Тон по умолчанию — danger: счётчик зовёт к действию. Остальные — для спокойных событий.">
      <div class="flex flex-wrap items-center gap-6">
        <GrBadgeWrap v-for="(tone, index) in GR_TONES" :key="tone" :value="index + 1" :tone="tone" :aria-label="eventsLabel(index + 1)">
          <span class="flex h-10 w-20 items-center justify-center rounded-[var(--gr-radius-md)] border border-[var(--gr-brd)] bg-[var(--gr-card)] font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
            {{ tone }}
          </span>
        </GrBadgeWrap>
      </div>
    </Specimen>
  </div>
</template>
