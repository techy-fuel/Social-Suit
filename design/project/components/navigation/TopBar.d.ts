export interface TopBarProps {
  title: string;
  /** Typically a <WorkspaceSwitcher>. */
  workspace?: React.ReactNode;
  /** Extra actions left of the workspace switcher (search, notifications icon buttons). */
  right?: React.ReactNode;
}
