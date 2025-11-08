import React, { useState, useEffect, JSX } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Linking } from 'react-native';
import { Card, Title, Paragraph, Chip, Searchbar, Button, Text, ActivityIndicator } from 'react-native-paper';
import { Business } from '../types';
import { api } from '../services/api';

const BusinessScreen: React.FC = () => { // ← Remove as props
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await api.getBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadBusinesses();
    setRefreshing(false);
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || business.type === selectedType;
    return matchesSearch && matchesType;
  });

  const businessTypes = [
    { id: 'all', label: 'Todos', icon: 'store' },
    { id: 'restaurant', label: 'Restaurantes', icon: 'silverware-fork-knife' },
    { id: 'store', label: 'Lojas', icon: 'shopping' },
    { id: 'hotel', label: 'Hotéis', icon: 'bed' },
    { id: 'attraction', label: 'Atrações', icon: 'camera' },
  ];

  const getTypeIcon = (type: string): string => {
    const typeConfig = businessTypes.find(t => t.id === type);
    return typeConfig?.icon || 'store';
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'restaurant': return '#E91E63';
      case 'store': return '#2196F3';
      case 'hotel': return '#4CAF50';
      case 'attraction': return '#FF9800';
      default: return '#9C27B0';
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'restaurant': return 'Restaurante';
      case 'store': return 'Loja';
      case 'hotel': return 'Hotel';
      case 'attraction': return 'Atração';
      default: return type;
    }
  };

  const handleCall = (phone?: string): void => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleOpenMaps = (address: string): void => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
  };

  const handleOpenWebsite = (website?: string): void => {
    if (website) {
      Linking.openURL(website);
    }
  };

  const renderRatingStars = (rating: number): JSX.Element => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    
    if (hasHalfStar) {
      stars.push('⭐');
    }
    
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>{stars.join('')}</Text>
        <Text style={styles.ratingNumber}>({rating})</Text>
      </View>
    );
  };

  const renderBusinessItem = ({ item }: { item: Business }) => (
    <Card style={styles.card} mode="elevated" elevation={3}>
      <Card.Cover 
        source={{ uri: item.image || 'https://via.placeholder.com/300x200?text=Estabelecimento' }} 
        style={styles.cardImage}
      />
      <Card.Content style={styles.cardContent}>
        <View style={styles.businessHeader}>
          <View style={styles.titleContainer}>
            <Title style={styles.businessTitle} numberOfLines={2}>{item.name}</Title>
            <Chip 
              icon={getTypeIcon(item.type)}
              style={[styles.typeChip, { backgroundColor: getTypeColor(item.type) }]}
              textStyle={styles.typeChipText}
              compact
            >
              {getTypeLabel(item.type)}
            </Chip>
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
              mode="outlined" 
              style={styles.actionButton}
              icon="phone"
              onPress={() => handleCall(item.phone)}
              compact
            >
              Ligar
            </Button>
          )}
          
          {item.website && (
            <Button 
              mode="outlined" 
              style={styles.actionButton}
              icon="web"
              onPress={() => handleOpenWebsite(item.website)}
              compact
            >
              Site
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

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

  if (isLoading) {
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
      <Searchbar
        placeholder="Buscar estabelecimentos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
        icon="magnify"
      />

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
          {filteredBusinesses.length} estabelecimento(s) encontrado(s)
          {selectedType !== 'all' && ` em ${businessTypes.find(t => t.id === selectedType)?.label?.toLowerCase()}`}
          {searchQuery && ` para "${searchQuery}"`}
        </Text>
      </View>

      {/* Lista de Estabelecimentos */}
      {filteredBusinesses.length === 0 ? (
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
              onPress={() => {
                setSearchQuery('');
                setSelectedType('all');
              }}
              style={styles.emptyButton}
              icon="filter-remove"
            >
              Limpar Filtros
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={filteredBusinesses}
          renderItem={renderBusinessItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
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
    marginBottom: 15,
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
  search: {
    marginBottom: 15,
    elevation: 2,
  },
  filtersCard: {
    marginBottom: 15,
    elevation: 2,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  filtersList: {
    paddingVertical: 5,
  },
  filterChip: {
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#6200ee',
  },
  resultsInfo: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
    elevation: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    height: 160,
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  businessTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 22,
  },
  typeChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  typeChipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  businessDescription: {
    marginBottom: 12,
    lineHeight: 20,
    color: '#555',
    fontSize: 14,
  },
  businessDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 80,
    marginHorizontal: 2,
  },
  emptyCard: {
    marginTop: 50,
    alignItems: 'center',
    elevation: 2,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 10,
  },
});

export default BusinessScreen;