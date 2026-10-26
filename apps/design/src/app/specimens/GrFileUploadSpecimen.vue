<script setup lang="ts">
import type { GrFileUploadRequestCtx } from '@feugene/granularity'
import { maxFileSize } from '@feugene/granularity/fileValidation'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

const uploadValidators = [maxFileSize({ mb: 20 })]

/*
 * Приложение никуда не отправляет файлы: загрузку изображает таймер, чтобы были
 * видны прогресс и итог строки. Превью таймеров не заводит — там загрузка мгновенная.
 */
function upload(files: File[], { signal, onProgress }: GrFileUploadRequestCtx, failAt?: number): Promise<void> {
  const total = files.reduce((sum, file) => sum + file.size, 0)
  return new Promise((resolve, reject) => {
    let percent = 0
    const timer = setInterval(() => {
      percent = Math.min(100, percent + 20)
      onProgress?.({ percent, loaded: Math.round((total * percent) / 100), total, indeterminate: false })
      if (failAt !== undefined && percent >= failAt) {
        clearInterval(timer)
        reject(new Error('Связь оборвалась'))
      }
      else if (percent === 100) {
        clearInterval(timer)
        resolve()
      }
    }, 300)
    signal.addEventListener('abort', () => {
      clearInterval(timer)
      reject(new DOMException('Загрузка остановлена', 'AbortError'))
    }, { once: true })
  })
}

function simulateUpload(files: File[], ctx: GrFileUploadRequestCtx): Promise<void> {
  return upload(files, ctx)
}

// Первая попытка каждого файла срывается на 40 %, повтор проходит.
const attempts = new WeakMap<File, number>()
function flakyUpload(files: File[], ctx: GrFileUploadRequestCtx): Promise<void> {
  const file = files[0]!
  const attempt = (attempts.get(file) ?? 0) + 1
  attempts.set(file, attempt)
  return upload(files, ctx, attempt === 1 ? 40 : undefined)
}

function instantUpload(): Promise<void> {
  return Promise.resolve()
}

const readonlyFiles = [
  new File([new Uint8Array(412 * 1024)], 'Устав.pdf', { type: 'application/pdf' }),
  new File([new Uint8Array(230 * 1024)], 'Выписка ЕГРЮЛ.pdf', { type: 'application/pdf' }),
]
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <!-- Полоса прогресса держит место и скрытой — в карточке ей не хватит высоты. -->
    <GrFileUpload :request="instantUpload" size="sm" :show-progress="false" placeholder="Перетащите файлы или выберите">
      <template #tip>
        PDF, DOCX, XLSX · до 20 МБ
      </template>
    </GrFileUpload>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Пофайловая загрузка" note="Файл над зоной — пунктир становится линией; у каждой строки свой статус и прогресс, едущий файл можно остановить." wide>
      <GrFormField label="Материалы к заказу">
        <GrFileUpload
          :request="simulateUpload"
          :validators="uploadValidators"
          accept=".pdf,.docx,.xlsx"
          upload-mode="per-file"
          multiple
          show-file-list
          placeholder="Перетащите файлы или выберите"
          progress-label="Загрузка файлов"
        >
          <template #tip>
            PDF, DOCX, XLSX · до 20 МБ
          </template>
        </GrFileUpload>
      </GrFormField>
    </Specimen>

    <Specimen title="Сбой и повтор" note="Первая попытка здесь всегда срывается: строка говорит «Ошибка» и предлагает повторить только её.">
      <GrFormField label="Выгрузка для бухгалтерии">
        <GrFileUpload
          :request="flakyUpload"
          upload-mode="per-file"
          multiple
          show-file-list
          placeholder="Выберите файлы"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Картинка с превью" note="Весь набор уходит одним запросом; у картинок в списке — миниатюра.">
      <GrFormField label="Обложка проекта" hint="JPG или PNG, лучше горизонтальная">
        <GrFileUpload
          :request="simulateUpload"
          accept="image/*"
          preview
          show-file-list
          placeholder="Перетащите картинку или выберите"
        />
      </GrFormField>
    </Specimen>

    <Specimen title="Состояния" note="Только чтение показывает набор, но диалог не откроется и перетаскивание не примут." wide>
      <div class="grid gap-x-6 gap-y-5 lg:grid-cols-3">
        <GrFormField label="Чек об оплате" error="Без чека заказ не подтвердим" required>
          <GrFileUpload :request="simulateUpload" size="sm" placeholder="Выберите чек" />
        </GrFormField>
        <GrFormField label="Архив проекта" hint="Загрузка откроется после сдачи" disabled>
          <GrFileUpload :request="simulateUpload" size="sm" placeholder="Выберите архив" />
        </GrFormField>
        <GrFormField label="Учредительные документы" readonly>
          <GrFileUpload :model-value="readonlyFiles" :request="simulateUpload" size="sm" multiple show-file-list placeholder="Выберите файлы" />
        </GrFormField>
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Значок, подпись и отступы зоны идут за ступенью." wide>
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="size in SIZES" :key="size" class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
          <GrFileUpload :request="simulateUpload" :size="size" placeholder="Перетащите файл или выберите" :aria-label="`Файл, ступень ${size}`" />
        </div>
      </div>
    </Specimen>
  </div>
</template>
