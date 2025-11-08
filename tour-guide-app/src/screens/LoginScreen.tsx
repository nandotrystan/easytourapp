import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Button, TextInput, Text, RadioButton } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { User, UserType } from '../types';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [userType, setUserType] = useState<UserType>('tourist');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const router = useRouter();

  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: '',
      name: ''
    };

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'E-mail é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Por favor, insira um e-mail válido';
    }

    // Validação de senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    // Validação de nome (apenas para cadastro)
    if (!isLogin && !formData.name) {
      errors.name = 'Nome é obrigatório';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password && !errors.name;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        console.log('🔐 Attempting login with:', { email: formData.email });
        const response = await api.login(formData.email, formData.password);
        
        console.log('✅ Login API response:', response);
        
        if (!response.user || !response.token) {
          throw new Error('Resposta inválida do servidor');
        }

        const normalizedUser: User = {
          id: response.user.id?.toString() || 'temp-id',
          name: response.user.name || 'Usuário',
          email: response.user.email,
          type: (response.user.type || response.user.type) as UserType,
        };

        console.log('👤 Normalized user:', normalizedUser);
        
        // Fazer login no contexto
        await login(normalizedUser, response.token, normalizedUser.type);
        
        console.log('✅ Login successful, calling success callback...');
        
        // Chamar callback de sucesso se existir, senão navegar normalmente
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          // Navegação padrão caso não esteja no modal
          const redirectPath = normalizedUser.type === 'guide' 
            ? '/(tabs)/dashboard' 
            : '/(tabs)/explore';
          router.replace(redirectPath as any);
        }

        Alert.alert('Sucesso', `Bem-vindo de volta, ${normalizedUser.name}!`);
        
      } else {
        // REGISTRO
        console.log('📝 Attempting registration with:', { 
          name: formData.name, 
          email: formData.email, 
          userType 
        });
        
        const response = await api.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          user_type: userType
        });

        console.log('✅ Register API response:', response);

        if (!response.user || !response.token) {
          throw new Error('Resposta inválida do servidor');
        }

        const normalizedUser: User = {
          id: response.user.id?.toString() || 'temp-id',
          name: response.user.name || 'Usuário',
          email: response.user.email,
          type: (response.user.type || response.user.type) as UserType,
        };

        console.log('👤 Normalized user:', normalizedUser);
        
        // Fazer login no contexto
        await login(normalizedUser, response.token, normalizedUser.type);
        
        console.log('✅ Registration successful, calling success callback...');
        
        // Chamar callback de sucesso se existir, senão navegar normalmente
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          // Navegação padrão caso não esteja no modal
          const redirectPath = normalizedUser.type === 'guide' 
            ? '/(tabs)/dashboard' 
            : '/(tabs)/explore';
          router.replace(redirectPath as any);
        }

        Alert.alert('Sucesso', `Conta criada com sucesso, ${normalizedUser.name}!`);
      }
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      
      let errorMessage = 'Ocorreu um erro. Tente novamente.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (errorMessage.includes('email') || errorMessage.includes('usuário')) {
        errorMessage = 'E-mail ou senha incorretos.';
      } else if (errorMessage.includes('já existe') || errorMessage.includes('already exists')) {
        errorMessage = 'Este e-mail já está cadastrado.';
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (): void => {
    Alert.alert('Recuperação de Senha', 'Entre em contato com o suporte ou use a funcionalidade no site.');
  };

  const clearError = useCallback((field: keyof typeof formErrors) => {
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleToggleMode = useCallback(() => {
    if (isLoading) return;
    setIsLogin(!isLogin);
    setFormData(prev => ({ ...prev, password: '' }));
    setFormErrors({ email: '', password: '', name: '' });
  }, [isLoading, isLogin]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Faça login para continuar' : 'Junte-se à nossa comunidade'}
        </Text>
      </View>

      {!isLogin && (
        <View>
          <TextInput
            label="Nome completo"
            value={formData.name}
            onChangeText={(text: string) => {
              setFormData(prev => ({...prev, name: text}));
              clearError('name');
            }}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
            autoCapitalize="words"
            disabled={isLoading}
            error={!!formErrors.name}
          />
          {formErrors.name ? <Text style={styles.errorText}>{formErrors.name}</Text> : null}
        </View>
      )}

      <View>
        <TextInput
          label="E-mail"
          value={formData.email}
          onChangeText={(text: string) => {
            setFormData(prev => ({...prev, email: text}));
            clearError('email');
          }}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          left={<TextInput.Icon icon="email" />}
          disabled={isLoading}
          error={!!formErrors.email}
        />
        {formErrors.email ? <Text style={styles.errorText}>{formErrors.email}</Text> : null}
      </View>

      <View>
        <TextInput
          label="Senha"
          value={formData.password}
          onChangeText={(text: string) => {
            setFormData(prev => ({...prev, password: text}));
            clearError('password');
          }}
          style={styles.input}
          mode="outlined"
          secureTextEntry
          left={<TextInput.Icon icon="lock" />}
          disabled={isLoading}
          error={!!formErrors.password}
        />
        {formErrors.password ? (
          <Text style={styles.errorText}>{formErrors.password}</Text>
        ) : (
          !isLogin && formData.password.length > 0 && formData.password.length < 6 && (
            <Text style={styles.warningText}>A senha deve ter pelo menos 6 caracteres</Text>
          )
        )}
      </View>

      {isLogin && (
        <Button 
          mode="text" 
          onPress={handleForgotPassword}
          style={styles.forgotPassword}
          disabled={isLoading}
        >
          Esqueceu sua senha?
        </Button>
      )}

      {!isLogin && (
        <View style={styles.radioGroup}>
          <Text style={styles.radioLabel}>Tipo de conta:</Text>
          <RadioButton.Group 
            onValueChange={(value: string) => setUserType(value as UserType)} 
            value={userType}
          >
            <View style={styles.radioOptions}>
              <View style={styles.radioOption}>
                <RadioButton value="tourist" disabled={isLoading} />
                <Text style={styles.radioText}>Turista</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="guide" disabled={isLoading} />
                <Text style={styles.radioText}>Guia Turístico</Text>
              </View>
            </View>
          </RadioButton.Group>
        </View>
      )}

      <Button 
        mode="contained" 
        onPress={handleSubmit} 
        style={styles.button}
        loading={isLoading}
        disabled={isLoading}
        contentStyle={styles.buttonContent}
      >
        {isLoading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar conta')}
      </Button>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
        </Text>
        <Button 
          mode="text" 
          onPress={handleToggleMode}
          style={styles.switchButton}
          compact
          disabled={isLoading}
        >
          {isLogin ? 'Cadastre-se' : 'Fazer login'}
        </Button>
      </View>

      {/* Informações para debug */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Informações de Debug:</Text>
          <Text style={styles.debugText}>Modo: {isLogin ? 'Login' : 'Cadastro'}</Text>
          <Text style={styles.debugText}>Tipo de usuário: {userType}</Text>
          <Text style={styles.debugText}>Carregando: {isLoading ? 'Sim' : 'Não'}</Text>
          <Text style={styles.debugText}>Email: {formData.email}</Text>
          <Text style={styles.debugText}>Senha length: {formData.password.length}</Text>
          {!isLogin && <Text style={styles.debugText}>Nome: {formData.name}</Text>}
        </View>
      )}

      {/* Credenciais de teste para desenvolvimento */}
      {__DEV__ && isLogin && (
        <View style={styles.testCredentials}>
          <Text style={styles.testTitle}>Credenciais de Teste:</Text>
          <Text style={styles.testText}>• Use qualquer e-mail válido</Text>
          <Text style={styles.testText}>• Senha: qualquer senha com 6+ caracteres</Text>
          <Text style={styles.testText}>• Ou use credenciais reais do seu backend</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 12,
  },
  warningText: {
    color: '#ed6c02',
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  radioGroup: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  radioOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 8,
    backgroundColor: '#6200ee',
  },
  buttonContent: {
    height: 48,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  switchText: {
    color: '#666',
    marginRight: 8,
  },
  switchButton: {
    margin: 0,
    padding: 0,
  },
  debugContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#856404',
    marginBottom: 2,
  },
  testCredentials: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  testTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  testText: {
    fontSize: 10,
    color: '#2e7d32',
    marginBottom: 2,
  },
});

export default LoginScreen;