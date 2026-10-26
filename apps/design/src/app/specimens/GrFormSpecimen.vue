<script setup lang="ts">
import type { GrFormInstance, GrFormRules } from '@feugene/granularity'
import { onMounted, reactive, ref, useTemplateRef } from 'vue'

import Specimen from './Specimen.vue'

const props = defineProps<{ preview?: boolean }>()

const EMAIL_DOMAIN = /@[^\s@]+\.[^\s@]{2,}$/

const previewModel = reactive({ email: 'anna@studio' })
const previewRules: GrFormRules = {
  email: [{ validator: value => EMAIL_DOMAIN.test(String(value)) || 'Нет домена после «@» — например, studio.ru' }],
}
const previewForm = useTemplateRef<GrFormInstance>('previewForm')

const profile = reactive({
  firstName: 'Анна',
  lastName: 'Ершова',
  email: 'anna@studio',
  bio: 'Дизайнер интерфейсов, веду формы и таблицы в продуктовой команде.',
})
const profileRules: GrFormRules = {
  firstName: [{ required: true, message: 'Без имени коллеги вас не найдут' }],
  email: [
    { required: true, message: 'Нужна рабочая почта' },
    { validator: value => EMAIL_DOMAIN.test(String(value)) || 'Нет домена после «@» — например, studio.ru' },
  ],
}
const profileForm = useTemplateRef<GrFormInstance>('profileForm')
const savedNote = ref('')

// Форма с ошибкой под своим полем видна ещё до нажатия «Сохранить» — и в превью тоже.
onMounted(() => {
  if (props.preview)
    void previewForm.value?.validateField('email')
  else
    void profileForm.value?.validateField('email')
})

function onProfileSave(): void {
  savedNote.value = 'Профиль сохранён'
  profileForm.value?.setSnapshot()
}

function onProfileCancel(): void {
  profileForm.value?.resetFields()
  savedNote.value = ''
}

const passwords = reactive({ password: '', repeat: '' })
const passwordRules: GrFormRules = {
  password: [{ required: true, message: 'Придумайте пароль' }, { min: 10, message: 'Не короче 10 знаков' }],
  repeat: [
    { required: true, message: 'Повторите пароль' },
    { validator: (value, model) => value === model.password || 'Пароли не совпадают' },
  ],
}
const passwordNote = ref('')

const signup = reactive({ login: 'anna' })
const TAKEN = new Set(['anna', 'admin', 'studio'])
// Занятость логина проверяет «сервер» — правило асинхронное.
function checkLogin(value: unknown): Promise<true | string> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(!TAKEN.has(String(value).trim().toLowerCase()) || 'Логин занят — попробуйте anna.ershova'), 900)
  })
}
const signupRules: GrFormRules = {
  login: [{ required: true, message: 'Нужен логин' }, { validator: checkLogin }],
}
const signupNote = ref('')

const request = reactive({ company: 'Мастерская «Лён»', phone: '+7 900 123-45-67' })
const sending = ref(false)
const requestNote = ref('')

function onRequestSubmit(): void {
  sending.value = true
  requestNote.value = 'Отправляем заявку…'
  setTimeout(() => {
    sending.value = false
    requestNote.value = 'Заявка ушла — менеджер позвонит в течение часа'
  }, 1500)
}
</script>

<template>
  <div v-if="preview" class="flex w-full flex-col gap-3">
    <GrForm ref="previewForm" :model="previewModel" :rules="previewRules">
      <GrFormField label="Рабочая почта" name="email">
        <div class="flex gap-2">
          <div class="min-w-0 flex-1">
            <GrInput v-model="previewModel.email" type="email" autocomplete="email" />
          </div>
          <GrButton type="submit">
            Войти
          </GrButton>
        </div>
      </GrFormField>
    </GrForm>
  </div>
  <div v-else class="grid gap-x-8 gap-y-10 lg:grid-cols-2">
    <Specimen title="Правила и отправка" note="Правила по имени поля; каждая ошибка — под своим полем, фокус уходит к первой; «Отмена» возвращает снимок." wide>
      <div class="max-w-[40rem] rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-6 shadow-[var(--gr-shadow-1)]">
        <GrForm ref="profileForm" v-slot="{ isDirty }" :model="profile" :rules="profileRules" @submit="onProfileSave">
          <div class="flex flex-col gap-6">
            <GrFormSection title="Профиль" description="Видят коллеги по пространству" :heading-level="5">
              <div class="grid gap-4 sm:grid-cols-2">
                <GrFormField label="Имя" name="firstName">
                  <GrInput v-model="profile.firstName" autocomplete="given-name" />
                </GrFormField>
                <GrFormField label="Фамилия" name="lastName">
                  <GrInput v-model="profile.lastName" autocomplete="family-name" />
                </GrFormField>
                <GrFormField label="Рабочая почта" name="email" class="sm:col-span-2">
                  <GrInput v-model="profile.email" type="email" autocomplete="email" />
                </GrFormField>
                <GrFormField label="О себе" name="bio" hint="Пара фраз для коллег" class="sm:col-span-2">
                  <GrTextarea v-model="profile.bio" :rows="3" :maxlength="140" show-count />
                </GrFormField>
              </div>
            </GrFormSection>
            <div class="flex flex-wrap items-center justify-end gap-2">
              <span role="status" class="me-auto text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">{{ isDirty ? 'Есть несохранённые изменения' : savedNote }}</span>
              <GrButton variant="ghost" tone="neutral" @click="onProfileCancel">
                Отмена
              </GrButton>
              <GrButton type="submit">
                Сохранить
              </GrButton>
            </div>
          </div>
        </GrForm>
      </div>
    </Specimen>

    <Specimen title="Зависимые поля" note="Правило видит всю модель: повтор сверяется с паролем.">
      <GrForm :model="passwords" :rules="passwordRules" @submit="passwordNote = 'Пароль изменён'">
        <div class="flex flex-col gap-4">
          <GrFormField label="Новый пароль" name="password" hint="Не короче 10 знаков">
            <GrInput v-model="passwords.password" type="password" autocomplete="new-password" password-toggle />
          </GrFormField>
          <GrFormField label="Повторите пароль" name="repeat">
            <GrInput v-model="passwords.repeat" type="password" autocomplete="new-password" password-toggle />
          </GrFormField>
          <div class="flex flex-wrap items-center gap-3">
            <GrButton type="submit">
              Сменить пароль
            </GrButton>
            <span role="status" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">{{ passwordNote }}</span>
          </div>
        </div>
      </GrForm>
    </Specimen>

    <Specimen title="Асинхронное правило" note="Пока правило ходит на сервер, поле показывает «проверяем» вместо старой ошибки; занятые — anna, admin, studio.">
      <GrForm :model="signup" :rules="signupRules" @submit="signupNote = `Логин ${signup.login} ваш`">
        <div class="flex flex-col gap-4">
          <GrFormField label="Логин" name="login" hint="Латиница, цифры и точка">
            <GrInput v-model="signup.login" autocomplete="username" />
          </GrFormField>
          <div class="flex flex-wrap items-center gap-3">
            <GrButton type="submit">
              Занять логин
            </GrButton>
            <span role="status" class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">{{ signupNote }}</span>
          </div>
        </div>
      </GrForm>
    </Specimen>

    <Specimen title="Выключение на отправке" note="Пока заявка уходит, форма выключена целиком — кнопка отправки гаснет сама, второй раз не отправить." wide>
      <GrForm :model="request" :disabled="sending" @submit="onRequestSubmit">
        <div class="flex flex-wrap items-end gap-3">
          <GrFormField label="Компания" class="w-full sm:w-64">
            <GrInput v-model="request.company" autocomplete="organization" />
          </GrFormField>
          <GrFormField label="Телефон" class="w-full sm:w-52">
            <GrInput v-model="request.phone" type="tel" autocomplete="tel" />
          </GrFormField>
          <GrButton type="submit">
            Оставить заявку
          </GrButton>
        </div>
        <p role="status" class="mt-3 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)] text-[var(--gr-muted-fg)]">
          {{ requestNote }}
        </p>
      </GrForm>
    </Specimen>
  </div>
</template>
