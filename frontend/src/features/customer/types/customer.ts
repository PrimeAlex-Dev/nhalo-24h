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
