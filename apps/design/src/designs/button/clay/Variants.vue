<script setup>
import { computed } from 'vue'

const vals = computed(() => {
  const tones = [
    { key: 'neutral', hint: 'графит, рабочий главный', verb: 'Сохранить' },
    { key: 'primary', hint: 'глина, один акцент', verb: 'Отправить' },
    { key: 'success', hint: 'олива', verb: 'Принять' },
    { key: 'warning', hint: 'охра', verb: 'Продолжить' },
    { key: 'danger', hint: 'кирпич', verb: 'Удалить' },
    { key: 'info', hint: 'синий', verb: 'Подробнее' },
    { key: 'slate', hint: 'тёплый серый', verb: 'В архив' },
    { key: 'azure', hint: 'небо', verb: 'Открыть' },
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
<div class="gr-light doc" style="width: 1280px; min-height: 1400px; padding: 64px 72px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">Варианты × тоны</span>
<h2 class="title" style="font-size: 34px">Сколько краски — и какой</h2>
<p class="lead">primary — заливка тона, secondary — тот же тон, разведённый в бумаге, outline — тонкая тёплая рамка, ghost — только подпись. Цвет рамки не зависит от тона.</p>
</header>

<div class="card" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 170px repeat(5, minmax(0, 1fr)); align-items: end; padding: 14px 24px; background: var(--muted)">
<span class="colh">тон \ вес</span>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="h3" style="font-size: 13px">primary</span><span class="cap">заливка</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="h3" style="font-size: 13px">secondary</span><span class="cap">тон в бумаге</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="h3" style="font-size: 13px">outline</span><span class="cap">рамка 30 % графита</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="h3" style="font-size: 13px">ghost</span><span class="cap">только подпись</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="h3" style="font-size: 13px">ghost-border</span><span class="cap">рамка под указателем</span></div>
</div>
<template v-for="(row, rowIndex) in vals.rows" :key="rowIndex">
<div class="rule" style="display: grid; grid-template-columns: 170px repeat(5, minmax(0, 1fr)); align-items: center; min-height: 66px; padding: 0 24px">
<div style="display: flex; flex-direction: column; gap: 2px"><span class="h3" style="font-size: 13px">{{ row.key }}</span><span class="cap">{{ row.hint }}</span></div>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div><button :class="c.cls" type="button">{{ c.verb }}</button></div>
</template>
</div>
</template>
</div>

<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">

<div class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 14px">
<h3 class="heading" style="font-size: 20px">Одна глиняная точка</h3>
<div class="paper" style="min-height: 100px; display: flex; align-items: center; justify-content: center; gap: 8px">
<button class="gb s-md v-ghost t-neutral" type="button">Черновик</button>
<button class="gb s-md v-secondary t-neutral" type="button">Предпросмотр</button>
<button class="gb s-md v-primary t-primary" type="button">Отправить</button>
</div>
<p class="body">Глина — это «вот оно». На экране она одна; если глиняных кнопок две, одна из них должна стать графитовой или светлой.</p>
</div>

<div class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 14px">
<h3 class="heading" style="font-size: 20px">Графит — рабочий главный</h3>
<div class="paper" style="min-height: 100px; display: flex; align-items: center; justify-content: center; gap: 8px">
<button class="gb s-md v-ghost t-neutral" type="button">Отмена</button>
<button class="gb s-md v-primary t-neutral" type="button">Сохранить</button>
</div>
<p class="body">В формах, настройках и диалогах главное действие — графитовое: оно сильное, но не кричит, и глина остаётся свободной для по-настоящему важного.</p>
</div>

<div class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 14px">
<h3 class="heading" style="font-size: 20px">Рамка без цвета</h3>
<div class="paper" style="min-height: 100px; display: flex; align-items: center; justify-content: center; gap: 8px">
<button class="gb s-md v-outline t-success" type="button">Принять</button>
<button class="gb s-md v-outline t-warning" type="button">Продолжить</button>
<button class="gb s-md v-outline t-danger" type="button">Удалить</button>
</div>
<p class="body">У outline любого тона рамка одна — графит на 30 %. Тон говорит подписью, поэтому три тона рядом не превращаются в светофор.</p>
</div>

</div>
</div>
</template>
