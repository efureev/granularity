# `@feugene/granularity-media`

Работа с изображением, камерой и видео для `@feugene/granularity`. Четыре
компонента, и они стоят рядом по сценарию: `GrCameraCapture` снимает кадр
камерой, `GrImageCrop` выбирает кадр из уже существующей картинки,
`GrCodeScanner` читает камерой QR и штрихкоды, `GrVideoPlayer` проигрывает
готовое видео своими элементами управления.

```bash
yarn add @feugene/granularity-media
```

Своих зависимостей у пакета нет: кадрирование держится на Canvas и браузерных
API, а не на библиотеке. Наружу объявлены только peer — ядро, пресет и Vue.

## Быстрый старт

```vue
<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { GrImageCrop } from '@feugene/granularity-media'

const file = ref<File | null>(null)
const cropper = useTemplateRef('cropper')

async function save() {
  const blob = await cropper.value?.crop()
  if (blob)
    await fetch('/api/avatar', { method: 'POST', body: blob })
}
</script>

<template>
  <GrImageCrop ref="cropper" :src="file" shape="circle" :output="{ width: 256, height: 256 }" />
  <button @click="save">
Сохранить
</button>
</template>
```

## Рамка неподвижна, двигается картинка

Обратная модель — рамка ездит по изображению — требует двух жестов вместо
одного, а её угловые ручки на телефоне меньше пальца. Здесь жест один: тянуть
картинку, а увеличение живёт отдельным контролом (по умолчанию `GrSlider` ядра,
заменяется слотом `#controls`).

Соотношение сторон кадра задаёт приложение (`aspectRatio`), а не пользователь:
место, куда картинка потом встанет, известно заранее.

## Кадр считается в пикселях исходника

Без `output` результат получает размер захваченной области **исходного файла**, а
не окна на экране: окно почти всегда меньше картинки, и вывод по нему молча
ополовинил бы разрешение. Нужен точный размер — он задаётся явно.

## Что внутри

| | |
| --- | --- |
| **Жест** | перетаскивание на `useDragGesture` ядра: оборванный жест откатывается, а не коммитит |
| **Клавиатура** | стрелки двигают кадр, `+`/`-` меняют увеличение, `Home` сбрасывает |
| **Экспорт** | `crop()` отдаёт `Blob`; тип и качество — `output.type`, `output.quality` |
| **Формы кадра** | прямоугольник и круг (`shape="circle"` — маска показа, результат остаётся прямоугольным) |
| **Серверный рендер** | браузерного API в `setup` нет, оборачивать в `<ClientOnly>` не нужно |

## Вес гранулярного импорта

<!-- entry-sizes:generated:start lang=ru -->
| Что берут | gzip | от бареля |
| --- | ---: | ---: |
| весь пакет из корня | 14.8 kB | 100 % |
| самый лёгкий компонент — `GrVideoPlayer` | 3.8 kB | 26 % |
| медианный компонент — `GrCodeScanner` | 4.3 kB | 29 % |
| 4 самых тяжёлых вместе | 15.1 kB | 102 % |

Числа **не складываются**: общий код посчитан в каждой строке заново, а платится один раз —
поэтому набор компонентов и показан объединением, а не суммой. Это верхняя граница: gzip всего,
что подпуть тянет из `dist`, а бандлер приложения трясёт дальше и минифицирует повторно.

Вес каждого компонента — [`docs/entry-sizes.md`](./docs/entry-sizes.md).
<!-- entry-sizes:generated:end -->

## Подключение к сборке

Провайдер — рядом с ядром, резолвер — **перед** жадным `GranularityResolver()`:

```ts
presetGranularNode({
  providers: [granularityProvider, granularityMediaProvider],
  components: ['@feugene/granularity-media:GrImageCrop'],
})
```

Локали подключаются тем же `createFintI18n`, что и словари ядра — блок
`GR_MEDIA_I18N_BLOCK`.

## Снимок камерой

```vue
<GrCameraCapture :aspect-ratio="1" @capture="blob => upload(blob)" />
```

Камера включается только по кнопке: запрос разрешения, всплывший сам по себе,
отклоняют не глядя — а второй раз браузер уже не спросит, потому что решение
запоминается для сайта целиком.

Отказ разведён на четыре состояния (`denied`, `missing`, `busy`, `insecure`),
потому что действия пользователя в них разные: «разрешите доступ» при
отсутствующей камере отправляет искать настройку, которой нет, а на `http://`
объекта `navigator.mediaDevices` не существует вовсе.

Превью фронтальной камеры зеркальное, снимок — нет: иначе текст на визитке или в
документе уехал бы в зазеркалье.

## Чтение кодов

```vue
<GrCodeScanner :formats="['qr_code']" @detect="codes => open(codes[0].value)" />
```

Декодера пакет не несёт. Нативный `BarcodeDetector` есть в Chrome и Edge, а
Safari и Firefox закрываются детектором, который передаёт приложение
(`:detector`): встроить библиотеку значило бы навязать самую тяжёлую
зависимость и тем, кто взял один кроп. Готовый рецепт на `@zxing/browser` — на
странице компонента.

Один код в кадре даёт одно событие: камера отдаёт десятки кадров в секунду, и
без фильтра приложение оформило бы двадцать заказов вместо одного. Режим
приёмки, где сканируют одинаковые упаковки подряд, включается `continuous`.

## Видео со своими элементами управления

```vue
<GrVideoPlayer :src="clip" poster="/preview.jpg" muted />
```

Нативные `controls` в каждом браузере выглядят по-своему и не знают ни про темы,
ни про размеры дизайн-системы. Полный экран запрашивается у рамки, а не у
`<video>`: иначе браузер подменил бы эти элементы управления своими — вместе с
клавиатурой и подписями.

## Документация

- [`docs/components.md`](./docs/components.md) — состав пакета;
- [`docs/components/GrImageCrop.md`](./docs/components/GrImageCrop.md),
  [`docs/components/GrCameraCapture.md`](./docs/components/GrCameraCapture.md) и
  [`docs/components/GrCodeScanner.md`](./docs/components/GrCodeScanner.md) и
  [`docs/components/GrVideoPlayer.md`](./docs/components/GrVideoPlayer.md) — страницы компонентов;
- [`docs/keyboard.md`](./docs/keyboard.md), [`docs/ssr.md`](./docs/ssr.md) — сквозные правила пакета.
