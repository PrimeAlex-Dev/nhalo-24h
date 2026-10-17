export interface CategoryItem {
  id: string;
  title: string;
  description: string;
  priceFrom: number;
  completedJobs: string;
  icon: 'snowflake' | 'zap' | 'wrench' | 'sparkles' | 'key' | 'hammer' | 'paint-roller' | 'bug';
}

export interface UserAddress {
  id: string;
  label: string;
  fullAddress: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCustomerAddressRequest {
  label: string;
  fullAddress: string;
  isDefault?: boolean;
}

export interface UpdateCustomerAddressRequest {
  label: string;
  fullAddress: string;
  isDefault?: boolean;
}

export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  gender?: GenderType | null;
  address?: string | null;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCustomerProfileRequest {
  fullName: string;
  gender?: GenderType | null;
  address?: string | null;
}

export interface UserProfile {
  name: string;
  avatarLetter: string;
  unreadNotifications: number;
  role?: string;
  email?: string;
  phone?: string;
  addresses?: UserAddress[];
  joinedDate?: string;
}

export interface ProviderReview {
  id: string;
  author: string;
  avatarLetter: string;
  service: string;
  date: string;
  rating: number;
  comment: string;
}

export interface ProviderItem {
  id: string;
  name: string;
  verified: boolean;
  company: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  pricePerHour: number;
  category: string;
  isTopRated?: boolean;
  availability: 'Available today' | 'Available soon';
  avatar: string;

  // Rich profile properties
  experienceYears?: number;
  completedJobsCount?: string;
  responseTime?: string;
  availabilityDetail?: string;
  about?: string;
  skills?: string[];
  aiInsight?: string;
  reviews?: ProviderReview[];
}

export type OrderStatus = 'In progress' | 'Scheduled' | 'Completed';

export interface CustomerOrder {
  id: string;
  orderCode: string;
  serviceCategory: string;
  serviceDetail: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  status: OrderStatus;
  scheduledTime: string;
  price: number;
  reviewPending?: boolean;
  address?: string;
  notes?: string;
}
