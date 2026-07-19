<script setup lang="ts">
/**
 * GrToaster — GR-примитив области уведомлений (toast).
 *
 * Модель состояния берётся из `useToast`, поэтому в приложении предполагается
 * **один активный `GrToaster`** на корень (или app-scoped через плагин).
 *
 * A11y:
 * - контейнер — `role="region"` с `aria-label` (i18n-проп `regionLabel`);
 * - список обёрнут в ПОСТОЯННЫЙ live-region (`aria-live="polite"`), который
 *   существует до вставки тостов — иначе SR часто не озвучивают целиком
 *   вставленный узел с `aria-live`;
 * - критичные тосты (`warning`/`danger`) несут `role="alert"` (ассертивно).
 *
 * UX:
 * - `maxVisible` ограничивает стек; лишние ждут в очереди (их таймеры на паузе);
 * - автозакрытие **останавливается под курсором/фокусом** (WCAG 2.2.1) и
 *   визуализируется прогресс-баром до закрытия;
 * - `placement` настраивает угол экрана; слой — `--gr-z-toast`.
 */
import { computed, ref, watchEffect } from 'vue'
import type { Component } from 'vue'

import { useToast } from '../../composables/useToast'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type { GrToastTone } from '../../composables/useToast'
import GrButton from '../GrButton'
import GrIcon from '../GrIcon'
import { PLACEMENT_CLASS, type GrToasterPlacement } from './grToasterStyles'

import IconCheck from '~icons/lucide/check-circle'
import IconWarning from '~icons/lucide/alert-triangle'
import IconError from '~icons/lucide/x-circle'
import IconInfo from '~icons/lucide/info'
import IconClose from '~icons/lucide/x'

export type { GrToasterPlacement }

interface ToneMeta {
  icon: Component
  color: string
  role: 'status' | 'alert'
}

// Единый маппинг по tone'у: иконка, цвет, a11y-роль. На уровне модуля —
// чтобы не пересоздавать объект на каждый рендер.
const TONE_META: Record<GrToastTone, ToneMeta> = {
  primary: { icon: IconInfo, color: 'var(--primary)', role: 'status' },
  neutral: { icon: IconInfo, color: 'var(--muted-fg)', role: 'status' },
  info: { icon: IconInfo, color: 'var(--gr-info)', role: 'status' },
  success: { icon: IconCheck, color: 'var(--gr-success)', role: 'status' },
  warning: { icon: IconWarning, color: 'var(--gr-warning)', role: 'alert' },
  danger: { icon: IconError, color: 'var(--gr-danger)', role: 'alert' },
  slate: { icon: IconInfo, color: 'var(--gr-slate)', role: 'status' },
  azure: { icon: IconInfo, color: 'var(--gr-azure)', role: 'status' },
}

export interface GrToasterProps {
  /** Угол экрана для стека уведомлений. */
  placement?: GrToasterPlacement
  /** Максимум одновременно видимых тостов; остальные ждут в очереди. По умолчанию `4`. */
  maxVisible?: number
  /** A11y-лейбл кнопки закрытия (i18n). */
  dismissLabel?: string
  /** A11y-лейбл контейнера-региона (i18n). */
  regionLabel?: string
}

const props = withDefaults(defineProps<GrToasterProps>(), {
  placement: 'top-right',
  maxVisible: 4,
  dismissLabel: undefined,
  regionLabel: undefined,
})

const { t } = useGranularityTranslations()
const resolvedDismissLabel = computed(() => props.dismissLabel ?? t('gr.toaster.dismiss', 'Dismiss'))
const resolvedRegionLabel = computed(() => props.regionLabel ?? t('gr.toaster.region', 'Notifications'))

const { list, dismiss, pause, resume } = useToast()

// SSR-guard: на сервере `document.body` недоступен — отключаем `teleport`.
const isClient = typeof window !== 'undefined'

// Видимые тосты (не больше `maxVisible`); остальные — в очереди.
const visibleToasts = computed(() => list.value.slice(0, Math.max(1, props.maxVisible)))
const visibleIds = computed(() => new Set(visibleToasts.value.map(toast => toast.id)))

// Пауза под курсором/фокусом (WCAG 2.2.1). Один флаг на весь стек.
const paused = ref(false)

// Единый источник правды по таймерам: тост тикает, только если он видим И стек не на
// паузе. Очередь и hover — на паузе. Реагирует на изменения списка/hover.
watchEffect(() => {
  for (const toast of list.value) {
    if (visibleIds.value.has(toast.id) && !paused.value)
      resume(toast.id)
    else
      pause(toast.id)
  }
})

function metaFor(tone: GrToastTone): ToneMeta {
  return TONE_META[tone] ?? TONE_META.info
}

const containerClass = computed(() => PLACEMENT_CLASS[props.placement])
</script>

<template>
  <teleport to="body" :disabled="!isClient">
    <div
        data-gr-toaster
        role="region"
        :aria-label="resolvedRegionLabel"
        class="fixed z-[var(--gr-z-toast)] w-[360px] max-w-[calc(100vw-2rem)]"
        :class="containerClass"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
        @focusin="paused = true"
        @focusout="paused = false"
    >
      <!-- Постоянный live-region: существует всегда, поэтому вставленные тосты озвучиваются. -->
      <TransitionGroup
          tag="div"
          aria-live="polite"
          aria-atomic="false"
          class="grid gap-3"
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in absolute"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
          move-class="transition-transform duration-200 ease-out"
      >
        <div
            v-for="toast in visibleToasts"
            :key="toast.id"
            data-gr-toast
            :data-tone="toast.tone"
            :role="metaFor(toast.tone).role"
            aria-atomic="true"
            class="relative overflow-hidden rounded-[var(--gr-radius-lg)] border border-[var(--brd)] bg-[var(--card)] px-4 py-3 shadow-[var(--gr-shadow-2)]"
        >
          <div class="flex items-start gap-3">
            <GrIcon size="md" class="mt-0.5" :style="{ color: metaFor(toast.tone).color }" aria-hidden="true">
              <component :is="metaFor(toast.tone).icon" />
            </GrIcon>
            <div class="min-w-0 flex-1">
              <div class="text-[13px] font-700">
                {{ toast.title }}
              </div>
              <div v-if="toast.message" class="mt-0.5 text-[13px] text-[var(--muted-fg)]">
                {{ toast.message }}
              </div>
            </div>
            <GrButton
                variant="ghost"
                size="sm"
                square
                :aria-label="resolvedDismissLabel"
                @click="dismiss(toast.id)"
            >
              <GrIcon size="sm" aria-hidden="true">
                <IconClose />
              </GrIcon>
            </GrButton>
          </div>

          <!-- Прогресс до автозакрытия; замирает вместе с таймером на паузе. -->
          <div
              v-if="toast.timeoutMs > 0"
              data-gr-toast-progress
              aria-hidden="true"
              class="gr-toast-progress absolute bottom-0 left-0 h-[2px] w-full origin-left"
              :style="{
                backgroundColor: metaFor(toast.tone).color,
                animationDuration: `${toast.timeoutMs}ms`,
                animationPlayState: paused ? 'paused' : 'running',
              }"
          />
        </div>
      </TransitionGroup>
    </div>
  </teleport>
</template>

<style scoped>
.gr-toast-progress {
  animation-name: gr-toast-progress;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes gr-toast-progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style>
