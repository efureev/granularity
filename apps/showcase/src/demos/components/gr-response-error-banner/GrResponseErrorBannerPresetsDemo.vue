<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'

import {
  GrButton,
  GrCard,
  GrFormField,
  GrResponseErrorBanner,
  GrSelect,
  type ResponseErrorInfo,
  useResponseError,
} from '@feugene/granularity'

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

class FakeFileValidationError extends Error {
  issues: { file: { name: string }, message: string }[]

  constructor(issues: { file: { name: string }, message: string }[]) {
    super('File validation failed')
    this.name = 'FileValidationError'
    this.issues = issues
  }
}

type PresetId
  = | 'network'
    | 'aborted'
    | 'laravel-422'
    | 'jsonapi-422'
    | 'rfc7807-403'
    | 'client-404'
    | 'server-500'
    | 'file-validation'
    | 'plain-string'

const presets = computed<{ id: PresetId, label: string, build: () => unknown }[]>(() => [
  { id: 'network', label: 'Network (no connection)', build: () => new FakeNetworkError() },
  { id: 'aborted', label: 'Aborted (cancelled by user)', build: () => new FakeAbortError() },
  {
    id: 'laravel-422',
    label: 'Laravel validation (422 + errors)',
    build: () => new FakeHttpError(422, {
      message: 'Uploading the file field failed.',
      errors: {
        file: ['File is required.', 'File must not exceed 5 MB.'],
        amount: ['Amount must be positive.'],
      },
    }),
  },
  {
    id: 'jsonapi-422',
    label: 'JSON:API validation (422 + errors[])',
    build: () => new FakeHttpError(422, {
      errors: [
        {
          status: '422',
          title: 'Invalid Attribute',
          detail: 'Email is required.',
          source: { pointer: '/data/attributes/email' },
        },
        {
          status: '422',
          title: 'Invalid Attribute',
          detail: 'Phone is invalid.',
          source: { pointer: '/data/attributes/phone' },
        },
      ],
    }),
  },
  {
    id: 'rfc7807-403',
    label: 'RFC 7807 problem+json (403)',
    build: () => new FakeHttpError(403, {
      type: 'https://example.com/probs/out-of-credit',
      title: 'You do not have enough credit.',
      status: 403,
      detail: 'Your current balance is 30, but that costs 50.',
    }, { 'content-type': 'application/problem+json' }),
  },
  {
    id: 'client-404',
    label: 'Client error (404)',
    build: () => new FakeHttpError(404, { message: 'Resource not found' }),
  },
  {
    id: 'server-500',
    label: 'Server error (500)',
    build: () => new FakeHttpError(500, { message: 'Internal Server Error' }),
  },
  {
    id: 'file-validation',
    label: 'FileValidationError (local)',
    build: () => new FakeFileValidationError([
      { file: { name: 'photo.heic' }, message: 'Format heic is not supported.' },
      { file: { name: 'huge.zip' }, message: 'File is larger than 10 MB.' },
    ]),
  },
  { id: 'plain-string', label: 'Plain string', build: () => 'Something went wrong on the backend' },
])

const presetOptions = computed(() => presets.value.map(p => ({ label: p.label, value: p.id })))
const selectedPreset = ref<PresetId>('laravel-422')

const { currentError, setRaw, dismiss, retry } = useResponseError()
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
    log(`classified kind=${info.kind}${info.status ? `, status=${info.status}` : ''}`)
  else
    log('auto-hidden (kind in autoHideKinds)')
}

function onRetry(info: ResponseErrorInfo) {
  log(`@retry fired (kind=${info.kind})`)
  retry(() => {
    log('retry handler executed -> dismissing banner')
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
        <!-- Подпись через GrFormField: она даёт селекту доступное имя, а не просто
             рисуется рядом. -->
        <GrFormField :label="'Error preset'">
          <GrSelect v-model="selectedPreset" :options="presetOptions" />
        </GrFormField>
      </div>
      <GrButton size="sm" variant="primary" @click="trigger">
        Throw error
      </GrButton>
      <GrButton size="sm" variant="outline" @click="dismiss">
        Reset
      </GrButton>
    </div>

    <GrResponseErrorBanner
        :error="currentError"
        can-retry
        @retry="onRetry"
        @dismiss="onDismiss"
    />

    <details class="text-[12px] text-[var(--gr-muted-fg)]">
      <summary class="cursor-pointer">
        Current ResponseErrorInfo (JSON)
      </summary>
      <pre class="mt-2 overflow-x-auto rounded bg-[var(--gr-muted)] p-3">{{ currentJson }}</pre>
    </details>

    <div class="grid gap-1">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Event log
      </div>
      <pre class="max-h-[160px] overflow-auto rounded bg-[var(--gr-muted)] p-3 text-[12px]">{{
          eventLog.join('\n') || '—'
        }}</pre>
    </div>
  </GrCard>
</template>
