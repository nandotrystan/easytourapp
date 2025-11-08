import {
  User,
  Tour,
  Business,
  TourRequest,
  CreateTourData,
  CreateTourRequestData,
  CreateGuideReviewData,
  GuideReview,
  TourReview,
  CreateTourReviewData,
} from "../types";

const API_BASE_URL = "http://localhost:3000/api";

interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

interface RegisterResponse {
  message: string;
  user: User;
  token: string;
}

export const api = {
  // ===== AVALIAÇÕES DE PASSEIOS =====
  createTourReview: async (
    reviewData: CreateTourReviewData,
    token: string
  ): Promise<{ message: string; review: TourReview }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tour-reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar avaliação");
      }

      return {
        message: data.message,
        review: {
          id: data.review.id.toString(),
          tour_id: data.review.tour_id.toString(),
          tourist_id: data.review.tourist_id.toString(),
          tourist_name: data.review.tourist_name,
          rating: data.review.rating,
          comment: data.review.comment,
          created_at: data.review.created_at,
        },
      };
    } catch (error) {
      console.error("Create tour review error:", error);
      throw error;
    }
  },

  getTourReviews: async (tourId: string): Promise<TourReview[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tour-reviews/tour/${tourId}`
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar avaliações");
      }

      const data = await response.json();

      return data.map((review: any) => ({
        id: review.id.toString(),
        tour_id: review.tour_id.toString(),
        tourist_id: review.tourist_id.toString(),
        tourist_name: review.tourist_name,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      }));
    } catch (error) {
      console.error("Get tour reviews error:", error);
      throw error;
    }
  },

  getMyTourReviews: async (token: string): Promise<TourReview[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tour-reviews/my-reviews`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar minhas avaliações");
      }

      const data = await response.json();

      return data.map((review: any) => ({
        id: review.id.toString(),
        tour_id: review.tour_id.toString(),
        tourist_id: review.tourist_id.toString(),
        tourist_name: review.tourist_name,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        tour_title: review.tour_title,
      }));
    } catch (error) {
      console.error("Get my tour reviews error:", error);
      throw error;
    }
  },

  updateTourReview: async (
    reviewId: string,
    rating: number,
    comment: string,
    token: string
  ): Promise<{ message: string; review: TourReview }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tour-reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar avaliação");
      }

      return {
        message: data.message,
        review: {
          id: data.review.id.toString(),
          tour_id: data.review.tour_id.toString(),
          tourist_id: data.review.tourist_id.toString(),
          tourist_name: data.review.tourist_name,
          rating: data.review.rating,
          comment: data.review.comment,
          created_at: data.review.created_at,
        },
      };
    } catch (error) {
      console.error("Update tour review error:", error);
      throw error;
    }
  },

  // ===== AVALIAÇÕES DE GUIAS =====
  createGuideReview: async (
    reviewData: CreateGuideReviewData,
    token: string
  ): Promise<{ message: string; review: GuideReview }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/guide-reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao avaliar guia");
      }

      return {
        message: data.message,
        review: {
          id: data.review.id.toString(),
          guide_id: data.review.guide_id.toString(),
          tourist_id: data.review.tourist_id.toString(),
          tourist_name: data.review.tourist_name,
          rating: data.review.rating,
          comment: data.review.comment,
          created_at: data.review.created_at,
        },
      };
    } catch (error) {
      console.error("Create guide review error:", error);
      throw error;
    }
  },

  getGuideReviews: async (guideId: string): Promise<GuideReview[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/guide-reviews/guide/${guideId}`
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar avaliações do guia");
      }

      const data = await response.json();

      return data.map((review: any) => ({
        id: review.id.toString(),
        guide_id: review.guide_id.toString(),
        tourist_id: review.tourist_id.toString(),
        tourist_name: review.tourist_name,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      }));
    } catch (error) {
      console.error("Get guide reviews error:", error);
      throw error;
    }
  },

  getGuideAverageRating: async (guideId: string): Promise<number> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/guide-reviews/guide/${guideId}/average`
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar média de avaliações");
      }

      const data = await response.json();
      return data.average_rating || 0;
    } catch (error) {
      console.error("Get guide average rating error:", error);
      return 0;
    }
  },
  // ===== AUTENTICAÇÃO =====
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    user_type: "tourist" | "guide";
  }): Promise<RegisterResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro no cadastro");
      }

      return data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro no login");
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // ===== PASSEIOS =====
  getTours: async (): Promise<Tour[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tours`);

      if (!response.ok) {
        throw new Error("Erro ao carregar passeios");
      }

      const data = await response.json();

      return data.map((tour: any) => ({
        id: tour.id.toString(),
        title: tour.title,
        description: tour.description,
        guide: tour.guide_name,
        guideId: tour.guide_id.toString(),
        basePrice: parseFloat(tour.base_price),
        maxPeople: tour.max_people,
        extraPersonPrice: tour.extra_person_price
          ? parseFloat(tour.extra_person_price)
          : undefined,
        rating: tour.average_rating ? parseFloat(tour.average_rating) : 0,
        reviewCount: tour.review_count || 0,
        image:
          tour.image_url ||
          "https://via.placeholder.com/300x200?text=Passeio+Turístico",
        location: tour.location,
        duration: tour.duration,
        createdAt: tour.created_at,
      }));
    } catch (error) {
      console.error("Get tours error:", error);
      throw error;
    }
  },

  getTour: async (id: string): Promise<Tour> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tours/${id}`);

      if (!response.ok) {
        throw new Error("Passeio não encontrado");
      }

      const tour = await response.json();

      return {
        id: tour.id.toString(),
        title: tour.title,
        description: tour.description,
        guide: tour.guide_name,
        guideId: tour.guide_id.toString(),
        basePrice: parseFloat(tour.base_price),
        maxPeople: tour.max_people,
        extraPersonPrice: tour.extra_person_price
          ? parseFloat(tour.extra_person_price)
          : undefined,
        rating: tour.average_rating ? parseFloat(tour.average_rating) : 0,
        reviewCount: tour.review_count || 0,
        image:
          tour.image_url ||
          "https://via.placeholder.com/300x200?text=Passeio+Turístico",
        location: tour.location,
        duration: tour.duration,
        createdAt: tour.created_at,
      };
    } catch (error) {
      console.error("Get tour error:", error);
      throw error;
    }
  },

  createTour: async (
    tourData: CreateTourData,
    token: string
  ): Promise<{ message: string; tour: Tour }> => {
    try {
      // Preparar dados para a API
      const apiData: any = {
        title: tourData.title,
        description: tourData.description,
        base_price: tourData.base_price,
        max_people: tourData.max_people,
        location: tourData.location,
        duration: tourData.duration,
      };

      // Adicionar campos opcionais apenas se existirem
      if (
        tourData.extra_person_price !== undefined &&
        tourData.extra_person_price !== null
      ) {
        apiData.extra_person_price = tourData.extra_person_price;
      }

      if (tourData.image) {
        apiData.image_url = tourData.image;
      }

      const response = await fetch(`${API_BASE_URL}/tours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar passeio");
      }

      return {
        message: data.message,
        tour: {
          id: data.tour.id.toString(),
          title: data.tour.title,
          description: data.tour.description,
          guide: data.tour.guide_name || "Você",
          guideId: data.tour.guide_id.toString(),
          basePrice: parseFloat(data.tour.base_price),
          maxPeople: data.tour.max_people,
          extraPersonPrice: data.tour.extra_person_price
            ? parseFloat(data.tour.extra_person_price)
            : undefined,
          rating: parseFloat(data.tour.rating || "0"),
          image:
            data.tour.image_url ||
            "https://via.placeholder.com/300x200?text=Passeio+Turístico",
          location: data.tour.location,
          duration: data.tour.duration,
          createdAt: data.tour.created_at,
          reviewCount: data.tour.review_count || 0
        },
      };
    } catch (error) {
      console.error("Create tour error:", error);
      throw error;
    }
  },

  getMyTours: async (token: string): Promise<Tour[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tours/my-tours`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar seus passeios");
      }

      const data = await response.json();

      return data.map((tour: any) => ({
        id: tour.id.toString(),
        title: tour.title,
        description: tour.description,
        guide: tour.guide_name,
        guideId: tour.guide_id.toString(),
        basePrice: parseFloat(tour.base_price),
        maxPeople: tour.max_people,
        extraPersonPrice: tour.extra_person_price
          ? parseFloat(tour.extra_person_price)
          : undefined,
        rating: tour.average_rating ? parseFloat(tour.average_rating) : 0,
        reviewCount: tour.review_count || 0,
        image:
          tour.image_url ||
          "https://via.placeholder.com/300x200?text=Passeio+Turístico",
        location: tour.location,
        duration: tour.duration,
        createdAt: tour.created_at,
      }));
    } catch (error) {
      console.error("Get my tours error:", error);
      throw error;
    }
  },

  // ===== MÉTODOS PARA GUIAS =====
  getGuideTourRequests: async (token: string): Promise<TourRequest[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tour-requests/guide-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar solicitações do guia");
      }

      const data = await response.json();

      return data.map((apiRequest: any) => ({
        id: apiRequest.id.toString(),
        tourId: apiRequest.tour_id.toString(),
        touristId: apiRequest.tourist_id.toString(),
        touristName: apiRequest.tourist_name,
        date: apiRequest.request_date,
        people: apiRequest.people_count,
        status: apiRequest.status,
        totalPrice: parseFloat(apiRequest.total_price),
        createdAt: apiRequest.created_at,
        tourTitle: apiRequest.tour_title, // Adicionando título do passeio
      }));
    } catch (error) {
      console.error("Get guide tour requests error:", error);
      throw error;
    }
  },

  getGuideStats: async (
    token: string
  ): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    totalTours: number;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/guides/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar estatísticas do guia");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get guide stats error:", error);
      throw error;
    }
  },

  // ===== SOLICITAÇÕES DE PASSEIO =====
  // ===== SOLICITAÇÕES DE PASSEIO =====
  requestTour: async (
    tourRequest: CreateTourRequestData,
    token: string
  ): Promise<{ message: string; request: TourRequest }> => {
    try {
      console.log(
        "🚀 Enviando requisição para:",
        `${API_BASE_URL}/tour-requests`
      );

      // CORREÇÃO: Tratamento seguro do tourId
      const tourId = tourRequest.tour_id || tourRequest.tourId;
      if (!tourId) {
        throw new Error("ID do passeio é obrigatório");
      }

      // CORREÇÃO: Garantir que é string antes do parseInt
      const tourIdNumber = parseInt(tourId.toString());

      console.log(
        "📝 Dados:",
        JSON.stringify(
          {
            tour_id: tourIdNumber,
            request_date: tourRequest.date,
            people_count: tourRequest.people,
            total_price: tourRequest.totalPrice,
            special_requests: tourRequest.special_requests || "",
          },
          null,
          2
        )
      );

      const response = await fetch(`${API_BASE_URL}/tour-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tour_id: tourIdNumber, // ✅ AGORA É NUMBER
          request_date: tourRequest.date,
          people_count: tourRequest.people,
          total_price: tourRequest.totalPrice,
          special_requests: tourRequest.special_requests || "",
        }),
      });

      const data = await response.json();
      console.log("📨 Corpo da resposta:", data);

      if (!response.ok) {
        throw new Error(data.error || "Erro ao solicitar passeio");
      }

      if (!data.tourRequest) {
        throw new Error("Resposta da API não contém dados da solicitação");
      }

      const apiRequest = data.tourRequest;
      return {
        message: data.message,
        request: {
          id: apiRequest.id?.toString() || apiRequest.id,
          tourId: apiRequest.tour_id?.toString() || apiRequest.tour_id,
          touristId: apiRequest.tourist_id?.toString() || apiRequest.tourist_id,
          touristName: apiRequest.tourist_name,
          date: apiRequest.request_date,
          people: apiRequest.people_count,
          status: apiRequest.status,
          totalPrice: parseFloat(apiRequest.total_price),
          createdAt: apiRequest.created_at,
          special_requests: apiRequest.special_requests,
        },
      };
    } catch (error) {
      console.error("🔥 Request tour error completo:", error);
      throw error;
    }
  },

  getMyTourRequests: async (token: string): Promise<TourRequest[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tour-requests/my-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar solicitações");
      }

      const data = await response.json();

      // CORREÇÃO: Verificar se data é array
      if (!Array.isArray(data)) {
        console.error("❌ Resposta não é array:", data);
        return [];
      }

      return data.map((apiRequest: any) => ({
        id: apiRequest.id?.toString() || apiRequest.id,
        tourId: apiRequest.tour_id?.toString() || apiRequest.tour_id,
        touristId: apiRequest.tourist_id?.toString() || apiRequest.tourist_id,
        touristName: apiRequest.tourist_name,
        date: apiRequest.request_date,
        people: apiRequest.people_count,
        status: apiRequest.status,
        totalPrice: parseFloat(apiRequest.total_price),
        createdAt: apiRequest.created_at,
        special_requests: apiRequest.special_requests, // CORREÇÃO: Adicionado
      }));
    } catch (error) {
      console.error("Get tour requests error:", error);
      throw error;
    }
  },

  approveTourRequest: async (
    requestId: string,
    token: string
  ): Promise<{ message: string; request: TourRequest }> => {
    try {
      console.log("✅ Aprovando solicitação ID:", requestId);

      const response = await fetch(
        `${API_BASE_URL}/tour-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "approved",
          }),
        }
      );

      const data = await response.json();
      console.log("📨 Resposta da aprovação:", data);

      if (!response.ok) {
        throw new Error(data.error || "Erro ao aprovar solicitação");
      }

      // CORREÇÃO: Verificar se tourRequest existe
      if (!data.tourRequest) {
        throw new Error("Resposta da API não contém dados atualizados");
      }

      const apiRequest = data.tourRequest;
      return {
        message: data.message,
        request: {
          id: apiRequest.id?.toString() || apiRequest.id,
          tourId: apiRequest.tour_id?.toString() || apiRequest.tour_id,
          touristId: apiRequest.tourist_id?.toString() || apiRequest.tourist_id,
          touristName: apiRequest.tourist_name,
          date: apiRequest.request_date,
          people: apiRequest.people_count,
          status: apiRequest.status,
          totalPrice: parseFloat(apiRequest.total_price),
          createdAt: apiRequest.created_at,
          special_requests: apiRequest.special_requests,
        },
      };
    } catch (error) {
      console.error("Approve tour request error:", error);
      throw error;
    }
  },

  rejectTourRequest: async (
    requestId: string,
    token: string
  ): Promise<{ message: string; request: TourRequest }> => {
    try {
      console.log("❌ Rejeitando solicitação ID:", requestId);

      const response = await fetch(
        `${API_BASE_URL}/tour-requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "rejected",
          }),
        }
      );

      const data = await response.json();
      console.log("📨 Resposta da rejeição:", data);

      if (!response.ok) {
        throw new Error(data.error || "Erro ao rejeitar solicitação");
      }

      // CORREÇÃO: Verificar se tourRequest existe
      if (!data.tourRequest) {
        throw new Error("Resposta da API não contém dados atualizados");
      }

      const apiRequest = data.tourRequest;
      return {
        message: data.message,
        request: {
          id: apiRequest.id?.toString() || apiRequest.id,
          tourId: apiRequest.tour_id?.toString() || apiRequest.tour_id,
          touristId: apiRequest.tourist_id?.toString() || apiRequest.tourist_id,
          touristName: apiRequest.tourist_name,
          date: apiRequest.request_date,
          people: apiRequest.people_count,
          status: apiRequest.status,
          totalPrice: parseFloat(apiRequest.total_price),
          createdAt: apiRequest.created_at,
          special_requests: apiRequest.special_requests,
        },
      };
    } catch (error) {
      console.error("Reject tour request error:", error);
      throw error;
    }
  },

  cancelTourRequest: async (
    requestId: string,
    token: string
  ): Promise<{ message: string; request: TourRequest }> => {
    try {
      console.log("🚫 Cancelando solicitação ID:", requestId);

      const response = await fetch(
        `${API_BASE_URL}/tour-requests/${requestId}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json", // CORREÇÃO: Adicionado Content-Type
            Authorization: `Bearer ${token}`,
          },
          // CORREÇÃO: Algumas APIs podem exigir body vazio
          body: JSON.stringify({}),
        }
      );

      const data = await response.json();
      console.log("📨 Resposta do cancelamento:", data);

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cancelar solicitação");
      }

      // CORREÇÃO: Verificar se tourRequest existe
      if (!data.tourRequest) {
        throw new Error("Resposta da API não contém dados atualizados");
      }

      const apiRequest = data.tourRequest;
      return {
        message: data.message,
        request: {
          id: apiRequest.id?.toString() || apiRequest.id,
          tourId: apiRequest.tour_id?.toString() || apiRequest.tour_id,
          touristId: apiRequest.tourist_id?.toString() || apiRequest.tourist_id,
          touristName: apiRequest.tourist_name,
          date: apiRequest.request_date,
          people: apiRequest.people_count,
          status: apiRequest.status,
          totalPrice: parseFloat(apiRequest.total_price),
          createdAt: apiRequest.created_at,
          special_requests: apiRequest.special_requests,
        },
      };
    } catch (error) {
      console.error("Cancel tour request error:", error);
      throw error;
    }
  },

  // ===== ESTABELECIMENTOS =====
  getBusinesses: async (): Promise<Business[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/businesses`);

      if (!response.ok) {
        throw new Error("Erro ao carregar estabelecimentos");
      }

      const data = await response.json();

      return data.map((business: any) => ({
        id: business.id.toString(),
        name: business.name,
        type: business.type,
        description: business.description,
        address: business.address,
        rating: parseFloat(business.rating),
        image:
          business.image_url ||
          "https://via.placeholder.com/300x200?text=Estabelecimento",
        phone: business.phone || undefined,
        website: business.website || undefined,
      }));
    } catch (error) {
      console.error("Get businesses error:", error);
      throw error;
    }
  },

  // ===== NOTIFICAÇÕES =====
  getNotifications: async (token: string): Promise<any[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar notificações");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Get notifications error:", error);
      throw error;
    }
  },

  markNotificationAsRead: async (
    notificationId: string,
    token: string
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao marcar notificação como lida");
      }
    } catch (error) {
      console.error("Mark notification as read error:", error);
      throw error;
    }
  },

  getUnreadNotificationCount: async (token: string): Promise<number> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar contagem de notificações");
      }

      const data = await response.json();
      return data.unreadCount;
    } catch (error) {
      console.error("Get unread count error:", error);
      throw error;
    }
  },
};

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:3000/health`);
    const data = await response.json();
    return data.status === "OK";
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
};

export default api;
