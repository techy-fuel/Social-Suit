import React from 'react';
import { LoginScreen } from './LoginScreen';
import { SignupScreen } from './SignupScreen';

export function AuthGate() {
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  return mode === 'login' ? (
    <LoginScreen onSwitchToSignup={() => setMode('signup')} />
  ) : (
    <SignupScreen onSwitchToLogin={() => setMode('login')} />
  );
}
