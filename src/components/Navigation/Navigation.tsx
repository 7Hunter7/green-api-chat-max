import { NavButton } from "../../ui";
import "./Navigation.css";

interface Props {
  activeSection?: NavigationSection;
  onSelectSection?: (section: NavigationSection) => void;
  onLogout: () => void;
}

export type NavigationSection = "all" | "contacts" | "calls" | "settings";

export function Navigation({
  activeSection = "all",
  onSelectSection,
  onLogout,
}: Props) {
  return (
    <nav className="navigation" aria-label="Разделы">
      <div className="navigation__folders">
        <NavButton
          iconName="users"
          label="Все"
          active={activeSection === "all"}
          onClick={() => onSelectSection?.("all")}
        />
      </div>

      <div className="navigation__separator" />

      <div className="navigation__bottom">
        <NavButton
          iconName="user"
          label="Контакты"
          active={activeSection === "contacts"}
          onClick={() => onSelectSection?.("contacts")}
        />
        <NavButton
          iconName="call"
          label="Звонки"
          active={activeSection === "calls"}
          onClick={() => onSelectSection?.("calls")}
        />
        <NavButton
          iconName="settings"
          label="Настройки"
          active={activeSection === "settings"}
          onClick={() => onSelectSection?.("settings")}
        />
        <NavButton
          iconName="autorization_leave"
          label="Выйти"
          onClick={onLogout}
        />
      </div>
    </nav>
  );
}
