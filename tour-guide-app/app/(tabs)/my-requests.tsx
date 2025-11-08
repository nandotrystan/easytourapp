// app/(tabs)/my-request.tsx
import React from 'react';
import { useAuth } from '../../src/context/AuthContext';
import TouristDashboard from '../../src/screens/TouristDashboard';
import GuideDashboard from '../../src/screens/GuideDashboard';

export default function MyRequestScreen() {
  const { userType } = useAuth();

  // Renderiza componente diferente baseado no tipo de usuário
  return userType === 'guide' ? <GuideDashboard /> : <TouristDashboard />;
}