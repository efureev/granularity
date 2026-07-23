<script setup lang="ts">
import { shallowRef } from 'vue'

import {
  GrButton,
  GrCard,
  GrUploadErrorBanner,
  type ResponseErrorInfo,
  useResponseError,
} from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const NS = 'components.GrResponseErrorBanner'

class FakeHttpError extends Error {
  isAxiosError = true
  response: { status: number, data: unknown, headers?: Record<string, string> }

  constructor(status: number, data: unknown, headers?: Record<string, string>) {
    super(`Request failed with status ${status}`)
    this.name = 'AxiosError'
    this.response = { status, data, headers }
  }
}

const uploadClassifier = useResponseError({ texts: () => ({ retryLabel: t(`${NS}.upload.retryLabel`) }) })
const fakeUploadError = shallowRef<ResponseErrorInfo | null>(null)
const events = shallowRef<string[]>([])
const uploadFiles = typeof File !== 'undefined' ? [new File([], 'photo.heic')] : []

function log(msg: string) {
  events.value = [`[${new Date().toLocaleTimeString()}] ${msg}`, ...events.value].slice(0, 8)
}

async function triggerUploadDemo() {
  const info = await uploadClassifier.classify(
    new FakeHttpError(413, {
      message: t(`${NS}.upload.mock.message`),
      errors: { file: [t(`${NS}.upload.mock.fileError`)] },
    }),
  )
  fakeUploadError.value = info
  log(`upload-wrapper classify -> kind=${info.kind}`)
}
</script>

<template>
  <GrCard class="grid gap-3 p-4">
    <p class="text-[12px] text-[var(--gr-muted-fg)]">
      {{ t(`${NS}.upload.description`) }}
    </p>

    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" @click="triggerUploadDemo">
        {{ t(`${NS}.upload.triggerLabel`) }}
      </GrButton>
      <GrButton size="sm" variant="outline" @click="fakeUploadError = null">
        {{ t(`${NS}.Hide`) }}
      </GrButton>
    </div>

    <GrUploadErrorBanner
      :error="fakeUploadError"
      :files="uploadFiles"
      @retry="({ files }) => log(`upload-retry payload files=${files.length}`)"
      @dismiss="fakeUploadError = null"
    />

    <div class="grid gap-1">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        {{ t(`${NS}.Event log`) }}
      </div>
      <pre class="max-h-[120px] overflow-auto rounded bg-[var(--gr-muted)] p-3 text-[12px]">{{ events.join('\n') || '—' }}</pre>
    </div>
  </GrCard>
</template>
