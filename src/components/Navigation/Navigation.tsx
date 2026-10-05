import { NavButton } from "../../ui";
import "./Navigation.css";

export type NavigationSection =
  | "all"
  | "new"
  | "channels"
  | "contacts"
  | "calls"
  | "settings";

interface Props {
  activeSection?: NavigationSection;
  onSelectSection?: (section: NavigationSection) => void;
  newCount?: number;
  channelsCount?: number;
}

export function Navigation({
  activeSection = "all",
  onSelectSection,
  newCount = 0,
  channelsCount = 0,
}: Props) {
  return (
    <nav className="navigation" aria-label="Папки и профиль">
      <div className="navigation__inner">
        <div className="navigation__folders">
          <div className="navigation__folders-viewport">
            <div className="navigation__upper-trigger" aria-hidden="true" />
            <div className="navigation__item">
              <NavButton
                iconName="message_fill"
                label="Все"
                active={activeSection === "all"}
                onClick={() => onSelectSection?.("all")}
              />
            </div>

            <div
              className="navigation__draggable-viewport"
              role="list"
              tabIndex={0}
            >
              <div role="listitem" tabIndex={0}>
                <div className="navigation__item">
                  <NavButton
                    iconName="folder_fill"
                    label="Новые"
                    active={activeSection === "new"}
                    counter={newCount}
                    onClick={() => onSelectSection?.("new")}
                  />
                </div>
              </div>

              <div role="listitem" tabIndex={0}>
                <div className="navigation__item">
                  <NavButton
                    iconName="folder_fill"
                    label="Каналы"
                    active={activeSection === "channels"}
                    counter={channelsCount}
                    onClick={() => onSelectSection?.("channels")}
                  />
                </div>
              </div>
            </div>

            <div className="navigation__bottom-trigger" aria-hidden="true" />
          </div>
        </div>

        <div className="navigation__separator" />

        <div className="navigation__bottom-group">
          <NavButton
            iconName="users_fill"
            label="Контакты"
            active={activeSection === "contacts"}
            onClick={() => onSelectSection?.("contacts")}
          />

          <NavButton
            iconName="call_fill"
            label="Звонки"
            active={activeSection === "calls"}
            onClick={() => onSelectSection?.("calls")}
          />

          <div className="navigation__item navigation__item--settings">
            <NavButton
              iconName="settings_fill"
              label="Настройки"
              active={activeSection === "settings"}
              onClick={() => onSelectSection?.("settings")}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
