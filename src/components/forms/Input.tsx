import React from 'react';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  autoComplete?: string;
}

export function Input({ label, placeholder, value, onChange, error, type = 'text', icon, disabled, autoComplete }: InputProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--font-body)' }}>
      {label && (
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', color: 'var(--text)' }}>{label}</span>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          height: 38,
          padding: '0 12px',
          borderRadius: 'var(--radius-md)',
          background: disabled ? 'var(--surface-sunken)' : 'var(--card)',
          border: `1px solid ${error ? 'var(--red)' : focused ? 'var(--focus-ring)' : 'var(--border-strong)'}`,
          boxShadow: focused ? '0 0 0 3px var(--blue-100)' : 'none',
          transition: 'border-color var(--duration-fast) var(--ease-standard)',
        }}
      >
        {icon}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            flex: 1,
            fontSize: 'var(--text-sm)',
            color: 'var(--text)',
            fontFamily: 'var(--font-body)',
          }}
        />
      </div>
      {error && <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--red)' }}>{error}</span>}
    </label>
  );
}
