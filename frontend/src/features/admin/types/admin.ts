export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'DISABLED';

export interface AdminUserItem {
  id: string; // UUID from backend
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpringPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  phone?: string;
  role?: UserRole;
  password: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
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
  changePercent?: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  trendLabel?: string;
  compareLabel: string;
  statusLabel: string;
  statusVariant: 'success' | 'warning' | 'info' | 'danger';
  icon: 'users' | 'wrench' | 'package' | 'clock' | 'user-check';
}

export type UserRoleFilter = 'ALL' | 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
export type UserStatusFilter = 'ALL' | 'ACTIVE' | 'DISABLED';
export type OrderFilterTab = 'all' | 'backlog' | 'new' | 'unassigned' | 'in_progress' | 'completed' | 'cancelled';

export interface AdminServiceItem {
  id: string;
  name: string;
  basePrice: number;
  unit: string;
  duration: string;
  isActive: boolean;
}

export type CategoryStatus = 'ACTIVE' | 'INACTIVE';
export type CategoryStatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export interface AdminCategoryItem {
  id: string; // UUID from backend
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  status: CategoryStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  displayOrder?: number;
  status?: CategoryStatus;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  displayOrder?: number;
}

export interface UpdateCategoryStatusPayload {
  status: CategoryStatus;
}

