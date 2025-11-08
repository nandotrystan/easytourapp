import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert, Platform } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Chip,
  Divider,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { Tour, TourReview } from "../types";
import { api } from "../services/api";
import Rating from "../components/Rating";
import ReviewModal from "../components/ReviewModal";

// Importação condicional do DateTimePicker
let DateTimePicker: any = null;
if (Platform.OS !== "web") {
  try {
    DateTimePicker = require("@react-native-community/datetimepicker").default;
  } catch (error) {
    console.warn("DateTimePicker não disponível:", error);
  }
}

// Componente DatePicker para Web
const WebDatePicker: React.FC<{
  value: string;
  onChange: (date: string) => void;
  error?: boolean;
}> = ({ value, onChange, error }) => {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={new Date().toISOString().split("T")[0]}
      style={{
        padding: "10px",
        border: error ? "2px solid #d32f2f" : "2px solid #6200ee",
        borderRadius: "8px",
        fontSize: "14px",
        width: "100%",
        backgroundColor: "#ffffff",
        fontFamily: "System",
        color: "#000000",
      }}
    />
  );
};


const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return "#15803d"; // Verde escuro
  if (rating >= 4.0) return "#1d4ed8"; // Azul escuro
  if (rating >= 3.0) return "#a16207"; // Amarelo escuro
  if (rating >= 2.0) return "#c2410c"; // Laranja escuro
  return "#b91c1c"; // Vermelho escuro
};

const getRatingBackgroundColor = (rating: number): string => {
  if (rating >= 4.5) return "#dcfce7";
  if (rating >= 4.0) return "#dbeafe";
  if (rating >= 3.0) return "#fef9c3";
  if (rating >= 2.0) return "#ffedd5";
  return "#fee2e2";
};

const TourDetailScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user, userType, token } = useAuth();
  const router = useRouter();

  const [tour, setTour] = useState<Tour | null>(null);
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [peopleCount, setPeopleCount] = useState<string>("1");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [errors, setErrors] = useState<{
    date?: string;
    people?: string;
  }>({});

  useEffect(() => {
    if (id) {
      loadTour();
      loadReviews();
    }
  }, [id]);

  const loadTour = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const tourData = await api.getTour(id!);
      setTour(tourData);
    } catch (error: any) {
      console.error("Error loading tour:", error);
      Alert.alert("Erro", "Não foi possível carregar os detalhes do passeio.");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async (): Promise<void> => {
    if (!id) return;

    try {
      setIsLoadingReviews(true);
      const reviewsData = await api.getTourReviews(id);
      setReviews(reviewsData);
    } catch (error: any) {
      console.error("Error loading reviews:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (
    rating: number,
    comment?: string
  ): Promise<void> => {
    if (!tour || !user || !token) {
      Alert.alert("Erro", "Não foi possível enviar a avaliação");
      return;
    }

    try {
      const response = await api.createTourReview(
        {
          tour_id: tour.id,
          rating,
          comment: comment || "",
        },
        token
      );

      Alert.alert("Sucesso!", response.message);
      await loadReviews();
    } catch (error: any) {
      console.error("Erro ao enviar avaliação:", error);

      let errorMessage = "Não foi possível enviar a avaliação";
      if (
        error.message?.includes("já avaliou") ||
        error.message?.includes("já existe")
      ) {
        errorMessage = "Você já avaliou este passeio";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Erro", errorMessage);
      throw error;
    }
  };

  const hasUserReviewed = (): boolean => {
    if (!user || !reviews) return false;
    return reviews.some((review) => review.tourist_id === user.id);
  };

  const canReview = userType === "tourist" && !hasUserReviewed();

  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const selected = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= today;
  };

  const validatePeopleCount = (count: string): boolean => {
    const num = parseInt(count);
    return !isNaN(num) && num > 0 && num <= 20;
  };

  const calculateTotalPrice = (): number => {
    if (!tour) return 0;
    const basePeople = parseInt(peopleCount) || 1;
    let total = tour.basePrice;
    if (basePeople > tour.maxPeople && tour.extraPersonPrice) {
      const extraPeople = basePeople - tour.maxPeople;
      total += extraPeople * tour.extraPersonPrice;
    }
    return total;
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  const handleMobileDateSelect = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setSelectedDate(formattedDate);
      setDate(selectedDate);
      if (!validateDate(formattedDate)) {
        setErrors((prev) => ({
          ...prev,
          date: "A data não pode ser no passado",
        }));
      } else {
        setErrors((prev) => ({ ...prev, date: undefined }));
      }
    }
  };

  const showMobileDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleWebDateChange = (dateString: string) => {
    setSelectedDate(dateString);
    if (!validateDate(dateString)) {
      setErrors((prev) => ({
        ...prev,
        date: "A data não pode ser no passado",
      }));
    } else {
      setErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  const handlePeopleChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    setPeopleCount(numericText);
    if (!validatePeopleCount(numericText)) {
      setErrors((prev) => ({
        ...prev,
        people: "Quantidade deve ser entre 1 e 20 pessoas",
      }));
    } else {
      setErrors((prev) => ({ ...prev, people: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!selectedDate) {
      newErrors.date = "Data é obrigatória";
    } else if (!validateDate(selectedDate)) {
      newErrors.date = "A data não pode ser no passado";
    }
    if (!validatePeopleCount(peopleCount)) {
      newErrors.people = "Quantidade deve ser entre 1 e 20 pessoas";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTourRequest = async (): Promise<void> => {
    if (!validateForm()) {
      Alert.alert("Erro", "Por favor, corrija os erros antes de enviar");
      return;
    }
    if (!user || !token) {
      Alert.alert(
        "Erro",
        "Você precisa estar logado para solicitar um passeio"
      );
      router.push("/login");
      return;
    }
    if (userType !== "tourist") {
      Alert.alert("Erro", "Apenas turistas podem solicitar passeios");
      return;
    }
    if (!tour) {
      Alert.alert("Erro", "Passeio não encontrado");
      return;
    }
    setIsRequesting(true);
    try {
      const response = await api.requestTour(
        {
          tourId: tour.id,
          date: selectedDate,
          people: parseInt(peopleCount),
          totalPrice: calculateTotalPrice(),
        },
        token
      );
      Alert.alert("Sucesso!", response.message, [
        {
          text: "Ver Minhas Solicitações",
          onPress: () => router.push("/(tabs)/my-requests"),
        },
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("❌ Tour request error completo:", error);
      let errorMessage = "Não foi possível solicitar o passeio";
      if (error.message?.includes("já existe")) {
        errorMessage = "Você já tem uma solicitação pendente para este passeio";
      } else if (error.message?.includes("data indisponível")) {
        errorMessage = "Esta data não está disponível para o passeio";
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert("Erro", errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  const canRequestTour = userType === "tourist";
  const isFormValid =
    selectedDate && validatePeopleCount(peopleCount) && !isRequesting;

  const formatReviewDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const calculateAverageRating = (): number => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
  };

  const getStarRating = (rating: number): number => {
    return rating;
  };

  const renderMobileDateInput = () => {
    if (!DateTimePicker) {
      return (
        <TextInput
          value={selectedDate}
          onChangeText={setSelectedDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#666"
          style={styles.input}
          mode="outlined"
          outlineColor="#6200ee"
          activeOutlineColor="#3700b3"
          error={!!errors.date}
          editable={!isRequesting}
          theme={{
            colors: {
              primary: "#6200ee",
              text: "#000000",
              placeholder: "#666666",
              background: "#ffffff",
            },
          }}
        />
      );
    }

    return (
      <>
        <TextInput
          value={selectedDate ? formatDateForDisplay(selectedDate) : ""}
          onFocus={showMobileDatepicker}
          showSoftInputOnFocus={false}
          placeholder="Selecionar data"
          placeholderTextColor="#666"
          style={styles.input} // ✅ REMOVER styles.dateInput extra
          mode="outlined"
          outlineColor="#6200ee"
          activeOutlineColor="#3700b3"
          error={!!errors.date}
          editable={!isRequesting}
          right={
            <TextInput.Icon
              icon="calendar"
              onPress={showMobileDatepicker}
              color="#6200ee"
            />
          }
          theme={{
            colors: {
              primary: "#6200ee",
              text: "#000000",
              placeholder: "#666666",
              background: "#ffffff",
            },
          }}
        />

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleMobileDateSelect}
            minimumDate={new Date()}
          />
        )}
      </>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!tour) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>😞</Text>
        <Title style={styles.errorTitle}>Passeio não encontrado</Title>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          Voltar
        </Button>
      </View>
    );
  }

  const averageRating = calculateAverageRating();
  const displayRating = tour.rating || averageRating;
  const ratingColor = getRatingColor(displayRating);
  const ratingBackgroundColor = getRatingBackgroundColor(displayRating);
  const starRating = getStarRating(displayRating);

  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Cover
            source={{
              uri:
                tour.image ||
                "https://via.placeholder.com/300x200?text=Imagem+do+Passeio",
            }}
            style={styles.tourImage}
          />
          <Card.Content style={styles.content}>
            <Title style={styles.title}>{tour.title}</Title>
            <Paragraph style={styles.description}>{tour.description}</Paragraph>

            <View style={styles.details}>
              <Chip style={styles.chip} textStyle={styles.chipText}>
                👤 {tour.guide}
              </Chip>
              <Chip style={styles.chip} textStyle={styles.chipText}>
                📍 {tour.location}
              </Chip>
              <Chip style={styles.chip} textStyle={styles.chipText}>
                ⏰ {tour.duration}
              </Chip>

              <Chip
                style={[
                  styles.ratingChip,
                  { backgroundColor: ratingBackgroundColor },
                ]}
                textStyle={[styles.chipText, { color: ratingColor }]}
              >
                <View style={styles.ratingContainer}>
                  <Rating
                    rating={starRating}
                    size={16}
                    readonly
                    starColor={ratingColor}
                  />
                  <Text style={[styles.ratingText, { color: ratingColor }]}>
                    {displayRating.toFixed(1)}
                  </Text>
                </View>
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.pricing}>
              <Title style={styles.sectionTitle}>💲 Preços</Title>
              <View style={styles.pricingItem}>
                <Text style={styles.pricingLabel}>
                  Preço base (até {tour.maxPeople} pessoas):
                </Text>
                <Text style={styles.pricingValue}>
                  R$ {tour.basePrice.toFixed(2)}
                </Text>
              </View>
              {tour.extraPersonPrice && tour.extraPersonPrice > 0 && (
                <View style={styles.pricingItem}>
                  <Text style={styles.pricingLabel}>Pessoa extra:</Text>
                  <Text style={styles.pricingValue}>
                    + R$ {tour.extraPersonPrice.toFixed(2)} por pessoa
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.reviewSection,
                { backgroundColor: ratingBackgroundColor },
              ]}
            >
              <View style={styles.reviewSectionHeader}>
                <Title style={styles.sectionTitle}>⭐ Avaliações</Title>
                <View style={styles.ratingDisplay}>
                  <Text style={[styles.ratingValue, { color: ratingColor }]}>
                    {displayRating.toFixed(1)}
                  </Text>
                  <View style={styles.ratingStarsContainer}>
                    <Rating
                      rating={starRating}
                      size={18}
                      readonly
                      starColor={ratingColor}
                    />
                    <Text style={[styles.ratingCount, { color: ratingColor }]}>
                      {reviews.length}
                    </Text>
                  </View>
                </View>
              </View>

              {canReview && (
                <Button
                  mode="contained"
                  onPress={() => setShowReviewModal(true)}
                  style={[
                    styles.reviewButton,
                    { backgroundColor: ratingColor },
                  ]}
                  icon="star"
                  labelStyle={styles.reviewButtonLabel}
                >
                  Avaliar Passeio
                </Button>
              )}

              {hasUserReviewed() && (
                <View style={styles.alreadyReviewed}>
                  <Text style={styles.alreadyReviewedText}>
                    ✅ Você já avaliou este passeio
                  </Text>
                </View>
              )}

              <View style={styles.reviewsList}>
                {isLoadingReviews ? (
                  <ActivityIndicator size="small" color={ratingColor} />
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <View key={review.id} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewUserInfo}>
                          <Text style={styles.reviewUserName}>
                            {review.tourist_name || "Usuário"}
                          </Text>
                          <Text style={styles.reviewDate}>
                            {formatReviewDate(review.created_at)}
                          </Text>
                        </View>
                        <View style={styles.reviewRating}>
                          <Rating
                            rating={review.rating}
                            size={16}
                            readonly
                            starColor={getRatingColor(review.rating)}
                          />
                          <Text
                            style={[
                              styles.reviewRatingValue,
                              { color: getRatingColor(review.rating) },
                            ]}
                          >
                            {review.rating.toFixed(1)}
                          </Text>
                        </View>
                      </View>
                      {review.comment && (
                        <Text style={styles.reviewComment}>
                          {review.comment}
                        </Text>
                      )}
                      <Divider style={styles.reviewDivider} />
                    </View>
                  ))
                ) : (
                  <View style={styles.noReviews}>
                    <Text style={styles.noReviewsIcon}>⭐</Text>
                    <Text style={styles.noReviewsText}>
                      Este passeio ainda não possui avaliações.
                    </Text>
                    <Text style={styles.noReviewsSubtext}>
                      Seja o primeiro a avaliar!
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {canRequestTour && (
              <>
                <Divider style={styles.divider} />

                <Title style={styles.sectionTitle}>📅 Solicitar Passeio</Title>

                <View style={styles.formColumn}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Data do Passeio *</Text>
                    {Platform.OS === "web" ? (
                      <WebDatePicker
                        value={selectedDate}
                        onChange={handleWebDateChange}
                        error={!!errors.date}
                      />
                    ) : (
                      renderMobileDateInput()
                    )}
                    {errors.date && (
                      <Text style={styles.errorText}>{errors.date}</Text>
                    )}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Quantidade de Pessoas *</Text>
                    <TextInput
                      value={peopleCount}
                      onChangeText={handlePeopleChange}
                      keyboardType="numeric"
                      placeholder="Ex: 2"
                      placeholderTextColor="#666"
                      style={styles.input}
                      mode="outlined"
                      outlineColor="#6200ee"
                      activeOutlineColor="#3700b3"
                      error={!!errors.people}
                      editable={!isRequesting}
                      theme={{
                        colors: {
                          primary: "#6200ee",
                          text: "#000000",
                          placeholder: "#666666",
                          background: "#ffffff",
                        },
                      }}
                    />
                    {errors.people && (
                      <Text style={styles.errorText}>{errors.people}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.total}>
                  <Text style={styles.totalLabel}>Total do Passeio:</Text>
                  <Text style={styles.totalPrice}>
                    R$ {calculateTotalPrice().toFixed(2)}
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={handleTourRequest}
                  loading={isRequesting}
                  disabled={!isFormValid}
                  style={[
                    styles.requestButton,
                    !isFormValid && styles.disabledButton,
                  ]}
                  icon="send"
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  {isRequesting ? "Enviando..." : "Solicitar Passeio"}
                </Button>

                <Text style={styles.helperText}>* Campos obrigatórios</Text>
              </>
            )}

            {userType === "guide" && user?.id === tour.guideId && (
              <Button
                mode="outlined"
                onPress={() => router.push("/(tabs)/dashboard")}
                style={styles.guideButton}
                icon="chart-line"
                labelStyle={styles.outlinedButtonLabel}
              >
                Gerenciar Passeio
              </Button>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <ReviewModal
        visible={showReviewModal}
        onDismiss={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        type="tour"
        title={tour.title}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  card: {
    margin: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "hidden",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    textAlign: "center",
    marginBottom: 16,
    color: "#dc2626",
    fontSize: 20,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 10,
    backgroundColor: "#6366f1",
  },
  tourImage: {
    height: 280,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 12,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: "#475569",
    textAlign: "center",
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 10,
    justifyContent: "center",
  },
  chip: {
    backgroundColor: "#6366f1",
  },
  chipText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13,
  },
  ratingChip: {
    borderWidth: 2,
    borderColor: "transparent",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  reviewSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  reviewSectionHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  ratingDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
    flexWrap: "nowrap",
  },
  ratingStarsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: "bold",
    minWidth: 40,
  },
  ratingCount: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  reviewButton: {
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 8,
  },
  reviewButtonLabel: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  alreadyReviewed: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  alreadyReviewedText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewsList: {
    marginTop: 8,
  },
  reviewItem: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontWeight: "bold",
    color: "#1e293b",
    fontSize: 16,
  },
  reviewDate: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  reviewRating: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  reviewRatingValue: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  reviewDivider: {
    marginTop: 12,
    backgroundColor: "#e2e8f0",
    height: 1,
  },
  noReviews: {
    alignItems: "center",
    padding: 24,
  },
  noReviewsIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noReviewsText: {
    textAlign: "center",
    color: "#475569",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  noReviewsSubtext: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 14,
    fontStyle: "italic",
  },
  divider: {
    marginVertical: 24,
    backgroundColor: "#e2e8f0",
    height: 2,
  },
  pricing: {
    marginBottom: 24,
    backgroundColor: "#f1f5f9",
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#6366f1",
  },
  sectionTitle: {
    marginBottom: 16,
    color: "#1e293b",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  pricingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  pricingLabel: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  pricingValue: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "bold",
  },
  formColumn: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
    width: "80%",
  },
  halfInput: {
    flex: 1,
    minHeight: 80,
  },
  dateInputWrapper: {
    flex: 1,
  },
  dateInput: {
    backgroundColor: "#ffffff",
    fontSize: 14,
  },
  peopleInput: {
    backgroundColor: "#ffffff",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#ffffff",
    fontSize: 14,
    color: "#000000",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 6,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 5,
    fontWeight: "500",
  },
  total: {
    backgroundColor: "#22c55e",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  requestButton: {
    marginTop: 10,
    paddingVertical: 12,
    backgroundColor: "#6366f1",
    borderRadius: 12,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
  },
  buttonContent: {
    height: 52,
  },
  buttonLabel: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
  },
  outlinedButtonLabel: {
    color: "#6366f1",
    fontSize: 15,
    fontWeight: "600",
  },
  helperText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
    marginTop: 12,
    fontStyle: "italic",
  },
  guideButton: {
    marginTop: 16,
    borderColor: "#6366f1",
    borderWidth: 2,
    borderRadius: 12,
  },
});

export default TourDetailScreen;
