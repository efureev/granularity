<template>
<div class="gr-light doc" style="width: 1280px; min-height: 2000px; padding: 64px 72px; display: flex; flex-direction: column; gap: 36px">

<header style="display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: center; gap: 8px">
<span class="eyebrow">Granularity · GrButton</span>
<span class="chip">редизайн 3</span>
<span class="chip">тёплая бумага</span>
</div>
<h1 class="display" style="font-size: 56px">Глина</h1>
<p class="lead">Тёплая бумага, графитовые чернила и одна глиняная точка на экран. Главное действие — графит, акцент — глина, остальное — оттенок бумаги и тонкая тёплая рамка. Тон живёт в заливке, а рамки остаются серыми. Пропы прежние.</p>
</header>

<section style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">
<div class="paper" style="min-height: 260px; padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px">
<div style="display: flex; align-items: center; gap: 10px">
<button class="gb s-lg v-primary t-neutral" type="button">Начать проект</button>
<button class="gb s-lg v-secondary t-neutral" type="button">Подробнее</button>
<button class="gb s-lg v-ghost t-neutral" type="button">Отмена</button>
</div>
<div style="display: flex; align-items: center; gap: 10px">
<button class="gb s-md v-primary t-neutral is-loading" type="button" aria-busy="true"><span class="lbl">Сохраняем отчёт</span></button>
<button class="gb s-md v-outline t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path><path d="M12 15V3"></path></svg><span class="lbl">Экспорт</span></button>
<button class="gb s-md sq v-primary t-primary" type="button" aria-label="Отправить"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg></button>
</div>
</div>
<div class="gr-dark paper" style="min-height: 260px; padding: 32px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px">
<div style="display: flex; align-items: center; gap: 10px">
<button class="gb s-lg v-primary t-neutral" type="button">Начать проект</button>
<button class="gb s-lg v-secondary t-neutral" type="button">Подробнее</button>
<button class="gb s-lg v-ghost t-neutral" type="button">Отмена</button>
</div>
<div style="display: flex; align-items: center; gap: 10px">
<button class="gb s-md v-primary t-neutral is-loading" type="button" aria-busy="true"><span class="lbl">Сохраняем отчёт</span></button>
<button class="gb s-md v-outline t-neutral" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path><path d="M12 15V3"></path></svg><span class="lbl">Экспорт</span></button>
<button class="gb s-md sq v-primary t-primary" type="button" aria-label="Отправить"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg></button>
</div>
</div>
</section>

<section style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px">
<div class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 8px">
<h3 class="heading" style="font-size: 20px">Графит главный, глина — акцент</h3>
<p class="body">Главное действие поверхности — графитовая кнопка. Глина — одна точка на экран: отправить, начать, то, ради чего экран открыт.</p>
</div>
<div class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 8px">
<h3 class="heading" style="font-size: 20px">Тон в заливке, не в рамке</h3>
<p class="body">Рамки всегда тёплые серые — графит на 15 % и 30 %. Цветная рамка не строит структуру: тон живёт в заливке и в подписи.</p>
</div>
<div class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 8px">
<h3 class="heading" style="font-size: 20px">Наведение — оттенок бумаги</h3>
<p class="body">Прозрачные кнопки под указателем получают тёплую тень бумаги. Залитые уходят от цвета подписи — контраст в наведении только растёт.</p>
</div>
<div class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 8px">
<h3 class="heading" style="font-size: 20px">Загрузка мерцает текстом</h3>
<p class="body">Подпись не исчезает и не уступает место спиннеру — по ней медленно проходит свет, как по строке, которая думает.</p>
</div>
</section>

<section style="display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between">
<h2 class="title">Восемь тонов темы clay</h2>
<span class="cap">заливка · подпись на ней · контраст</span>
</div>
<div style="display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 12px">
<div style="display: flex; flex-direction: column; gap: 6px"><div class="swatch" style="background: #1c1b18; display: flex; align-items: center; justify-content: center; color: #fdfbf6; font-weight: 500">Аа</div><span class="h3" style="font-size: 13px">neutral · графит</span><span class="mono">#1c1b18 · 16.7:1</span><span class="cap">главная кнопка</span></div>
<div style="display: flex; flex-direction: column; gap: 6px"><div class="swatch" style="background: #d27a55; display: flex; align-items: center; justify-content: center; color: #1c1b18; font-weight: 500">Аа</div><span class="h3" style="font-size: 13px">primary · глина</span><span class="mono">#d27a55 · 5.5:1</span><span class="cap">акцент, подпись графит</span></div>
<div style="display: flex; flex-direction: column; gap: 6px"><div class="swatch" style="background: #7f9a5c; display: flex; align-items: center; justify-content: center; color: #1c1b18; font-weight: 500">Аа</div><span class="h3" style="font-size: 13px">success · олива</span><span class="mono">#7f9a5c · 5.5:1</span><span class="cap">подпись графит</span></div>
<div style="display: flex; flex-direction: column; gap: 6px"><div class="swatch" style="background: #d1a43c; display: flex; align-items: center; justify-content: center; color: #1c1b18; font-weight: 500">Аа</div><span class="h3" style="font-size: 13px">warning · горчица</span><span class="mono">#d1a43c · 7.5:1</span><span class="cap">подпись графит</span></div>
<div style="display: flex; flex-direction: column; gap: 6px"><div class="swatch" style="background: #b2443a; display: flex; align-items: center; justify-content: center; color: #fdfbf6; font-weight: 500">Аа</div><span class="h3" style="font-size: 13px">danger · кирпич</span><span class="mono">#b2443a · 5.4:1</span><span class="cap">подпись цвета бумаги</span></div>
<div style="display: flex; flex-direction: column; gap: 6px"><div class="swatch" style="background: #2f69ba; display: flex; align-items: center; justify-content: center; color: #fdfbf6; font-weight: 500">Аа</div><span class="h3" style="font-size: 13px">info · синий</span><span class="mono">#2f69ba · 5.3:1</span><span class="cap">подпись цвета бумаги</span></div>
<div style="display: flex; flex-direction: column; gap: 6px"><div class="swatch" style="background: #585650; display: flex; align-items: center; justify-content: center; color: #fdfbf6; font-weight: 500">Аа</div><span class="h3" style="font-size: 13px">slate · тёплый серый</span><span class="mono">#585650 · 7.1:1</span><span class="cap">подпись цвета бумаги</span></div>
<div style="display: flex; flex-direction: column; gap: 6px"><div class="swatch" style="background: #6e9fcd; display: flex; align-items: center; justify-content: center; color: #1c1b18; font-weight: 500">Аа</div><span class="h3" style="font-size: 13px">azure · небо</span><span class="mono">#6e9fcd · 6.2:1</span><span class="cap">подпись графит</span></div>
</div>
<p class="body">Светлые земляные тона — глина, олива, охра, небо — несут графитовую подпись: белая на глине даёт 3:1 и проваливает AA. Тёмные — кирпич, синий, серый — несут подпись цвета бумаги.</p>
</section>

<section style="display: flex; flex-direction: column; gap: 14px">
<div style="display: flex; align-items: baseline; justify-content: space-between">
<h2 class="title">Анатомия</h2>
<span class="cap">md · neutral primary · фокус с клавиатуры · 2×</span>
</div>
<div style="display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 16px">
<div class="paper" style="min-height: 290px; display: flex; align-items: center; justify-content: center">
<div style="position: relative; display: inline-block; padding: 64px 84px">
<div style="zoom: 2"><button class="gb s-md v-primary t-neutral is-focus" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class="lbl">Новый отчёт</span><span class="kbd">⌘N</span></button></div>
<span class="pin" style="left: 8px; top: 93px">1</span>
<div style="position: absolute; left: 30px; top: 104px; width: 54px; border-top: 1px solid var(--hair-2)"></div>
<span class="pin" style="left: 121px; top: 8px">2</span>
<div class="leader" style="left: 132px; top: 30px; height: 54px"></div>
<span class="pin" style="left: 240px; top: 8px">3</span>
<div class="leader" style="left: 251px; top: 30px; height: 54px"></div>
<span class="pin" style="right: 120px; top: 8px">4</span>
<div class="leader" style="right: 131px; top: 30px; height: 54px"></div>
<span class="pin" style="right: 8px; bottom: 30px">5</span>
<div style="position: absolute; right: 30px; bottom: 41px; width: 50px; border-top: 1px solid var(--hair-2)"></div>
</div>
</div>
<ol class="card" style="padding: 22px; display: flex; flex-direction: column; gap: 12px">
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">1</span><div><h3 class="h3">Контейнер</h3><p class="body">Радиус 8px, на lg — 10px, на xs — 6px. Без тени: кнопка лежит на бумаге, а не над ней.</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">2</span><div><h3 class="h3">Иконка</h3><p class="body">Тонкий штрих 1.5px с круглыми концами — тот же почерк, что у подписи.</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">3</span><div><h3 class="h3">Подпись</h3><p class="body">Гротеск 500, без трекинга. Серифом набраны только заголовки вокруг — кнопка остаётся интерфейсом.</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">4</span><div><h3 class="h3">Клавиша</h3><p class="body">Плашка в 16 % цвета подписи — без рамки, тихая.</p></div></li>
<li style="display: flex; gap: 12px"><span class="pin" style="position: static; flex: none">5</span><div><h3 class="h3">Фокус</h3><p class="body">Контур 2px с отступом 2px синим — единственный холодный цвет на тёплой бумаге, его не спутать с тоном кнопки.</p></div></li>
</ol>
</div>
</section>

<section style="display: flex; flex-direction: column; gap: 14px">
<h2 class="title">Четыре версии рядом</h2>
<div class="card" style="overflow: hidden">
<div style="display: grid; grid-template-columns: 150px repeat(4, minmax(0, 1fr)); gap: 16px; padding: 12px 20px; background: var(--muted)">
<span class="colh"></span><span class="colh">Эволюция · в коде</span><span class="colh">Тактильная</span><span class="colh">Чертёж</span><span class="colh" style="color: var(--fg); font-weight: 500">Глина</span>
</div>
<div class="rule" style="display: grid; grid-template-columns: 150px repeat(4, minmax(0, 1fr)); gap: 16px; padding: 11px 20px"><span class="h3" style="font-size: 14px">Характер</span><span class="body">аккуратная классика</span><span class="body">объёмный предмет</span><span class="body">плоская точность</span><span class="body" style="color: var(--fg)">тёплая бумага</span></div>
<div class="rule" style="display: grid; grid-template-columns: 150px repeat(4, minmax(0, 1fr)); gap: 16px; padding: 11px 20px"><span class="h3" style="font-size: 14px">Главное действие</span><span class="body">индиго</span><span class="body">индиго с тенью тона</span><span class="body">индиго, плоско</span><span class="body" style="color: var(--fg)">графит; глина — акцент</span></div>
<div class="rule" style="display: grid; grid-template-columns: 150px repeat(4, minmax(0, 1fr)); gap: 16px; padding: 11px 20px"><span class="h3" style="font-size: 14px">Наведение</span><span class="body">темнее заливка</span><span class="body">подъём и тень</span><span class="body">линия по кромке</span><span class="body" style="color: var(--fg)">оттенок бумаги</span></div>
<div class="rule" style="display: grid; grid-template-columns: 150px repeat(4, minmax(0, 1fr)); gap: 16px; padding: 11px 20px"><span class="h3" style="font-size: 14px">Загрузка</span><span class="body">спиннер поверх подписи</span><span class="body">спиннер и блик</span><span class="body">бегущая линия</span><span class="body" style="color: var(--fg)">мерцание подписи</span></div>
<div class="rule" style="display: grid; grid-template-columns: 150px repeat(4, minmax(0, 1fr)); gap: 16px; padding: 11px 20px"><span class="h3" style="font-size: 14px">Недоступность</span><span class="body">серая плашка</span><span class="body">штриховка</span><span class="body">пунктир</span><span class="body" style="color: var(--fg)">бумага без чернил</span></div>
<div class="rule" style="display: grid; grid-template-columns: 150px repeat(4, minmax(0, 1fr)); gap: 16px; padding: 11px 20px"><span class="h3" style="font-size: 14px">Рамки</span><span class="body">тон, приглушённый</span><span class="body">тон, мягкий</span><span class="body">тон, волосяная</span><span class="body" style="color: var(--fg)">только тёплый серый</span></div>
<div class="rule" style="display: grid; grid-template-columns: 150px repeat(4, minmax(0, 1fr)); gap: 16px; padding: 11px 20px"><span class="h3" style="font-size: 14px">Где к месту</span><span class="body">везде по умолчанию</span><span class="body">продукт, лендинги</span><span class="body">инструменты, таблицы</span><span class="body" style="color: var(--fg)">чтение, ассистенты, редакторы</span></div>
</div>
</section>

</div>
</template>
