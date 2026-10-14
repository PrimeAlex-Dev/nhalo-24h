export interface CategoryItem {
  id: string;
  title: string;
  description: string;
  priceFrom: number;
  completedJobs: string;
  icon: 'snowflake' | 'zap' | 'wrench' | 'sparkles' | 'key' | 'hammer' | 'paint-roller' | 'bug';
}

export interface UserProfile {
  name: string;
  avatarLetter: string;
  unreadNotifications: number;
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
