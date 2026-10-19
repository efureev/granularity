<template>
<div class="gr-light doc" style="width: 1280px; min-height: 1800px; padding: 56px 64px; display: flex; flex-direction: column; gap: 32px">

<header style="display: flex; flex-direction: column; gap: 12px">
<span class="eyebrow">04 · Размеры, содержимое, группы</span>
<h2 class="h1" style="font-size: 32px; line-height: 40px">Сетка 4px, угол 3px, иконка — в ячейке</h2>
<p class="lead">Высоты общие со шкалой контролов, кегль подписи на sm — 13px, как у плотных таблиц. Иконка слева получает квадратную ячейку высотой с кнопку, и в ряду кнопок иконки встают ровной колонкой.</p>
</header>

<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px">
<div style="display: flex; flex-direction: column; gap: 10px">
<span class="mono" style="color: var(--muted-fg)"><b style="color: var(--fg)">xs</b> · 28 · 12/16 · иконка 14</span>
<div class="blueprint" style="min-height: 210px; padding: 36px 20px 20px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<div style="position: relative; display: inline-flex"><button class="gb s-xs v-primary t-primary" type="button">Сохранить</button><div class="dim dim-h" style="left: 0; top: -14px; width: 10px"><span>10</span></div></div>
<button class="gb s-xs v-outline t-neutral celled" type="button"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 6px"><button class="gb s-xs sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13"></rect><path d="M4 16V4h12"></path></svg></button><button class="gb s-xs sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h.01M12 12h.01M19 12h.01"></path></svg></button></div>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<span class="mono" style="color: var(--muted-fg)"><b style="color: var(--fg)">sm</b> · 32 · 13/18 · иконка 16</span>
<div class="blueprint" style="min-height: 210px; padding: 36px 20px 20px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<div style="position: relative; display: inline-flex"><button class="gb s-sm v-primary t-primary" type="button">Сохранить</button><div class="dim dim-h" style="left: 0; top: -14px; width: 12px"><span>12</span></div></div>
<button class="gb s-sm v-outline t-neutral celled" type="button"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 6px"><button class="gb s-sm sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13"></rect><path d="M4 16V4h12"></path></svg></button><button class="gb s-sm sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h.01M12 12h.01M19 12h.01"></path></svg></button></div>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<span class="mono" style="color: var(--muted-fg)"><b style="color: var(--fg)">md</b> · 40 · 14/20 · иконка 16</span>
<div class="blueprint" style="min-height: 210px; padding: 36px 20px 20px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<div style="position: relative; display: inline-flex"><button class="gb s-md v-primary t-primary" type="button">Сохранить</button><div class="dim dim-h" style="left: 0; top: -14px; width: 16px"><span>16</span></div></div>
<button class="gb s-md v-outline t-neutral celled" type="button"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 6px"><button class="gb s-md sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13"></rect><path d="M4 16V4h12"></path></svg></button><button class="gb s-md sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h.01M12 12h.01M19 12h.01"></path></svg></button></div>
</div>
</div>
<div style="display: flex; flex-direction: column; gap: 10px">
<span class="mono" style="color: var(--muted-fg)"><b style="color: var(--fg)">lg</b> · 44 · 16/24 · иконка 18</span>
<div class="blueprint" style="min-height: 210px; padding: 36px 20px 20px; display: flex; flex-direction: column; align-items: center; justify-content: space-between">
<div style="position: relative; display: inline-flex"><button class="gb s-lg v-primary t-primary" type="button">Сохранить</button><div class="dim dim-h" style="left: 0; top: -14px; width: 20px"><span>20</span></div></div>
<button class="gb s-lg v-outline t-neutral celled" type="button"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg></span><span class="lbl">Добавить</span></button>
<div style="display: flex; gap: 6px"><button class="gb s-lg sq v-outline t-neutral" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13"></rect><path d="M4 16V4h12"></path></svg></button><button class="gb s-lg sq v-ghost t-neutral is-hover" type="button" aria-label="Ещё"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h.01M12 12h.01M19 12h.01"></path></svg></button></div>
</div>
</div>
</div>

<section style="display: flex; flex-direction: column; gap: 14px">
<h2 class="h2">Содержимое</h2>
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px">

<div class="sheet" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<span class="idx">ячейка иконки</span>
<div class="blueprint" style="min-height: 120px; padding: 16px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 6px">
<button class="gb s-sm v-outline t-neutral celled" type="button" style="width: 210px; justify-content: flex-start"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v6H3v-6"></path><path d="m7 10 5 5 5-5"></path><path d="M12 15V3"></path></svg></span><span class="lbl">Скачать PDF</span></button>
<button class="gb s-sm v-outline t-neutral celled" type="button" style="width: 210px; justify-content: flex-start"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13"></rect><path d="M4 16V4h12"></path></svg></span><span class="lbl">Дублировать</span></button>
</div>
<p class="body">Иконки в столбике кнопок встают ровной колонкой, а подписи — ровным краем: ячейка не зависит от длины текста.</p>
</div>

<div class="sheet" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<span class="idx">клавиша и счётчик — моно</span>
<div class="blueprint" style="min-height: 120px; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 8px">
<button class="gb s-md v-secondary t-neutral" type="button"><span class="lbl">Найти</span><span class="kbd">⌘K</span></button>
<button class="gb s-md v-outline t-primary" type="button"><span class="lbl">Фильтры</span><span class="cnt">03</span></button>
</div>
<p class="body">JetBrains Mono в рамке 1px, табличные цифры, ведущий ноль у счётчика до 10 — ширина кнопки не дёргается при смене числа.</p>
</div>

<div class="sheet" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<span class="idx">меню — уголок, а не шеврон</span>
<div class="blueprint" style="min-height: 120px; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 8px">
<button class="gb s-md v-secondary t-neutral" type="button" aria-haspopup="menu" aria-expanded="false"><span class="lbl">Экспорт</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10h10l-5 6z" class="fill"></path></svg></button>
<button class="gb s-md v-secondary t-neutral is-active" type="button" aria-haspopup="menu" aria-expanded="true"><span class="lbl">Экспорт</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14h10l-5-6z" class="fill"></path></svg></button>
</div>
<p class="body">Залитый треугольник вместо линейного шеврона: в строгой графике он читается чертёжным знаком и не спорит с иконкой ячейки.</p>
</div>

<div class="sheet" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<span class="idx">только иконка</span>
<div class="blueprint" style="min-height: 120px; padding: 16px 16px 20px; display: flex; align-items: flex-end; justify-content: center; gap: 4px">
<span class="anchor"><button class="gb s-md sq v-ghost-border t-neutral is-hover" type="button" aria-label="Копировать"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13"></rect><path d="M4 16V4h12"></path></svg></button><span class="tip" role="tooltip">Копировать</span></span>
<button class="gb s-md sq v-ghost-border t-neutral" type="button" aria-label="Переименовать"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L20 8l-4-4L4 16z"></path></svg></button>
<button class="gb s-md sq v-ghost-border t-danger" type="button" aria-label="Удалить"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14H5V6"></path><path d="M8 6V3h8v3"></path></svg></button>
</div>
<p class="body">Иконки нарисованы прямым штрихом без скруглений — <span class="code">stroke-linecap: square</span>. Имя — в <span class="code">ariaLabel</span>, тултип его повторяет.</p>
</div>

<div class="sheet" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<span class="idx">ссылка наружу</span>
<div class="blueprint" style="min-height: 120px; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 8px">
<a class="gb s-md v-outline t-primary is-hover" href="https://granularity.tech/docs" target="_blank" rel="noopener noreferrer"><span class="lbl">Документация</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6"></path><path d="M10 14 20 4"></path><path d="M18 14v6H4V6h6"></path></svg></a>
</div>
<p class="body">Ссылка с видом кнопки получает ту же линию хода — для глаза это и есть подчёркивание ссылки. Значок говорит, что откроется новая вкладка.</p>
</div>

<div class="sheet" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<span class="idx">ширина</span>
<div class="blueprint" style="min-height: 120px; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 16px">
<div style="width: 150px; display: flex; flex-direction: column; gap: 6px">
<button class="gb s-sm v-primary t-primary block" type="button">Войти</button>
<button class="gb s-sm v-outline t-neutral block" type="button">Создать аккаунт</button>
</div>
<div style="width: 150px"><button class="gb s-sm v-outline t-neutral" type="button" title="Экспортировать отчёт за третий квартал" style="width: 100%"><span class="lbl">Экспортировать отчёт за третий квартал</span></button></div>
</div>
<p class="body">block растягивает на ширину колонки, длинная подпись режется многоточием.</p>
</div>

</div>
</section>

<section style="display: flex; flex-direction: column; gap: 14px">
<h2 class="h2">Группы</h2>
<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px">

<div class="sheet" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<span class="idx">ghost-ряд = вкладки</span>
<div class="blueprint" style="min-height: 100px; display: flex; align-items: center; justify-content: center">
<div class="grp" role="group" aria-label="Период" style="border-bottom: 1px solid var(--brd-2)">
<button class="gb s-sm v-ghost t-neutral" type="button">День</button>
<button class="gb s-sm v-ghost t-primary is-active" type="button">Неделя</button>
<button class="gb s-sm v-ghost t-neutral" type="button">Месяц</button>
</div>
</div>
<p class="body">Линия хода в ghost-группе ведёт себя как подчёркивание вкладки. Для настоящего выбора вида — <span class="code">GrSegmented</span>.</p>
</div>

<div class="sheet" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<span class="idx">склеенный ряд</span>
<div class="blueprint" style="min-height: 100px; display: flex; align-items: center; justify-content: center">
<div class="grp" role="group" aria-label="Навигация по датам">
<button class="gb s-sm sq v-outline t-neutral" type="button" aria-label="Назад"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg></button>
<button class="gb s-sm v-outline t-neutral is-hover" type="button">Сегодня</button>
<button class="gb s-sm sq v-outline t-neutral" type="button" aria-label="Вперёд"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg></button>
</div>
</div>
<p class="body">Рамки внахлёст, внутренние углы 0, линия хода — только под звеном под указателем.</p>
</div>

<div class="sheet" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<span class="idx">сплит-кнопка</span>
<div class="blueprint" style="min-height: 100px; display: flex; align-items: center; justify-content: center">
<div class="grp" role="group" aria-label="Публикация">
<button class="gb s-sm v-primary t-primary" type="button">Опубликовать</button>
<button class="gb s-sm sq v-primary t-primary" type="button" aria-label="Другие варианты" aria-haspopup="menu" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10h10l-5 6z" class="fill"></path></svg></button>
</div>
</div>
<p class="body">Между solid-звеньями — граница в 35 % подписи: шов рисуется рамкой, а не тенью.</p>
</div>

<div class="sheet" style="padding: 20px; display: flex; flex-direction: column; gap: 12px">
<span class="idx">вертикальная</span>
<div class="blueprint" style="min-height: 100px; padding: 12px; display: flex; align-items: center; justify-content: center">
<div class="grp vert" role="group" aria-label="Действия с файлом" style="width: 190px">
<button class="gb s-sm v-outline t-neutral celled" type="button"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15v6H3v-6"></path><path d="m17 8-5-5-5 5"></path><path d="M12 3v12"></path></svg></span><span class="lbl">Новая версия</span></button>
<button class="gb s-sm v-outline t-neutral celled is-hover" type="button"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13"></rect><path d="M4 16V4h12"></path></svg></span><span class="lbl">Дублировать</span></button>
<button class="gb s-sm v-outline t-danger celled" type="button"><span class="cell"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14H5V6"></path><path d="M8 6V3h8v3"></path></svg></span><span class="lbl">Удалить</span></button>
</div>
</div>
<p class="body">Ячейки иконок встают в колонку — список действий читается как таблица.</p>
</div>

</div>
</section>

</div>
</template>
