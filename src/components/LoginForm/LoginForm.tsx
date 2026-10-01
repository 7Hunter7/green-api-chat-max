import { useState } from 'react';
import { getStateInstance } from '../../api/greenApi';
import type { Credentials } from '../../types';
import './LoginForm.css';

interface Props {
  onLogin: (c: Credentials) => void;
}

export function LoginForm({ onLogin }: Props) {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const c: Credentials = {
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
      };
      const state = await getStateInstance(c);
      if (state !== 'authorized') throw new Error(`Инстанс не авторизован: ${state}`);
      onLogin(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>GREEN-API Chat</h1>
        <input
          placeholder="idInstance"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          required
        />
        <input
          placeholder="apiTokenInstance"
          value={apiTokenInstance}
          onChange={(e) => setApiToken(e.target.value)}
          required
          type="password"
        />
        {error && <div className="login-error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Проверка…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}