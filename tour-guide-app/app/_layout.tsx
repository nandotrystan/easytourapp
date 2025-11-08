import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';

// Componente para redirecionamentos baseados na autenticação
function RootLayoutNav() {
  const { user, userType, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      console.log('🔐 Auth State:', { 
        user: user ? user.name : 'null', 
        userType, 
        isAuthenticated: !!user 
      });

      // Se não está autenticado, redirecionar para login
      if (!user) {
        console.log('🔄 Redirecting to login');
        router.replace('/login');
        return;
      }

      // Se está autenticado, garantir que está na rota correta
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      console.log('📍 Current path:', currentPath);

      // Redirecionar baseado no tipo de usuário
      if (userType === 'guide') {
        // Guia tentando acessar rotas de turista
        if (currentPath.includes('tourist-dashboard')) {
          router.replace('/guideDashboard');
        }
        
        // Proteger create-tour apenas para guias (já está implícito)
        if (currentPath === '/create-tour' && userType !== 'guide') {
          router.replace('/guideDashboard');
        }
      } else if (userType === 'tourist') {
        // Turista tentando acessar rotas de guia
        if (currentPath.includes('guide-dashboard') || currentPath === '/create-tour') {
          router.replace('/touristDashboard');
        }
      }
    }
  }, [user, userType, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 16 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <Stack>
      {/* Telas públicas */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      
      {/* Telas protegidas - acesso baseado no tipo de usuário */}
      
      {/* Telas para ambos os tipos */}
      <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="tour-details/[id]" options={{ headerShown: false }} />
      
      {/* Telas específicas para GUIAS */}
      <Stack.Screen 
        name="guide-dashboard" 
        options={{ 
          headerShown: false,
          gestureEnabled: false // Previne voltar para login
        }} 
      />
      <Stack.Screen 
        name="create-tour" 
        options={{ 
          title: 'Criar Passeio',
          headerShown: true,
          headerBackTitle: 'Voltar'
        }} 
      />
      
      {/* Telas específicas para TURISTAS */}
      <Stack.Screen 
        name="tourist-dashboard" 
        options={{ 
          headerShown: false,
          gestureEnabled: false
        }} 
      />
      
      {/* Layout das tabs (contém redirecionamento interno) */}
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </PaperProvider>
  );
}