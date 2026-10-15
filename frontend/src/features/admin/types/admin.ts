export type UserRole = 'customer' | 'provider' | 'admin';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  totalOrders: number;
  rating?: number;
  profession?: string;
  city: string;
  idCardNumber?: string;
  bio?: string;
}

export type OrderStatus = 'new' | 'unassigned' | 'in_progress' | 'completed' | 'cancelled';
export type BacklogStatus = 'normal' | 'delayed_unassigned' | 'delayed_progress' | 'disputed';

export interface OrderTimelineEvent {
  time: string;
  title: string;
  description: string;
  status: 'done' | 'current' | 'warning' | 'pending';
}

export interface AdminOrderItem {
  id: string;
  code: string;
  serviceName: string;
  category: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  providerId?: string;
  providerName?: string;
  providerPhone?: string;
  providerAvatar?: string;
  status: OrderStatus;
  backlogStatus: BacklogStatus;
  backlogReason?: string;
  waitMinutes?: number;
  createdAt: string;
  scheduledTime: string;
  price: number;
  paymentMethod: 'cash' | 'vnpay' | 'wallet';
  notes?: string;
  timeline: OrderTimelineEvent[];
}

export interface AdminKpiMetric {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  unit?: string;
  changePercent: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  compareLabel: string;
  statusLabel: string;
  statusVariant: 'success' | 'warning' | 'info' | 'danger';
  icon: 'users' | 'wrench' | 'package' | 'clock' | 'user-check';
}

export type UserRoleFilter = 'all' | 'customer' | 'provider' | 'admin';
export type UserStatusFilter = 'all' | 'active' | 'pending' | 'suspended';
export type OrderFilterTab = 'all' | 'backlog' | 'new' | 'unassigned' | 'in_progress' | 'completed' | 'cancelled';

export interface AdminServiceItem {
  id: string;
  name: string;
  basePrice: number;
  unit: string;
  duration: string;
  isActive: boolean;
}

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: 'zap' | 'snowflake' | 'wrench' | 'key' | 'sparkles' | 'tv' | 'hammer';
  colorTheme: string;
  activeProviders: number;
  minPrice: number;
  isActive: boolean;
  services: AdminServiceItem[];
  updatedAt: string;
}
