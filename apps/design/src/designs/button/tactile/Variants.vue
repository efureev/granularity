<script setup>
import { computed } from 'vue'

const props = defineProps({
  shape: { type: String, default: 'rounded' },
})

const vals = computed(() => {
  const tones = [
    { key: 'primary', hint: 'главное действие', verb: 'Сохранить' },
    { key: 'neutral', hint: 'чернильная', verb: 'Продолжить' },
    { key: 'success', hint: 'подтверждение', verb: 'Принять' },
    { key: 'warning', hint: 'с последствиями', verb: 'Продолжить' },
    { key: 'danger', hint: 'необратимое', verb: 'Удалить' },
    { key: 'info', hint: 'справка, обзор', verb: 'Подробнее' },
    { key: 'slate', hint: 'служебное', verb: 'В архив' },
    { key: 'azure', hint: 'второй акцент', verb: 'Открыть' },
  ]
  const variants = ['primary', 'secondary', 'outline', 'ghost', 'ghost-border']
  return {
    shapeCls: (props.shape ?? 'rounded') === 'capsule' ? 'shape-capsule' : '',
    rows: tones.map(t => ({
      key: t.key,
      hint: t.hint,
      cells: variants.map(v => ({ cls: `gb s-md v-${v} t-${t.key}`, verb: t.verb })),
    })),
  }
})
</script>

<template>
<div class="gr-light doc" :class="vals.shapeCls" style="width: 1280px; min-height: 1300px; padding: 56px 64px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">02 · Варианты × тоны</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Пять весов — пять степеней объёма</h2>
<p class="lead">primary выпуклая, secondary — тонированная пластина, outline — контур, ghost и ghost-border проявляются только под указателем. Чем главнее действие, тем больше в нём света и тени.</p>
</header>

<div class="panel" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 170px repeat(5, minmax(0, 1fr)); align-items: end; padding: 16px 24px; background: var(--bg)">
<span class="colh">тон \ вес</span>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">primary</span><span class="cap">выпуклая</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">secondary</span><span class="cap">тонированная пластина</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">outline</span><span class="cap">контур 45 %</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">ghost</span><span class="cap">подложка всплывает</span></div>
<div style="display: flex; flex-direction: column; gap: 2px"><span class="colh" style="color: var(--fg)">ghost-border</span><span class="cap">подложка и рамка</span></div>
</div>
<template v-for="(row, rowIndex) in vals.rows" :key="rowIndex">
<div style="display: grid; grid-template-columns: 170px repeat(5, minmax(0, 1fr)); align-items: center; min-height: 72px; padding: 0 24px; border-top: 1px solid var(--brd)">
<div style="display: flex; flex-direction: column; gap: 2px"><span class="mono" style="font-weight: 600; color: var(--fg)">{{ row.key }}</span><span class="cap">{{ row.hint }}</span></div>
<template v-for="(c, cIndex) in row.cells" :key="cIndex">
<div><button :class="c.cls" type="button">{{ c.verb }}</button></div>
</template>
</div>
</template>
</div>

<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 14px">
<h3 class="h3">Чернильная нейтральная</h3>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center"><button class="gb s-md v-primary t-neutral" type="button">Продолжить</button></div>
<div class="gr-dark stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center"><button class="gb s-md v-primary t-neutral" type="button">Продолжить</button></div>
</div>
<p class="body">neutral + primary — цвет текста страницы. Строгая главная кнопка для интерфейсов, где индиго лишний: админки, настройки, редакторы.</p>
</div>

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 14px">
<h3 class="h3">Форма — рычаг темы</h3>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
<div class="stage" style="min-height: 96px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px"><button class="gb s-md v-primary t-primary" type="button">Сохранить</button><span class="cap">10 px</span></div>
<div class="stage shape-capsule" style="min-height: 96px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px"><button class="gb s-md v-primary t-primary" type="button">Сохранить</button><span class="cap">капсула</span></div>
</div>
<p class="body">Радиус по ступени: 8 / 8 / 10 / 12. Капсула включается одним <span class="code">--gr-button-radius: 999px</span> в приложении — группы держат её сами.</p>
</div>

<div class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 14px">
<h3 class="h3">Тень цвета тона</h3>
<div class="stage" style="min-height: 96px; display: flex; align-items: center; justify-content: center; gap: 10px">
<button class="gb s-sm v-primary t-primary" type="button">Индиго</button>
<button class="gb s-sm v-primary t-success" type="button">Успех</button>
<button class="gb s-sm v-primary t-danger" type="button">Удалить</button>
<button class="gb s-sm v-primary t-azure" type="button">Лазурь</button>
</div>
<p class="body">Цветная тень отделяет главное действие от фона мягче серой и подсказывает тон ещё до чтения подписи.</p>
</div>

</div>
</div>
</template>
