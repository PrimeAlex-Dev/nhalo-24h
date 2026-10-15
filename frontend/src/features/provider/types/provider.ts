export interface ProviderProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  phone: string;
  email: string;
  isOnline: boolean;
  walletBalance: number;
  todayEarnings: number;
  todayJobsCount: number;
  newJobsCount: number;
  completedJobsTotal: number;
  acceptanceRate: number; // e.g. 96%
  completionRate: number; // e.g. 99%
  serviceArea: string;
  activeCategories: string[];
}

export type JobStatus = 'available' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type JobUrgency = 'urgent' | 'scheduled' | 'standard';

export interface ProviderJob {
  id: string;
  title: string;
  category: string;
  customerName: string;
  customerPhone: string;
  distance: string;
  travelTime: string;
  scheduledTime: string;
  area: string;
  address: string;
  priceEstimate: string;
  priceAmount: number;
  urgency: JobUrgency;
  status: JobStatus;
  note: string;
  materialsNeeded?: string[];
  createdAt: string;
}

export interface ProviderEarningItem {
  id: string;
  jobId: string;
  title: string;
  customerName: string;
  amount: number;
  fee: number;
  netAmount: number;
  completedAt: string;
  date: string;
  paymentMethod: 'wallet' | 'cash' | 'bank_transfer';
}
