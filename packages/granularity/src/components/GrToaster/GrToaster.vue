<script setup lang="ts">
/**
 * GrToaster — DS-примитив области уведомлений (toast).
 *
 * Модель состояния берётся из `useToast` (модульный синглтон), поэтому
 * в приложении предполагается **один активный `GrToaster`** на корень.
 *
 * A11y:
 * - контейнер — `role="region"` с `aria-label` (i18n-проп `regionLabel`);
 * - каждый toast — `role="status"` + `aria-live="polite"` для `info`/`success`
 *   и `role="alert"` + `aria-live="assertive"` для `warning`/`danger`
 *   (критичные сообщения должны прерывать скринридер).
 *
 * UX:
 * - появление/исчезновение анимируется `TransitionGroup`;
 * - `placement` настраивает угол экрана;
 * - `z-[60]` — выше, чем `GrModal` (`z-50`), чтобы уведомления не перекрывались диалогом.
 */
import {computed} from 'vue'
import type {Component} from 'vue'

import {useToast} from '../../composables/useToast'
import type {GrToastTone} from '../../composables/useToast'
import GrButton from '../GrButton'
import GrIcon from '../GrIcon'
import {PLACEMENT_CLASS, type GrToasterPlacement} from './grToasterStyles'

import IconCheck from '~icons/lucide/check-circle'
import IconWarning from '~icons/lucide/alert-triangle'
import IconError from '~icons/lucide/x-circle'
import IconInfo from '~icons/lucide/info'
import IconClose from '~icons/lucide/x'

export type {GrToasterPlacement}

interface ToneMeta {
  icon: Component
  color: string
  role: 'status' | 'alert'
  live: 'polite' | 'assertive'
}

// Единый маппинг по tone'у: иконка, цвет, a11y-роль и «напор» live-региона.
// На уровне модуля — чтобы не пересоздавать объект на каждый рендер.
const TONE_META: Record<GrToastTone, ToneMeta> = {
  primary: {icon: IconInfo, color: 'var(--primary)', role: 'status', live: 'polite'},
  neutral: {icon: IconInfo, color: 'var(--muted-fg)', role: 'status', live: 'polite'},
  info: {icon: IconInfo, color: 'var(--ds-info)', role: 'status', live: 'polite'},
  success: {icon: IconCheck, color: 'var(--ds-success)', role: 'status', live: 'polite'},
  warning: {icon: IconWarning, color: 'var(--ds-warning)', role: 'alert', live: 'assertive'},
  danger: {icon: IconError, color: 'var(--ds-danger)', role: 'alert', live: 'assertive'},
  slate: {icon: IconInfo, color: 'var(--ds-slate)', role: 'status', live: 'polite'},
  azure: {icon: IconInfo, color: 'var(--ds-azure)', role: 'status', live: 'polite'},
}


export interface GrToasterProps {
  /** Угол экрана для стека уведомлений. */
  placement?: GrToasterPlacement
  /** A11y-лейбл кнопки закрытия (i18n). */
  dismissLabel?: string
  /** A11y-лейбл контейнера-региона (i18n). */
  regionLabel?: string
}

const props = withDefaults(defineProps<GrToasterProps>(), {
  placement: 'top-right',
  dismissLabel: 'Dismiss',
  regionLabel: 'Notifications',
})

const {list, dismiss} = useToast()

// SSR-guard: на сервере `document.body` недоступен — отключаем `teleport`.
const isClient = typeof window !== 'undefined'

function metaFor(tone: GrToastTone): ToneMeta {
  return TONE_META[tone] ?? TONE_META.info
}

const containerClass = computed(() => PLACEMENT_CLASS[props.placement])
</script>

<template>
  <teleport to="body" :disabled="!isClient">
    <div
        data-ds-toaster
        role="region"
        :aria-label="regionLabel"
        class="fixed z-[60] grid w-[360px] max-w-[calc(100vw-2rem)] gap-3"
        :class="containerClass"
    >
      <TransitionGroup
          tag="div"
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
            v-for="toast in list"
            :key="toast.id"
            data-ds-toast
            :data-tone="toast.tone"
            :role="metaFor(toast.tone).role"
            :aria-live="metaFor(toast.tone).live"
            aria-atomic="true"
            class="rounded-[var(--ds-radius-lg)] border border-[var(--brd)] bg-[var(--card)] px-4 py-3 shadow-[var(--ds-shadow-2)]"
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
                :aria-label="dismissLabel"
                @click="dismiss(toast.id)"
            >
              <GrIcon size="sm" aria-hidden="true">
                <IconClose />
              </GrIcon>
            </GrButton>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </teleport>
</template>
