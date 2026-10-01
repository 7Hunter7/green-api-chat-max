import { useState } from 'react';
import { LoginForm } from './components/LoginForm/LoginForm';
import type { Credentials } from './types';
import './App.css';

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  if (!credentials) {
    return <LoginForm onLogin={setCredentials} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Авторизован</h2>
      <p>idInstance: {credentials.idInstance}</p>
      <button onClick={() => setCredentials(null)}>Выйти</button>
    </div>
  );
}