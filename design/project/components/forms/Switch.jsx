import React from 'react';

export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, fontFamily: 'var(--font-body)' }}>
      <span
        onClick={() => !disabled && onChange && onChange(!checked)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 'var(--radius-full)',
          background: checked ? 'var(--accent-primary)' : 'var(--slate-300)',
          position: 'relative',
          transition: 'background var(--duration-fast) var(--ease-standard)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left var(--duration-fast) var(--ease-standard)',
            boxShadow: 'var(--shadow-xs)',
          }}
        />
      </span>
      {label && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{label}</span>}
    </label>
  );
}
