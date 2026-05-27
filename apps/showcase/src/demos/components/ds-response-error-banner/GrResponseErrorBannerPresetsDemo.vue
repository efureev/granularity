<script setup lang="ts">
import {computed, ref, shallowRef} from 'vue'

import {
  GrButton,
  GrCard,
  GrResponseErrorBanner,
  GrSelect,
  type ResponseErrorInfo,
  useResponseError,
} from '@feugene/granularity'
import {useFintI18n} from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const NS = 'components.GrResponseErrorBanner'

class FakeHttpError extends Error {
  isAxiosError = true
  response: { status: number, data: unknown, headers?: Record<string, string> }
  code?: string

  constructor(status: number, data: unknown, headers?: Record<string, string>) {
    super(`Request failed with status ${status}`)
    this.name = 'AxiosError'
    this.response = {status, data, headers}
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

class FakeFileValidationError extends Error {
  issues: { file: { name: string }, message: string }[]

  constructor(issues: { file: { name: string }, message: string }[]) {
    super('File validation failed')
    this.name = 'FileValidationError'
    this.issues = issues
  }
}

type PresetId =
    | 'network'
    | 'aborted'
    | 'laravel-422'
    | 'jsonapi-422'
    | 'rfc7807-403'
    | 'client-404'
    | 'server-500'
    | 'file-validation'
    | 'plain-string'

const presets = computed<{ id: PresetId, label: string, build: () => unknown }[]>(() => [
  {id: 'network', label: t(`${NS}.preset.network`), build: () => new FakeNetworkError()},
  {id: 'aborted', label: t(`${NS}.preset.aborted`), build: () => new FakeAbortError()},
  {
    id: 'laravel-422',
    label: t(`${NS}.preset.laravel-422`),
    build: () => new FakeHttpError(422, {
      message: t(`${NS}.mock.laravel.message`),
      errors: {
        file: [t(`${NS}.mock.laravel.file.required`), t(`${NS}.mock.laravel.file.size`)],
        amount: [t(`${NS}.mock.laravel.amount.positive`)],
      },
    }),
  },
  {
    id: 'jsonapi-422',
    label: t(`${NS}.preset.jsonapi-422`),
    build: () => new FakeHttpError(422, {
      errors: [
        {
          status: '422',
          title: 'Invalid Attribute',
          detail: 'Email is required.',
          source: {pointer: '/data/attributes/email'}
        },
        {
          status: '422',
          title: 'Invalid Attribute',
          detail: 'Phone is invalid.',
          source: {pointer: '/data/attributes/phone'}
        },
      ],
    }),
  },
  {
    id: 'rfc7807-403',
    label: t(`${NS}.preset.rfc7807-403`),
    build: () => new FakeHttpError(403,
        {
          type: 'https://example.com/probs/out-of-credit',
          title: 'You do not have enough credit.',
          status: 403,
          detail: 'Your current balance is 30, but that costs 50.',
        },
        {'content-type': 'application/problem+json'},
    ),
  },
  {
    id: 'client-404',
    label: t(`${NS}.preset.client-404`),
    build: () => new FakeHttpError(404, {message: 'Resource not found'})
  },
  {
    id: 'server-500',
    label: t(`${NS}.preset.server-500`),
    build: () => new FakeHttpError(500, {message: 'Internal Server Error'})
  },
  {
    id: 'file-validation',
    label: t(`${NS}.preset.file-validation`),
    build: () => new FakeFileValidationError([
      {file: {name: 'photo.heic'}, message: t(`${NS}.mock.file.heic`)},
      {file: {name: 'huge.zip'}, message: t(`${NS}.mock.file.tooBig`)},
    ]),
  },
  {id: 'plain-string', label: t(`${NS}.preset.plain-string`), build: () => t(`${NS}.mock.plainString`)},
])

const presetOptions = computed(() => presets.value.map(p => ({label: p.label, value: p.id})))
const selectedPreset = ref<PresetId>('laravel-422')

const {currentError, setRaw, dismiss, retry} = useResponseError()
const eventLog = shallowRef<string[]>([])

function log(msg: string) {
  eventLog.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...eventLog.value].slice(0, 10)
}

async function trigger() {
  const preset = presets.value.find(p => p.id === selectedPreset.value)
  if (!preset)
    return
  const raw = preset.build()
  const info = await setRaw(raw, {presetId: preset.id})
  if (info)
    log(`classified kind=${info.kind}${info.status ? `, status=${info.status}` : ''}`)
  else
    log('auto-hidden (kind in autoHideKinds)')
}

function onRetry(info: ResponseErrorInfo) {
  log(`@retry fired (kind=${info.kind})`)
  retry(() => {
    log('retry handler executed → dismissing banner')
  })
}

function onDismiss() {
  log('@dismiss fired')
  dismiss()
}

function replacer(_: string, v: unknown) {
  if (v instanceof Error)
    return `[${v.name}] ${v.message}`
  return v
}

const currentJson = computed(() => currentError.value ? JSON.stringify(currentError.value, replacer, 2) : '—')
</script>

<template>
  <GrCard class="grid gap-3 p-4">
    <div class="flex flex-wrap items-end gap-3">
      <div class="min-w-[260px] flex-1">
        <GrSelect v-model="selectedPreset" :options="presetOptions"/>
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
        @dismiss="onDismiss"
    />

    <details class="text-[12px] text-[var(--muted-fg)]">
      <summary class="cursor-pointer">
        {{ t(`${NS}.Current ResponseErrorInfo (JSON)`) }}
      </summary>
      <pre class="mt-2 overflow-x-auto rounded bg-[var(--muted)] p-3">{{ currentJson }}</pre>
    </details>

    <div class="grid gap-1">
      <div class="text-sm font-semibold text-[var(--fg)]">
        {{ t(`${NS}.Event log`) }}
      </div>
      <pre class="max-h-[160px] overflow-auto rounded bg-[var(--muted)] p-3 text-[12px]">{{
          eventLog.join('\n') || '—'
        }}</pre>
    </div>
  </GrCard>
</template>
