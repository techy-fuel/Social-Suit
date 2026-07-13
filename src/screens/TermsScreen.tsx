import React from 'react';
import { Link } from 'react-router-dom';

export function TermsScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px 24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', fontFamily: 'var(--font-body)', color: 'var(--text)' }}>
        <Link to="/" style={{ fontSize: 'var(--text-sm)' }}>← Back to SocialSuite</Link>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: 20, marginBottom: 4 }}>Terms of Service</h1>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 28 }}>Last updated: July 2026</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
          <p style={{ color: 'var(--text-muted)' }}>
            This is placeholder template text, not reviewed legal counsel. Replace it with terms
            drafted or approved by a lawyer before relying on it for a real product.
          </p>
          <section>
            <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 6 }}>1. Accounts</h2>
            <p>You're responsible for the security of your account credentials and for all activity that happens under your account. Notify us promptly if you suspect unauthorized access.</p>
          </section>
          <section>
            <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 6 }}>2. Acceptable use</h2>
            <p>Don't use SocialSuite to violate any platform's terms of service, send spam, or infringe on others' rights. We may suspend accounts that abuse the service.</p>
          </section>
          <section>
            <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 6 }}>3. Your content</h2>
            <p>You retain ownership of the content you create and schedule through SocialSuite. You grant us the limited right to store and process it in order to provide the service.</p>
          </section>
          <section>
            <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 6 }}>4. Service availability</h2>
            <p>SocialSuite is provided "as is" without warranty of any kind. We aim for high availability but don't guarantee uninterrupted access.</p>
          </section>
          <section>
            <h2 style={{ fontSize: 'var(--text-md)', marginBottom: 6 }}>5. Changes</h2>
            <p>We may update these terms from time to time. Continued use of SocialSuite after a change means you accept the updated terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
