export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  /** Render this column's cells in IBM Plex Mono (metrics, IDs, timestamps). */
  mono?: boolean;
}
export interface TableProps {
  columns: TableColumn[];
  rows: Record<string, React.ReactNode>[];
}
