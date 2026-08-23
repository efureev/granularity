# `@feugene/granularity-media`

Работа с изображением и камерой для `@feugene/granularity`. Первый компонент —
`GrImageCrop`: пользователь выбирает кадр, приложение получает готовый `Blob`.

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
  <button @click="save">Сохранить</button>
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

## Документация

- [`docs/components.md`](./docs/components.md) — состав пакета;
- [`docs/components/GrImageCrop.md`](./docs/components/GrImageCrop.md) — страница компонента;
- [`docs/keyboard.md`](./docs/keyboard.md), [`docs/ssr.md`](./docs/ssr.md) — сквозные правила пакета.
