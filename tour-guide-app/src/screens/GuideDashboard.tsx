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

const GuideDashboard: React.FC = () => {
  const { user, token, userType } = useAuth();

  console.log("🔐 DEBUG AUTH CONTEXT:");
  console.log("- Token presente:", !!token);
  console.log("- Token:", token);
  console.log("- User:", user);
  console.log("- UserType:", userType);
  const router = useRouter();

  const [tourRequests, setTourRequests] = useState<TourRequest[]>([]);
  const [myTours, setMyTours] = useState<Tour[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"requests" | "tours">("requests");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    try {
      setIsLoading(true);

      if (token) {
        const [requests, tours] = await Promise.all([
          api.getMyTourRequests(token),
          api.getMyTours(token),
        ]);

        setTourRequests(requests);
        setMyTours(tours);
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
    await AsyncStorage.multiRemove(["userToken", "userData", "userType"]);
    router.replace("/login");
    console.log("✅ LOGOUT - Bypass completed");
  };

  const handleCreateTour = (): void => {
    router.push("/create-tour");
  };

  const handleViewTourDetails = (tourId: string): void => {
    router.push(`/tour-details/${tourId}`);
  };

  const handleEditTour = (tourId: string): void => {
    Alert.alert(
      "Editar Passeio",
      "A funcionalidade de edição estará disponível em breve!",
      [
        {
          text: "OK",
          style: "default",
        },
        {
          text: "Ver Detalhes",
          onPress: () => handleViewTourDetails(tourId),
        },
      ]
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      case "cancelled":
        return "#9E9E9E";
      default:
        return "#FF9800";
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
      default:
        return "Pendente";
    }
  };

  const handleApproveRequest = async (requestId: string): Promise<void> => {
    console.log("=== 🎯 handleApproveRequest INICIADO ===");
    console.log("Request ID:", requestId);
    console.log("Token disponível:", !!token);
    console.log("Token:", token);

    if (!token) {
      console.log("❌ ERRO: Token não encontrado");
      Alert.alert("Erro", "Token de autenticação não encontrado");
      return;
    }

    console.log("🔄 Executando aprovação diretamente...");

    try {
      setProcessingRequest(requestId);
      console.log("📤 Chamando api.approveTourRequest...");

      const result = await api.approveTourRequest(requestId, token);
      console.log("✅ API RESPONSE:", result);

      Alert.alert("Sucesso", "Solicitação aprovada com sucesso!");
      console.log("✅ Alert exibido");

      console.log("🔄 Atualizando estado local...");
      setTourRequests((prev) => {
        const updated = prev.map((req) =>
          req.id === requestId ? { ...req, status: "approved" as const } : req
        );
        console.log("✅ Estado atualizado:", updated);
        return updated;
      });
    } catch (error: any) {
      console.error("❌ ERRO COMPLETO:", error);
      console.error("❌ Mensagem:", error.message);
      console.error("❌ Stack:", error.stack);
      Alert.alert("Erro", error.message || "Erro desconhecido");
    } finally {
      setProcessingRequest(null);
      console.log("🏁 Processamento finalizado");
    }
  };

  const handleRejectRequest = async (requestId: string): Promise<void> => {
    console.log("🎯 handleRejectRequest chamado com ID:", requestId);

    if (!token) {
      console.log("❌ Token não encontrado");
      Alert.alert("Erro", "Token de autenticação não encontrado");
      return;
    }

    Alert.alert(
      "Rejeitar Solicitação",
      "Deseja rejeitar esta solicitação de passeio?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => console.log("❌ Rejeição cancelada pelo usuário"),
        },
        {
          text: "Rejeitar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("✅ Usuário confirmou rejeição");
              setProcessingRequest(requestId);
              console.log("🔄 Chamando api.rejectTourRequest...");

              const result = await api.rejectTourRequest(requestId, token);
              console.log("✅ Resposta da API:", result);

              Alert.alert("Sucesso", "Solicitação rejeitada");

              setTourRequests((prev) =>
                prev.map((req) =>
                  req.id === requestId
                    ? { ...req, status: "rejected" as const }
                    : req
                )
              );

              console.log("✅ Estado atualizado localmente");
            } catch (error: any) {
              console.error("❌ Erro completo ao rejeitar:", error);
              console.error("🔍 Mensagem de erro:", error.message);
              console.error("🔍 Stack trace:", error.stack);
              Alert.alert(
                "Erro",
                error.message || "Não foi possível rejeitar a solicitação"
              );
            } finally {
              setProcessingRequest(null);
              console.log("🏁 Processamento finalizado");
            }
          },
        },
      ]
    );
  };

  const filteredRequests = tourRequests.filter(
    (request) =>
      request.touristName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.date.includes(searchQuery) ||
      request.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTours = myTours.filter(
    (tour) =>
      tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderRequestsTab = () => (
    <View>
      <Searchbar
        placeholder="Buscar solicitações..."
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
                : "Nenhuma solicitação recebida"}
            </Text>
          </Card.Content>
        </Card>
      ) : (
        filteredRequests.map((request) => (
          <Card key={request.id} style={styles.requestCard} mode="outlined">
            <Card.Content>
              <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                  <Title style={styles.requestTitle}>
                    {request.touristName}
                  </Title>
                  <Paragraph style={styles.requestSubtitle}>
                    Solicitação #{request.id.slice(0, 8)}
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
                  <>
                    <Button
                      mode="contained"
                      onPress={() => handleApproveRequest(request.id)}
                      disabled={processingRequest === request.id}
                      loading={processingRequest === request.id}
                      style={[styles.actionButton, styles.approveButton]}
                      icon="check"
                    >
                      {processingRequest === request.id
                        ? "Processando..."
                        : "Aprovar"}
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => handleRejectRequest(request.id)}
                      disabled={processingRequest === request.id}
                      style={[styles.actionButton, styles.rejectButton]}
                      icon="close"
                      textColor="#F44336"
                    >
                      Rejeitar
                    </Button>
                  </>
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

  const renderToursTab = () => (
    <View>
      <View style={styles.createTourSection}>
        <Button
          mode="contained"
          onPress={handleCreateTour}
          style={styles.createTourButton}
          icon="plus"
        >
          Criar Novo Passeio
        </Button>
      </View>

      <Searchbar
        placeholder="Buscar meus passeios..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
      />

      {filteredTours.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Nenhum passeio encontrado"
                : "Você ainda não criou passeios"}
            </Text>
            <Button
              mode="contained"
              onPress={handleCreateTour}
              style={styles.createTourButton}
              icon="plus"
            >
              Criar Primeiro Passeio
            </Button>
          </Card.Content>
        </Card>
      ) : (
        filteredTours.map((tour) => (
          <Card key={tour.id} style={styles.tourCard} mode="outlined">
            <Card.Cover
              source={{
                uri:
                  tour.image ||
                  "https://via.placeholder.com/300x200?text=Imagem+do+Passeio",
              }}
              style={styles.tourImage}
            />
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
                  R$ {tour.basePrice.toFixed(2)}
                </Chip>
                <Chip
                  icon="account-group"
                  style={styles.tourChip}
                  mode="outlined"
                >
                  Máx: {tour.maxPeople}
                </Chip>
                <Chip icon="star" style={styles.tourChip} mode="outlined">
                  ⭐ {tour.rating || "Novo"}
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
                  onPress={() => handleEditTour(tour.id)}
                  style={styles.tourActionButton}
                  icon="pencil"
                >
                  Editar
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
    <ProtectedRoute requiredUserType="guide">
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
        {/* Header com informações do guia */}
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
                      Guia Turístico
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
                icon="bell"
              >
                Solicitações (
                {tourRequests.filter((r) => r.status === "pending").length})
              </Button>
              <Button
                mode={activeTab === "tours" ? "contained" : "outlined"}
                onPress={() => setActiveTab("tours")}
                style={styles.tabButton}
                icon="map"
              >
                Meus Passeios ({myTours.length})
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Conteúdo principal */}
        <Card style={styles.contentSection}>
          <Card.Content>
            {activeTab === "requests" && renderRequestsTab()}
            {activeTab === "tours" && renderToursTab()}
          </Card.Content>
        </Card>

        {/* Estatísticas */}
        {activeTab === "requests" && (
          <Card style={styles.statsSection}>
            <Card.Content>
              <Title style={styles.statsTitle}>Resumo das Solicitações</Title>
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
                  <Text style={[styles.statNumber, styles.rejected]}>
                    {
                      tourRequests.filter(
                        (r) =>
                          r.status === "rejected" || r.status === "cancelled"
                      ).length
                    }
                  </Text>
                  <Text style={styles.statLabel}>Rejeitadas</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
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
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  search: {
    marginBottom: 16,
  },
  createTourSection: {
    marginBottom: 16,
  },
  createTourButton: {
    marginBottom: 8,
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
  approveButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
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
  rejected: {
    color: "#F44336",
  },
});

export default GuideDashboard;
