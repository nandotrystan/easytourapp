// app/modal.tsx
import React from 'react';
import LoginScreen from '../src/screens/LoginScreen';
import { useRouter } from 'expo-router';

export default function Modal() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    console.log('✅ Login successful, closing modal...');
    // Fechar o modal após login bem-sucedido
    router.back();
  };

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
}