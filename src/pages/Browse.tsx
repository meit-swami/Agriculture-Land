import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppLayout from '@/components/layout/AppLayout';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchableSelect from '@/components/ui/searchable-select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { mockProperties, states, formatPrice, formatPriceEn, Property } from '@/data/mockProperties';
import { stateOptions, getDistrictOptions, sortOptions } from '@/data/selectOptions';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, CheckCircle2, Clock, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const normalizeDbProperty = (p: any): Property & { isDb?: boolean } => ({
  id: p.id, title: p.title, titleEn: p.title_en, state: p.state, district: p.district,
  tehsil: p.tehsil, village: p.village, landType: p.land_type, category: p.category,
  area: p.area, areaUnit: p.area_unit, khasraNumber: p.khasra_number,
  askingPrice: p.asking_price, negotiable: p.negotiable, ownerType: p.owner_type,
  ownerName: p.owner_name, ownerPhone: p.owner_phone, verified: p.verified,
  images: p.images || ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop'],
  postedDate: new Date(p.created_at).toISOString().split('T')[0], isDb: true,
});

const allStatesWithAll = [{ value: 'all', label: 'सभी राज्य', searchAlt: 'All States' }, ...stateOptions];

const Browse = () => {
  const { t, lang } = useLanguage();
  const priceFmt = lang === 'hi' ? formatPrice : formatPriceEn;
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ state: 'all', district: '', verifiedOnly: false, sortBy: 'date' });
  const districtOpts = useMemo(() => {
    const opts = getDistrictOptions(filters.state);
    return opts.length > 0 ? [{ value: 'all', label: 'सभी जिले', searchAlt: 'All Districts' }, ...opts] : [];
  }, [filters.state]);
  const [dbProperties, setDbProperties] = useState<(Property & { isDb?: boolean })[]>([]);
  const [cardPriceUnit, setCardPriceUnit] = useState<'bigha' | 'acre'>('bigha');
  const BIGHA_PER_ACRE = 5;

  useEffect(() => {
    const fetchDbProperties = async () => {
      const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
      if (data) setDbProperties(data.map(normalizeDbProperty));
    };
    fetchDbProperties();
  }, []);

  const allProperties = useMemo(() => [...dbProperties, ...mockProperties], [dbProperties]);

  const filtered = useMemo(() => {
    let list = [...allProperties];
    if (filters.state && filters.state !== 'all') list = list.filter((p) => p.state === filters.state);
    if (filters.district && filters.district !== 'all') list = list.filter((p) => p.district === filters.district);
    if (filters.verifiedOnly) list = list.filter((p) => p.verified);
    if (filters.sortBy === 'price-asc') list.sort((a, b) => a.askingPrice - b.askingPrice);
    if (filters.sortBy === 'price-desc') list.sort((a, b) => b.askingPrice - a.askingPrice);
    if (filters.sortBy === 'area') list.sort((a, b) => b.area - a.area);
    return list;
  }, [filters, allProperties]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('भूमि खोजें', 'Browse Lands')}</h1>
          <Button variant="outline" size="sm" className="md:hidden" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <X className="h-4 w-4 mr-1" /> : <Filter className="h-4 w-4 mr-1" />}
            {t('फ़िल्टर', 'Filters')}
          </Button>
        </div>

        <div className="flex gap-6">
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
            <Card className="border-0 shadow-md">
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label>{t('राज्य', 'State')}</Label>
                  <SearchableSelect options={allStatesWithAll} value={filters.state} onValueChange={(v) => setFilters((f) => ({ ...f, state: v, district: '' }))} placeholder={t('सभी राज्य', 'All States')} />
                </div>
                {districtOpts.length > 0 && (
                  <div>
                    <Label>{t('जिला', 'District')}</Label>
                    <SearchableSelect options={districtOpts} value={filters.district || 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, district: v === 'all' ? '' : v }))} placeholder={t('सभी जिले', 'All Districts')} />
                  </div>
                )}
                <div>
                  <Label>{t('क्रमबद्ध करें', 'Sort By')}</Label>
                  <SearchableSelect options={sortOptions} value={filters.sortBy} onValueChange={(v) => setFilters((f) => ({ ...f, sortBy: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t('केवल सत्यापित', 'Verified Only')}</Label>
                  <Switch checked={filters.verifiedOnly} onCheckedChange={(v) => setFilters((f) => ({ ...f, verifiedOnly: v }))} />
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setFilters({ state: 'all', district: '', verifiedOnly: false, sortBy: 'date' })}>
                  {t('फ़िल्टर रीसेट करें', 'Reset Filters')}
                </Button>
              </CardContent>
            </Card>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{filtered.length} {t('भूमि मिली', 'properties found')}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{t('कीमत:', 'Price:')}</span>
                <button onClick={() => setCardPriceUnit('bigha')} className={`px-2 py-1 rounded ${cardPriceUnit === 'bigha' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>/{t('बीघा', 'Bigha')}</button>
                <button onClick={() => setCardPriceUnit('acre')} className={`px-2 py-1 rounded ${cardPriceUnit === 'acre' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>/{t('एकड़', 'Acre')}</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((property) => (
                <Link key={property.id} to={`/property/${property.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer border-0 shadow-md h-full">
                    <div className="relative h-44 overflow-hidden">
                      <img src={property.images[0]} alt={lang === 'hi' ? property.title : property.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                      <Badge className={`absolute top-2 left-2 text-xs ${property.verified ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
                        {property.verified ? <><CheckCircle2 className="h-3 w-3 mr-1" />{t('सत्यापित', 'Verified')}</> : <><Clock className="h-3 w-3 mr-1" />{t('सत्यापन लंबित', 'Pending')}</>}
                      </Badge>
                      <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs">
                        {property.ownerType === 'owner' ? t('मालिक', 'Owner') : t('ब्रोकर', 'Broker')}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{lang === 'hi' ? property.title : property.titleEn}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2"><MapPin className="h-3 w-3" />{property.district}, {property.state}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {cardPriceUnit === 'acre' ? priceFmt(Math.round((property.askingPrice / property.area) * BIGHA_PER_ACRE)) : priceFmt(Math.round(property.askingPrice / property.area))}
                          <span className="text-xs font-normal text-muted-foreground">/{cardPriceUnit === 'acre' ? t('एकड़', 'Acre') : t('बीघा', 'Bigha')}</span>
                        </span>
                        <span className="text-xs text-muted-foreground">{property.area} {property.areaUnit === 'bigha' ? t('बीघा', 'Bigha') : t('एकड़', 'Acre')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </AppLayout>
  );
};

export default Browse;
