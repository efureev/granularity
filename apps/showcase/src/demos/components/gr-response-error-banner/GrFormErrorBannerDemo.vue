<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import {
  GrButton,
  GrCard,
  GrFormErrorBanner,
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

const formClassifier = useResponseError()
const fakeFormError = shallowRef<ResponseErrorInfo | null>(null)

const fieldLabels = computed(() => ({
  email: t(`${NS}.form.fieldLabel.email`),
  password: t(`${NS}.form.fieldLabel.password`),
}))

async function triggerFormDemo() {
  const info = await formClassifier.classify(new FakeHttpError(422, {
    message: t(`${NS}.form.mock.message`),
    errors: {
      email: [t(`${NS}.form.mock.email`)],
      password: [t(`${NS}.form.mock.password.short`), t(`${NS}.form.mock.password.digits`)],
    },
  }))
  fakeFormError.value = info
}
</script>

<template>
  <GrCard class="grid gap-3 p-4">
    <p class="text-[12px] text-[var(--gr-muted-fg)]">
      {{ t(`${NS}.form.description`) }}
    </p>

    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" @click="triggerFormDemo">
        {{ t(`${NS}.form.triggerLabel`) }}
      </GrButton>
      <GrButton size="sm" variant="outline" @click="fakeFormError = null">
        {{ t(`${NS}.Hide`) }}
      </GrButton>
    </div>

    <GrFormErrorBanner
      :error="fakeFormError"
      :field-labels="fieldLabels"
      @dismiss="fakeFormError = null"
    />
  </GrCard>
</template>
