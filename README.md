# GREEN-API Chat (MAX)

Тестовое задание на позицию Frontend React-разработчик.

Минимальный интерфейс для отправки и получения текстовых сообщений через GREEN-API мессенджера MAX.

## Демо

Локальный запуск: [http://localhost:5173](http://localhost:5173)

## Стек

- **React 19** + **TypeScript** — UI и типизация
- **Vite** — сборка и dev-сервер
- **CSS-переменные** — темизация без UI-библиотек
- **GREEN-API HTTP API** — транспорт сообщений
- **Polling** через `receiveNotification` + `deleteNotification` — получение входящих

Без Redux, без Router, без UI-китов.

## Функционал

- Авторизация по `idInstance` + `apiTokenInstance`
- Поддержка QR-кода (для неавторизованных инстансов) с автообновлением
- Поддержка 2FA (`pendingPassword` → `SendAuthorizationPassword`)
- Список чатов с сохранением в `localStorage`
- Отправка сообщений (`SendMessage`) с оптимистичным UI
- Получение сообщений (polling каждые 1.5 сек)
- Индикатор непрочитанных в сайдбаре
- Тёмная тема в стиле веб-клиента MAX

## Требования

- Node.js 20+
- npm 10+

## Локальный запуск

```bash
git clone <your-repo-url>
cd green-api-chat
npm install
cp .env.example .env
npm run dev
```

Откроется `http://localhost:5173`.

### Переменные окружения

| Переменная | Описание | По умолчанию |
|---|---|---|
| `VITE_API_URL` | Базовый URL GREEN-API | `https://3100.api.green-api.com` |

## Использование

1. Получите данные инстанса в [console.green-api.com](https://console.green-api.com).
2. Введите в форму:
   - `idInstance` — например `310022752482`
   - `apiTokenInstance` — токен инстанса
3. Если инстанс не авторизован — появится QR-код. Отсканируйте в приложении MAX:
   **Настройки → Устройства → Подключить устройство**.
4. Если включён 2FA — введите пароль.
5. Нажмите **«+»** в сайдбаре, введите номер получателя в формате `79991234567` или `+7 999 123-45-67`.
6. Пишите сообщения. Ответы приходят автоматически.

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | Dev-сервер с HMR |
| `npm run build` | Production-сборка в `dist/` |
| `npm run preview` | Локальный просмотр собранного бандла |
| `npm run lint` | ESLint |

## Структура

```
src/
  api/greenApi.ts          — клиент GREEN-API (getState, send, receive, qr, logout)
  hooks/
    useChatPolling.ts      — рекурсивный polling входящих
    useConversations.ts    — список чатов + localStorage
    useMessagesStorage.ts  — история сообщений + localStorage
  components/
    LoginForm/             — экран входа + QR + 2FA
    Sidebar/               — список чатов
    ChatWindow/            — окно переписки
    MessageList/           — пузыри сообщений
    MessageInput/          — поле ввода
  utils/
    chatId.ts              — "79991234567" ⇄ "79991234567@c.us"
    time.ts                — форматирование времени
  types/                   — общие типы
```

## Особенности реализации

- **Polling, не WebSocket.** Для тестового задания — проще и достаточно. В реальном продакшене был бы вебхук.
- **Рекурсивный `setTimeout`, не `setInterval`** — предотвращает наложение запросов при медленной сети.
- **`deleteNotification` обязателен** — без него сервер GREEN-API не отдаёт следующее уведомление.
- **Оптимистичный UI** — сообщение появляется сразу, потом заменяется серверным `idMessage`.

## Ограничения

- Polling работает только при открытой вкладке.
- История сообщений хранится в `localStorage` браузера, не на сервере.
- Работает только с текстовыми сообщениями (по условиям задания).

## Автор

**Иван Калугин**

- Telegram: [@Ivan_Anatolievich_Kalugin](https://t.me/Ivan_Anatolievich_Kalugin)
- VK: [vk.com/id39443462](https://vk.com/id39443462)
- e-mail: ivan_kalugin89@mail.ru