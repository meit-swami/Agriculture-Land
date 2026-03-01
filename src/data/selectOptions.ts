import { SearchableSelectOption } from '@/components/ui/searchable-select';
import { states } from '@/data/mockProperties';
import { getRajasthanDistricts, getTehsilsForDistrict } from '@/data/rajasthanData';

// State options with English search alt
const stateEnMap: Record<string, string> = {
  'राजस्थान': 'Rajasthan',
  'उत्तर प्रदेश': 'Uttar Pradesh',
  'मध्य प्रदेश': 'Madhya Pradesh',
  'बिहार': 'Bihar',
  'महाराष्ट्र': 'Maharashtra',
  'गुजरात': 'Gujarat',
  'पंजाब': 'Punjab',
  'हरियाणा': 'Haryana',
  'कर्नाटक': 'Karnataka',
  'तमिलनाडु': 'Tamil Nadu',
};

export const stateOptions: SearchableSelectOption[] = states.map((s) => ({
  value: s,
  label: s,
  searchAlt: stateEnMap[s] || '',
}));

export const getDistrictOptions = (state: string): SearchableSelectOption[] => {
  if (state === 'राजस्थान') {
    return getRajasthanDistricts().map((d) => ({ value: d, label: d }));
  }
  return [];
};

export const getTehsilOptions = (district: string): SearchableSelectOption[] => {
  return getTehsilsForDistrict(district).map((t) => ({ value: t, label: t }));
};

// Small fixed-option helpers
export const landTypeOptions: SearchableSelectOption[] = [
  { value: 'irrigated', label: 'सिंचित', searchAlt: 'Irrigated' },
  { value: 'non-irrigated', label: 'गैर-सिंचित', searchAlt: 'Non-Irrigated' },
];

export const categoryOptions: SearchableSelectOption[] = [
  { value: 'General', label: 'General' },
  { value: 'SC', label: 'SC' },
  { value: 'ST', label: 'ST' },
  { value: 'Other', label: 'Other' },
];

export const areaUnitOptions: SearchableSelectOption[] = [
  { value: 'bigha', label: 'बीघा', searchAlt: 'Bigha' },
  { value: 'acre', label: 'एकड़', searchAlt: 'Acre' },
];

export const ownerTypeOptions: SearchableSelectOption[] = [
  { value: 'owner', label: 'मालिक', searchAlt: 'Owner' },
  { value: 'broker', label: 'ब्रोकर', searchAlt: 'Broker' },
];

export const sortOptions: SearchableSelectOption[] = [
  { value: 'date', label: 'तारीख', searchAlt: 'Date' },
  { value: 'price-asc', label: 'कीमत: कम से ज़्यादा', searchAlt: 'Price Low to High' },
  { value: 'price-desc', label: 'कीमत: ज़्यादा से कम', searchAlt: 'Price High to Low' },
  { value: 'area', label: 'क्षेत्रफल', searchAlt: 'Area' },
];

export const roleOptions: SearchableSelectOption[] = [
  { value: 'buyer', label: 'खरीदार', searchAlt: 'Buyer' },
  { value: 'seller', label: 'विक्रेता', searchAlt: 'Seller' },
  { value: 'agent', label: 'एजेंट', searchAlt: 'Agent' },
  { value: 'admin', label: 'एडमिन', searchAlt: 'Admin' },
];
