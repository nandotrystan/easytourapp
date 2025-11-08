import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  Divider,
  Text,
  Searchbar,
  ActivityIndicator,
  Avatar,
} from "react-native-paper";
import { useAuth } from "../context/AuthContext";
import { TourRequest, Tour } from "../types";
import { api } from "../services/api";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProtectedRoute from "../components/ProtectedRoute";

const TouristDashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [tourRequests, setTourRequests] = useState<TourRequest[]>([]);
  const [favoriteTours, setFavoriteTours] = useState<Tour[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"requests" | "favorites">(
    "requests"
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true);

      if (token) {
        const requests = await api.getMyTourRequests(token);
        setTourRequests(requests);
        // Para favoritos, você pode implementar uma API específica depois
        setFavoriteTours([]);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    console.log("🔄 LOGOUT - Complete bypass solution");

    // 1. Limpar TUDO diretamente no storage
    await AsyncStorage.multiRemove(["userToken", "userData", "userType"]);

    // 2. Navegar DIRETAMENTE sem passar pelo contexto
    router.replace("/login");

    console.log("✅ LOGOUT - Bypass completed");
  };

  const handleExploreTours = (): void => {
    router.push("/(tabs)/explore");
  };

  const handleViewTourDetails = (tourId: string): void => {
    router.push(`/tour-details/${tourId}`);
  };

  const handleCancelRequest = async (requestId: string): Promise<void> => {
    console.log("=== 🎯 handleCancelRequest INICIADO ===");
    console.log("Request ID:", requestId);
    console.log("Token disponível:", !!token);

    if (!token) {
      console.log("❌ ERRO: Token não encontrado");
      Alert.alert("Erro", "Token de autenticação não encontrado");
      return;
    }

    // SOLUÇÃO: Usar window.confirm que é mais confiável no web
    const shouldCancel = window.confirm(
      "Deseja cancelar esta solicitação de passeio?"
    );

    if (!shouldCancel) {
      console.log("❌ Cancelamento cancelado pelo usuário");
      return;
    }

    console.log("✅ Usuário confirmou cancelamento");

    try {
      console.log("🔄 Chamando api.cancelTourRequest...");
      console.log("📤 Request ID:", requestId);

      const result = await api.cancelTourRequest(requestId, token);
      console.log("✅ RESPOSTA DA API - Sucesso:", result);

      Alert.alert("Sucesso", "Solicitação cancelada com sucesso!");
      console.log("✅ Alert de sucesso exibido");

      console.log("🔄 Atualizando estado local...");
      setTourRequests((prev) => {
        const updated = prev.map((req) =>
          req.id === requestId ? { ...req, status: "cancelled" as const } : req
        );
        console.log("✅ Estado atualizado. Nova lista:", updated);
        return updated;
      });
    } catch (error: any) {
      console.error("❌ ERRO COMPLETO na requisição:", error);
      console.error("❌ Mensagem de erro:", error.message);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível cancelar a solicitação"
      );
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      case "cancelled":
        return "#9E9E9E";
      case "pending":
        return "#FF9800";
      default:
        return "#2196F3";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "approved":
        return "Aprovado";
      case "rejected":
        return "Rejeitado";
      case "cancelled":
        return "Cancelado";
      case "pending":
        return "Pendente";
      default:
        return status;
    }
  };

  const filteredRequests = tourRequests.filter(
    (request) =>
      request.date.includes(searchQuery) ||
      request.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFavorites = favoriteTours.filter(
    (tour) =>
      tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRequestsTab = () => (
    <View>
      <Searchbar
        placeholder="Buscar minhas solicitações..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      {filteredRequests.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Nenhuma solicitação encontrada"
                : "Você ainda não fez solicitações"}
            </Text>
            <Button
              mode="contained"
              onPress={handleExploreTours}
              style={styles.exploreButton}
              icon="compass"
            >
              Explorar Passeios
            </Button>
          </Card.Content>
        </Card>
      ) : (
        filteredRequests.map((request) => (
          <Card key={request.id} style={styles.requestCard} mode="outlined">
            <Card.Content>
              <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                  <Title style={styles.requestTitle}>
                    Solicitação #{request.id.slice(0, 8)}
                  </Title>
                  <Paragraph style={styles.requestSubtitle}>
                    {new Date(request.date).toLocaleDateString("pt-BR")}
                  </Paragraph>
                </View>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(request.status) },
                  ]}
                  textStyle={styles.statusText}
                >
                  {getStatusText(request.status)}
                </Chip>
              </View>

              <View style={styles.requestDetails}>
                <Paragraph style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Data do passeio: </Text>
                  {new Date(request.date).toLocaleDateString("pt-BR")}
                </Paragraph>
                <Paragraph style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Nº de pessoas: </Text>
                  {request.people}
                </Paragraph>
                <Paragraph style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Valor total: </Text>
                  R$ {request.totalPrice.toFixed(2)}
                </Paragraph>
                <Paragraph style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Solicitado em: </Text>
                  {new Date(request.createdAt || "").toLocaleDateString(
                    "pt-BR"
                  )}
                </Paragraph>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.requestActions}>
                {request.status === "pending" && (
                  <Button
                    mode="outlined"
                    onPress={() => handleCancelRequest(request.id)}
                    style={[styles.actionButton, styles.cancelButton]}
                    icon="close"
                    textColor="#F44336"
                  >
                    Cancelar
                  </Button>
                )}
                <Button
                  mode="text"
                  onPress={() => handleViewTourDetails(request.tourId)}
                  style={styles.actionButton}
                  icon="information"
                >
                  Ver Passeio
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );

  const renderFavoritesTab = () => (
    <View>
      <Searchbar
        placeholder="Buscar favoritos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      {filteredFavorites.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Nenhum favorito encontrado"
                : "Você ainda não tem passeios favoritos"}
            </Text>
            <Button
              mode="contained"
              onPress={handleExploreTours}
              style={styles.exploreButton}
              icon="heart"
            >
              Explorar Passeios
            </Button>
          </Card.Content>
        </Card>
      ) : (
        filteredFavorites.map((tour) => (
          <Card key={tour.id} style={styles.tourCard} mode="outlined">
            <Card.Cover source={{ uri: tour.image }} style={styles.tourImage} />
            <Card.Content>
              <Title style={styles.tourTitle}>{tour.title}</Title>
              <Paragraph numberOfLines={2} style={styles.tourDescription}>
                {tour.description}
              </Paragraph>

              <View style={styles.tourDetails}>
                <Chip icon="map-marker" style={styles.tourChip} mode="outlined">
                  {tour.location}
                </Chip>
                <Chip icon="cash" style={styles.tourChip} mode="outlined">
                  R$ {tour.basePrice}
                </Chip>
                <Chip icon="star" style={styles.tourChip} mode="outlined">
                  ⭐ {tour.rating}
                </Chip>
              </View>

              <View style={styles.tourActions}>
                <Button
                  mode="outlined"
                  onPress={() => handleViewTourDetails(tour.id)}
                  style={styles.tourActionButton}
                  icon="eye"
                >
                  Ver Detalhes
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    /* Remover dos favoritos */
                  }}
                  style={styles.tourActionButton}
                  icon="heart-broken"
                >
                  Remover
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ProtectedRoute requiredUserType="tourist">
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2196F3"]}
            tintColor="#2196F3"
          />
        }
      >
        {/* Header com informações do turista */}
        <Card style={styles.headerSection}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.userInfo}>
                <View style={styles.avatarSection}>
                  <Avatar.Icon size={50} icon="account" style={styles.avatar} />
                  <View style={styles.userText}>
                    <Title style={styles.welcomeTitle}>
                      Olá, {user?.name}! 👋
                    </Title>
                    <Paragraph style={styles.welcomeSubtitle}>
                      Viajante
                    </Paragraph>
                  </View>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={handleLogout}
                style={styles.logoutButton}
                icon="logout"
                compact
              >
                Sair
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Seção de abas */}
        <Card style={styles.tabsSection}>
          <Card.Content>
            <View style={styles.tabsContainer}>
              <Button
                mode={activeTab === "requests" ? "contained" : "outlined"}
                onPress={() => setActiveTab("requests")}
                style={styles.tabButton}
                icon="clock"
              >
                Minhas Solicitações ({tourRequests.length})
              </Button>
              <Button
                mode={activeTab === "favorites" ? "contained" : "outlined"}
                onPress={() => setActiveTab("favorites")}
                style={styles.tabButton}
                icon="heart"
              >
                Favoritos ({favoriteTours.length})
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Conteúdo principal */}
        <Card style={styles.contentSection}>
          <Card.Content>
            {activeTab === "requests" && renderRequestsTab()}
            {activeTab === "favorites" && renderFavoritesTab()}
          </Card.Content>
        </Card>

        {/* Estatísticas */}
        <Card style={styles.statsSection}>
          <Card.Content>
            <Title style={styles.statsTitle}>Minhas Estatísticas</Title>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{tourRequests.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.pending]}>
                  {tourRequests.filter((r) => r.status === "pending").length}
                </Text>
                <Text style={styles.statLabel}>Pendentes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.approved]}>
                  {tourRequests.filter((r) => r.status === "approved").length}
                </Text>
                <Text style={styles.statLabel}>Aprovadas</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, styles.cancelled]}>
                  {tourRequests.filter((r) => r.status === "cancelled").length}
                </Text>
                <Text style={styles.statLabel}>Canceladas</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Ação rápida */}
        <Card style={styles.quickActionSection}>
          <Card.Content>
            <Title style={styles.quickActionTitle}>Próxima Aventura</Title>
            <Button
              mode="contained"
              onPress={handleExploreTours}
              style={styles.exploreButton}
              icon="compass"
            >
              Explorar Passeios Disponíveis
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </ProtectedRoute>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  headerSection: {
    margin: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 12,
    backgroundColor: "#2196F3",
  },
  userText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    color: "#666",
    fontSize: 14,
  },
  logoutButton: {
    borderColor: "#d32f2f",
  },
  tabsSection: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tabButton: {
    flex: 1,
  },
  contentSection: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  statsSection: {
    margin: 16,
    marginTop: 8,
  },
  quickActionSection: {
    margin: 16,
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  search: {
    marginBottom: 16,
  },
  exploreButton: {
    marginVertical: 8,
  },
  requestCard: {
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  requestSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailItem: {
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: "bold",
    color: "#333",
  },
  divider: {
    marginVertical: 12,
  },
  requestActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  cancelButton: {
    borderColor: "#F44336",
  },
  tourCard: {
    marginBottom: 16,
  },
  tourImage: {
    height: 160,
  },
  tourTitle: {
    fontSize: 18,
    marginTop: 8,
  },
  tourDescription: {
    color: "#666",
    marginVertical: 8,
    lineHeight: 20,
  },
  tourDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tourChip: {
    marginBottom: 4,
  },
  tourActions: {
    flexDirection: "row",
    gap: 8,
  },
  tourActionButton: {
    flex: 1,
  },
  emptyCard: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2196F3",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  pending: {
    color: "#FF9800",
  },
  approved: {
    color: "#4CAF50",
  },
  cancelled: {
    color: "#9E9E9E",
  },
});

export default TouristDashboard;
