export interface TabItem {
  key: string;
  label: string;
  count?: number;
}
export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange?: (key: string) => void;
}
