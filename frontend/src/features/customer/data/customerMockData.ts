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
  'Máy lạnh không mát và chảy nước',
  'Bồn rửa chén bị nghẹt, nước thoát chậm',
  'Ổ cắm điện phòng ngủ bị chập, mất điện',
  'Cần dọn dẹp nhà cửa tổng thể trước khi chuyển đi'
];

export const mockCategories: CategoryItem[] = [
  {
    id: 'ac-repair',
    title: 'Sửa điện lạnh',
    description: 'Sửa máy lạnh không mát, rò nước, bảo dưỡng & lắp đặt',
    priceFrom: 150000,
    completedJobs: '12k+ đơn',
    icon: 'snowflake'
  },
  {
    id: 'electrical',
    title: 'Sửa điện gia dụng',
    description: 'Đấu nối dây, ổ cắm, tủ điện, cầu dao & đèn chiếu sáng',
    priceFrom: 120000,
    completedJobs: '9k+ đơn',
    icon: 'zap'
  },
  {
    id: 'plumbing',
    title: 'Sửa đường nước',
    description: 'Rò rỉ ống, thông tắc, thay vòi & bình nước nóng',
    priceFrom: 120000,
    completedJobs: '15k+ đơn',
    icon: 'wrench'
  },
  {
    id: 'cleaning',
    title: 'Vệ sinh & Dọn dẹp',
    description: 'Tổng vệ sinh, dọn định kỳ & dọn nhà chuyển đi',
    priceFrom: 100000,
    completedJobs: '20k+ đơn',
    icon: 'sparkles'
  },
  {
    id: 'locksmith',
    title: 'Sửa khóa & Cửa',
    description: 'Mở khóa khẩn cấp, thay ổ khóa & cài khóa thông minh',
    priceFrom: 150000,
    completedJobs: '5k+ đơn',
    icon: 'key'
  },
  {
    id: 'handyman',
    title: 'Thợ sửa tổng hợp',
    description: 'Khoan tường, lắp kệ, sửa cửa & việc vặt gia đình',
    priceFrom: 100000,
    completedJobs: '18k+ đơn',
    icon: 'hammer'
  },
  {
    id: 'painting',
    title: 'Sơn sửa nhà',
    description: 'Sơn dặm vá tường, sơn mới nội thất & chống thấm',
    priceFrom: 200000,
    completedJobs: '7k+ đơn',
    icon: 'paint-roller'
  },
  {
    id: 'pest-control',
    title: 'Diệt côn trùng',
    description: 'Kiểm soát mối, diệt gián, kiến & khử trùng',
    priceFrom: 180000,
    completedJobs: '4k+ đơn',
    icon: 'bug'
  }
];

export const providerCategoryFilters: string[] = [
  'Tất cả dịch vụ',
  'Sửa điện lạnh',
  'Sửa điện gia dụng',
  'Sửa đường nước',
  'Vệ sinh & Dọn dẹp',
  'Sửa khóa & Cửa',
  'Thợ sửa tổng hợp',
  'Sơn sửa nhà',
  'Diệt côn trùng'
];

export const mockProviders: ProviderItem[] = [
  {
    id: 'provider-1',
    name: 'Nguyễn Văn Hùng',
    verified: true,
    company: 'Điện Lạnh Siêu Tốc',
    rating: 4.9,
    reviewsCount: 412,
    distance: '1.2 km',
    pricePerHour: 150000,
    category: 'Sửa điện lạnh',
    isTopRated: true,
    availability: 'Available today',
    avatar: provider1Img,
    experienceYears: 12,
    completedJobsCount: '1,840',
    responseTime: '~10 phút',
    availabilityDetail: 'Sẵn sàng hôm nay, 14:00',
    about: 'Kỹ thuật viên điện lạnh với hơn 10 năm kinh nghiệm chuyên chẩn đoán, sửa chữa và vệ sinh các dòng máy lạnh dân dụng. Thao tác nhanh gọn, sạch sẽ và bảo hành dài hạn.',
    skills: ['Sửa máy lạnh', 'Khắc phục rò rỉ gas', 'Lắp đặt máy lạnh', 'Bảo dưỡng định kỳ'],
    aiInsight: 'Chuyên gia xử lý sự cố máy lạnh không mát & rò rỉ nước dàn lạnh.',
    reviews: [
      {
        id: 'r1-1',
        author: 'Nguyễn Kiều Oanh',
        avatarLetter: 'O',
        service: 'Sửa máy lạnh',
        date: '2 ngày trước',
        rating: 5,
        comment: 'Anh Hùng kiểm tra rất nhanh và khắc phục dứt điểm rò rỉ nước ngay trong buổi chiều. Tác phong cực kỳ chuyên nghiệp và dọn dẹp sạch sẽ.'
      },
      {
        id: 'r1-2',
        author: 'Phạm Minh Tuấn',
        avatarLetter: 'T',
        service: 'Bảo dưỡng máy lạnh',
        date: '1 tuần trước',
        rating: 5,
        comment: 'Đúng giờ, giá cả hợp lý và giải thích rõ ràng từng khoản chi phí. Máy lạnh sau khi làm chạy êm và mát sâu hơn hẳn.'
      },
      {
        id: 'r1-3',
        author: 'Trần Hương Ly',
        avatarLetter: 'L',
        service: 'Sửa máy lạnh',
        date: '3 tuần trước',
        rating: 4,
        comment: 'Tay nghề tốt, xử lý chắc chắn và giá cả trung thực.'
      }
    ]
  },
  {
    id: 'provider-2',
    name: 'Trần Thị Mai',
    verified: true,
    company: 'Dịch Vụ Vệ Sinh Nhà Sạch',
    rating: 4.9,
    reviewsCount: 524,
    distance: '1.8 km',
    pricePerHour: 120000,
    category: 'Vệ sinh & Dọn dẹp',
    isTopRated: true,
    availability: 'Available today',
    avatar: provider2Img,
    experienceYears: 8,
    completedJobsCount: '2,410',
    responseTime: '~15 phút',
    availabilityDetail: 'Sẵn sàng hôm nay, 15:30',
    about: 'Chuyên gia dọn dẹp nhà ở và tổng vệ sinh chuyên sâu. Sử dụng dung dịch sinh học an toàn cho trẻ nhỏ và thú cưng.',
    skills: ['Tổng vệ sinh', 'Dọn nhà chuyển đi', 'Khử khuẩn nhà cửa', 'Lau kính ban công'],
    aiInsight: 'Top thợ được yêu thích nhất cho dịch vụ tổng vệ sinh dọn nhà chuyển đi.',
    reviews: [
      {
        id: 'r2-1',
        author: 'Hoàng Mai Phương',
        avatarLetter: 'P',
        service: 'Tổng vệ sinh',
        date: '3 ngày trước',
        rating: 5,
        comment: 'Chị Mai và đội ngũ làm việc tỉ mỉ, sàn nhà và bếp sạch bong không còn tì vết.'
      },
      {
        id: 'r2-2',
        author: 'Đặng Tuấn Kiệt',
        avatarLetter: 'K',
        service: 'Vệ sinh nhà ở',
        date: '1 tuần trước',
        rating: 5,
        comment: 'Thái độ lịch sự, làm nhanh và rất kỹ càng. Sẽ tiếp tục đặt lại.'
      }
    ]
  },
  {
    id: 'provider-3',
    name: 'Lê Minh Tuấn',
    verified: true,
    company: 'Điện Gia Dụng Minh Tuấn',
    rating: 4.8,
    reviewsCount: 287,
    distance: '2.4 km',
    pricePerHour: 130000,
    category: 'Sửa điện gia dụng',
    isTopRated: true,
    availability: 'Available soon',
    avatar: provider3Img,
    experienceYears: 10,
    completedJobsCount: '1,320',
    responseTime: '~20 phút',
    availabilityDetail: 'Sẵn sàng ngày mai, 09:00',
    about: 'Thợ điện có chứng chỉ hành nghề, xử lý an toàn hệ thống điện âm tường, cầu dao tự động, tủ điện và đèn trang trí.',
    skills: ['Nâng cấp tủ điện', 'Đi dây & ổ cắm', 'Lắp đèn chiếu sáng', 'Kiểm tra an toàn điện'],
    aiInsight: 'Nổi bật với khả năng dò tìm sự cố chập điện ngầm cực nhanh.',
    reviews: [
      {
        id: 'r3-1',
        author: 'Vũ Quốc Bảo',
        avatarLetter: 'B',
        service: 'Sửa chữa điện',
        date: '4 ngày trước',
        rating: 5,
        comment: 'Anh Tuấn xử lý dứt điểm tình trạng nhảy aptomat liên tục mà thợ khác không tìm ra nguyên nhân.'
      }
    ]
  },
  {
    id: 'provider-4',
    name: 'Hoàng Quốc Việt',
    verified: true,
    company: 'Khóa Cấp Tốc 24/7',
    rating: 4.8,
    reviewsCount: 176,
    distance: '2.9 km',
    pricePerHour: 150000,
    category: 'Sửa khóa & Cửa',
    isTopRated: true,
    availability: 'Available today',
    avatar: provider4Img,
    experienceYears: 9,
    completedJobsCount: '980',
    responseTime: '~10 phút',
    availabilityDetail: 'Sẵn sàng hôm nay, 13:15',
    about: 'Chuyên gia mở khóa cứu hộ khẩn cấp và lắp đặt khóa cửa cao cấp. Có mặt thần tốc dưới 15 phút.',
    skills: ['Mở khóa khẩn cấp', 'Thay ổ khóa cửa', 'Cài đặt khóa thông minh', 'Làm chìa khóa mới'],
    aiInsight: 'Thời gian có mặt khẩn cấp chỉ 10-15 phút tại nội thành.',
    reviews: [
      {
        id: 'r4-1',
        author: 'Lê Thảo My',
        avatarLetter: 'M',
        service: 'Lắp khóa thông minh',
        date: '5 ngày trước',
        rating: 5,
        comment: 'Anh Việt đến rất đúng giờ, lắp đặt khóa vân tay nhanh và hướng dẫn sử dụng rất kỹ càng.'
      }
    ]
  },
  {
    id: 'provider-5',
    name: 'Phạm Đức Long',
    verified: true,
    company: 'Điện Nước Thông Suốt',
    rating: 4.7,
    reviewsCount: 356,
    distance: '3.1 km',
    pricePerHour: 140000,
    category: 'Sửa đường nước',
    isTopRated: false,
    availability: 'Available today',
    avatar: provider5Img,
    experienceYears: 11,
    completedJobsCount: '1,560',
    responseTime: '~15 phút',
    availabilityDetail: 'Sẵn sàng hôm nay, 16:00',
    about: 'Thợ sửa ống nước lành nghề, xử lý tắc nghẹt đường ống, rò rỉ bồn nước, thay thiết bị vệ sinh với chi phí công khai minh bạch.',
    skills: ['Dò rò rỉ nước ngầm', 'Thông tắc bồn rửa', 'Hàn sửa ống nước', 'Lắp bình nước nóng'],
    aiInsight: 'Chuyên xử lý các sự cố tắc nghẽn và rò rỉ nước khó.',
    reviews: [
      {
        id: 'r5-1',
        author: 'Trần Văn Thịnh',
        avatarLetter: 'T',
        service: 'Sửa ống nước',
        date: '1 tuần trước',
        rating: 5,
        comment: 'Anh Long xử lý đường ống rò rỉ dưới bồn rửa rất nhanh và sạch sẽ.'
      }
    ]
  },
  {
    id: 'provider-6',
    name: 'Đặng Đình Huy',
    verified: true,
    company: 'Tiện Ích Nhà Cửa Huy Đặng',
    rating: 4.6,
    reviewsCount: 198,
    distance: '4.5 km',
    pricePerHour: 120000,
    category: 'Thợ sửa tổng hợp',
    isTopRated: false,
    availability: 'Available soon',
    avatar: provider6Img,
    experienceYears: 7,
    completedJobsCount: '890',
    responseTime: '~25 phút',
    availabilityDetail: 'Sẵn sàng ngày mai, 10:00',
    about: 'Thợ sửa tổng hợp đa năng, chuyên khoan tường, treo TV, sửa bản lề cửa, lắp ráp nội thất và xử lý các sự cố lặt vặt trong nhà.',
    skills: ['Lắp giá treo TV', 'Trám trét tường thạch cao', 'Lắp ráp đồ gỗ', 'Cân chỉnh cửa đi'],
    aiInsight: 'Thợ đa năng phù hợp nhất để giải quyết cùng lúc nhiều việc vặt trong nhà.',
    reviews: [
      {
        id: 'r6-1',
        author: 'Đỗ Thùy Trang',
        avatarLetter: 'T',
        service: 'Lắp ráp nội thất',
        date: '2 tuần trước',
        rating: 5,
        comment: 'Thao tác cực kỳ nhanh, đầy đủ máy móc dụng cụ chuyên dụng. Rất ưng ý!'
      }
    ]
  },
  {
    id: 'provider-7',
    name: 'Vũ Đức Thành',
    verified: true,
    company: 'Sơn Nhà Hoàn Mỹ',
    rating: 4.8,
    reviewsCount: 145,
    distance: '3.8 km',
    pricePerHour: 180000,
    category: 'Sơn sửa nhà',
    isTopRated: true,
    availability: 'Available today',
    avatar: provider1Img,
    experienceYears: 14,
    completedJobsCount: '1,120',
    responseTime: '~15 phút',
    availabilityDetail: 'Sẵn sàng hôm nay, 14:30',
    about: 'Thợ sơn chuyên nghiệp phục vụ nhà phố và căn hộ. Tỉ mỉ từ khâu che chắn, vệ sinh bề mặt cho đến lớp sơn hoàn thiện sắc nét.',
    skills: ['Sơn tường nội thất', 'Xử lý chân tường mốc', 'Bả matit tường', 'Tư vấn phối màu sơn'],
    aiInsight: 'Khách hàng đánh giá rất cao về độ sạch sẽ và che chắn đồ đạc cẩn thận.',
    reviews: [
      {
        id: 'r7-1',
        author: 'Ngô Thanh Hùng',
        avatarLetter: 'H',
        service: 'Sơn nội thất',
        date: '1 tuần trước',
        rating: 5,
        comment: 'Sơn lại phòng khách trong 2 ngày đẹp như mới. Đường viền sắc sảo và không bị vương vãi sơn ra sàn.'
      }
    ]
  },
  {
    id: 'provider-8',
    name: 'Bùi Gia Khiêm',
    verified: true,
    company: 'Bảo Vệ Nhà Xanh',
    rating: 4.9,
    reviewsCount: 210,
    distance: '2.1 km',
    pricePerHour: 160000,
    category: 'Diệt côn trùng',
    isTopRated: false,
    availability: 'Available today',
    avatar: provider4Img,
    experienceYears: 10,
    completedJobsCount: '1,450',
    responseTime: '~10 phút',
    availabilityDetail: 'Sẵn sàng hôm nay, 13:00',
    about: 'Chuyên gia kiểm soát và diệt trừ côn trùng gây hại với hóa chất sinh học không mùi, an toàn tuyệt đối cho người già và vật nuôi.',
    skills: ['Phòng chống mối ngầm', 'Diệt gián kiến sinh học', 'Phun thuốc an toàn', 'Bảo hành định kỳ'],
    aiInsight: 'Phương pháp diệt sinh học hiệu quả và an toàn cho gia đình.',
    reviews: [
      {
        id: 'r8-1',
        author: 'Nguyễn Bích Ngọc',
        avatarLetter: 'N',
        service: 'Diệt côn trùng',
        date: '3 ngày trước',
        rating: 5,
        comment: 'Đã xử lý sạch sẽ ổ kiến và gián ở khu vực bếp. Rất yên tâm vì thuốc không có mùi hôi.'
      }
    ]
  }
];

export const mockCustomerOrders: CustomerOrder[] = [
  {
    id: 'ord-1',
    orderCode: 'ORD-10482',
    serviceCategory: 'Sửa điện lạnh',
    serviceDetail: 'Khắc phục máy lạnh rò rỉ nước',
    providerId: 'provider-1',
    providerName: 'Nguyễn Văn Hùng',
    providerAvatar: provider1Img,
    status: 'In progress',
    scheduledTime: '23 Tháng 9, 2026, 14:00 – 15:30',
    price: 350000,
    address: '142 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1',
    notes: 'Dàn lạnh trong nhà bị rò nước nhỏ giọt xuống sàn, gió thổi không mát.'
  },
  {
    id: 'ord-2',
    orderCode: 'ORD-10501',
    serviceCategory: 'Sửa điện gia dụng',
    serviceDetail: 'Lắp đặt thêm 2 ổ cắm âm tường',
    providerId: 'provider-3',
    providerName: 'Trần Thị Mai',
    providerAvatar: provider3Img,
    status: 'Scheduled',
    scheduledTime: '28 Tháng 9, 2026, 09:00 – 10:00',
    price: 250000,
    address: '142 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1',
    notes: 'Cần đấu thêm 2 ổ cắm điện chịu tải cao tại phòng làm việc.'
  },
  {
    id: 'ord-3',
    orderCode: 'ORD-10475',
    serviceCategory: 'Vệ sinh & Dọn dẹp',
    serviceDetail: 'Tổng vệ sinh căn hộ 2 phòng ngủ',
    providerId: 'provider-2',
    providerName: 'Lê Minh Tuấn',
    providerAvatar: provider2Img,
    status: 'Completed',
    scheduledTime: '20 Tháng 9, 2026, 13:00 – 16:00',
    price: 450000,
    reviewPending: true,
    address: '142 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1',
    notes: 'Dọn dẹp tổng thể trước khi nhận nhà mới, đặc biệt khu bếp và toilet.'
  },
  {
    id: 'ord-4',
    orderCode: 'ORD-10460',
    serviceCategory: 'Sửa đường nước',
    serviceDetail: 'Thay mới vòi bồn rửa chén',
    providerId: 'provider-5',
    providerName: 'Phạm Đức Long',
    providerAvatar: provider5Img,
    status: 'Completed',
    scheduledTime: '12 Tháng 9, 2026, 10:00 – 11:00',
    price: 200000,
    address: '142 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1',
    notes: 'Vòi cũ bị nứt cổ rò rỉ nước. Gia đình đã mua sẵn vòi mới thay thế.'
  }
];
