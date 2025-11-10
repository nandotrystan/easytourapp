// screens/BusinessScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Linking, 
  Alert,
  RefreshControl 
} from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Chip, 
  Searchbar, 
  Button, 
  Text, 
  ActivityIndicator,
  Snackbar 
} from 'react-native-paper';
import { Business, BusinessFilters } from '../types';
import { api } from '../services/api';

const BusinessScreen: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);

  // Tipos de negócio disponíveis
  const businessTypes = [
    { id: 'all', label: 'Todos', icon: 'store' },
    { id: 'restaurant', label: 'Restaurantes', icon: 'silverware-fork-knife' },
    { id: 'store', label: 'Lojas', icon: 'shopping' },
    { id: 'hotel', label: 'Hotéis', icon: 'bed' },
    { id: 'attraction', label: 'Atrações', icon: 'camera' },
  ];

  // Carregar estabelecimentos
  const loadBusinesses = useCallback(async (filters?: BusinessFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📥 Carregando estabelecimentos com filtros:', filters);
      
      const data = await api.getBusinesses(filters);
      console.log('✅ Estabelecimentos carregados:', data.length);
      
      setBusinesses(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estabelecimentos';
      setError(errorMessage);
      setSnackbarVisible(true);
      console.error('❌ Erro ao carregar estabelecimentos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  // Atualizar quando o tipo mudar
  useEffect(() => {
    const filters: BusinessFilters = {};
    
    if (selectedType !== 'all') {
      filters.type = selectedType;
    }
    
    if (searchQuery) {
      filters.search = searchQuery;
    }
    
    loadBusinesses(filters);
  }, [selectedType, loadBusinesses]);

  // Refresh manual
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBusinesses();
    setRefreshing(false);
  }, [loadBusinesses]);

  // Buscar estabelecimentos
  const handleSearch = useCallback(() => {
    const filters: BusinessFilters = {};
    
    if (selectedType !== 'all') {
      filters.type = selectedType;
    }
    
    if (searchQuery) {
      filters.search = searchQuery;
    }
    
    loadBusinesses(filters);
  }, [selectedType, searchQuery, loadBusinesses]);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedType('all');
    loadBusinesses();
  }, [loadBusinesses]);

  // Funções de utilidade
  const getTypeIcon = (type: string): string => {
    const typeConfig = businessTypes.find(t => t.id === type);
    return typeConfig?.icon || 'store';
  };

  const getTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      restaurant: '#E91E63',
      store: '#2196F3',
      hotel: '#4CAF50',
      attraction: '#FF9800',
    };
    return colors[type] || '#9C27B0';
  };

  const getTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
      restaurant: 'Restaurante',
      store: 'Loja',
      hotel: 'Hotel',
      attraction: 'Atração',
    };
    return labels[type] || type;
  };

  // Ações
  const handleCall = (phone: string | null): void => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o aplicativo de telefone');
      });
    } else {
      Alert.alert('Info', 'Número de telefone não disponível');
    }
  };

  const handleOpenMaps = (address: string): void => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas');
    });
  };

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('⭐');
      } else {
        stars.push('☆');
      }
    }
    
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>{stars.join('')}</Text>
        <Text style={styles.ratingNumber}>({rating.toFixed(1)})</Text>
      </View>
    );
  };

  // Componente de item da lista
  const renderBusinessItem = ({ item }: { item: Business }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Cover 
        source={{ 
          uri: item.image_url || 'https://via.placeholder.com/300x200/6200ee/ffffff?text=Estabelecimento'
        }} 
        style={styles.cardImage}
        resizeMode="cover"
      />
      <Card.Content style={styles.cardContent}>
        <View style={styles.businessHeader}>
          <View style={styles.titleContainer}>
            <Title style={styles.businessTitle} numberOfLines={2}>
              {item.name}
            </Title>
            <View style={styles.chipContainer}>
              <Chip 
                icon={getTypeIcon(item.type)}
                style={[styles.typeChip, { backgroundColor: getTypeColor(item.type) }]}
                textStyle={styles.typeChipText}
                compact
              >
                {getTypeLabel(item.type)}
              </Chip>
              {item.is_verified && (
                <Chip 
                  icon="check-circle"
                  style={styles.verifiedChip}
                  textStyle={styles.verifiedChipText}
                  compact
                >
                  Verificado
                </Chip>
              )}
            </View>
          </View>
          {renderRatingStars(item.rating)}
        </View>
        
        <Paragraph style={styles.businessDescription} numberOfLines={3}>
          {item.description}
        </Paragraph>
        
        <View style={styles.businessDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Paragraph style={styles.detailText} numberOfLines={2}>
              {item.address}
            </Paragraph>
          </View>
          
          {item.phone && (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📞</Text>
              <Paragraph style={styles.detailText}>
                {item.phone}
              </Paragraph>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <Button 
            mode="outlined" 
            style={styles.actionButton}
            icon="map-marker"
            onPress={() => handleOpenMaps(item.address)}
            compact
          >
            Mapas
          </Button>
          
          {item.phone && (
            <Button 
              mode="contained" 
              style={styles.actionButton}
              icon="phone"
              onPress={() => handleCall(item.phone)}
              compact
            >
              Ligar
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  // Componente de filtro
  const renderFilterChip = ({ item }: { item: typeof businessTypes[0] }) => (
    <Chip
      selected={selectedType === item.id}
      onPress={() => setSelectedType(item.id)}
      style={[
        styles.filterChip,
        selectedType === item.id && styles.filterChipSelected
      ]}
      icon={item.icon}
      showSelectedOverlay
      mode={selectedType === item.id ? 'flat' : 'outlined'}
    >
      {item.label}
    </Chip>
  );

  // Loading state
  if (isLoading && !refreshing && businesses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Carregando estabelecimentos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>Estabelecimentos</Title>
          <Paragraph style={styles.headerSubtitle}>
            Descubra lojas, restaurantes e atrações locais
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Barra de Pesquisa */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar estabelecimentos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.search}
          icon="magnify"
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {/* <Button 
          mode="contained" 
          onPress={handleSearch}
          style={styles.searchButton}
          icon="magnify"
        >
        "Buscar"
        </Button> */}
      </View>

      {/* Filtros por Tipo */}
      <Card style={styles.filtersCard}>
        <Card.Content>
          <Text style={styles.filtersTitle}>Categorias</Text>
          <FlatList
            horizontal
            data={businessTypes}
            renderItem={renderFilterChip}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </Card.Content>
      </Card>

      {/* Contador de Resultados */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {businesses.length} estabelecimento(s) encontrado(s)
          {selectedType !== 'all' && ` em ${businessTypes.find(t => t.id === selectedType)?.label?.toLowerCase()}`}
          {searchQuery && ` para "${searchQuery}"`}
        </Text>
      </View>

      {/* Lista de Estabelecimentos */}
      <FlatList
        data={businesses}
        renderItem={renderBusinessItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200ee']}
            tintColor="#6200ee"
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text style={styles.emptyIcon}>🏪</Text>
                <Title style={styles.emptyTitle}>Nenhum estabelecimento encontrado</Title>
                <Paragraph style={styles.emptyText}>
                  {searchQuery || selectedType !== 'all' 
                    ? 'Tente ajustar os filtros ou termos da pesquisa'
                    : 'Nenhum estabelecimento cadastrado no momento'
                  }
                </Paragraph>
                <Button 
                  mode="outlined" 
                  onPress={clearFilters}
                  style={styles.emptyButton}
                  icon="filter-remove"
                >
                  Limpar Filtros
                </Button>
              </Card.Content>
            </Card>
          ) : null
        }
      />

      {/* Snackbar para erros */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Tentar Novamente',
          onPress: () => loadBusinesses(),
        }}
      >
        {error || 'Erro ao carregar dados'}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerCard: {
    marginBottom: 6,
    backgroundColor: '#6200ee',
    elevation: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  search: {
    flex: 1,
    elevation: 2,
  },
  searchButton: {
    elevation: 2,
  },
  filtersCard: {
    marginBottom: 16,
    elevation: 2,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  filtersList: {
    paddingVertical: 4,
  },
  filterChip: {
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#6200ee',
  },
  resultsInfo: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  list: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    height: 160,
  },
  cardContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  businessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeChip: {
    height: 28,
  },
  typeChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  verifiedChip: {
    height: 28,
    backgroundColor: '#4CAF50',
  },
  verifiedChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
    marginRight: 6,
  },
  ratingNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  businessDescription: {
    marginBottom: 12,
    lineHeight: 20,
    color: '#aca6a6ff',
    fontSize: 14,
  },
  businessDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
    fontSize: 16,
    marginTop: 2,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#aca6a6ff',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  actionButton: {
    minWidth: 100,
  },
  emptyCard: {
    marginTop: 40,
    alignItems: 'center',
    elevation: 2,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aca6a6ff',
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 8,
  },
});

export default BusinessScreen;