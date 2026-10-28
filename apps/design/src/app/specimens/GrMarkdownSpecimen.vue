<script setup lang="ts">
import GrCodeBlock from '@feugene/granularity-code/components/GrCodeBlock'
import { computed, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const SIZES = ['xs', 'sm', 'md', 'lg'] as const
const DENSITIES = ['comfortable', 'compact'] as const

const PREVIEW_SOURCE = `Счёт **СЧ-1046** оплачен, акт придёт в \`ЭДО\`.

- [x] макет согласован
- [ ] вёрстка презентации`

const CONTRACT = `## Договор поставки № 41

Памятка менеджеру: что проверить **до подписи** и куда смотреть, если поставщик прислал
правки. Сумма по договору — \`120 000 ₽\` с НДС, срок действия — *до конца года*.

### Что проверить

1. реквизиты сторон совпадают с выпиской;
2. срок поставки — не позже 30 дней с оплаты;
3. неустойка за просрочку — не выше 0,1 % в день.

- [x] счёт выставлен
- [x] спецификация согласована
- [ ] акт подписан

> [!WARNING]
> Правки поставщика в разделе 7 меняют порядок приёмки — согласуйте их с юристом.

### Платежи

| Этап | Срок | Сумма |
| --- | --- | ---: |
| Аванс | при подписании | 36 000 ₽ |
| Остаток | после приёмки | 84 000 ₽ |

> Поставщик передаёт товар свободным от прав третьих лиц.

Шаблон договора обновлён в октябре[^1].

[^1]: Новая редакция учитывает электронный документооборот.
`

const ALERTS = `> [!NOTE]
> Счёт уйдёт клиенту после подписи акта.

> [!TIP]
> Шаблон письма можно сохранить для следующих сделок.

> [!IMPORTANT]
> Оплата по договору — только безналичная.

> [!WARNING]
> До конца аванса осталось три дня.

> [!CAUTION]
> Удалённый договор не восстановить.`

const SIZE_SAMPLE = `Поставка — **в течение 30 дней** с оплаты.

- реквизиты сверены
- спецификация согласована`

const DENSITY_SAMPLE = `Клиент просит перенести поставку на ноябрь.

- склад подтвердил остаток
- логистика ждёт новый адрес

Ответить до пятницы.`

const ESCAPED_SOURCE = `Комментарий клиента: <b>срочно</b>, <button onclick="pay()">Оплатить</button> и [наш сайт](javascript:alert(1)).`

const MINIMAL_SOURCE = `Прикладываю скан: ![Скан подписанного акта](act-41.png) — <i>оригинал</i> отправлю почтой.`

const checklist = ref(`- [x] счёт выставлен
- [ ] акт подписан
- [ ] закрывающие документы отправлены`)

const done = computed(() => (checklist.value.match(/\[x\]/g) ?? []).length)
const total = computed(() => (checklist.value.match(/\[[ x]\]/g) ?? []).length)

/** Офсет указывает на «[» маркера в исходнике: документ переписывают по нему, а не по номеру пункта. */
function toggleTask(offset: number, checked: boolean): void {
  checklist.value = `${checklist.value.slice(0, offset)}${checked ? '[x]' : '[ ]'}${checklist.value.slice(offset + 3)}`
}

const API_NOTE = `Ответ сервиса после подписи:

\`\`\`json
{
  "contract": 41,
  "status": "signed",
  "amount": 120000,
  "overdue": false
}
\`\`\``

const renderers = { code: GrCodeBlock }
</script>

<template>
  <!-- Карточка каталога и «Темы рядом»: одно состояние, ничего не открыто. -->
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrMarkdown :source="PREVIEW_SOURCE" size="sm" density="compact" />
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Документ" note="Заголовки с якорями, списки, задачи, алерт, таблица, цитата и сноска — узлами Vue на токенах темы; текстовые блоки держат меру строки, таблица выходит во всю ширину." wide>
      <div class="rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-6">
        <GrMarkdown :source="CONTRACT" :heading-offset="2" id-prefix="contract-" aria-label="Памятка: договор поставки № 41" />
      </div>
    </Specimen>

    <Specimen title="Алерты" note="Маркер цитаты разбирается только в тон; вид — из темы, подпись тона — текстом, без живого региона.">
      <GrMarkdown :source="ALERTS" density="compact" />
    </Specimen>

    <Specimen title="Недоверенный текст" note="Сырой HTML экранируется или выбрасывается, ссылка с чужой схемой становится текстом; minimal оставляет от картинки подпись — без запроса на чужой сервер.">
      <div class="flex flex-col gap-1.5">
        <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">html="escape"</span>
        <GrMarkdown :source="ESCAPED_SOURCE" />
      </div>
      <div class="flex flex-col gap-1.5">
        <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">html="strip" · preset="minimal"</span>
        <GrMarkdown :source="MINIMAL_SOURCE" html="strip" preset="minimal" />
      </div>
    </Specimen>

    <Specimen title="Ступени" note="Кегль и интерлиньяж текста — по шкале xs · sm · md · lg.">
      <div v-for="size in SIZES" :key="size" class="flex items-start gap-3">
        <span class="w-6 shrink-0 font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ size }}</span>
        <div class="min-w-0 flex-1">
          <GrMarkdown :source="SIZE_SAMPLE" :size="size" density="compact" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Плотность" note="comfortable — отбивка статьи, compact — комментарий в ленте; решение сквозное, его задают на приложение.">
      <div class="grid gap-6 sm:grid-cols-2">
        <div v-for="density in DENSITIES" :key="density" class="flex flex-col gap-1.5">
          <span class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ density }}</span>
          <GrMarkdown :source="DENSITY_SAMPLE" :density="density" size="sm" />
        </div>
      </div>
    </Specimen>

    <Specimen title="Задачи" note="interactiveTasks делает отметки кликабельными; эмит несёт офсет маркера, и приложение переписывает исходник само. Имя отметки — текст пункта.">
      <GrMarkdown :source="checklist" interactive-tasks @task-toggle="toggleTask" />
      <p role="status" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        Сделано {{ done }} из {{ total }}
      </p>
    </Specimen>

    <Specimen title="Свой рендерер кода" note="Пакет не красит код сам: подсветку приносит рендерер из components — здесь GrCodeBlock из granularity-code.">
      <GrMarkdown :source="API_NOTE" :components="renderers" />
    </Specimen>
  </div>
</template>
