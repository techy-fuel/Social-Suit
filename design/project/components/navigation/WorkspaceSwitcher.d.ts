/**
 * @startingPoint section="Navigation" subtitle="Signature multi-tenant client picker — top-right of the top bar" viewport="700x160"
 */
export interface Workspace {
  initials: string;
  name: string;
}
export interface WorkspaceSwitcherProps {
  workspace: Workspace;
  onClick?: () => void;
}
