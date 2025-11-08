import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';

export default function TabLayout() {
  const { user, userType, isLoading } = useAuth();
  const router = useRouter();

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return null; // Ou um loading indicator
  }

  const getDashboardTitle = () => {
    return userType === 'guide' ? 'Meus Tours' : 'Meu Perfil';
  };

  const getDashboardIcon = (color: string, size: number) => {
    return userType === 'guide' 
      ? <Ionicons name="briefcase" size={size} color={color} />
      : <Ionicons name="person" size={size} color={color} />;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e0e0',
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      {/* Página Inicial */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Comportamento padrão já está bom
          },
        }}
      />

      {/* Explorar Passeios */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      {/* Dashboard Dinâmico - Baseado no Tipo de Usuário */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: getDashboardTitle(),
          tabBarIcon: ({ color, size }) => getDashboardIcon(color, size),
        }}
        listeners={{
          tabPress: (e) => {
            // Prevenir navegação padrão para dashboard
            e.preventDefault();
            
            console.log('🎯 Dashboard tab pressed - User type:', userType);
            
            // Navegar para o dashboard correto baseado no tipo de usuário
            if (userType === 'guide') {
              console.log('🔄 Redirecting guide to guide-dashboard');
              router.push('/guideDashboard');
            } else {
              console.log('🔄 Redirecting tourist to tourist-dashboard');
              router.push('/touristDashboard');
            }
          },
        }}
      />

      {/* Minhas Solicitações - Principalmente para Turistas */}
      <Tabs.Screen
        name="my-requests"
        options={{
          title: 'Solicitações',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (userType === 'guide') {
              // Guias podem ver solicitações no seu próprio dashboard
              e.preventDefault();
              console.log('🔄 Guide accessing requests - redirecting to guide-dashboard');
              router.push('/guideDashboard');
            }
            // Turistas podem acessar normalmente
          },
        }}
      />

      {/* Estabelecimentos */}
      <Tabs.Screen
        name="business"
        options={{
          title: 'Estabelecimentos',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}