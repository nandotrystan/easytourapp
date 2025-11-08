import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'tourist' | 'guide';
  fallbackMessage?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType,
  fallbackMessage 
}) => {
  const { user, userType, isLoading, isGuide, isTourist } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Usuário não autenticado</Text>
        <Button onPress={() => router.push('/login')}>
          Fazer Login
        </Button>
      </View>
    );
  }

  if (requiredUserType && userType !== requiredUserType) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {fallbackMessage || `Acesso restrito para ${requiredUserType === 'guide' ? 'guias' : 'turistas'}`}
        </Text>
        <Button onPress={() => router.back()}>
          Voltar
        </Button>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ProtectedRoute;