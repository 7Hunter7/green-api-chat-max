import { Button } from "../../ui";
import { MaxLogo } from "../LoginForm/MaxLogo";
import "./LoginChoice.css";

interface Props {
  onChooseQr: () => void;
  onChooseCredentials: () => void;
}

export function LoginChoice({ onChooseQr, onChooseCredentials }: Props) {
  return (
    <div className="login-wrap">
      <div className="login-card login-card--max">
        <MaxLogo size={32} />
        <p className="login-card__hint">Войдите, чтобы начать общение</p>

        <Button
          variant="primary"
          size="large"
          stretched
          onClick={onChooseQr}
        >
          Войти по QR-коду
        </Button>

        <Button
          variant="secondary"
          size="large"
          stretched
          onClick={onChooseCredentials}
        >
          Войти по данным GREEN-API
        </Button>
      </div>
    </div>
  );
}
