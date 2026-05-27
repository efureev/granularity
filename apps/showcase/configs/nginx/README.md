# Nginx config for `granularity.loc`

Локальный конфиг nginx для запуска собранного SPA-приложения `@feugene/granularity-showcase`
на домене `granularity.loc` (порт 80).

## Быстрый старт

1. Соберите приложение из корня репозитория:

   ```bash
   yarn workspace @feugene/granularity-showcase build
   ```

   Результат окажется в `apps/showcase/dist`.

2. Добавьте локальный домен в `/etc/hosts`:

   ```
   127.0.0.1   granularity.loc
   ```

3. В файле [`granularity.loc.conf`](./granularity.loc.conf) замените плейсхолдер
   `__SHOWCASE_DIST__` на абсолютный путь к директории `apps/showcase/dist`.

4. Подключите конфиг к nginx одним из способов:

   - **macOS (Homebrew):** создайте симлинк в `/usr/local/etc/nginx/servers/`
     (для Apple Silicon — `/opt/homebrew/etc/nginx/servers/`):

     ```bash
     ln -s "$PWD/granularity.loc.conf" /usr/local/etc/nginx/servers/granularity.loc.conf
     ```

   - **Linux:** скопируйте/симлинкните файл в `/etc/nginx/sites-enabled/`
     (или `/etc/nginx/conf.d/`).

   - Либо добавьте `include /absolute/path/to/granularity.loc.conf;` в основной
     `nginx.conf` внутри секции `http { ... }`.

5. Проверьте и перезагрузите nginx:

   ```bash
   sudo nginx -t && sudo nginx -s reload
   ```

6. Откройте в браузере: <http://granularity.loc/>.
   Прямые заходы на вложенные маршруты (например, `http://granularity.loc/components`)
   тоже работают — за счёт `try_files ... /index.html;` (SPA fallback).

## Примечания

- При сборке через `vite build` приложение использует `base: '/granularity/'`
  (см. `apps/showcase/vite.config.ts`). Для локального запуска под отдельным
  доменом удобнее, чтобы приложение жило в корне (`/`). Если хотите оставить
  префикс `/granularity/` как на GitHub Pages — раскомментируйте
  соответствующий блок `location /granularity/ { ... }` в конце конфига и
  закомментируйте корневой `location /`.
- Кэширование: `index.html` отдаётся с `no-store`, а файлы из `/assets/*`
  (хешированные сборкой Vite) — на год с `immutable`.
