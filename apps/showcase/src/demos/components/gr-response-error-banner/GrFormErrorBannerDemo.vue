<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import {
  GrButton,
  GrCard,
  GrFormErrorBanner,
  type ResponseErrorInfo,
  useResponseError,
} from '@feugene/granularity'

class FakeHttpError extends Error {
  isAxiosError = true
  response: { status: number, data: unknown, headers?: Record<string, string> }

  constructor(status: number, data: unknown, headers?: Record<string, string>) {
    super(`Request failed with status ${status}`)
    this.name = 'AxiosError'
    this.response = { status, data, headers }
  }
}

const formClassifier = useResponseError()
const fakeFormError = shallowRef<ResponseErrorInfo | null>(null)

const fieldLabels = computed(() => ({
  email: 'E-mail',
  password: 'Password',
}))

async function triggerFormDemo() {
  const info = await formClassifier.classify(new FakeHttpError(422, {
    message: 'Validation error',
    errors: {
      email: ['Enter a valid email'],
      password: ['Password is too short', 'Must contain digits'],
    },
  }))
  fakeFormError.value = info
}
</script>

<template>
  <GrCard class="grid gap-3 p-4">
    <p class="text-[12px] text-[var(--gr-muted-fg)]">
      showFieldLabels=true, canRetry=false, tone validation=warning, fieldLabels for nice field captions.
    </p>

    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" @click="triggerFormDemo">
        Simulate 422 form validation
      </GrButton>
      <GrButton size="sm" variant="outline" @click="fakeFormError = null">
        Hide
      </GrButton>
    </div>

    <GrFormErrorBanner
      :error="fakeFormError"
      :field-labels="fieldLabels"
      @dismiss="fakeFormError = null"
    />
  </GrCard>
</template>
