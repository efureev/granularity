<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1900px; padding: 56px 64px; display: flex; flex-direction: column; gap: 40px">

<header style="display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: center; gap: 8px">
<span class="eyebrow">Granularity · GrButton</span>
<span class="tag tag-ink">редизайн 2</span>
<span class="tag">API без изменений</span>
</div>
<h1 class="h1">Чертёж</h1>
<p class="lead">Кнопка без объёма: заливка, линия и шрифт. Под указателем по нижней кромке прочерчивается линия — один и тот же сигнал у всех пяти весов. Загрузка бежит той же линией, недоступность рисуется пунктиром. Пропы прежние, меняется язык.</p>
</header>

<section style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">
<div class="blueprint" style="min-height: 260px; padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px">
<div style="display: flex; align-items: center; gap: 10px">
<button class="gb s-lg v-primary t-primary celled" type="button"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span><span class="lbl">Новый отчёт</span></button>
<button class="gb s-lg v-secondary t-neutral" type="button">Шаблоны</button>
<button class="gb s-lg v-ghost t-neutral is-hover" type="button">Отмена</button>
</div>
<div style="display: flex; align-items: center; gap: 10px">
<button class="gb s-md v-primary t-primary is-loading" type="button" aria-busy="true"><span class="lbl">Публикуем</span></button>
<button class="gb s-md v-outline t-primary" type="button"><span class="lbl">Экспорт</span><span class="kbd">⌘E</span></button>
<button class="gb s-md sq v-outline t-danger" type="button" aria-label="Удалить"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14H5V6"></path><path d="M8 6V3h8v3"></path></svg></button>
</div>
</div>
<div class="gr-dark blueprint" style="min-height: 260px; padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px">
<div style="display: flex; align-items: center; gap: 10px">
<button class="gb s-lg v-primary t-primary celled" type="button"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span><span class="lbl">Новый отчёт</span></button>
<button class="gb s-lg v-secondary t-neutral" type="button">Шаблоны</button>
<button class="gb s-lg v-ghost t-neutral is-hover" type="button">Отмена</button>
</div>
<div style="display: flex; align-items: center; gap: 10px">
<button class="gb s-md v-primary t-primary is-loading" type="button" aria-busy="true"><span class="lbl">Публикуем</span></button>
<button class="gb s-md v-outline t-primary" type="button"><span class="lbl">Экспорт</span><span class="kbd">⌘E</span></button>
<button class="gb s-md sq v-outline t-danger" type="button" aria-label="Удалить"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14H5V6"></path><path d="M8 6V3h8v3"></path></svg></button>
</div>
</div>
</section>

<section style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; border: 1px solid var(--brd-2); border-radius: 4px; background: var(--card)">
<div style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<span class="idx">01 · плоскость</span>
<p class="body">Ни теней, ни бликов, ни градиентов. Вес действия — заливка, рамка или только текст; больше различать нечем и незачем.</p>
</div>
<div style="padding: 20px; display: flex; flex-direction: column; gap: 8px; border-left: 1px solid var(--brd-2)">
<span class="idx">02 · линия хода</span>
<p class="body">Под указателем по нижней кромке слева направо прочерчивается линия в 2px. Сигнал одинаков у всех весов: ghost ведёт себя как ссылка или вкладка.</p>
</div>
<div style="padding: 20px; display: flex; flex-direction: column; gap: 8px; border-left: 1px solid var(--brd-2)">
<span class="idx">03 · загрузка — та же линия</span>
<p class="body">Подпись остаётся читаемой, по кромке бежит отрезок. Ширина не меняется, спиннер не нужен.</p>
</div>
<div style="padding: 20px; display: flex; flex-direction: column; gap: 8px; border-left: 1px solid var(--brd-2)">
<span class="idx">04 · пунктир вместо серого</span>
<p class="body">Недоступная кнопка теряет заливку и получает пунктирный контур: её отличишь и без цвета, и в монохроме.</p>
</div>
</section>

<section style="display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between">
<h2 class="h2">Анатомия</h2>
<span class="mono" style="color: var(--muted-fg)">md · primary · иконка в ячейке · под указателем · 2×</span>
</div>
<div style="display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px">
<div class="blueprint" style="min-height: 300px; display: flex; align-items: center; justify-content: center">
<div style="position: relative; display: inline-block; padding: 64px 80px">
<div style="zoom: 2"><button class="gb s-md v-primary t-primary celled is-hover" type="button"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span><span class="lbl">Новый отчёт</span></button></div>
<span class="pin" style="left: 8px; top: 94px">1</span>
<div style="position: absolute; left: 28px; top: 104px; width: 52px; border-top: 1px solid var(--brd-3)"></div>
<span class="pin" style="left: 110px; top: 8px">2</span>
<div class="leader" style="left: 120px; top: 28px; height: 56px"></div>
<span class="pin" style="left: 270px; top: 8px">3</span>
<div class="leader" style="left: 280px; top: 28px; height: 56px"></div>
<span class="pin" style="left: 330px; bottom: 8px">4</span>
<div class="leader" style="left: 340px; top: 146px; height: 32px"></div>
<div class="dim dim-v" style="right: 54px; top: 64px; height: 80px"><span>40</span></div>
<div class="dim dim-h b" style="left: 80px; top: 152px; width: 80px"><span>40 · ячейка</span></div>
</div>
</div>
<ol class="sheet" style="padding: 22px; display: flex; flex-direction: column; gap: 14px">
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">1</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Контур</h3><p class="body">Рамка 1px у всех весов, угол 3px на любой ступени. Форма не растёт с кнопкой: строгость держится одинаково от xs до lg.</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">2</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Ячейка иконки</h3><p class="body">Квадрат со стороной в высоту кнопки, отделённый линией в 24 % цвета подписи. Иконка не плывёт вместе с текстом — у неё своё место.</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">3</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Подпись</h3><p class="body">Inter 600, кегль ступени без трекинга. Счётчики и клавиши — JetBrains Mono в рамке 1px.</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">4</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Линия хода</h3><p class="body">2px по нижней кромке, тоном подписи. Под указателем — прочерчивается слева за 180 мс, в нажатии — полной яркостью, в загрузке — бежит отрезком.</p></div></li>
</ol>
</div>
</section>

<section style="display: flex; flex-direction: column; gap: 14px">
<h2 class="h2">«Тактильная» и «Чертёж» — два разных ответа</h2>
<div class="sheet" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 170px minmax(0, 1fr) minmax(0, 1fr); padding: 12px 20px; background: var(--muted)">
<span class="colh">свойство</span><span class="colh">тактильная</span><span class="colh" style="color: var(--fg)">чертёж</span>
</div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) minmax(0, 1fr); padding: 11px 20px"><span class="h3">Объём</span><span class="body">блик сверху, кромка снизу, тень цвета тона</span><span class="body" style="color: var(--fg)">нет: заливка, рамка, текст</span></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) minmax(0, 1fr); padding: 11px 20px"><span class="h3">Форма</span><span class="body">радиус растёт со ступенью, есть капсула</span><span class="body" style="color: var(--fg)">3px на всех ступенях</span></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) minmax(0, 1fr); padding: 11px 20px"><span class="h3">Наведение</span><span class="body">подъём на 1px, тень раскрывается</span><span class="body" style="color: var(--fg)">линия по нижней кромке</span></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) minmax(0, 1fr); padding: 11px 20px"><span class="h3">Нажатие</span><span class="body">вдавливание и пружина</span><span class="body" style="color: var(--fg)">только цвет, кнопка не двигается</span></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) minmax(0, 1fr); padding: 11px 20px"><span class="h3">Загрузка</span><span class="body">спиннер и блик по поверхности</span><span class="body" style="color: var(--fg)">бегущая линия, подпись видна</span></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) minmax(0, 1fr); padding: 11px 20px"><span class="h3">Недоступность</span><span class="body">штриховка по заливке</span><span class="body" style="color: var(--fg)">пунктирный контур без заливки</span></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) minmax(0, 1fr); padding: 11px 20px"><span class="h3">Иконка</span><span class="body">поворачивается и подталкивает</span><span class="body" style="color: var(--fg)">стоит в своей ячейке</span></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) minmax(0, 1fr); padding: 11px 20px"><span class="h3">Движение</span><span class="body">пружины 240–280 мс</span><span class="body" style="color: var(--fg)">120–180 мс, без перелёта</span></div>
<div class="ruled" style="display: grid; grid-template-columns: 170px minmax(0, 1fr) minmax(0, 1fr); padding: 11px 20px"><span class="h3">Где к месту</span><span class="body">продуктовые экраны, онбординг, лендинги</span><span class="body" style="color: var(--fg)">рабочие инструменты, админки, плотные таблицы</span></div>
</div>
</section>

</div>
</template>
