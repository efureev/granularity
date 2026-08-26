<script setup lang="ts">
import { componentPath, FIXTURE_PACKAGES } from './fixtures'

/**
 * Корень стенда: карта всех страниц.
 *
 * Каталог, а не демонстрация. Тематические страницы в шапке — их немного, и
 * они собраны под класс дефектов; страниц компонентов сотня, и в шапке они
 * превратились бы в стену ссылок на каждой странице стенда.
 */
const packages = FIXTURE_PACKAGES.filter(pkg => pkg.fixtures.length > 0)
</script>

<template>
  <main>
    <h1>Компоненты экосистемы</h1>
    <p>
      Один адрес — один компонент. Изоляция здесь не аккуратность: на общей
      странице падение одного компонента уносит рендер всей, а расхождение
      гидрации не указывает на виновника.
    </p>

    <section v-for="pkg in packages" :key="pkg.key">
      <h2>{{ pkg.title }} <small>({{ pkg.fixtures.length }})</small></h2>
      <ul>
        <li v-for="fixture in pkg.fixtures" :key="fixture.name">
          <a :href="componentPath(fixture.name)">{{ fixture.name }}</a>
          <span> — {{ fixture.about }}</span>
        </li>
      </ul>
    </section>
  </main>
</template>
