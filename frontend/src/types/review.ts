export interface CreateReviewPayload {
  orderId: string;
  rating: number; // 1 - 5
  punctualityRating?: number;
  skillRating?: number;
  attitudeRating?: number;
  priceRating?: number;
  comment?: string;
  tags?: string[];
  images?: string[];
  isAnonymous?: boolean;
}

export interface ProviderReplyPayload {
  replyComment: string;
}

export interface ReviewItem {
  id: string;
  orderId: string;
  orderCode: string;
  orderTitle: string;
  providerProfileId: string;
  providerName: string;
  providerAvatar?: string | null;
  customerId: string;
  customerName: string;
  customerAvatar?: string | null;
  rating: number;
  punctualityRating?: number;
  skillRating?: number;
  attitudeRating?: number;
  priceRating?: number;
  comment?: string;
  tags: string[];
  images: string[];
  isAnonymous: boolean;
  isVisible: boolean;
  providerReply?: string;
  providerRepliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderRatingSummary {
  providerProfileId: string;
  averageRating: number;
  totalReviews: number;
  star5Count: number;
  star4Count: number;
  star3Count: number;
  star2Count: number;
  star1Count: number;
}
