import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000ff', // ✅ Cor do header
          },
          headerTintColor: '#1e293b',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#1e293b',
          },
          contentStyle: {
            backgroundColor: '#aca6a6ff', // ✅ Cor de fundo de todas as telas
          },
          headerShadowVisible: false, // ✅ Remove sombra do header
        }}
      >
        {/* Telas públicas */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        
        {/* Telas protegidas - acesso baseado no tipo de usuário */}
        
        {/* Telas para ambos os tipos */}
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="tour-details/[id]" 
          options={{ 
            headerShown: true,
            title: 'Detalhes do Passeio',
            headerStyle: {
              backgroundColor: '#f8fafc',
            },
            headerTintColor: '#1e293b',
          }} 
        />
        
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
            headerBackTitle: 'Voltar',
            headerStyle: {
              backgroundColor: '#f8fafc',
            },
            headerTintColor: '#1e293b',
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
        
        {/* ✅ REMOVIDO: Stack.Screen das tabs */}
        {/* <Stack.Screen name="tabs" options={{ headerShown: false }} /> */}
        
        {/* ✅ ADICIONAR: Outras telas que estavam nas tabs */}
        <Stack.Screen 
          name="my-requests" 
          options={{ 
            title: 'Minhas Solicitações',
            headerStyle: {
              backgroundColor: '#f8fafc',
            },
            headerTintColor: '#1e293b',
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            title: 'Meu Perfil',
            headerStyle: {
              backgroundColor: '#f8fafc',
            },
            headerTintColor: '#1e293b',
          }} 
        />
        <Stack.Screen 
          name="search" 
          options={{ 
            title: 'Buscar Passeios',
            headerStyle: {
              backgroundColor: '#f8fafc',
            },
            headerTintColor: '#1e293b',
          }} 
        />
      </Stack>
    </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff', // ✅ Cor de fundo global
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc', // ✅ Mesma cor de fundo
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#334155',
  },
});
