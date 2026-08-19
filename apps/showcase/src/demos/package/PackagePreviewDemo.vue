<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFintI18n } from '@feugene/fint-i18n/vue'

import {
  GrBadge,
  GrButton,
  GrCard,
  GrDialog,
  GrFileUpload,
  GrInput,
  GrTextarea,
  GrToaster,
  createLoading,
  useAnnouncer,
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
// Валидация файлов — свой подпуть: у неё нет ни компонента, ни CSS, и тянуть
// её через корневую бочку значило бы тащить за собой весь граф компонентов.
import {
  FileValidationError,
  acceptValidator,
  allowedExtensionsValidator,
  allowedMimeTypesValidator,
  matchAccept,
  maxFileSize,
  maxTotalSizeBytesValidator,
  normalizeFiles,
  runFileValidators,
} from '@feugene/granularity/fileValidation'

defineProps<{
  previewKey: string
}>()

const dialogOpen = ref(false)
const autosizeValue = ref('Первый абзац\nВторая строка для автоподстройки textarea.')
const dropzoneState = ref('Перетащите файл в зону ниже')
const isDropOver = ref(false)
const hotkeyLog = ref('Нажмите `Ctrl+K`, `Shift+/` или `Escape`.')

// Демо `vClickOutside`: своя панель, а не `GrDropdown` — у того собственный
// click-outside, и на нём не видно, что делает `exclude`.
const outsidePanelOpen = ref(false)
const outsideExcludeEl = ref<{ $el?: HTMLElement } | HTMLElement | null>(null)
const outsideLog = ref('—')

// Директива ждёт элемент: ref на компонент отдаёт инстанс, поэтому берём его корень.
function resolveOutsideExclude(): HTMLElement | null {
  const target = outsideExcludeEl.value
  if (!target) return null
  // `instanceof`, а не `'$el' in target`: проверка через `in` не сужает union,
  // и `$el` остаётся неизвестного типа.
  if (target instanceof HTMLElement) return target

  return target.$el ?? null
}

function closeOutsidePanel(): void {
  outsidePanelOpen.value = false
  outsideLog.value = 'клик вне панели — закрылась'
}
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
  validators: [maxFileSize({ mb: 2 })],
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
    // Поле называется `tone`, а не `variant`: до этой правки тон молча не
    // применялся — все тосты демо выходили нейтральными.
    tone: variant,
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
    maxFileSize({ bytes: 512_000 }),
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

const { t } = useFintI18n()
const dialog = useDialogService()
const dialogStatus = ref(t('composables.useDialogService.status.idle'))

async function runConfirmDemo() {
  const ok = await dialog.confirm(t('composables.useDialogService.confirm.message'), {
    title: t('composables.useDialogService.confirm.title'),
    size: 'sm',
    confirmText: t('composables.useDialogService.confirm.confirmText'),
    cancelText: t('composables.useDialogService.confirm.cancelText'),
    confirmTone: 'danger',
  })
  dialogStatus.value = t('composables.useDialogService.status.confirmResolved', { value: String(ok) })
}

async function runPromptDemo() {
  const name = await dialog.prompt(t('composables.useDialogService.prompt.message'), {
    title: t('composables.useDialogService.prompt.title'),
    size: 'md',
    label: t('composables.useDialogService.prompt.label'),
    placeholder: t('composables.useDialogService.prompt.placeholder'),
    required: true,
    confirmText: t('composables.useDialogService.prompt.confirmText'),
  })
  dialogStatus.value = name === null
    ? t('composables.useDialogService.status.promptCancelled')
    : t('composables.useDialogService.status.promptResolved', { value: name })
}

async function runAlertDemo() {
  await dialog.alert(t('composables.useDialogService.alert.message'), {
    title: t('composables.useDialogService.alert.title'),
    size: 'lg',
    confirmText: t('composables.useDialogService.alert.confirmText'),
  })
  dialogStatus.value = t('composables.useDialogService.status.alertAcknowledged')
}

const nestedStatus = ref(t('composables.useDialogService.nested.idle'))

async function runNestedDemo() {

  // Второй диалог спрашивается из `onConfirm` первого — сервис показывает его
  // поверх, потому что первый ждёт именно его ответа.
  const deleted = await dialog.confirm(t('composables.useDialogService.nested.message'), {
    title: t('composables.useDialogService.nested.title'),
    confirmText: t('composables.useDialogService.nested.confirmText'),
    cancelText: t('composables.useDialogService.nested.cancelText'),
    confirmTone: 'danger',
    async onConfirm() {
      return await dialog.confirm(t('composables.useDialogService.nested.secondMessage'), {
        title: t('composables.useDialogService.nested.secondTitle'),
        size: 'sm',
        confirmText: t('composables.useDialogService.nested.secondConfirmText'),
        cancelText: t('composables.useDialogService.nested.secondCancelText'),
        confirmTone: 'danger',
      })
    },
  })

  nestedStatus.value = deleted
    ? t('composables.useDialogService.nested.done')
    : t('composables.useDialogService.nested.aborted')
}

// Живой регион невидим по своей природе, поэтому демо дублирует объявление
// обычным текстом: иначе превью выглядит как кнопка, которая ничего не делает.
const { announce: announceToScreenReader } = useAnnouncer()
const announcerLast = ref('')
const announcerRegion = ref<'polite' | 'assertive' | ''>('')
let announcerResults = 3

function runAnnouncerPolite() {
  const message = t('composables.useAnnouncer.polite.message')
  announceToScreenReader(message)
  announcerLast.value = message
  announcerRegion.value = 'polite'
}

function runAnnouncerAssertive() {
  const message = t('composables.useAnnouncer.assertive.message')
  announceToScreenReader(message, { politeness: 'assertive' })
  announcerLast.value = message
  announcerRegion.value = 'assertive'
}

function runAnnouncerResults() {
  // Число меняется от нажатия к нажатию: так видно, что повтор объявления
  // работает и что `clearAfterMs` стирает устаревшее.
  announcerResults = announcerResults === 3 ? 12 : 3
  const message = t('composables.useAnnouncer.results.message', { count: announcerResults })
  announceToScreenReader(message, { clearAfterMs: 4000 })
  announcerLast.value = message
  announcerRegion.value = 'polite'
}

const networkStatus = ref(t('composables.useDialogService.network.idle'))
let networkAttempt = 0

async function runNetworkDemo() {
  networkAttempt = 0
  networkStatus.value = t('composables.useDialogService.network.opened')

  const email = await dialog.prompt(t('composables.useDialogService.network.message'), {
    title: t('composables.useDialogService.network.title'),
    size: 'md',
    label: t('composables.useDialogService.network.label'),
    placeholder: t('composables.useDialogService.network.placeholder'),
    required: true,
    confirmText: t('composables.useDialogService.network.confirmText'),
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
            message: t('composables.useDialogService.network.serverMessage'),
            errors: { value: [t('composables.useDialogService.network.fieldError')] },
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
    ? t('composables.useDialogService.network.cancelled', { attempts: networkAttempt })
    : t('composables.useDialogService.network.sent', { email, attempts: networkAttempt })
}
</script>

<template>
  <!-- `data-preview-key` — опора e2e: на одной странице сущности лежит несколько
       превью, а различать их позицией нельзя (порядок задаёт состав examples) и
       подписью тоже (она приходит из локали). -->
  <div :data-preview-key="previewKey" class="grid gap-4">
    <template v-if="previewKey === 'v-autofocus-dialog'">
      <GrButton class="justify-self-start" @click="dialogOpen = true">
        Open dialog
      </GrButton>

      <GrDialog v-model="dialogOpen" title="Invite teammate" size="sm">
        <div v-autofocus="{ selector: 'input', preventScroll: true }" class="grid gap-3 text-sm text-[var(--gr-muted-fg)]">
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
      <div class="grid gap-3">
        <div class="flex flex-wrap items-start gap-3">
          <GrButton @click="outsidePanelOpen = true">
            Открыть панель
          </GrButton>

          <!-- Исключённая зона: клик по ней директива считает «внутренним». -->
          <GrButton
            ref="outsideExcludeEl"
            variant="outline"
            @click="outsideLog = 'клик по exclude-зоне — панель осталась открытой'"
          >
            Exclude zone
          </GrButton>
        </div>

        <div
          v-if="outsidePanelOpen"
          v-click-outside="{
            handler: closeOutsidePanel,
            exclude: [resolveOutsideExclude],
          }"
          class="showcase-panel max-w-sm rounded-2xl border p-4 text-sm leading-6"
        >
          Панель закрывается кликом мимо неё. Кнопка «Exclude zone» перечислена в
          <code>exclude</code>, поэтому клик по ней панель не закрывает.
        </div>

        <p class="text-sm text-[var(--gr-muted-fg)]">
          Последнее событие: <code>{{ outsideLog }}</code>
        </p>
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
            maxFileSize({ bytes: 256_000 }),
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

    <template v-else-if="previewKey.startsWith('use-announcer-')">
      <GrButton
        class="justify-self-start"
        :variant="previewKey === 'use-announcer-assertive' ? 'primary' : 'outline'"
        :tone="previewKey === 'use-announcer-assertive' ? 'danger' : undefined"
        @click="previewKey === 'use-announcer-polite'
          ? runAnnouncerPolite()
          : previewKey === 'use-announcer-assertive' ? runAnnouncerAssertive() : runAnnouncerResults()"
      >
        {{ t(`composables.useAnnouncer.${previewKey.replace('use-announcer-', '')}.trigger`) }}
      </GrButton>

      <GrCard v-if="announcerLast" class="p-3 text-sm">
        <div class="flex flex-wrap items-center gap-2">
          <GrBadge :tone="announcerRegion === 'assertive' ? 'danger' : 'info'" size="sm">
            {{ announcerRegion }}
          </GrBadge>
          <span class="text-[var(--gr-muted-fg)]">{{ t('composables.useAnnouncer.lastLabel') }}:</span>
          <span class="font-600">{{ announcerLast }}</span>
        </div>
      </GrCard>
      <p v-else class="text-sm text-[var(--gr-muted-fg)]">
        {{ t('composables.useAnnouncer.idle') }}
      </p>

      <p class="text-sm text-[var(--gr-muted-fg)]">
        {{ t('composables.useAnnouncer.hint') }}
      </p>
    </template>

    <template v-else-if="previewKey === 'use-dialog-service-confirm'">
      <GrButton class="justify-self-start" variant="primary" tone="danger" @click="runConfirmDemo">
        {{ t('composables.useDialogService.confirm.trigger') }}
      </GrButton>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        {{ dialogStatus }}
      </p>
    </template>

    <template v-else-if="previewKey === 'use-dialog-service-prompt'">
      <GrButton class="justify-self-start" variant="outline" @click="runPromptDemo">
        {{ t('composables.useDialogService.prompt.trigger') }}
      </GrButton>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        {{ dialogStatus }}
      </p>
    </template>

    <template v-else-if="previewKey === 'use-dialog-service-alert'">
      <GrButton class="justify-self-start" variant="ghost" @click="runAlertDemo">
        {{ t('composables.useDialogService.alert.trigger') }}
      </GrButton>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        {{ dialogStatus }}
      </p>
    </template>

    <template v-else-if="previewKey === 'use-dialog-service-nested'">
      <GrButton class="justify-self-start" variant="primary" tone="danger" @click="runNestedDemo">
        {{ t('composables.useDialogService.nested.trigger') }}
      </GrButton>
      <p class="text-sm text-[var(--gr-muted-fg)]">
        {{ nestedStatus }}
      </p>
    </template>

    <template v-else-if="previewKey === 'use-dialog-service-network'">
      <GrButton class="justify-self-start" variant="primary" @click="runNetworkDemo">
        {{ t('composables.useDialogService.network.trigger') }}
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