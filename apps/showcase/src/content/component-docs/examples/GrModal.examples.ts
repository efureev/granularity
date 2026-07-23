import type { ShowcaseComponentExampleDoc } from '../types'

export const grModalExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'modal-basic-flow',
    title: 'Bare modal flow',
    description: 'Базовый сценарий для `GrModal`: минимальный контейнер, открытие по кнопке и явное закрытие из пользовательского контента.',
    status: 'ready',
    previewKey: 'gr-modal-basic-flow',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <GrButton @click="open = true">
    Open bare modal
  </GrButton>

  <GrModal v-model="open" size="sm">
    <div class="grid gap-3">
      <div class="text-sm font-semibold">
        Bare modal
      </div>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        <code>GrModal</code> даёт только overlay, panel и focus management — остальную структуру вы собираете сами.
      </div>
      <GrButton class="justify-self-start" @click="open = false">
        Close
      </GrButton>
    </div>
  </GrModal>
</template>`,
  },
  {
    id: 'modal-backdrop-guard',
    title: 'Backdrop guard for critical flows',
    description: 'Показываем `closeOnBackdrop=false` для кейсов, где нельзя случайно потерять прогресс черновика или подтверждения.',
    status: 'ready',
    previewKey: 'gr-modal-backdrop-guard',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <GrButton variant="outline" @click="open = true">
    Open guarded modal
  </GrButton>

  <GrModal v-model="open" :close-on-backdrop="false" size="md">
    <div class="grid gap-3">
      <div class="text-sm font-semibold">
        Draft protection
      </div>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Клик по backdrop не закрывает окно — закройте его явной кнопкой.
      </div>
      <div class="flex flex-wrap gap-3">
        <GrButton variant="outline" @click="open = false">
          Cancel
        </GrButton>
        <GrButton @click="open = false">
          Save draft
        </GrButton>
      </div>
    </div>
  </GrModal>
</template>`,
    note: 'Этот сценарий полезен для проверки focus-trap и поведения backdrop в критичных формах/confirm flows.',
  },
  {
    id: 'modal-size-switcher',
    title: 'Size variants for different payloads',
    description: 'Изолируем влияние `size` на layout: один и тот же entry point может открывать compact review или широкую review-панель.',
    status: 'ready',
    previewKey: 'gr-modal-size-switcher',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal } from '@feugene/granularity'

const activeSize = ref<'sm' | 'lg'>('sm')
const open = ref(false)

function openWithSize(size: 'sm' | 'lg') {
  activeSize.value = size
  open.value = true
}
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <GrButton variant="outline" @click="openWithSize('sm')">
      Open compact modal
    </GrButton>
    <GrButton @click="openWithSize('lg')">
      Open wide modal
    </GrButton>
  </div>

  <GrModal v-model="open" :size="activeSize">
    <div class="grid gap-4">
      <div class="text-sm font-semibold">
        Active size: {{ activeSize }}
      </div>
      <div class="grid gap-2 text-sm text-[var(--gr-muted-fg)]">
        <div>Используйте <code>sm</code> для коротких решений и <code>lg</code> для review/panel-потока.</div>
        <div>Контент внутри полностью ваш — компонент отвечает только за modal-shell.</div>
      </div>
      <GrButton class="justify-self-start" @click="open = false">
        Done
      </GrButton>
    </div>
  </GrModal>
</template>`,
  },
  {
    id: 'modal-dialog-service',
    title: 'Imperative dialogs from an open modal',
    description: 'Запускаем `useDialogService` (`confirm` / `alert` / `prompt`) прямо из открытой `GrModal`. Сервис монтирует собственный host в `document.body` поверх окна, поэтому закрытие диалога не закрывает исходную модалку — решение возвращается через `Promise`.',
    status: 'ready',
    previewKey: 'gr-modal-dialog-service',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrModal, useDialogService } from '@feugene/granularity'

const dialog = useDialogService()

const open = ref(false)
const result = ref('')

// confirm -> Promise<boolean>. Открытая модалка остаётся на месте.
async function confirmFromModal() {
  const ok = await dialog.confirm('Удалить выбранный черновик безвозвратно?', {
    title: 'Удалить черновик?',
    confirmText: 'Удалить',
    confirmTone: 'danger',
  })
  result.value = ok ? 'confirm: подтверждено' : 'confirm: отменено'
}

// alert -> Promise<void>.
async function alertFromModal() {
  await dialog.alert('Изменения сохранены в фоне.', { title: 'Готово' })
  result.value = 'alert: закрыт'
}

// prompt -> Promise<string | null>.
async function promptFromModal() {
  const name = await dialog.prompt('Введите новое имя пресета', {
    title: 'Переименовать пресет',
    label: 'Имя пресета',
    value: 'Draft preset',
    required: true,
  })
  result.value = name === null ? 'prompt: отменён' : 'prompt: ' + name
}
</script>

<template>
  <GrButton @click="open = true">
    Open settings modal
  </GrButton>

  <GrModal v-model="open" :close-on-backdrop="false" size="md">
    <div class="grid gap-4">
      <div class="text-sm font-semibold">
        Workspace settings
      </div>
      <div class="flex flex-wrap gap-3">
        <GrButton variant="primary" tone="danger" @click="confirmFromModal">
          confirm
        </GrButton>
        <GrButton variant="outline" @click="alertFromModal">
          alert
        </GrButton>
        <GrButton variant="outline" @click="promptFromModal">
          prompt
        </GrButton>
      </div>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        {{ result || 'Вызовите любой диалог — окно останется открытым.' }}
      </div>
      <GrButton variant="outline" class="justify-self-start" @click="open = false">
        Close modal
      </GrButton>
    </div>
  </GrModal>
</template>`,
    note: 'Закрытие confirm/alert/prompt не закрывает исходную модалку — это удобно для подтверждений и быстрых вводов внутри сложных форм.',
  },
]
