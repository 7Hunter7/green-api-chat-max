import { useState } from "react";
import type { Credentials } from "../../types";
import { LoginChoice } from "../LoginChoice/LoginChoice";
import { CredentialsForm } from "./CredentialsForm";
import { QrAuth } from "./QrAuth";
import { PasswordAuth } from "./PasswordAuth";
import "./LoginForm.css";

interface Props {
  onLogin: (c: Credentials) => void;
}

type Screen =
  | { kind: "choice" }
  | { kind: "qr" }
  | { kind: "credentials" }
  | { kind: "password"; credentials: Credentials; from: "qr" | "credentials" };

export function LoginForm({ onLogin }: Props) {
  const [screen, setScreen] = useState<Screen>({ kind: "choice" });

  if (screen.kind === "choice") {
    return (
      <LoginChoice
        onChooseQr={() => setScreen({ kind: "qr" })}
        onChooseCredentials={() => setScreen({ kind: "credentials" })}
      />
    );
  }

  if (screen.kind === "qr") {
    return (
      <QrAuth
        onLogin={onLogin}
        onPendingPassword={(c) =>
          setScreen({ kind: "password", credentials: c, from: "qr" })
        }
        onBack={() => setScreen({ kind: "choice" })}
      />
    );
  }

  if (screen.kind === "credentials") {
    return (
      <CredentialsForm
        onAuthorized={onLogin}
        onPendingPassword={(c) =>
          setScreen({ kind: "password", credentials: c, from: "credentials" })
        }
        onNotAuthorized={() => {
          // Инстанс не привязан к аккаунту MAX.
          // Показываем ошибку через alert + возврат на выбор QR,
          // потому что только QR может авторизовать неавторизованный инстанс.
          alert(
            "Инстанс не авторизован. Чтобы привязать аккаунт MAX, войдите по QR-коду.",
          );
          setScreen({ kind: "qr" });
        }}
        onBack={() => setScreen({ kind: "choice" })}
        submitLabel="Войти"
      />
    );
  }

  // password
  return (
    <PasswordAuth
      credentials={screen.credentials}
      onLogin={onLogin}
      onBack={() =>
        setScreen({ kind: screen.from === "qr" ? "qr" : "credentials" })
      }
    />
  );
}