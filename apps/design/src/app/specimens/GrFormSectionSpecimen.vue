<script setup lang="ts">
import { reactive, ref } from 'vue'

import Specimen from './Specimen.vue'

defineProps<{ preview?: boolean }>()

const previewAddress = ref('Москва, ул. Лесная, 12')

const delivery = reactive({ address: 'Москва, ул. Лесная, 12, кв. 40', date: 'Четверг, 10:00–14:00', note: '' })

const recipients = ref(['anna@studio.ru'])

function addRecipient(): void {
  recipients.value = [...recipients.value, '']
}

function resetRecipients(): void {
  recipients.value = ['anna@studio.ru']
}

const security = reactive({ twoFactor: '+7 900 123-45-67', backupMail: '' })

const card = reactive({ holder: 'ANNA ERSHOVA', number: '2200 1234 5678 9012' })
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrFormSection title="Доставка" description="Куда привезти заказ" :heading-level="5">
      <GrInput v-model="previewAddress" size="sm" autocomplete="street-address" aria-label="Адрес доставки" />
    </GrFormSection>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Заголовок и описание" note="Заголовок — настоящий тег h2…h6: длинную форму диктор обходит по ним; описание связано с секцией.">
      <GrFormSection title="Доставка" description="Курьер позвонит за час до приезда" :heading-level="5">
        <div class="grid gap-4">
          <GrFormField label="Адрес">
            <GrInput v-model="delivery.address" autocomplete="street-address" />
          </GrFormField>
          <GrFormField label="Интервал" hint="Выбирается на следующем шаге" readonly>
            <GrInput v-model="delivery.date" />
          </GrFormField>
          <GrFormField label="Комментарий курьеру">
            <GrTextarea v-model="delivery.note" :rows="2" placeholder="Код домофона, этаж" />
          </GrFormField>
        </div>
      </GrFormSection>
    </Specimen>

    <Specimen title="Действия в шапке" note="Справа — действия раздела; на узком экране они переносятся под заголовок.">
      <GrFormSection title="Получатели отчёта" description="Каждый получит копию в понедельник" :heading-level="5">
        <template #actions>
          <GrButton size="sm" variant="ghost" tone="neutral" @click="resetRecipients">
            Сбросить
          </GrButton>
          <GrButton size="sm" variant="outline" tone="neutral" :disabled="recipients.length >= 4" @click="addRecipient">
            Добавить
          </GrButton>
        </template>
        <div class="grid gap-3">
          <GrInput
            v-for="(_, index) in recipients"
            :key="index"
            v-model="recipients[index]"
            type="email"
            placeholder="name@studio.ru"
            :aria-label="`Получатель ${index + 1}`"
          />
        </div>
      </GrFormSection>
    </Specimen>

    <Specimen title="Свой заголовок и регион" note="Слот заголовка принимает бейдж или счётчик; с landmark секция становится регионом с именем заголовка.">
      <GrFormSection landmark description="Вход по коду и запасная почта на случай потери телефона" :heading-level="5">
        <template #title>
          <span class="inline-flex items-center gap-2">
            Безопасность
            <GrBadge tone="warning" size="xs">1 из 2</GrBadge>
          </span>
        </template>
        <div class="grid gap-4">
          <GrFormField label="Телефон для кода">
            <GrInput v-model="security.twoFactor" type="tel" autocomplete="tel" state="success" />
          </GrFormField>
          <GrFormField label="Запасная почта" hint="Не настроена">
            <GrInput v-model="security.backupMail" type="email" autocomplete="email" placeholder="name@mail.ru" />
          </GrFormField>
        </div>
      </GrFormSection>
    </Specimen>

    <Specimen title="В карточке" note="Рамки у секции нет намеренно — её даёт обёртка.">
      <GrCard>
        <GrFormSection title="Оплата" description="Списание после подтверждения заказа" :heading-level="5">
          <div class="grid gap-4 sm:grid-cols-2">
            <GrFormField label="Номер карты" class="sm:col-span-2">
              <GrInput v-model="card.number" inputmode="numeric" autocomplete="cc-number" />
            </GrFormField>
            <GrFormField label="Владелец" class="sm:col-span-2">
              <GrInput v-model="card.holder" autocomplete="cc-name" />
            </GrFormField>
          </div>
        </GrFormSection>
      </GrCard>
    </Specimen>
  </div>
</template>
