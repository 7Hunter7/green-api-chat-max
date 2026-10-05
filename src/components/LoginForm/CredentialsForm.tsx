import { useState } from "react";
import { Button, Icon, Input } from "../../ui";
import { MaxLogo } from "./MaxLogo";
import { getStateInstance } from "../../api/greenApi";
import type { Credentials, InstanceState } from "../../types";
import "./LoginForm.css";

interface Props {
  onAuthorized: (c: Credentials) => void;
  onPendingPassword: (c: Credentials) => void;
  onNotAuthorized: (c: Credentials) => void;
  onBack: () => void;
  submitLabel?: string;
}

export function CredentialsForm({
  onAuthorized,
  onPendingPassword,
  onNotAuthorized,
  onBack,
  submitLabel = "Далее",
}: Props) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiToken] = useState("");
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
      const state = (await getStateInstance(c)) as InstanceState;

      if (state === "authorized") {
        onAuthorized(c);
        return;
      }
      if (state === "pendingPassword") {
        onPendingPassword(c);
        return;
      }
      if (state === "notAuthorized" || state === "starting") {
        onNotAuthorized(c);
        return;
      }
      throw new Error(`Не удалось войти. Статус: ${state}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <Button
          type="button"
          variant="ghost"
          size="small"
          className="login-back"
          icon={<Icon name="arrow_left" size={20} />}
          onClick={onBack}
        >
          Назад
        </Button>

        <MaxLogo size={28} />

        <h1 className="login-card__title">GREEN-API</h1>
        <p className="login-card__hint">
          Введите данные инстанса из личного кабинета GREEN-API
        </p>

        <Input
          size="default"
          placeholder="idInstance"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          required
          autoComplete="off"
        />
        <Input
          size="default"
          type="password"
          placeholder="apiTokenInstance"
          value={apiTokenInstance}
          onChange={(e) => setApiToken(e.target.value)}
          required
          autoComplete="off"
        />
        {error && <div className="login-error">{error}</div>}

        <Button
          type="submit"
          variant="primary"
          size="large"
          stretched
          loading={loading}
        >
          {submitLabel}
        </Button>
      </form>
    </div>
  );
}