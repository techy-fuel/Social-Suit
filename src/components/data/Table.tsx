import React from 'react';

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

export function Table({ columns, rows }: TableProps) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)' }}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.key}
              style={{
                textAlign: c.align || 'left',
                fontSize: 'var(--text-2xs)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wide)',
                color: 'var(--text-muted)',
                fontWeight: 'var(--weight-medium)',
                padding: '8px 12px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map((c) => (
              <td
                key={c.key}
                style={{
                  padding: '10px 12px',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text)',
                  textAlign: c.align || 'left',
                  fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-body)',
                }}
              >
                {row[c.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
