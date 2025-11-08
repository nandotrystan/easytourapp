// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  type: 'tourist' | 'guide';
  created_at?: string;
}

export interface Tour {
  id: string;
  title: string;
  description: string;
  guide: string;
  guideId: string; // Mantido como guideId para consistência
  basePrice: number;
  maxPeople: number;
  extraPersonPrice?: number;
  rating: number;
  image: string;
  location: string;
  duration: string;
  createdAt?: string;
  reviewCount: number
}

export interface CreateTourData {
  title: string;
  description: string;
  guide_id: string;
  base_price: number;
  max_people: number;
  extra_person_price?: number;
  location: string;
  duration: string;
  image?: string;
}



// export interface TourRequest {
//   id: string;
//   tour_id: string;
//   tourist_id: string;
//   tourist_name: string;
//   date: string;
//   people: number;
//   status: 'pending' | 'approved' | 'rejected';
//   total_price: number;
//   created_at?: string;
// }

export interface TourRequest {
  id: string;
  tourId: string;
  touristId: string;
  touristName: string;
  date: string;
  people: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  totalPrice: number;
  createdAt?: string;
  special_requests?: string;
}

export interface CreateTourRequestData {
  tourId?: string;        // Para compatibilidade com frontend
  tour_id?: number;       // Para compatibilidade com backend
  date: string;
  people: number;
  totalPrice: number;
  special_requests?: string;
}

export interface Business {
  id: string;
  name: string;
  type: 'restaurant' | 'store' | 'hotel' | 'attraction';
  description: string;
  address: string;
  rating: number;
  image: string;
  phone?: string;
  website?: string;
  email?: string;
  opening_hours?: string;
  price_range?: '$' | '$$' | '$$$' | '$$$$';
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  target_type: 'tour' | 'guide' | 'business';
  target_id: string;
  rating: number;
  comment: string;
  date: string;
  created_at?: string;
}

export type UserType = 'tourist' | 'guide';

export interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  token: string | null;
  login: (userData: User, token: string, type: UserType) => void;
  logout: () => void;
  isLoading: boolean;
  isGuide: boolean;
  isTourist: boolean;
}

export interface TourReview {
  id: string;
  tour_id: string;
  tourist_id: string;
  tourist_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface GuideReview {
  id: string;
  guide_id: string;
  tourist_id: string;
  tourist_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface CreateTourReviewData {
  tour_id: string;
  rating: number;
  comment?: string;
}

export interface CreateGuideReviewData {
  guide_id: string;
  rating: number;
  comment?: string;
}