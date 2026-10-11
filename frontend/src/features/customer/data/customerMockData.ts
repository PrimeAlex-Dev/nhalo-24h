import type { CategoryItem, UserProfile } from '../types/customer';

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
