import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User, UserType, AuthContextType } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificar se usuário está logado ao iniciar o app
  React.useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async (): Promise<void> => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('userData');
      const storedUserType = await AsyncStorage.getItem('userType') as UserType | null;

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setUserType(storedUserType);
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login
  const login = useCallback(async (userData: User, authToken: string, type: UserType): Promise<void> => {
    try {
      console.log('🔐 LOGIN - Setting user data:', userData);
      setUser(userData);
      setToken(authToken);
      setUserType(type);

      // Salvar no AsyncStorage
      await AsyncStorage.setItem('userToken', authToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userType', type);
      
      console.log('🔐 LOGIN - Data saved to storage');
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }, []);

  // Função de logout - CORRIGIDA E MELHORADA
  const logout = useCallback(async (): Promise<void> => {
    console.log('🔄 AUTH - Logout started');
    
    try {
      // 1. Limpar storage primeiro
      await AsyncStorage.multiRemove(['userToken', 'userData', 'userType']);
      console.log('✅ AUTH - Storage cleared');
      
      // 2. Limpar estado depois
      setUser(null);
      setToken(null);
      setUserType(null);
      
      console.log('✅ AUTH - State cleared');
    } catch (error) {
      console.error('❌ AUTH - Logout error:', error);
      // Mesmo com erro, limpa o estado
      setUser(null);
      setToken(null);
      setUserType(null);
    }
  }, []);

  const isGuide = userType === 'guide';
  const isTourist = userType === 'tourist';

  const value: AuthContextType = {
    user, 
    userType, 
    token, 
    login, 
    logout, 
    isLoading,
    isGuide,
    isTourist,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

