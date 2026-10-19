<script setup>
import { computed } from 'vue'

const props = defineProps({
  shape: { type: String, default: 'rounded' },
})

const vals = computed(() => {
  return { shapeCls: (props.shape ?? 'rounded') === 'capsule' ? 'shape-capsule' : '' }
})
</script>

<template>
<div class="gr-light doc" :class="vals.shapeCls" style="width: 1280px; min-height: 1800px; padding: 56px 64px; display: flex; flex-direction: column; gap: 48px">

<header style="display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: center; gap: 8px">
<span class="eyebrow">Granularity · GrButton</span>
<span class="tag tag-new">редизайн</span>
<span class="tag">API без изменений</span>
</div>
<h1 class="h1">Тактильная кнопка</h1>
<p class="lead">Свет сверху, тень снизу, отклик телом. Кнопка выглядит нажимаемой ещё до наведения и отвечает на нажатие за 80 мс. Те же пять весов, восемь тонов, четыре ступени и те же пропы — меняется только то, как она ощущается.</p>
</header>

<section style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">
<div class="stage" style="min-height: 280px; padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px">
<div style="display: flex; align-items: center; gap: 12px">
<button class="gb s-lg v-primary t-primary suf" type="button"><span class="lbl">Начать проект</span><svg class="nudge" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></button>
<button class="gb s-lg v-secondary t-neutral" type="button">Посмотреть демо</button>
</div>
<div style="display: flex; align-items: center; gap: 8px">
<button class="gb s-md v-primary t-neutral pre" type="button"><svg class="pop" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Новый отчёт</span></button>
<button class="gb s-md v-secondary t-primary" type="button">Дублировать</button>
<button class="gb s-md v-ghost t-neutral" type="button">Отмена</button>
<button class="gb s-md sq v-outline t-danger" type="button" aria-label="Удалить"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
</div>
</div>
<div class="gr-dark stage" style="min-height: 280px; padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px">
<div style="display: flex; align-items: center; gap: 12px">
<button class="gb s-lg v-primary t-primary suf" type="button"><span class="lbl">Начать проект</span><svg class="nudge" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></button>
<button class="gb s-lg v-secondary t-neutral" type="button">Посмотреть демо</button>
</div>
<div style="display: flex; align-items: center; gap: 8px">
<button class="gb s-md v-primary t-neutral pre" type="button"><svg class="pop" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Новый отчёт</span></button>
<button class="gb s-md v-secondary t-primary" type="button">Дублировать</button>
<button class="gb s-md v-ghost t-neutral" type="button">Отмена</button>
<button class="gb s-md sq v-outline t-danger" type="button" aria-label="Удалить"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button>
</div>
</div>
</section>

<section style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px">
<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<span class="num">01</span>
<h3 class="h3">Свет сверху, тень снизу</h3>
<p class="body">У заливки — блик и линия света по верхней кромке, внизу — тёмная кромка. Кнопка читается как предмет, а не как прямоугольник с текстом.</p>
</div>
<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<span class="num">02</span>
<h3 class="h3">Отклик телом</h3>
<p class="body">Наведение приподнимает на 1 px и раскрывает тень. Нажатие вдавливает за 80 мс, отпускание возвращает пружиной за 240 мс.</p>
</div>
<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<span class="num">03</span>
<h3 class="h3">Не только цветом</h3>
<p class="body">Недоступная кнопка заштрихована, у outline рамка становится пунктиром. Кольцо фокуса защёлкивается с 6 px до 2 px — его замечают боковым зрением.</p>
</div>
<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<span class="num">04</span>
<h3 class="h3">Тон светится</h3>
<p class="body">Тень берёт цвет заливки: 42 % в светлой теме, 62 % в тёмной. Нейтральная primary — чернильная и инвертируется в тёмной теме.</p>
</div>
</section>

<section style="display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: baseline; justify-content: space-between">
<h2 class="h2">Из чего сделан объём</h2>
<span class="cap">lg · primary, масштаб 2×</span>
</div>
<div style="display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 24px">
<div class="stage" style="min-height: 300px; display: flex; align-items: center; justify-content: center">
<div style="position: relative; display: inline-block; padding: 64px 96px">
<div style="zoom: 2"><button class="gb s-lg v-primary t-primary suf" type="button"><span class="lbl">Начать проект</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></button></div>
<span class="pin" style="right: 8px; top: 97px">1</span>
<div style="position: absolute; right: 30px; top: 108px; width: 66px; border-top: 1px dashed var(--brd-3)"></div>
<span class="pin" style="left: 145px; top: 8px">2</span>
<div class="leader" style="left: 156px; top: 30px; height: 50px"></div>
<span class="pin" style="left: 285px; top: 8px">3</span>
<div class="leader" style="left: 296px; top: 30px; height: 36px"></div>
<span class="pin" style="left: 205px; bottom: 8px">4</span>
<div class="leader" style="left: 216px; top: 150px; height: 36px"></div>
<span class="pin" style="left: 365px; bottom: 8px">5</span>
<div class="leader" style="left: 376px; top: 164px; height: 22px"></div>
</div>
</div>
<ol class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 14px">
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">1</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Заливка</h3><p class="mono" style="color: var(--fg-2)">--gr-button-{tone}-bg</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">2</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Блик</h3><p class="mono" style="color: var(--fg-2)">linear-gradient(180deg, #fff 14% → 0 на 60%)</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">3</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Линия света</h3><p class="mono" style="color: var(--fg-2)">inset 0 1px 0 rgb(255 255 255 / .24)</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">4</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Нижняя кромка</h3><p class="mono" style="color: var(--fg-2)">inset 0 −1px 0 rgb(0 0 0 / .14) + рамка: тон 84 % с чёрным</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">5</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Тень тона</h3><p class="mono" style="color: var(--fg-2)">0 6px 14px −6px color-mix(тон 42%)</p></div></li>
</ol>
</div>
</section>

<section style="display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: baseline; justify-content: space-between">
<h2 class="h2">1.1 → редизайн</h2>
<span class="cap">те же пропы: variant · tone · size</span>
</div>
<div class="panel" style="padding: 8px 24px">
<div style="display: grid; grid-template-columns: 120px repeat(4, minmax(0, 1fr)); align-items: center; padding: 12px 0">
<span></span><span class="colh">primary</span><span class="colh">secondary · neutral</span><span class="colh">outline</span><span class="colh">ghost</span>
</div>
<div style="display: grid; grid-template-columns: 120px repeat(4, minmax(0, 1fr)); align-items: center; padding: 16px 0; border-top: 1px solid var(--brd)">
<span class="cap">1.1</span>
<div><button class="gb s-md" type="button" style="background: #4f46e5; border-color: #4f46e5; color: #ffffff; font-weight: 400; letter-spacing: 0; border-radius: 6px; padding: 0 16px">Сохранить</button></div>
<div><button class="gb s-md" type="button" style="background: #e2e8f0; border-color: #e2e8f0; color: #1e293b; font-weight: 400; letter-spacing: 0; border-radius: 6px; padding: 0 16px">Отмена</button></div>
<div><button class="gb s-md" type="button" style="background: transparent; border-color: #4f46e5; color: #3730a3; font-weight: 400; letter-spacing: 0; border-radius: 6px; padding: 0 16px">Экспорт</button></div>
<div><button class="gb s-md" type="button" style="background: transparent; color: #3730a3; font-weight: 400; letter-spacing: 0; border-radius: 6px; padding: 0 16px">Подробнее</button></div>
</div>
<div style="display: grid; grid-template-columns: 120px repeat(4, minmax(0, 1fr)); align-items: center; padding: 16px 0; border-top: 1px solid var(--brd)">
<span class="cap">редизайн</span>
<div><button class="gb s-md v-primary t-primary" type="button">Сохранить</button></div>
<div><button class="gb s-md v-secondary t-neutral" type="button">Отмена</button></div>
<div><button class="gb s-md v-outline t-primary" type="button">Экспорт</button></div>
<div><button class="gb s-md v-ghost t-primary is-hover" type="button">Подробнее</button></div>
</div>
</div>
</section>

</div>
</template>
