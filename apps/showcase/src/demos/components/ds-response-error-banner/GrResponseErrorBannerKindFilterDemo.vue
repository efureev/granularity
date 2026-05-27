<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'

import {
  GrButton,
  GrCard,
  GrResponseErrorBanner,
  GrSelect,
  type ResponseErrorInfo,
  type ResponseErrorKind,
  useResponseError,
} from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const i18n = useFintI18n()
const { t } = i18n
const NS = 'components.GrResponseErrorBanner'

class FakeHttpError extends Error {
  isAxiosError = true
  response: { status: number, data: unknown, headers?: Record<string, string> }
  code?: string

  constructor(status: number, data: unknown, headers?: Record<string, string>) {
    super(`Request failed with status ${status}`)
    this.name = 'AxiosError'
    this.response = { status, data, headers }
  }
}

class FakeNetworkError extends Error {
  isAxiosError = true
  code = 'ERR_NETWORK'

  constructor() {
    super('Network Error')
    this.name = 'AxiosError'
  }
}

class FakeAbortError extends DOMException {
  constructor() {
    super('The user aborted a request.', 'AbortError')
  }
}

type PresetId =
  | 'network'
  | 'aborted'
  | 'laravel-422'
  | 'client-404'
  | 'server-500'

const presets = computed<{ id: PresetId, label: string, build: () => unknown }[]>(() => [
  { id: 'network', label: t(`${NS}.preset.network`), build: () => new FakeNetworkError() },
  { id: 'aborted', label: t(`${NS}.preset.aborted`), build: () => new FakeAbortError() },
  {
    id: 'laravel-422',
    label: t(`${NS}.preset.laravel-422`),
    build: () => new FakeHttpError(422, {
      message: t(`${NS}.mock.laravel.message`),
      errors: {
        file: [t(`${NS}.mock.laravel.file.required`)],
        amount: [t(`${NS}.mock.laravel.amount.positive`)],
      },
    }),
  },
  { id: 'client-404', label: t(`${NS}.preset.client-404`), build: () => new FakeHttpError(404, { message: 'Resource not found' }) },
  { id: 'server-500', label: t(`${NS}.preset.server-500`), build: () => new FakeHttpError(500, { message: 'Internal Server Error' }) },
])

const presetOptions = computed(() => presets.value.map(p => ({ label: p.label, value: p.id })))
const selectedPreset = ref<PresetId>('client-404')

/**
 * Whitelist of error kinds the banner should react to.
 * Everything else (`client`, `server`, `aborted`, `unknown`) is silently swallowed.
 *
 * Laravel-валидация (422 + `errors`) попадает в `kind: 'validation'`,
 * поэтому ровно те же два kind покрывают и «сетевую ошибку», и «laravel-валидацию».
 */
const ALL_KINDS: ResponseErrorKind[] = ['network', 'aborted', 'validation', 'client', 'server', 'unknown']
const allowedKinds = ref<ResponseErrorKind[]>(['network', 'validation'])

const autoHideKinds = computed<ResponseErrorKind[]>(() =>
  ALL_KINDS.filter(k => !allowedKinds.value.includes(k)),
)

const { currentError, setRaw, dismiss } = useResponseError({
  autoHideKinds: () => autoHideKinds.value,
})

const eventLog = shallowRef<string[]>([])
function log(msg: string) {
  eventLog.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...eventLog.value].slice(0, 10)
}

async function trigger() {
  const preset = presets.value.find(p => p.id === selectedPreset.value)
  if (!preset)
    return
  const raw = preset.build()
  const info = await setRaw(raw, { presetId: preset.id })
  if (info)
    log(`${t(`${NS}.filter.shown`)} kind=${info.kind}${info.status ? `, status=${info.status}` : ''}`)
  else
    log(t(`${NS}.filter.hidden`))
}

function onRetry(info: ResponseErrorInfo) {
  log(`@retry (kind=${info.kind})`)
  dismiss()
}

function toggleKind(kind: ResponseErrorKind) {
  if (allowedKinds.value.includes(kind))
    allowedKinds.value = allowedKinds.value.filter(k => k !== kind)
  else
    allowedKinds.value = [...allowedKinds.value, kind]
  // Если текущая ошибка перестала быть в whitelist — спрячем баннер.
  if (currentError.value && !allowedKinds.value.includes(currentError.value.kind))
    dismiss()
}
</script>

<template>
  <GrCard class="grid gap-3 p-4">
    <div class="grid gap-2">
      <div class="text-sm font-semibold text-[var(--fg)]">
        {{ t(`${NS}.filter.whitelistLabel`) }}
      </div>
      <div class="flex flex-wrap gap-2">
        <label
          v-for="kind in ALL_KINDS"
          :key="kind"
          class="flex cursor-pointer items-center gap-1 rounded border border-[var(--border)] px-2 py-1 text-[12px]"
        >
          <input
            type="checkbox"
            :checked="allowedKinds.includes(kind)"
            @change="toggleKind(kind)"
          >
          <span>{{ kind }}</span>
        </label>
      </div>
      <div class="text-[12px] text-[var(--muted-fg)]">
        {{ t(`${NS}.filter.hint`) }}
      </div>
    </div>

    <div class="flex flex-wrap items-end gap-3">
      <div class="min-w-[260px] flex-1">
        <GrSelect v-model="selectedPreset" :options="presetOptions" />
      </div>
      <GrButton size="sm" variant="primary" @click="trigger">
        {{ t(`${NS}.Throw error`) }}
      </GrButton>
      <GrButton size="sm" variant="outline" @click="dismiss">
        {{ t(`${NS}.Reset`) }}
      </GrButton>
    </div>

    <GrResponseErrorBanner
      :error="currentError"
      can-retry
      @retry="onRetry"
      @dismiss="dismiss"
    />

    <div class="grid gap-1">
      <div class="text-sm font-semibold text-[var(--fg)]">
        {{ t(`${NS}.Event log`) }}
      </div>
      <pre class="max-h-[160px] overflow-auto rounded bg-[var(--muted)] p-3 text-[12px]">{{ eventLog.join('\n') || '—' }}</pre>
    </div>
  </GrCard>
</template>
