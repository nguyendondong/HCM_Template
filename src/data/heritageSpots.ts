import { HeritageSpot } from '../types/heritage';

export const heritageSpots: HeritageSpot[] = [
  {
    id: 'kim-lien',
    name: 'Khu di tích Kim Liên',
    description: 'Quê hương Chủ tịch Hồ Chí Minh - Nơi sinh và trưởng thành của Người, ghi dấu những năm tháng đầu đời hình thành ý chí cách mạng.',
    coordinates: { x: 25, y: 26 },
    side: 'left',
    url: 'https://kimlienvn.gov.vn/'
  },
  {
    id: 'ha-noi-complex',
    name: 'Khu di tích Hà Nội',
    description: 'Bao gồm Bảo tàng Hồ Chí Minh, Phủ Chủ tịch, Di tích 48 Hàng Ngang và Vạn Phúc - Nơi ghi dấu những hoạt động quan trọng của Bác tại Thủ đô.',
    coordinates: { x: 35, y: 15 },
    side: 'left',
    url: 'https://baotanghochiminh.vn/'
  },
  {
    id: 'hue',
    name: 'Khu di tích Huế',
    description: 'Nơi ghi dấu những năm tháng hoạt động cách mạng của Bác Hồ tại Thừa Thiên Huế.',
    coordinates: { x: 55, y: 45 },
    side: 'right',
    url: 'https://baotanghcmtthue.hochiminh.vn/'
  },
  {
    id: 'binh-dinh',
    name: 'Khu di tích Bình Định',
    description: 'Nơi ghi dấu những năm tháng hoạt động cách mạng của Bác Hồ tại Bình Định.',
    coordinates: { x: 62, y: 54 },
    side: 'right',
    url: 'https://binhdinh.hochiminh.vn/'
  },
  {
    id: 'ben-nha-rong',
    name: 'Bến Nhà Rồng',
    description: 'Bảo tàng Hồ Chí Minh - Nơi chàng thanh niên Nguyễn Tất Thành bước lên con tàu Amiral Latouche Tréville ra đi tìm đường cứu nước.',
    coordinates: { x: 45, y: 81 },
    side: 'right',
    url: 'https://baotanghochiminh.vn/chi-nhanh-ben-nha-rong'
  },
  {
    id: 'pac-bo',
    name: 'Khu di tích Pác Bó',
    description: 'Cội nguồn cách mạng Việt Nam - Nơi Người trở về sau 30 năm đi tìm đường cứu nước, lập căn cứ đầu tiên của cách mạng.',
    coordinates: { x: 35, y: 5 },
    side: 'right',
    url: 'https://pacbo.hochiminh.vn/'
  },
  {
    id: 'tan-trao',
    name: 'Khu di tích Tân Trào',
    description: 'Thủ đô Khu giải phóng - Nơi diễn ra Đại hội Quốc dân đầu tiên, ra đời nước Việt Nam Dân chủ Cộng hòa.',
    coordinates: { x: 25, y: 7},
    side: 'left',
    url: 'https://tantrao.hochiminh.vn/'
  },
  {
    id: 'co-to',
    name: 'Khu lưu niệm Cô Tô',
    description: 'Nơi lưu giữ kỷ niệm về chuyến thăm của Bác Hồ đến đảo Cô Tô, thể hiện tình cảm của Người với ngư dân và biển đảo.',
    coordinates: { x: 45, y: 18 },
    side: 'right',
    url: 'https://vr360.com.vn/projects/khu-luu-niem-chu-tich-ho-chi-minh/'
  },
  {
    id: 'can-tho',
    name: 'Bảo tàng Hồ Chí Minh Cần Thơ',
    description: 'Chi nhánh Đồng bằng sông Cửu Long - Nơi lưu giữ những kỷ niệm về chuyến thăm lịch sử của Bác đến miền Tây Nam Bộ.',
    coordinates: { x: 33, y: 85 },
    side: 'left',
    url: 'https://cantho.hochiminh.vn/'
  }
];
