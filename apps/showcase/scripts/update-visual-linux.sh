#!/usr/bin/env bash
# Снимает визуальные эталоны для Linux — те, с которыми сравнивает CI.
#
# Локальный macOS-рендер с CI не совпадает (шрифты, сглаживание), а допуски
# намеренно строгие (`threshold: 0`), поэтому darwin-эталоны на Linux-раннере
# не годятся. Оба набора живут рядом: Playwright выбирает по суффиксу платформы.
#
# Репозиторий НЕ монтируется на запись: `yarn install` внутри контейнера положил
# бы Linux-бинари (esbuild/rolldown) в общий `node_modules` и сломал бы сборку на
# хосте. Поэтому исходники копируются в контейнер, а наружу выдаются только
# готовые `*-linux.png`.
set -euo pipefail

IMAGE="mcr.microsoft.com/playwright:v1.61.1-noble"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SNAPSHOT_DIR="apps/showcase/e2e/__screenshots__/visual.spec.ts-snapshots"

echo "→ образ: $IMAGE"
echo "→ репозиторий: $REPO_ROOT"

docker run --rm \
  -v "$REPO_ROOT":/src:ro \
  -v "$REPO_ROOT/$SNAPSHOT_DIR":/out \
  "$IMAGE" bash -euo pipefail -c '
    echo "→ копирую исходники (без node_modules и .git)"
    mkdir -p /work
    tar -C /src --exclude=node_modules --exclude=.git --exclude=dist -cf - . | tar -C /work -xf -

    cd /work
    corepack enable
    echo "→ устанавливаю зависимости"
    yarn install --frozen-lockfile

    echo "→ собираю библиотеку и companion-пакеты"
    yarn build:granularity
    yarn workspace @feugene/unplugin-granularity build
    yarn workspace @feugene/granularity-datepicker build

    echo "→ снимаю эталоны"
    yarn workspace @feugene/granularity-showcase test:visual:update

    echo "→ выкладываю *-linux.png"
    cp -f '"$SNAPSHOT_DIR"'/*-linux.png /out/
  '

echo "✓ готово. Проверьте diff и закоммитьте новые *-chromium-linux.png"
