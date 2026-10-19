<script setup>
import { computed } from 'vue'

const vals = computed(() => {
  const tones = [
    { key: 'primary', hint: 'главное действие', verb: 'Сохранить' },
    { key: 'neutral', hint: 'второстепенное', verb: 'Отмена' },
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
<div class="gr-light doc" style="width: 1280px; min-height: 1280px; padding: 56px 64px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">02 · Варианты × тоны</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Вес — насколько действие главное. Тон — что оно значит.</h2>
<p class="lead">40 сочетаний из одного набора правил: заливка, подложка и рамка выводятся из тона формулой, поэтому новый тон из <span class="code">HOW_TO_ADD_NEW_TONE</span> встаёт во все пять весов сразу.</p>
</header>

<div class="panel" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 180px repeat(5, minmax(0, 1fr)); align-items: end; padding: 16px 24px; background: var(--bg)">
<span class="colh">тон \ вес</span>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">primary</span><span class="cap">заливка тона</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">secondary</span><span class="cap">подложка и мягкая рамка</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">outline</span><span class="cap">только рамка</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">ghost</span><span class="cap">только текст</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">ghost-border</span><span class="cap">рамка под указателем</span></div>
</div>
<template v-for="(row, rowIndex) in vals.rows" :key="rowIndex">
<div style="display: grid; grid-template-columns: 180px repeat(5, minmax(0, 1fr)); align-items: center; min-height: 68px; padding: 0 24px; border-top: 1px solid var(--brd)">
<div style="display: flex; flex-direction: column; gap: 2px"><span class="mono" style="font-weight: 600; color: var(--fg)">{{ row.key }}</span><span class="cap">{{ row.hint }}</span></div>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div><button :class="c.cls" type="button">{{ c.verb }}</button></div>
</template>
</div>
</template>
</div>

<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 16px">
<h3 class="h3">Одна primary на область</h3>
<p class="body">Диалог, карточка, шапка страницы — у каждой области одно главное действие. Остальные отступают на вес ниже.</p>
<div class="stage" style="padding: 20px; display: flex; justify-content: flex-end; gap: 8px; margin-top: auto">
<button class="gb s-md v-secondary t-neutral" type="button">Отмена</button>
<button class="gb s-md v-primary t-primary" type="button">Сохранить отчёт</button>
</div>
</div>

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Лестница веса</h3>
<div style="display: grid; grid-template-columns: 116px minmax(0, 1fr); gap: 10px 12px; align-items: center">
<button class="gb s-sm v-primary t-primary" type="button">primary</button><span class="body">главное действие области</span>
<button class="gb s-sm v-secondary t-primary" type="button">secondary</button><span class="body">сопутствующее: дублировать, экспорт</span>
<button class="gb s-sm v-outline t-primary" type="button">outline</button><span class="body">равноправные альтернативы</span>
<button class="gb s-sm v-ghost t-primary" type="button">ghost</button><span class="body">строки таблиц, плотный UI</span>
<button class="gb s-sm v-ghost-border t-primary is-hover" type="button">ghost-border</button><span class="body">тулбары: граница — под указателем</span>
</div>
</div>

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 12px">
<h3 class="h3">Тон — по смыслу</h3>
<ul style="display: flex; flex-direction: column; gap: 10px">
<li class="body"><b style="color: var(--fg)">danger</b> — только для необратимого. «Отмена» красной не бывает.</li>
<li class="body"><b style="color: var(--fg)">neutral</b> — второстепенное рядом с primary; secondary-вес — «обычная» кнопка формы.</li>
<li class="body"><b style="color: var(--fg)">success / warning</b> — когда действие продолжает статус рядом: «Принять» у заявки, «Продолжить» после предупреждения.</li>
<li class="body"><b style="color: var(--fg)">slate / azure</b> — служебные и брендовые поверхности, не замена primary.</li>
</ul>
</div>

</div>
</div>
</template>
