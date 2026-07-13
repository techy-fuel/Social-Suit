import React from 'react';
import { Link } from 'react-router-dom';

export function PrivacyScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', fontFamily: 'var(--font-body)', color: 'var(--text)' }}>
        <Link to="/" style={{ fontSize: 'var(--text-sm)' }}>← Back to SocialSuite</Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: 20, marginBottom: 4 }}>Privacy Policy</h1>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 28 }}>Last updated: July 2026</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
          <p style={{ color: 'var(--text-muted)' }}>
            This is placeholder template text, not reviewed legal counsel. Replace it with a policy
            drafted or approved by a lawyer, matched to what the product actually collects, before
            relying on it for a real product.
          </p>
          <section>
            <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 6 }}>What we collect</h2>
            <p>Your email address and password (stored as a one-way hash, never in plain text), plus the workspace, post, connection, and campaign data you create while using SocialSuite.</p>
          </section>
          <section>
            <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 6 }}>How we use it</h2>
            <p>To operate your account, show you your own data, and maintain the security of the service. We don't sell your data to third parties.</p>
          </section>
          <section>
            <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 6 }}>Data retention</h2>
            <p>Your data is retained for as long as your account is active. You can request deletion of your account and its data at any time.</p>
          </section>
          <section>
            <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 6 }}>Cookies</h2>
            <p>We use a single session cookie to keep you signed in. It's required for the app to function and isn't used for tracking or advertising.</p>
          </section>
          <section>
            <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 6 }}>Contact</h2>
            <p>Questions about this policy can be directed to your SocialSuite administrator.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
