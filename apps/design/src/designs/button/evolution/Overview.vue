<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1900px; padding: 56px 64px; display: flex; flex-direction: column; gap: 48px">

<header style="display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: center; gap: 8px">
<span class="eyebrow">Granularity · Actions</span>
<span class="tag">GrButton</span>
<span class="tag tag-new">1.2 · в коде пакета</span>
</div>
<h1 class="h1">GrButton · эволюция</h1>
<p class="lead">Тот же API — пять весов, восемь тонов, четыре ступени — и те же токены <span class="code">--gr-*</span>. Дотянуты детали, по которым кнопку считывают как действие: вес подписи, фокус, нажатие, загрузка без скачка ширины, иконки по ступени.</p>
</header>

<section style="display: flex; flex-direction: column; gap: 16px">
<div class="stage" style="min-height: 200px; display: flex; align-items: center; justify-content: center; gap: 12px">
<button class="gb s-lg v-primary t-primary pre" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg><span class="lbl">Сохранить изменения</span></button>
<button class="gb s-lg v-secondary t-primary" type="button"><span class="lbl">Дублировать</span></button>
<button class="gb s-lg v-secondary t-neutral" type="button"><span class="lbl">Отмена</span></button>
<span class="anchor"><button class="gb s-lg sq v-outline t-danger" type="button" aria-label="Удалить проект"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></button><span class="tip" role="tooltip">Удалить проект</span></span>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 8px">
<span class="tag">5 весов</span>
<span class="tag">8 тонов</span>
<span class="tag">4 ступени</span>
<span class="tag">7 состояний</span>
<span class="tag">#prefix · default · #suffix</span>
<span class="tag">button · a · RouterLink</span>
<span class="tag">GrConfigProvider → группа → проп</span>
</div>
</section>

<section style="display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: baseline; justify-content: space-between">
<h2 class="h2">Анатомия</h2>
<span class="cap">md · primary · с префиксом и суффиксом, масштаб 2×</span>
</div>
<div style="display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 24px">
<div class="stage" style="min-height: 300px; display: flex; align-items: center; justify-content: center">
<div style="position: relative; display: inline-block; padding: 64px 80px">
<div style="zoom: 2"><button class="gb s-md v-primary t-primary pre suf" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Добавить</span><span class="kbd">⌘N</span></button></div>
<span class="pin" style="left: 8px; top: 93px">1</span>
<div style="position: absolute; left: 30px; top: 104px; width: 50px; border-top: 1px dashed var(--brd-3)"></div>
<span class="pin" style="left: 115px; top: 8px">2</span>
<div class="leader" style="left: 126px; top: 30px; height: 56px"></div>
<span class="pin" style="left: calc(50% - 11px); top: 8px">3</span>
<div class="leader" style="left: 50%; top: 30px; height: 52px"></div>
<span class="pin" style="right: 126px; top: 8px">4</span>
<div class="leader" style="right: 137px; top: 30px; height: 54px"></div>
<div class="dim dim-h b" style="left: 80px; top: 152px; width: 30px"><span>14</span></div>
<div class="dim dim-h b" style="left: 142px; top: 152px; width: 16px"><span>8</span></div>
<div class="dim dim-h b" style="right: 80px; top: 152px; width: 30px"><span>14</span></div>
<div class="dim dim-v" style="right: 55px; top: 64px; height: 80px"><span>40</span></div>
</div>
</div>
<ol class="panel" style="padding: 24px; display: flex; flex-direction: column; gap: 16px">
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">1</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Контейнер</h3><p class="body">Высота по ступени, радиус ступени <span class="code">--gr-button-radius-&lt;ступень&gt;</span> — 6 px, по углу отдельно для групп. Рамка 1 px есть всегда, у ghost прозрачная: варианты не прыгают на 2 px.</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">2</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Префикс · #prefix</h3><p class="body">Иконка по ступени: 14 / 16 / 16 / 20. Со стороны иконки отступ на 2 px меньше. В загрузке уступает место спиннеру.</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">3</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Подпись</h3><p class="body">500, кегль и интерлиньяж ступени, трекинг −0.006em. Глагол и объект: «Сохранить отчёт». Не влезает — многоточие.</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">4</span><div style="display: flex; flex-direction: column; gap: 2px"><h3 class="h3">Суффикс · #suffix</h3><p class="body">Шеврон меню, счётчик, <span class="code">GrKbd</span>, значок внешней ссылки. Цвет берёт от подписи.</p></div></li>
</ol>
</div>
</section>

<section style="display: flex; flex-direction: column; gap: 16px">
<div style="display: flex; align-items: baseline; justify-content: space-between">
<h2 class="h2">Что меняется против 1.1</h2>
<span class="cap">API, пропы и имена токенов не трогаем — только значения и поведение</span>
</div>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">01</span><h3 class="h3">Вес подписи</h3></div>
<p class="cap"><span class="was">400</span> → <span class="now">500, --gr-font-medium</span></p>
<p class="body">Подпись читается как действие, а не как текст рядом с полем. Кириллица в 14 px на 400 заметно бледнее латиницы.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">02</span><h3 class="h3">Фокус</h3></div>
<p class="cap"><span class="was">ring вплотную</span> → <span class="now">outline 2 px + отступ 2 px</span></p>
<p class="body">Индиго-кольцо больше не сливается с индиго-заливкой. Outline переживает forced-colors в Windows — box-shadow там выключается.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">03</span><h3 class="h3">Нажатие</h3></div>
<p class="cap"><span class="was">только темнее</span> → <span class="now">+ внутренняя тень, scale .98</span></p>
<p class="body">Отклик под пальцем за 120 мс. С prefers-reduced-motion остаётся только смена цвета.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">04</span><h3 class="h3">Загрузка</h3></div>
<p class="cap"><span class="was">спиннер дописывается, +24 px</span> → <span class="now">поверх подписи, ширина та же</span></p>
<p class="body">Соседние кнопки не уезжают. Курсор progress вместо not-allowed: действие идёт, а не запрещено.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">05</span><h3 class="h3">Иконка и зазор</h3></div>
<p class="cap"><span class="was">16 и 8 px везде</span> → <span class="now">14/16/16/20 и 4/6/8/8</span></p>
<p class="body">Иконка в xs больше не крупнее текста. Со стороны иконки отступ на 2 px меньше — глиф оптически по центру.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">06</span><h3 class="h3">Рамки весов</h3></div>
<p class="cap"><span class="was">насыщенный тон</span> → <span class="now">secondary 38 %, outline 70 %, hover 100 %</span></p>
<p class="body">Второстепенные веса перестают спорить с primary: яркая рамка тянула взгляд к «Отмене».</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">07</span><h3 class="h3">Нейтральный тон</h3></div>
<p class="cap"><span class="was">primary и secondary одинаково серые</span> → <span class="now">поверхность, рамка, тень</span></p>
<p class="body">У neutral появляется «обычная» кнопка — самый частый вес в формах и тулбарах.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">08</span><h3 class="h3">Объём solid</h3></div>
<p class="cap"><span class="was">плоская заливка</span> → <span class="now">блик 1 px + --gr-shadow-1</span></p>
<p class="body">Главное действие отделяется от фона без градиента. В отключённом виде объём снимается.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">09</span><h3 class="h3">Тёмная тема</h3></div>
<p class="cap"><span class="was">hover темнее покоя</span> → <span class="now">тон подмешивается в soft-заливку</span></p>
<p class="body">У шести тонов hover шёл от <span class="code">--gr-*-light</span> к 20 % тона в фоне — темнее и грязнее покоя. Теперь наведение светлеет.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">10</span><h3 class="h3">Ссылка наружу</h3></div>
<p class="cap"><span class="was">только target и rel</span> → <span class="now">значок + «в новой вкладке» для AT</span></p>
<p class="body">Человек заранее знает, что его уведут со страницы — как у <span class="code">GrLink</span>. Строка — ключ <span class="code">gr.button.opensInNewTab</span> в трёх локалях.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">11</span><h3 class="h3">Длинная подпись</h3></div>
<p class="cap"><span class="was">nowrap, текст вылезает</span> → <span class="now">многоточие, полное имя в title</span></p>
<p class="body">Кнопка в узкой колонке не ломает вёрстку. Доступное имя остаётся полным.</p>
</div>

<div class="panel" style="padding: 20px; display: flex; flex-direction: column; gap: 8px">
<div style="display: flex; align-items: baseline; gap: 10px"><span class="num">12</span><h3 class="h3">Зона касания</h3></div>
<p class="cap"><span class="was">28 и 32 px под пальцем</span> → <span class="now">::after до 44 px на pointer: coarse</span></p>
<p class="body">Плотная таблица остаётся плотной, а на телефоне нет промахов. Визуальный размер не меняется.</p>
</div>

</div>
</section>

</div>
</template>
