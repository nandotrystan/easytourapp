import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  Text,
  Divider,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CreateTourData } from '../types';

const CreateTourScreen: React.FC = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    basePrice: '',
    maxPeople: '',
    extraPersonPrice: '',
    duration: '',
    category: '',
    meetingPoint: '',
    includes: [] as string[],
    requirements: '',
    image: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIncludeToggle = (item: string) => {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.includes(item)
        ? prev.includes.filter(i => i !== item)
        : [...prev.includes, item]
    }));
  };

  const handleSubmit = async () => {
    if (!token || !user) {
      Alert.alert('Erro', 'Você precisa estar logado para criar um passeio');
      return;
    }

    // Validação básica
    if (!formData.title || !formData.description || !formData.location || !formData.basePrice || !formData.maxPeople) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios (*)');
      return;
    }

    // Validação de números
    if (isNaN(parseFloat(formData.basePrice)) || parseFloat(formData.basePrice) <= 0) {
      Alert.alert('Atenção', 'Preço base deve ser um número válido maior que zero');
      return;
    }

    if (isNaN(parseInt(formData.maxPeople)) || parseInt(formData.maxPeople) <= 0) {
      Alert.alert('Atenção', 'Número máximo de pessoas deve ser um número válido maior que zero');
      return;
    }

    if (formData.extraPersonPrice && (isNaN(parseFloat(formData.extraPersonPrice)) || parseFloat(formData.extraPersonPrice) < 0)) {
      Alert.alert('Atenção', 'Preço por pessoa extra deve ser um número válido');
      return;
    }

    setIsLoading(true);

    try {
      const tourData: CreateTourData = {
        title: formData.title,
        description: formData.description,
        guide_id: user.id,
        base_price: parseFloat(formData.basePrice),
        max_people: parseInt(formData.maxPeople),
        location: formData.location,
        duration: formData.duration,
      };

      // Adicionar campos opcionais apenas se preenchidos
      if (formData.extraPersonPrice.trim() !== '') {
        tourData.extra_person_price = parseFloat(formData.extraPersonPrice);
      }

      if (formData.image.trim() !== '') {
        tourData.image = formData.image;
      }

      console.log('📤 Enviando dados do passeio:', tourData);

      const result = await api.createTour(tourData, token);
      
      Alert.alert(
        'Sucesso!',
        result.message || 'Passeio criado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Erro ao criar passeio:', error);
      Alert.alert('Erro', error.message || 'Não foi possível criar o passeio');
    } finally {
      setIsLoading(false);
    }
  };

  const includeOptions = [
    'Guia local',
    'Transporte',
    'Ingressos',
    'Refeição',
    'Seguro',
    'Fotos',
    'WiFi',
    'Água'
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Criar Novo Passeio</Title>
          <Paragraph style={styles.subtitle}>
            Preencha as informações do seu passeio turístico
          </Paragraph>

          <TextInput
            label="Título do Passeio *"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            style={styles.input}
            mode="outlined"
            placeholder="Nome do seu passeio turístico"
          />

          <TextInput
            label="Descrição *"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Descreva detalhadamente o passeio"
          />

          <TextInput
            label="Localização *"
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
            style={styles.input}
            mode="outlined"
            placeholder="Cidade, ponto turístico, etc."
          />

          <View style={styles.row}>
            <TextInput
              label="Preço Base (R$) *"
              value={formData.basePrice}
              onChangeText={(value) => handleInputChange('basePrice', value)}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              keyboardType="numeric"
              placeholder="0.00"
            />
            
            <TextInput
              label="Máx. Pessoas *"
              value={formData.maxPeople}
              onChangeText={(value) => handleInputChange('maxPeople', value)}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              keyboardType="numeric"
              placeholder="10"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              label="Preço por Pessoa Extra (R$)"
              value={formData.extraPersonPrice}
              onChangeText={(value) => handleInputChange('extraPersonPrice', value)}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              keyboardType="numeric"
              placeholder="Opcional"
            />
            
            <TextInput
              label="Duração"
              value={formData.duration}
              onChangeText={(value) => handleInputChange('duration', value)}
              style={[styles.input, styles.halfInput]}
              mode="outlined"
              placeholder="ex: 4 horas"
            />
          </View>

          <TextInput
            label="URL da Imagem"
            value={formData.image}
            onChangeText={(value) => handleInputChange('image', value)}
            style={styles.input}
            mode="outlined"
            placeholder="https://exemplo.com/imagem.jpg (opcional)"
          />

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>Detalhes Adicionais</Title>
          
          <TextInput
            label="Categoria"
            value={formData.category}
            onChangeText={(value) => handleInputChange('category', value)}
            style={styles.input}
            mode="outlined"
            placeholder="ex: Histórico, Aventura, Cultural"
          />

          <TextInput
            label="Ponto de Encontro"
            value={formData.meetingPoint}
            onChangeText={(value) => handleInputChange('meetingPoint', value)}
            style={styles.input}
            mode="outlined"
            placeholder="Local onde o grupo se encontrará"
          />

          <TextInput
            label="Requisitos e Recomendações"
            value={formData.requirements}
            onChangeText={(value) => handleInputChange('requirements', value)}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={2}
            placeholder="Idade mínima, condição física, o que levar, etc."
          />

          <Title style={styles.sectionTitle}>O que está incluído?</Title>
          <View style={styles.chipsContainer}>
            {includeOptions.map((option) => (
              <Chip
                key={option}
                selected={formData.includes.includes(option)}
                onPress={() => handleIncludeToggle(option)}
                style={styles.chip}
                mode={formData.includes.includes(option) ? 'flat' : 'outlined'}
              >
                {option}
              </Chip>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.button}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
              icon="check"
            >
              Criar Passeio
            </Button>
          </View>

          <Text style={styles.requiredText}>* Campos obrigatórios</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  divider: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
  requiredText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default CreateTourScreen;