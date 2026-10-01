import { useState } from 'react';
import { LoginForm } from './components/LoginForm/LoginForm';
import { ChatWindow } from './components/ChatWindow/ChatWindow';
import type { Credentials } from './types';
import './App.css';

const LS_KEY = 'green-api-chat-phone';

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [phone, setPhone] = useState<string>(() => localStorage.getItem(LS_KEY) ?? '');
  const [phoneInput, setPhoneInput] = useState(phone);

  if (!credentials) {
    return <LoginForm onLogin={setCredentials} />;
  }

  if (!phone) {
    return (
      <div className="phone-prompt">
        <form
          className="phone-prompt__card"
          onSubmit={(e) => {
            e.preventDefault();
            const p = phoneInput.trim();
            if (!p) return;
            localStorage.setItem(LS_KEY, p);
            setPhone(p);
          }}
        >
          <h2>Кому пишем?</h2>
          <input
            placeholder="+7 999 123-45-67"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            autoFocus
          />
          <button type="submit">Начать чат</button>
          <button
            type="button"
            className="phone-prompt__logout"
            onClick={() => setCredentials(null)}
          >
            Сменить инстанс
          </button>
        </form>
      </div>
    );
  }

  return (
    <ChatWindow
      credentials={credentials}
      phone={phone}
      onLogout={() => {
        localStorage.removeItem(LS_KEY);
        setPhone('');
        setPhoneInput('');
        setCredentials(null);
      }}
    />
  );
}