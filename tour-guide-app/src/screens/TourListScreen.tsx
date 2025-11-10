import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Searchbar, Button, Chip, Text, ActivityIndicator } from 'react-native-paper';
import { Tour } from '../types';
import { api } from '../services/api';
import { useRouter } from 'expo-router';

const TourListScreen: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getTours();
      setTours(data);
    } catch (error: any) {
      console.error('Error loading tours:', error);
      setError('Erro ao carregar passeios. Tente novamente.');
      Alert.alert('Erro', 'Não foi possível carregar os passeios.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadTours();
    setRefreshing(false);
  };

  const handleTourPress = (tour: Tour): void => {
    router.push({
      pathname: '/tour-details/[id]',
      params: { id: tour.id }
    } as any);
  };

  const filteredTours = tours.filter(tour =>
    tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.guide.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTourItem = ({ item }: { item: Tour }) => (
    <Card 
      style={styles.card} 
      onPress={() => handleTourPress(item)}
      mode="elevated"
      elevation={2}
    >
      <Card.Cover 
        source={{ uri: item.image }} 
        style={styles.cardImage}
      />
      <Card.Content style={styles.cardContent}>
        <View style={styles.tourHeader}>
          <Title style={styles.tourTitle} numberOfLines={2}>{item.title}</Title>
          <Chip 
            icon="star" 
            style={styles.ratingChip}
            textStyle={styles.ratingText}
          >
            {item.rating}
          </Chip>
        </View>
        
        <Paragraph style={styles.tourDescription} numberOfLines={2}>
          {item.description}
        </Paragraph>
        
        <View style={styles.tourDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👤</Text>
            <Paragraph style={styles.detailText}>{item.guide}</Paragraph>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📍</Text>
            <Paragraph style={styles.detailText}>{item.location}</Paragraph>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>⏱️</Text>
            <Paragraph style={styles.detailText}>{item.duration}</Paragraph>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>A partir de</Text>
          <Text style={styles.priceValue}>R$ {item.basePrice}</Text>
          {item.extraPersonPrice && item.extraPersonPrice > 0 && (
            <Text style={styles.extraPrice}>
              + R$ {item.extraPersonPrice} por pessoa extra
            </Text>
          )}
        </View>

        <Button 
          mode="contained" 
          onPress={() => handleTourPress(item)}
          style={styles.detailsButton}
          icon="arrow-right"
          contentStyle={styles.buttonContent}
        >
          Ver Detalhes
        </Button>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Carregando passeios...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>😞</Text>
        <Title style={styles.errorTitle}>Erro ao carregar</Title>
        <Paragraph style={styles.errorText}>{error}</Paragraph>
        <Button 
          mode="contained" 
          onPress={loadTours}
          style={styles.retryButton}
        >
          Tentar Novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>Passeios Disponíveis</Title>
          <Paragraph style={styles.headerSubtitle}>
            Descubra experiências incríveis com nossos guias
          </Paragraph>
        </Card.Content>
      </Card>

      <Searchbar
        placeholder="Buscar passeios, locais ou guias..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
        icon="magnify"
      />

      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredTours.length} passeio(s) encontrado(s)
          {searchQuery && ` para "${searchQuery}"`}
        </Text>
      </View>

      {filteredTours.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>🏛️</Text>
            <Title style={styles.emptyTitle}>
              {searchQuery ? 'Nenhum passeio encontrado' : 'Nenhum passeio disponível'}
            </Title>
            <Paragraph style={styles.emptyText}>
              {searchQuery 
                ? 'Tente ajustar os termos da pesquisa'
                : 'Aguarde novos passeios serem cadastrados'
              }
            </Paragraph>
            {searchQuery && (
              <Button 
                mode="outlined" 
                onPress={() => setSearchQuery('')}
                style={styles.emptyButton}
                icon="filter-remove"
              >
                Limpar Busca
              </Button>
            )}
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={filteredTours}
          renderItem={renderTourItem}
          keyExtractor={(item: Tour) => item.id}
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
    backgroundColor: "#a18d8dff",
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
    color: '#aca6a6ff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#d32f2f',
  },
  errorText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 10,
  },
  headerCard: {
    marginBottom: 15,
    backgroundColor: '#6200ee',
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
  resultsInfo: {
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  resultsText: {
    fontSize: 14,
    color: '#fcfbfbff',
    fontStyle: 'italic',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
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
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  ratingChip: {
    backgroundColor: '#FFD700',
  },
  ratingText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tourDescription: {
    marginBottom: 12,
    lineHeight: 20,
    color: '#aca6a6ff',
    fontSize: 14,
  },
  tourDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  detailText: {
    fontSize: 13,
    color: '#aca6a6ff',
  },
  priceContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  extraPrice: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  detailsButton: {
    marginTop: 4,
  },
  buttonContent: {
    height: 44,
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

export default TourListScreen;