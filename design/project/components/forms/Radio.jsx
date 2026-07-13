import React from 'react';

export function Radio({ label, checked, onChange, name }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
      <input type="radio" name={name} checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: `1.5px solid ${checked ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {checked && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent-primary)' }} />}
      </span>
      {label && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{label}</span>}
    </label>
  );
}
