import type { CategoryItem, UserProfile, ProviderItem } from '../types/customer';
import provider1Img from '../../../assets/provider_1.png';
import provider2Img from '../../../assets/provider_2.png';
import provider3Img from '../../../assets/provider_3.png';
import provider4Img from '../../../assets/provider_4.png';
import provider5Img from '../../../assets/provider_5.png';
import provider6Img from '../../../assets/provider_6.png';

export const mockCurrentUser: UserProfile = {
  name: 'Alex Johnson',
  avatarLetter: 'A',
  unreadNotifications: 1
};

export const mockSuggestionPrompts: string[] = [
  'My AC is not cooling and leaks water',
  'Kitchen sink is clogged and draining slowly',
  'Power outlet in bedroom stopped working',
  'Need a deep clean before moving out'
];

export const mockCategories: CategoryItem[] = [
  {
    id: 'ac-repair',
    title: 'AC Repair',
    description: 'Cooling issues, leaks, servicing & installation',
    priceFrom: 45,
    completedJobs: '12k+ jobs',
    icon: 'snowflake'
  },
  {
    id: 'electrical',
    title: 'Electrical',
    description: 'Wiring, outlets, panels & lighting',
    priceFrom: 39,
    completedJobs: '9k+ jobs',
    icon: 'zap'
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    description: 'Leaks, clogs, fixtures & water heaters',
    priceFrom: 42,
    completedJobs: '15k+ jobs',
    icon: 'wrench'
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    description: 'Deep cleaning, regular & move-out',
    priceFrom: 29,
    completedJobs: '20k+ jobs',
    icon: 'sparkles'
  },
  {
    id: 'locksmith',
    title: 'Locksmith',
    description: 'Lockouts, rekeying & smart locks',
    priceFrom: 35,
    completedJobs: '5k+ jobs',
    icon: 'key'
  },
  {
    id: 'handyman',
    title: 'Handyman',
    description: 'Repairs, mounting & general fixes',
    priceFrom: 30,
    completedJobs: '18k+ jobs',
    icon: 'hammer'
  },
  {
    id: 'painting',
    title: 'Painting',
    description: 'Interior & exterior painting',
    priceFrom: 60,
    completedJobs: '7k+ jobs',
    icon: 'paint-roller'
  },
  {
    id: 'pest-control',
    title: 'Pest Control',
    description: 'Inspection & extermination',
    priceFrom: 49,
    completedJobs: '4k+ jobs',
    icon: 'bug'
  }
];

export const providerCategoryFilters: string[] = [
  'All services',
  'AC Repair',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Locksmith',
  'Handyman',
  'Painting',
  'Pest Control'
];

export const mockProviders: ProviderItem[] = [
  {
    id: 'provider-1',
    name: 'James Carter',
    verified: true,
    company: 'CoolAir HVAC Experts',
    rating: 4.9,
    reviewsCount: 412,
    distance: '1.2 km',
    pricePerHour: 45,
    category: 'AC Repair',
    isTopRated: true,
    availability: 'Available today',
    avatar: provider1Img
  },
  {
    id: 'provider-2',
    name: 'Elena Rossi',
    verified: true,
    company: 'PureShine Cleaning Co.',
    rating: 4.9,
    reviewsCount: 524,
    distance: '1.8 km',
    pricePerHour: 29,
    category: 'Cleaning',
    isTopRated: true,
    availability: 'Available today',
    avatar: provider2Img
  },
  {
    id: 'provider-3',
    name: 'Sofia Nguyen',
    verified: true,
    company: 'BrightSpark Electric',
    rating: 4.8,
    reviewsCount: 287,
    distance: '2.4 km',
    pricePerHour: 39,
    category: 'Electrical',
    isTopRated: true,
    availability: 'Available soon',
    avatar: provider3Img
  },
  {
    id: 'provider-4',
    name: 'Omar Hassan',
    verified: true,
    company: 'SecureKey Locksmiths',
    rating: 4.8,
    reviewsCount: 176,
    distance: '2.9 km',
    pricePerHour: 35,
    category: 'Locksmith',
    isTopRated: true,
    availability: 'Available today',
    avatar: provider4Img
  },
  {
    id: 'provider-5',
    name: 'Marcus Lee',
    verified: true,
    company: 'FlowRight Plumbing',
    rating: 4.7,
    reviewsCount: 356,
    distance: '3.1 km',
    pricePerHour: 42,
    category: 'Plumbing',
    isTopRated: false,
    availability: 'Available today',
    avatar: provider5Img
  },
  {
    id: 'provider-6',
    name: 'David Miller',
    verified: true,
    company: 'FixIt Home Services',
    rating: 4.6,
    reviewsCount: 198,
    distance: '4.5 km',
    pricePerHour: 40,
    category: 'Handyman',
    isTopRated: false,
    availability: 'Available soon',
    avatar: provider6Img
  },
  {
    id: 'provider-7',
    name: 'Carlos Vance',
    verified: true,
    company: 'Prime Coat Painters',
    rating: 4.8,
    reviewsCount: 145,
    distance: '3.8 km',
    pricePerHour: 60,
    category: 'Painting',
    isTopRated: true,
    availability: 'Available today',
    avatar: provider1Img
  },
  {
    id: 'provider-8',
    name: 'Brian Ortiz',
    verified: true,
    company: 'Shield Pest Solutions',
    rating: 4.9,
    reviewsCount: 210,
    distance: '2.1 km',
    pricePerHour: 49,
    category: 'Pest Control',
    isTopRated: false,
    availability: 'Available today',
    avatar: provider4Img
  }
];
