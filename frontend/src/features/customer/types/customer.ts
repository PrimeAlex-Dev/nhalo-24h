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
}
