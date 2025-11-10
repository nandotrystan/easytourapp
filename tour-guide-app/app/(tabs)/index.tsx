import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card, Button, Avatar, useTheme } from 'react-native-paper';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

// ✅ Interface com as rotas CORRETAS baseadas na sua estrutura
interface QuickAction {
  title: string;
  icon: string;
  color: string;
  route: '/guideDashboard' | '/(tabs)/explore' | '/(tabs)/my-requests' | '/create-tour' | '/touristDashboard';
  description: string;
}

export default function TabHome() {
  const { user, userType } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  // ✅ Criar ações com rotas CORRETAS baseadas na sua estrutura
  const getQuickActions = (): QuickAction[] => {
    if (userType === 'guide') {
      return [
        {
          title: 'Meus Passeios',
          icon: 'map-marker',
          color: '#6366f1',
          route: '/guideDashboard',
          description: 'Gerencie seus passeios'
        },
        {
          title: 'Criar Passeio',
          icon: 'plus-circle',
          color: '#ec4899',
          route: '/create-tour',
          description: 'Adicione nova experiência'
        },
        {
          title: 'Minhas Solicitações',
          icon: 'clipboard-list',
          color: '#10b981',
          route: '/(tabs)/my-requests',
          description: 'Acompanhe seus pedidos'
        },
        {
          title: 'Explorar',
          icon: 'compass',
          color: '#f59e0b',
          route: '/(tabs)/explore',
          description: 'Descubra outros passeios'
        },
      ];
    } else {
      return [
        {
          title: 'Explorar Passeios',
          icon: 'compass',
          color: '#6366f1',
          route: '/(tabs)/explore',
          description: 'Descubra experiências incríveis'
        },
        {
          title: 'Minhas Solicitações',
          icon: 'clipboard-list',
          color: '#10b981',
          route: '/(tabs)/my-requests',
          description: 'Acompanhe seus pedidos'
        },
        {
          title: 'Dashboard',
          icon: 'view-dashboard',
          color: '#f59e0b',
          route: '/touristDashboard',
          description: 'Painel do turista'
        },
      ];
    }
  };

  const quickActions = getQuickActions();

  // ✅ Função de navegação tipada
  const handleNavigation = (route: QuickAction['route']) => {
    router.push(route);
  };

  // ✅ Função para botão promocional
  const handlePromoNavigation = () => {
    if (userType === 'guide') {
      router.push('/create-tour');
    } else {
      router.push('/(tabs)/explore');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header com Boas-vindas */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name || 'Viajante'}! 👋</Text>
          <Text style={styles.subtitle}>
            {userType === 'guide' 
              ? 'Pronto para criar experiências incríveis?' 
              : 'Qual aventura vamos viver hoje?'}
          </Text>
        </View>
        <Avatar.Text 
          size={50} 
          label={user?.name?.charAt(0) || 'U'} 
          style={{ backgroundColor: theme.colors.primary }}
        />
      </View>

      {/* Cards de Acesso Rápido */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={() => handleNavigation(action.route)}
            >
              <Card.Content style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
                  <Text style={styles.icon}>📌</Text>
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{action.title}</Text>
                  <Text style={styles.cardDescription}>{action.description}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {/* Destaques ou Estatísticas */}
      <View style={styles.highlights}>
        <Text style={styles.sectionTitle}>
          {userType === 'guide' ? 'Seu Desempenho' : 'Destaques'}
        </Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>🌟</Text>
              <Text style={styles.statLabel}>Avaliações</Text>
              <Text style={styles.statValue}>4.8</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>🎯</Text>
              <Text style={styles.statLabel}>
                {userType === 'guide' ? 'Passeios' : 'Experiências'}
              </Text>
              <Text style={styles.statValue}>12</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>📍</Text>
              <Text style={styles.statLabel}>Cidades</Text>
              <Text style={styles.statValue}>5</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Banner Promocional */}
      <Card style={styles.promoCard}>
        <Card.Content style={styles.promoContent}>
          <View>
            <Text style={styles.promoTitle}>🎉 Novas Experiências!</Text>
            <Text style={styles.promoText}>
              {userType === 'guide' 
                ? 'Compartilhe suas histórias com mais viajantes' 
                : 'Descubra passeios exclusivos perto de você'}
            </Text>
          </View>
          <Button 
            mode="contained" 
            style={styles.promoButton}
            onPress={handlePromoNavigation}
          >
            Explorar
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#aca6a6ff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#07409cff',
  },
  subtitle: {
    fontSize: 16,
    color: '#0459d1ff',
    marginTop: 4,
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 20,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d67f8ff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#5b80b4ff',
  },
  highlights: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#688fc5ff',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  promoCard: {
    backgroundColor: '#6366f1',
    elevation: 4,
  },
  promoContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  promoText: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  promoButton: {
    backgroundColor: '#ffffff',
  },
});