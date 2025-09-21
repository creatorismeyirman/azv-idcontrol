# AZV ID Control - Архитектура системы

## Обзор

AZV ID Control - это система верификации документов для финансового отдела и МВД, интегрированная с бэкендом azv_motors_backend через REST API.

## Архитектура

### Frontend (azv-idcontrol)
- **Framework**: Next.js 14 с TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **API Client**: Custom HTTP client с автоматическим управлением токенами

### Backend Integration
- **API Base URL**: `https://api.azvmotors.kz`
- **Authentication**: JWT токены (access + refresh)
- **Endpoints**: 
  - Auth: `/auth/send_sms/`, `/auth/verify_sms/`, `/auth/user/me`
  - Financier: `/financier/pending`, `/financier/approved`, `/financier/rejected`
  - MVD: `/mvd/pending`, `/mvd/approved`, `/mvd/rejected`

## Структура проекта

```
azv-idcontrol/
├── app/
│   ├── layout.tsx          # Root layout с AuthProvider
│   ├── page.tsx            # Главная страница с заявками
│   └── login/
│       └── page.tsx        # Страница OTP авторизации
├── components/
│   ├── ui/                 # UI компоненты
│   │   ├── OtpInput.tsx    # Компонент ввода OTP кода
│   │   ├── PhoneInput.tsx  # Компонент ввода номера телефона
│   │   └── button.tsx      # Кнопка
│   ├── verification/
│   │   └── user-card.tsx   # Карточка заявки
│   ├── modals/
│   │   └── approval-modal.tsx # Модальное окно одобрения
│   └── icons/
│       └── index.tsx       # SVG иконки
├── contexts/
│   └── AuthContext.tsx     # Контекст аутентификации
├── lib/
│   └── api.ts              # API клиент
├── types/
│   └── api.ts              # TypeScript типы для API
└── types/
    └── verification.ts     # Типы для верификации (legacy)
```

## Основные компоненты

### 1. AuthContext
Управляет состоянием аутентификации:
- Отправка SMS кода
- Верификация OTP
- Получение информации о пользователе
- Автоматическое обновление токенов

### 2. API Client
Централизованный HTTP клиент:
- Автоматическое добавление JWT токенов
- Обработка ошибок
- Refresh токенов при истечении

### 3. UserCard
Отображает заявку пользователя:
- Информация о пользователе
- Документы (фото)
- Действия (одобрить/отклонить)

### 4. ApprovalModal
Модальное окно для одобрения:
- Выбор класса доступа (для финансистов)
- Комментарии (для МВД)

## Поток данных

### Авторизация
1. Пользователь вводит номер телефона
2. Отправляется SMS код через `/auth/send_sms/`
3. Пользователь вводит OTP код
4. Верификация через `/auth/verify_sms/`
5. Получение информации о пользователе через `/auth/user/me`

### Работа с заявками
1. Загрузка заявок в зависимости от роли пользователя
2. Фильтрация по статусу (pending/approved/rejected)
3. Поиск по имени, телефону, ИИН
4. Одобрение/отклонение через соответствующие API

## Роли пользователей

### Financier (Финансист)
- Просмотр заявок на кредитование
- Выбор класса доступа (A/AB/ABC)
- Одобрение/отклонение заявок

### MVD (МВД)
- Просмотр заявок на водительские права
- Добавление комментариев
- Одобрение/отклонение заявок

## API Endpoints

### Authentication
- `POST /auth/send_sms/` - Отправка SMS кода
- `POST /auth/verify_sms/` - Верификация OTP
- `GET /auth/user/me` - Информация о пользователе

### Financier
- `GET /financier/pending` - Новые заявки
- `GET /financier/approved` - Одобренные заявки
- `GET /financier/rejected` - Отклоненные заявки
- `POST /financier/approve/{id}` - Одобрить заявку
- `POST /financier/reject/{id}` - Отклонить заявку

### MVD
- `GET /mvd/pending` - Новые заявки
- `GET /mvd/approved` - Одобренные заявки
- `GET /mvd/rejected` - Отклоненные заявки
- `POST /mvd/approve/{id}` - Одобрить заявку
- `POST /mvd/reject/{id}` - Отклонить заявку

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## Конфигурация

API URL настраивается в `lib/api.ts`:
```typescript
const API_BASE_URL = 'https://api.azvmotors.kz'
```

## Безопасность

- JWT токены хранятся в localStorage
- Автоматическое обновление токенов
- Защищенные маршруты с проверкой аутентификации
- Валидация данных на клиенте и сервере
