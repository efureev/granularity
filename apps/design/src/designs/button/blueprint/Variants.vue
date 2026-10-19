<script setup>
import { computed } from 'vue'

const vals = computed(() => {
  const tones = [
    { key: 'primary', hint: 'главное действие', verb: 'Сохранить' },
    { key: 'neutral', hint: 'графит', verb: 'Продолжить' },
    { key: 'success', hint: 'подтверждение', verb: 'Принять' },
    { key: 'warning', hint: 'с последствиями', verb: 'Продолжить' },
    { key: 'danger', hint: 'необратимое', verb: 'Удалить' },
    { key: 'info', hint: 'справка, обзор', verb: 'Подробнее' },
    { key: 'slate', hint: 'служебное', verb: 'В архив' },
    { key: 'azure', hint: 'второй акцент', verb: 'Открыть' },
  ]
  const variants = ['primary', 'secondary', 'outline', 'ghost', 'ghost-border']
  return {
    rows: tones.map(t => ({
      key: t.key,
      hint: t.hint,
      cells: variants.map(v => ({ cls: `gb s-md v-${v} t-${t.key}`, verb: t.verb })),
    })),
  }
})
</script>

<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1300px; padding: 56px 64px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">02 · Варианты × тоны</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Вес — сколько краски, тон — какой</h2>
<p class="lead">primary — сплошная заливка, secondary — тонированная плашка с волосяной рамкой, outline — контур, ghost — текст. Строка «под указателем» показывает общий сигнал: линию по нижней кромке.</p>
</header>

<div class="sheet" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 170px repeat(5, minmax(0, 1fr)); align-items: end; padding: 14px 24px; background: var(--muted)">
<span class="colh">тон \ вес</span>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">primary</span><span class="cap">сплошная заливка</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">secondary</span><span class="cap">плашка, рамка 32 %</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">outline</span><span class="cap">контур 62 %</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">ghost</span><span class="cap">как ссылка</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">ghost-border</span><span class="cap">контур под указателем</span></div>
</div>
<template v-for="(row, rowIndex) in vals.rows" :key="rowIndex">
<div class="ruled" style="display: grid; grid-template-columns: 170px repeat(5, minmax(0, 1fr)); align-items: center; min-height: 64px; padding: 0 24px">
<div style="display: flex; flex-direction: column; gap: 2px"><span class="mono" style="font-weight: 600; color: var(--fg)">{{ row.key }}</span><span class="cap">{{ row.hint }}</span></div>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div><button :class="c.cls" type="button">{{ c.verb }}</button></div>
</template>
</div>
</template>
<div class="ruled" style="display: grid; grid-template-columns: 170px repeat(5, minmax(0, 1fr)); align-items: center; min-height: 72px; padding: 0 24px; background: color-mix(in srgb, var(--muted) 60%, var(--card))">
<div style="display: flex; flex-direction: column; gap: 2px"><span class="mono" style="font-weight: 600; color: var(--fg)">под указателем</span><span class="cap">primary · тон primary</span></div>
<div><button class="gb s-md v-primary t-primary is-hover" type="button">Сохранить</button></div>
<div><button class="gb s-md v-secondary t-primary is-hover" type="button">Сохранить</button></div>
<div><button class="gb s-md v-outline t-primary is-hover" type="button">Сохранить</button></div>
<div><button class="gb s-md v-ghost t-primary is-hover" type="button">Сохранить</button></div>
<div><button class="gb s-md v-ghost-border t-primary is-hover" type="button">Сохранить</button></div>
</div>
</div>

<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">

<div class="sheet" style="padding: 22px; display: flex; flex-direction: column; gap: 14px">
<span class="idx">ghost = ссылка</span>
<div class="blueprint" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 4px">
<button class="gb s-sm v-ghost t-neutral" type="button">Обзор</button>
<button class="gb s-sm v-ghost t-neutral is-hover" type="button">Отчёты</button>
<button class="gb s-sm v-ghost t-neutral" type="button">Команда</button>
</div>
<p class="body">Без заливки и без рамки ghost узнаётся по линии хода — как вкладка или ссылка. Ряд ghost-кнопок читается навигацией, а не набором кнопок.</p>
</div>

<div class="sheet" style="padding: 22px; display: flex; flex-direction: column; gap: 14px">
<span class="idx">нейтральная — графит</span>
<div class="blueprint" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 8px">
<button class="gb s-md v-primary t-neutral" type="button">Продолжить</button>
<button class="gb s-md v-secondary t-neutral" type="button">Отмена</button>
</div>
<p class="body">neutral primary — серая плашка с тёмной подписью, secondary — белый лист с рамкой. Без тени нейтральную кнопку держит только контур, поэтому он заметнее, чем у «Тактильной».</p>
</div>

<div class="sheet" style="padding: 22px; display: flex; flex-direction: column; gap: 14px">
<span class="idx">тон в одной точке</span>
<div class="blueprint" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 8px">
<button class="gb s-sm v-outline t-success is-hover" type="button">Принять</button>
<button class="gb s-sm v-outline t-warning is-hover" type="button">Продолжить</button>
<button class="gb s-sm v-outline t-danger is-hover" type="button">Удалить</button>
</div>
<p class="body">Цвет тона живёт в подписи, рамке и линии — всегда вместе. Фон под outline почти не тонируется, поэтому три тона рядом не превращаются в светофор.</p>
</div>

</div>
</div>
</template>
