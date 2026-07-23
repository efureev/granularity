<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  GrBadge,
  GrButton,
  GrCard,
  GrDialog,
  GrDropdown,
  GrFileUpload,
  GrInput,
  GrTextarea,
  GrToaster,
  FileValidationError,
  acceptValidator,
  allowedExtensionsValidator,
  allowedMimeTypesValidator,
  createLoading,
  matchAccept,
  maxFileSizeBytesValidator,
  maxSizeMbValidator,
  maxTotalSizeBytesValidator,
  normalizeFiles,
  runFileValidators,
  useDialogService,
  useTheme,
  useToast,
  vAutofocus,
  vAutosize,
  vClickOutside,
  vDropzone,
  vHotkey,
  vLoading,
} from '@feugene/granularity'

const props = defineProps<{
  previewKey: string
}>()

const dialogOpen = ref(false)
const autosizeValue = ref('Первый абзац\nВторая строка для автоподстройки textarea.')
const dropzoneState = ref('Перетащите файл в зону ниже')
const isDropOver = ref(false)
const hotkeyLog = ref('Нажмите `Ctrl+K`, `Shift+/` или `Escape`.')
const cardLoading = ref(false)
const imperativeStatus = ref('Overlay ещё не запускался')

const runtimeTheme = useTheme({ persist: false, storageKey: 'showcase-package-demo-theme' })
const toasts = useToast()
const toastStatus = ref('Очередь toast shared между всеми consumers.')
const fileValidationStatus = ref('Запустите demo, чтобы увидеть shape `{ files, issues }`.')
const validatorPreviewStatus = ref('Запустите demo, чтобы увидеть различия между accept, extensions и MIME validators.')
const uploadBridgeStatus = ref('Выберите тестовые файлы, чтобы увидеть, как `GrFileUpload` транслирует `FileValidationError`.')

const dropzoneBinding = computed(() => ({
  onFiles: async (files: File[]) => {
    dropzoneState.value = `Accepted: ${files.map(file => file.name).join(', ')}`
  },
  validators: [maxSizeMbValidator(2)],
  onStateChange: ({ isOver }: { isOver: boolean }) => {
    isDropOver.value = isOver
  },
  onError: (error: unknown) => {
    dropzoneState.value = error instanceof Error ? error.message : String(error)
  },
  overClass: 'ring-2 showcase-ring-primary',
}))

async function startCardLoading() {
  cardLoading.value = true
  await new Promise(resolve => window.setTimeout(resolve, 900))
  cardLoading.value = false
}

async function startImperativeLoading() {
  const controller = createLoading({ text: 'Syncing package docs…' })
  imperativeStatus.value = `Target: ${controller.target.tagName.toLowerCase()}`
  controller.setText('Applying final state…')
  await new Promise(resolve => window.setTimeout(resolve, 500))
  controller.close()
}

function pushToast(variant: 'info' | 'success' | 'warning' | 'danger', timeoutMs = 2500) {
  const id = toasts.push({
    title: `Toast ${variant}`,
    message: `Queue length before push: ${toasts.list.value.length}`,
    variant,
    timeoutMs,
  })

  toastStatus.value = `Последний toast id: ${id}`
}

function dismissLatestToast() {
  const latest = toasts.list.value[0]
  if (!latest) {
    toastStatus.value = 'Очередь уже пуста'
    return
  }

  toasts.dismiss(latest.id)
  toastStatus.value = `Dismissed: ${latest.id}`
}

function handleHotkey(label: string) {
  hotkeyLog.value = `Shortcut triggered: ${label}`
}

function formatIssues(issues: Array<{ code: string; fileName?: string }>) {
  return issues.map(issue => `${issue.code}:${issue.fileName ?? 'n/a'}`).join(', ') || 'none'
}

async function runFileValidationDemo() {
  const demoFiles = [
    new File(['demo'], 'report.exe', { type: 'application/octet-stream' }),
    new File(['preview'], 'avatar.png', { type: 'image/png' }),
  ]
  const normalizedSingle = normalizeFiles(demoFiles, false)
  const acceptMatches = matchAccept(demoFiles[1]!, '.pdf,image/*')
  const result = await runFileValidators(demoFiles, [
    maxFileSizeBytesValidator(512_000),
    maxTotalSizeBytesValidator(1_500_000),
  ], {
    source: 'input',
    multiple: true,
    accept: '.pdf,image/*',
  })

  fileValidationStatus.value = [
    `normalized(single): ${normalizedSingle.map(file => file.name).join(', ')}`,
    `matchAccept(avatar.png): ${acceptMatches ? 'true' : 'false'}`,
    `issues: ${result.issues.map(issue => issue.code).join(', ') || 'none'}`,
    `accepted by pipeline: ${result.files.map(file => file.name).join(', ')}`,
  ].join(' • ')
}

async function runValidatorPreview(mode: 'accept' | 'extensions' | 'mime') {
  const demoFiles = [
    new File(['avatar'], 'avatar.png', { type: 'image/png' }),
    new File(['report'], 'report.pdf', { type: 'application/pdf' }),
    new File(['legacy'], 'invoice.heic', { type: 'application/octet-stream' }),
  ]

  const validators = {
    accept: acceptValidator('.pdf,image/*'),
    extensions: allowedExtensionsValidator(['pdf', '.png']),
    mime: allowedMimeTypesValidator(['image/png', 'application/pdf'], { allowFallbackByExtension: false }),
  }

  const result = await runFileValidators(demoFiles, [validators[mode]], {
    source: 'input',
    multiple: true,
    accept: '.pdf,image/*',
  })

  validatorPreviewStatus.value = [
    `mode: ${mode}`,
    `accepted: ${result.files.map(file => file.name).join(', ')}`,
    `issues: ${formatIssues(result.issues)}`,
  ].join(' • ')
}

function handleUploadSelection(files: File[]) {
  uploadBridgeStatus.value = `accepted: ${files.map(file => file.name).join(', ') || 'none'}`
}

function handleUploadValidationError(error: unknown) {
  if (error instanceof FileValidationError) {
    uploadBridgeStatus.value = `FileValidationError • ${formatIssues(error.issues)}`
    return
  }

  uploadBridgeStatus.value = String(error)
}

const dialog = useDialogService()
const dialogStatus = ref('Запустите imperative-вызов, чтобы увидеть результат Promise.')

async function runConfirmDemo() {
  const ok = await dialog.confirm('This action cannot be undone.', {
    title: 'Delete workspace?',
    size: 'sm',
    confirmText: 'Delete',
    cancelText: 'Keep',
    confirmTone: 'danger',
  })
  dialogStatus.value = `confirm resolved: ${ok}`
}

async function runPromptDemo() {
  const name = await dialog.prompt('Pick a new project name.', {
    title: 'Rename project',
    size: 'md',
    label: 'Project name',
    placeholder: 'e.g. Atlas',
    required: true,
    confirmText: 'Save',
  })
  dialogStatus.value = name === null ? 'prompt cancelled' : `prompt resolved: ${name}`
}

async function runAlertDemo() {
  await dialog.alert('Your workspace settings have been saved.', {
    title: 'Saved',
    size: 'lg',
    confirmText: 'Got it',
  })
  dialogStatus.value = 'alert acknowledged'
}

const networkStatus = ref('Откройте диалог: 1-я попытка вернёт серверную валидацию (422), 2-я — обрыв сети, 3-я завершится успехом.')
let networkAttempt = 0

async function runNetworkDemo() {
  networkAttempt = 0
  networkStatus.value = 'Dialog открыт. Жмите «Send invite», чтобы пройти сценарии loading -> validation -> network -> success.'

  const email = await dialog.prompt('Send an invite to a teammate.', {
    title: 'Invite teammate',
    size: 'md',
    label: 'Work email',
    placeholder: 'name@company.com',
    required: true,
    confirmText: 'Send invite',
    // Подключаем Laravel-пресет поверх ядра: fieldErrors лягут на поле `value`.
    errorParsers: presets => [...presets.core, presets.laravel],
    async onConfirm(ctx) {
      networkAttempt += 1
      // Имитируем сетевой запрос — Confirm автоматически переходит в loading.
      await new Promise(resolve => window.setTimeout(resolve, 700))

      if (networkAttempt === 1) {
        // Серверная валидация (HTTP 422): баннер + ошибка под полем ввода.
        await ctx.setRawError(
          new Response(JSON.stringify({
            message: 'The given data was invalid.',
            errors: { value: ['This email is already invited.'] },
          }), {
            status: 422,
            headers: { 'Content-Type': 'application/json' },
          }),
        )
        return false
      }

      if (networkAttempt === 2) {
        // Обрыв сети: throw автоматически прогоняется через парсеры -> kind: "network".
        throw new TypeError('Failed to fetch')
      }

      // Успех на третьей попытке: диалог закрывается, prompt резолвится значением.
    },
  })

  networkStatus.value = email === null
    ? `prompt cancelled (после ${networkAttempt} попыток)`
    : `invite sent: ${email} (успех с ${networkAttempt}-й попытки)`
}
</script>

<template>
  <div class="grid gap-4">
    <template v-if="previewKey === 'v-autofocus-dialog'">
      <GrButton class="justify-self-start" @click="dialogOpen = true">
        Open dialog
      </GrButton>

      <GrDialog v-model="dialogOpen" title="Invite teammate" size="sm">
        <div class="grid gap-3 text-sm text-[var(--gr-muted-fg)]" v-autofocus="{ selector: 'input', preventScroll: true }">
          <p>После открытия dialog фокус попадёт в первое поле ввода.</p>
          <GrInput model-value="" placeholder="name@company.com" />
          <GrInput model-value="" placeholder="Role" />
        </div>
      </GrDialog>
    </template>

    <template v-else-if="previewKey === 'v-autosize-textarea'">
      <GrTextarea
        v-model="autosizeValue"
        v-autosize
        :rows="2"
        placeholder="Type a long note to see autosize in action"
      />
      <p class="text-xs text-[var(--gr-muted-fg)]">
        Контейнер ограничен только шириной, а высота textarea растёт по содержимому.
      </p>
    </template>

    <template v-else-if="previewKey === 'v-click-outside-dropdown'">
      <div class="flex items-start gap-3">
        <GrDropdown align="left" width="80" :close-on-content-click="false">
          <template #trigger="{ open }">
            <GrButton class="justify-self-start">
              {{ open ? 'Close' : 'Open' }} dropdown
            </GrButton>
          </template>
          <template #content>
            <p class="text-sm leading-6 text-[var(--gr-muted-fg)]">
              Клик вне панели закроет dropdown, но клики по exclude-зоне будут считаться внутренними.
            </p>
          </template>
        </GrDropdown>
        <GrButton variant="outline">
          Exclude zone
        </GrButton>
      </div>
    </template>

    <template v-else-if="previewKey === 'v-dropzone-validation'">
      <div
        v-dropzone="dropzoneBinding"
        class="rounded-3xl border border-dashed border-[var(--gr-brd)] bg-[var(--gr-muted)]/40 p-6 transition"
      >
        <div class="flex items-center gap-3">
          <GrBadge>{{ isDropOver ? 'drag-over' : 'idle' }}</GrBadge>
          <span class="text-sm text-[var(--gr-muted-fg)]">
            {{ dropzoneState }}
          </span>
        </div>
      </div>
    </template>

    <template v-else-if="previewKey === 'v-hotkey-map'">
      <div
        v-hotkey="{
          'Ctrl+K': () => handleHotkey('Ctrl+K'),
          'Shift+/': { handler: () => handleHotkey('Shift+/'), preventDefault: true },
          'Escape': { handler: () => handleHotkey('Escape'), allowInEditable: true },
        }"
        class="grid gap-3"
      >
        <GrInput model-value="" placeholder="Focus here and press Escape" />
        <p class="text-sm text-[var(--gr-muted-fg)]">
          {{ hotkeyLog }}
        </p>
      </div>
    </template>

    <template v-else-if="previewKey === 'v-loading-card'">
      <div class="grid gap-3">
        <GrButton class="justify-self-start" @click="startCardLoading">
          Toggle async loading
        </GrButton>
        <GrCard
          v-loading="{ loading: cardLoading, text: 'Refreshing segment metrics…' }"
          class="rounded-3xl border border-[var(--gr-brd)] bg-[var(--gr-card)]/90 p-5 shadow-sm"
        >
          <h4 class="text-base font-semibold">
            Revenue snapshot
          </h4>
          <p class="mt-2 text-sm leading-6 text-[var(--gr-muted-fg)]">
            Overlay таргетится в текущую карточку и не блокирует весь экран.
          </p>
        </GrCard>
      </div>
    </template>

    <template v-else-if="previewKey === 'create-loading-imperative'">
      <GrButton class="justify-self-start" @click="startImperativeLoading">
        Run imperative overlay
      </GrButton>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        {{ imperativeStatus }}
      </p>
    </template>

    <template v-else-if="previewKey === 'use-theme-runtime'">
      <div class="flex flex-wrap items-center gap-3">
        <GrButton class="justify-self-start" @click="runtimeTheme.toggleTheme()">
          Toggle theme ({{ runtimeTheme.theme.value }})
        </GrButton>
        <GrBadge>{{ runtimeTheme.isDark.value ? 'dark' : 'light' }}</GrBadge>
      </div>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        Demo использует `persist: false`, поэтому не пишет состояние в localStorage и подходит для embedded flows.
      </p>
    </template>

    <template v-else-if="previewKey === 'use-toast-queue'">
      <div class="flex flex-wrap gap-3">
        <GrButton class="justify-self-start" @click="pushToast('success')">
          Push success
        </GrButton>
        <GrButton variant="outline" @click="pushToast('warning', 0)">
          Sticky warning
        </GrButton>
        <GrButton variant="ghost" @click="dismissLatestToast()">
          Dismiss latest
        </GrButton>
        <GrButton variant="ghost" @click="toasts.clear()">
          Clear all
        </GrButton>
      </div>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        {{ toastStatus }} Сейчас в очереди: {{ toasts.list.value.length }}.
      </p>
      <GrToaster />
    </template>

    <template v-else-if="previewKey === 'run-file-validators-pipeline'">
      <div class="grid gap-3">
        <GrButton class="justify-self-start" @click="runFileValidationDemo">
          Run validator pipeline
        </GrButton>
        <p class="text-sm text-[var(--gr-muted-fg)]">
          {{ fileValidationStatus }}
        </p>
      </div>
    </template>

    <template v-else-if="previewKey === 'accept-validator-preview' || previewKey === 'allowed-extensions-validator-preview' || previewKey === 'allowed-mime-types-validator-preview'">
      <div class="grid gap-3">
        <div class="flex flex-wrap gap-3">
          <GrButton class="justify-self-start" @click="runValidatorPreview('accept')">
            accept
          </GrButton>
          <GrButton variant="outline" @click="runValidatorPreview('extensions')">
            extensions
          </GrButton>
          <GrButton variant="ghost" @click="runValidatorPreview('mime')">
            mime
          </GrButton>
        </div>
        <p class="text-sm text-[var(--gr-muted-fg)]">
          {{ validatorPreviewStatus }}
        </p>
      </div>
    </template>

    <template v-else-if="previewKey === 'file-validation-upload-bridge'">
      <div class="grid gap-3">
        <GrFileUpload
          accept=".pdf,image/*"
          :multiple="true"
          :validators="[
            acceptValidator('.pdf,image/*'),
            allowedExtensionsValidator(['pdf', '.png']),
            allowedMimeTypesValidator(['image/png', 'application/pdf'], { allowFallbackByExtension: false }),
            maxFileSizeBytesValidator(256_000),
            maxTotalSizeBytesValidator(512_000),
          ]"
          @change="handleUploadSelection"
          @error="handleUploadValidationError"
        />
        <p class="text-sm text-[var(--gr-muted-fg)]">
          {{ uploadBridgeStatus }}
        </p>
      </div>
    </template>

    <template v-else-if="previewKey === 'use-dialog-service-confirm'">
      <GrButton class="justify-self-start" variant="primary" tone="danger" @click="runConfirmDemo">
        Delete workspace (confirm)
      </GrButton>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        {{ dialogStatus }}
      </p>
    </template>

    <template v-else-if="previewKey === 'use-dialog-service-prompt'">
      <GrButton class="justify-self-start" variant="outline" @click="runPromptDemo">
        Rename project (prompt)
      </GrButton>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        {{ dialogStatus }}
      </p>
    </template>

    <template v-else-if="previewKey === 'use-dialog-service-alert'">
      <GrButton class="justify-self-start" variant="ghost" @click="runAlertDemo">
        Show alert
      </GrButton>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        {{ dialogStatus }}
      </p>
    </template>

    <template v-else-if="previewKey === 'use-dialog-service-network'">
      <GrButton class="justify-self-start" variant="primary" @click="runNetworkDemo">
        Invite teammate (async onConfirm)
      </GrButton>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        {{ networkStatus }}
      </p>
    </template>

    <template v-else>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        Preview for `{{ previewKey }}` is not connected yet.
      </p>
    </template>
  </div>
</template>