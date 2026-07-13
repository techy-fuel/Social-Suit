import React from 'react';

export function Textarea({ label, placeholder, value, onChange, rows = 4, error, hint }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-body)' }}>
      {label && <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--text)' }}>{label}</span>}
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          resize: 'vertical',
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--red)' : focused ? 'var(--focus-ring)' : 'var(--border-strong)'}`,
          boxShadow: focused ? '0 0 0 3px var(--blue-100)' : 'none',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-body)',
          color: 'var(--text)',
          outline: 'none',
        }}
      />
      {(error || hint) && (
        <span style={{ fontSize: 'var(--text-2xs)', color: error ? 'var(--red)' : 'var(--text-muted)' }}>
          {error || hint}
        </span>
      )}
    </label>
  );
}
