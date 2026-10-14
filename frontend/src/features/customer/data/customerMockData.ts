import type { CategoryItem, UserProfile, ProviderItem, CustomerOrder } from '../types/customer';
import provider1Img from '../../../assets/provider_1.png';
import provider2Img from '../../../assets/provider_2.png';
import provider3Img from '../../../assets/provider_3.png';
import provider4Img from '../../../assets/provider_4.png';
import provider5Img from '../../../assets/provider_5.png';
import provider6Img from '../../../assets/provider_6.png';

export const mockCurrentUser: UserProfile = {
  name: 'Nguyễn Văn A',
  avatarLetter: 'A',
  unreadNotifications: 1,
  role: 'Tài khoản khách hàng',
  email: 'nguyenvana@gmail.com',
  phone: '0912 345 678',
  joinedDate: 'Tháng 03, 2026',
  addresses: [
    {
      id: 'addr-1',
      label: 'Nhà riêng',
      fullAddress: '142 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
      isDefault: true
    },
    {
      id: 'addr-2',
      label: 'Văn phòng',
      fullAddress: 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh',
      isDefault: false
    }
  ]
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
    avatar: provider1Img,
    experienceYears: 12,
    completedJobsCount: '1,840',
    responseTime: '~10 min',
    availabilityDetail: 'Available today, 2:00 PM',
    about: 'Certified HVAC technician with over a decade of experience diagnosing and repairing residential air conditioning systems. Known for fast, tidy, and long-lasting fixes.',
    skills: ['Cooling repair', 'Refrigerant leak', 'Installation', 'Maintenance'],
    aiInsight: 'Specializes in cooling failures & refrigerant leaks.',
    reviews: [
      {
        id: 'r1-1',
        author: 'Amanda K.',
        avatarLetter: 'A',
        service: 'AC Repair',
        date: '2 days ago',
        rating: 5,
        comment: 'James diagnosed the cooling issue in minutes and fixed a refrigerant leak the same day. Super professional and tidy. Highly recommend!'
      },
      {
        id: 'r1-2',
        author: 'Robert P.',
        avatarLetter: 'R',
        service: 'AC Maintenance',
        date: '1 week ago',
        rating: 5,
        comment: 'On time, fair price, and explained everything clearly. My AC is running better than it has in years.'
      },
      {
        id: 'r1-3',
        author: 'Priya S.',
        avatarLetter: 'P',
        service: 'AC Repair',
        date: '3 weeks ago',
        rating: 4,
        comment: 'Good work overall. Took a little longer than expected but the result was solid and the price was honest.'
      }
    ]
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
    avatar: provider2Img,
    experienceYears: 8,
    completedJobsCount: '2,410',
    responseTime: '~15 min',
    availabilityDetail: 'Available today, 3:30 PM',
    about: 'Professional home and deep cleaning specialist. Dedicated to immaculate results using eco-friendly, non-toxic, and pet-safe products for every space.',
    skills: ['Deep cleaning', 'Move-out clean', 'Sanitization', 'Window detailing'],
    aiInsight: 'Top rated for meticulous deep cleaning and move-out turnover.',
    reviews: [
      {
        id: 'r2-1',
        author: 'Sarah M.',
        avatarLetter: 'S',
        service: 'Deep Cleaning',
        date: '3 days ago',
        rating: 5,
        comment: 'Elena and her team did an exceptional job on our move-out clean. Spotless everywhere!'
      },
      {
        id: 'r2-2',
        author: 'Daniel T.',
        avatarLetter: 'D',
        service: 'Home Cleaning',
        date: '1 week ago',
        rating: 5,
        comment: 'Very polite, fast, and thorough. Will definitely book again.'
      }
    ]
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
    avatar: provider3Img,
    experienceYears: 10,
    completedJobsCount: '1,320',
    responseTime: '~20 min',
    availabilityDetail: 'Available tomorrow, 9:00 AM',
    about: 'Licensed electrician with 10 years experience handling electrical wiring, circuit breakers, and lighting solutions with strict safety standards.',
    skills: ['Panel upgrade', 'Wiring & Outlets', 'Lighting install', 'Safety inspection'],
    aiInsight: 'Recognized for precision diagnostics and quick breaker panel upgrades.',
    reviews: [
      {
        id: 'r3-1',
        author: 'Kevin B.',
        avatarLetter: 'K',
        service: 'Electrical Repair',
        date: '4 days ago',
        rating: 5,
        comment: 'Sofia quickly resolved a dead circuit breaker that other technicians could not diagnose.'
      }
    ]
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
    avatar: provider4Img,
    experienceYears: 9,
    completedJobsCount: '980',
    responseTime: '~10 min',
    availabilityDetail: 'Available today, 1:15 PM',
    about: 'Emergency lockout and residential lock specialist. Fast response times with expertise in high-security deadbolts and digital smart locks.',
    skills: ['Lockout service', 'Deadbolt install', 'Smart lock setup', 'Key rekeying'],
    aiInsight: 'Speedy response time under 15 minutes for emergency lockouts.',
    reviews: [
      {
        id: 'r4-1',
        author: 'Jessica L.',
        avatarLetter: 'J',
        service: 'Smart Lock Setup',
        date: '5 days ago',
        rating: 5,
        comment: 'Omar arrived within 15 minutes and installed our new smart lock flawlessly.'
      }
    ]
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
    avatar: provider5Img,
    experienceYears: 11,
    completedJobsCount: '1,560',
    responseTime: '~15 min',
    availabilityDetail: 'Available today, 4:00 PM',
    about: 'Master plumber handling clogged drains, pipe leaks, toilet repairs, and water heater installations with honest upfront pricing.',
    skills: ['Leak detection', 'Drain unclogging', 'Pipe repair', 'Water heaters'],
    aiInsight: 'Specializes in urgent drain unclogging and slab leak detection.',
    reviews: [
      {
        id: 'r5-1',
        author: 'Tom W.',
        avatarLetter: 'T',
        service: 'Plumbing Repair',
        date: '1 week ago',
        rating: 5,
        comment: 'Marcus fixed a persistent kitchen pipe leak quickly and cleanly.'
      }
    ]
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
    avatar: provider6Img,
    experienceYears: 7,
    completedJobsCount: '890',
    responseTime: '~25 min',
    availabilityDetail: 'Available tomorrow, 10:00 AM',
    about: 'Versatile handyman specializing in drywall patching, TV wall-mounting, door repairs, furniture assembly, and general home fixes.',
    skills: ['TV mounting', 'Drywall patch', 'Furniture assembly', 'Door adjustments'],
    aiInsight: 'Great versatility for multiple household repair tasks in a single visit.',
    reviews: [
      {
        id: 'r6-1',
        author: 'Emily C.',
        avatarLetter: 'E',
        service: 'Furniture Assembly',
        date: '2 weeks ago',
        rating: 5,
        comment: 'Super fast and brought all the right tools. Very satisfied!'
      }
    ]
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
    avatar: provider1Img,
    experienceYears: 14,
    completedJobsCount: '1,120',
    responseTime: '~15 min',
    availabilityDetail: 'Available today, 2:30 PM',
    about: 'Interior and exterior painting professional focused on crisp lines, thorough prep work, and premium paint finishes.',
    skills: ['Interior painting', 'Trim & Baseboards', 'Drywall prep', 'Color consultation'],
    aiInsight: 'High customer satisfaction for clean prep work and spotless finishes.',
    reviews: [
      {
        id: 'r7-1',
        author: 'Mark H.',
        avatarLetter: 'M',
        service: 'Interior Painting',
        date: '1 week ago',
        rating: 5,
        comment: 'Transformed our living room in two days. Pristine edges and no paint mess.'
      }
    ]
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
    avatar: provider4Img,
    experienceYears: 10,
    completedJobsCount: '1,450',
    responseTime: '~10 min',
    availabilityDetail: 'Available today, 1:00 PM',
    about: 'Certified exterminator specializing in eco-safe pest elimination, termite prevention, rodent exclusion, and home barrier protection.',
    skills: ['Termite inspection', 'Rodent exclusion', 'Eco-safe spraying', 'Perimeter barrier'],
    aiInsight: 'Effective preventative treatments and pet-safe pest elimination.',
    reviews: [
      {
        id: 'r8-1',
        author: 'Lisa N.',
        avatarLetter: 'L',
        service: 'Pest Inspection',
        date: '3 days ago',
        rating: 5,
        comment: 'Completely eliminated our ant problem and inspected the full perimeter.'
      }
    ]
  }
];

export const mockCustomerOrders: CustomerOrder[] = [
  {
    id: 'ord-1',
    orderCode: 'ORD-10482',
    serviceCategory: 'AC Repair',
    serviceDetail: 'Cooling & leak fix',
    providerId: 'provider-1',
    providerName: 'James Carter',
    providerAvatar: provider1Img,
    status: 'In progress',
    scheduledTime: 'Sep 23, 2026, 2:00 PM – 3:30 PM',
    price: 129,
    address: '142 Market Street, Apt 4B',
    notes: 'Indoor unit leaking water onto floor, airflow feels lukewarm.'
  },
  {
    id: 'ord-2',
    orderCode: 'ORD-10501',
    serviceCategory: 'Electrical',
    serviceDetail: 'Outlet installation',
    providerId: 'provider-3',
    providerName: 'Sofia Nguyen',
    providerAvatar: provider3Img,
    status: 'Scheduled',
    scheduledTime: 'Sep 28, 2026, 9:00 AM – 10:00 AM',
    price: 65,
    address: '142 Market Street, Apt 4B',
    notes: 'Need 2 new grounded outlets installed in home office wall.'
  },
  {
    id: 'ord-3',
    orderCode: 'ORD-10475',
    serviceCategory: 'Deep Cleaning',
    serviceDetail: '2 bedroom',
    providerId: 'provider-2',
    providerName: 'Elena Rossi',
    providerAvatar: provider2Img,
    status: 'Completed',
    scheduledTime: 'Sep 20, 2026, 1:00 PM – 4:00 PM',
    price: 89,
    reviewPending: true,
    address: '142 Market Street, Apt 4B',
    notes: 'Move-out deep cleaning, focus on kitchen oven and bathrooms.'
  },
  {
    id: 'ord-4',
    orderCode: 'ORD-10460',
    serviceCategory: 'Plumbing',
    serviceDetail: 'Kitchen faucet replacement',
    providerId: 'provider-5',
    providerName: 'Marcus Lee',
    providerAvatar: provider5Img,
    status: 'Completed',
    scheduledTime: 'Sep 12, 2026, 10:00 AM – 11:00 AM',
    price: 74,
    address: '142 Market Street, Apt 4B',
    notes: 'Old faucet leaking around base. New replacement faucet on-site.'
  }
];
