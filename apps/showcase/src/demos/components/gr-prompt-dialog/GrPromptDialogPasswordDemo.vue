<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrPromptDialog } from '@feugene/granularity'

const passwordOpen = ref(false)
const backupCodeOpen = ref(false)
const password = ref('')
const backupCode = ref('')
const lastAction = ref('—')

function confirmPassword(value: string): void {
  password.value = ''
  lastAction.value = `Password confirmed (${value.length} characters)`
}

function confirmBackupCode(value: string): void {
  backupCode.value = ''
  lastAction.value = `Backup code: ${value}`
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-3">
      <GrButton @click="passwordOpen = true">
        Disable two-factor
      </GrButton>
      <GrButton variant="outline" @click="backupCodeOpen = true">
        Enter a backup code
      </GrButton>
    </div>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Last action: <span class="font-medium text-[var(--gr-fg)]">{{ lastAction }}</span>
    </div>

    <!--
      Пароль опознаётся менеджером по `autocomplete` и по имени поля: без них
      подтверждение приходится набирать руками на каждом действии.
    -->
    <GrPromptDialog
      v-model="passwordOpen"
      v-model:value="password"
      title="Confirm your password"
      label="Password"
      description="The server only returns backup codes after the password is confirmed."
      input-type="password"
      autocomplete="current-password"
      name="password"
      confirm-text="Confirm"
      @confirm="confirmPassword"
    />

    <!--
      Резервный код сверяется байт в байт и генерируется в смешанном регистре,
      поэтому автозаполнение и автозаглавная здесь выключены явно.
    -->
    <GrPromptDialog
      v-model="backupCodeOpen"
      v-model:value="backupCode"
      title="Backup code"
      label="Code"
      description="Case-sensitive: the keyboard must not capitalise the first letter."
      autocomplete="off"
      autocapitalize="off"
      :spellcheck="false"
      confirm-text="Verify"
      @confirm="confirmBackupCode"
    />
  </div>
</template>
