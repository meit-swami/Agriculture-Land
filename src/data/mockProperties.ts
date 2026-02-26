export interface Property {
  id: string;
  title: string;
  titleEn: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  landType: 'irrigated' | 'non-irrigated';
  category: string;
  area: number;
  areaUnit: 'bigha' | 'acre';
  khasraNumber: string;
  askingPrice: number;
  negotiable: boolean;
  ownerType: 'owner' | 'broker';
  ownerName: string;
  ownerPhone: string;
  verified: boolean;
  images: string[];
  postedDate: string;
}

export const mockProperties: Property[] = [
  {
    id: '1',
    title: '5 बीघा सिंचित कृषि भूमि — जयपुर',
    titleEn: '5 Bigha Irrigated Farm Land — Jaipur',
    state: 'राजस्थान',
    district: 'जयपुर',
    tehsil: 'सांगानेर',
    village: 'वाटिका',
    landType: 'irrigated',
    category: 'General',
    area: 5,
    areaUnit: 'bigha',
    khasraNumber: '123/4',
    askingPrice: 2500000,
    negotiable: true,
    ownerType: 'owner',
    ownerName: 'रामकुमार शर्मा',
    ownerPhone: '9876543210',
    verified: true,
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop'],
    postedDate: '2026-02-20',
  },
  {
    id: '2',
    title: '10 बीघा गैर-सिंचित भूमि — लखनऊ',
    titleEn: '10 Bigha Non-Irrigated Land — Lucknow',
    state: 'उत्तर प्रदेश',
    district: 'लखनऊ',
    tehsil: 'मलिहाबाद',
    village: 'काकोरी',
    landType: 'non-irrigated',
    category: 'General',
    area: 10,
    areaUnit: 'bigha',
    khasraNumber: '456/7',
    askingPrice: 4500000,
    negotiable: false,
    ownerType: 'broker',
    ownerName: 'सुरेश यादव',
    ownerPhone: '9876543211',
    verified: false,
    images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop'],
    postedDate: '2026-02-18',
  },
  {
    id: '3',
    title: '3 एकड़ सिंचित भूमि — इंदौर',
    titleEn: '3 Acre Irrigated Land — Indore',
    state: 'मध्य प्रदेश',
    district: 'इंदौर',
    tehsil: 'देपालपुर',
    village: 'पिपलिया',
    landType: 'irrigated',
    category: 'SC',
    area: 3,
    areaUnit: 'acre',
    khasraNumber: '789/1',
    askingPrice: 7500000,
    negotiable: true,
    ownerType: 'owner',
    ownerName: 'विजय मालवीय',
    ownerPhone: '9876543212',
    verified: true,
    images: ['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop'],
    postedDate: '2026-02-15',
  },
  {
    id: '4',
    title: '8 बीघा कृषि भूमि — पटना',
    titleEn: '8 Bigha Farm Land — Patna',
    state: 'बिहार',
    district: 'पटना',
    tehsil: 'फुलवारी',
    village: 'दानापुर',
    landType: 'irrigated',
    category: 'General',
    area: 8,
    areaUnit: 'bigha',
    khasraNumber: '321/5',
    askingPrice: 3200000,
    negotiable: true,
    ownerType: 'owner',
    ownerName: 'अनिल कुमार',
    ownerPhone: '9876543213',
    verified: true,
    images: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop'],
    postedDate: '2026-02-10',
  },
  {
    id: '5',
    title: '2 एकड़ भूमि — नासिक',
    titleEn: '2 Acre Land — Nashik',
    state: 'महाराष्ट्र',
    district: 'नासिक',
    tehsil: 'निफाड',
    village: 'ओझर',
    landType: 'non-irrigated',
    category: 'ST',
    area: 2,
    areaUnit: 'acre',
    khasraNumber: '654/2',
    askingPrice: 5000000,
    negotiable: false,
    ownerType: 'broker',
    ownerName: 'प्रकाश देशमुख',
    ownerPhone: '9876543214',
    verified: false,
    images: ['https://images.unsplash.com/photo-1595841696677-6589b41de5ba?w=600&h=400&fit=crop'],
    postedDate: '2026-02-05',
  },
  {
    id: '6',
    title: '15 बीघा सिंचित भूमि — उदयपुर',
    titleEn: '15 Bigha Irrigated Land — Udaipur',
    state: 'राजस्थान',
    district: 'उदयपुर',
    tehsil: 'गिर्वा',
    village: 'बड़गांव',
    landType: 'irrigated',
    category: 'General',
    area: 15,
    areaUnit: 'bigha',
    khasraNumber: '999/3',
    askingPrice: 8000000,
    negotiable: true,
    ownerType: 'owner',
    ownerName: 'महेश सिंह',
    ownerPhone: '9876543215',
    verified: true,
    images: ['https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&h=400&fit=crop'],
    postedDate: '2026-02-01',
  },
];

export const states = [
  'राजस्थान', 'उत्तर प्रदेश', 'मध्य प्रदेश', 'बिहार', 'महाराष्ट्र',
  'गुजरात', 'पंजाब', 'हरियाणा', 'कर्नाटक', 'तमिलनाडु',
];

export const formatPrice = (price: number): string => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} करोड़`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} लाख`;
  return `₹${price.toLocaleString('hi-IN')}`;
};

export const formatPriceEn = (price: number): string => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lakh`;
  return `₹${price.toLocaleString('en-IN')}`;
};
