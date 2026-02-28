import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { mockProperties, formatPrice, formatPriceEn, states } from '@/data/mockProperties';
import {
  MapPin, CheckCircle2, Send, User, Phone, IndianRupee, Ruler,
  Filter, Droplets, Sun, ClipboardList, Building2, TrendingUp, Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BuyerLanding = () => {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const priceFmt = lang === 'hi' ? formatPrice : formatPriceEn;

  const [started, setStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('browse');

  // Query form state
  const [form, setForm] = useState({
    name: '', phone: '', state: '', budgetMin: '', budgetMax: '', areaMin: '', message: '',
  });
  const [formUnit, setFormUnit] = useState<'bigha' | 'acre'>('bigha');
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [filterState, setFilterState] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterLandType, setFilterLandType] = useState('all');
  const [filterBudgetMax, setFilterBudgetMax] = useState('');
  const [budgetUnit, setBudgetUnit] = useState<'bigha' | 'acre'>('bigha');

  // 1 Acre = 5 Bigha (standard conversion)
  const BIGHA_PER_ACRE = 5;

  const availableDistricts = useMemo(() => {
    const source = filterState !== 'all' ? mockProperties.filter((p) => p.state === filterState) : mockProperties;
    return [...new Set(source.map((p) => p.district))].sort();
  }, [filterState]);

  const filteredProperties = useMemo(() => {
    return mockProperties.filter((p) => {
      if (filterState !== 'all' && p.state !== filterState) return false;
      if (filterDistrict !== 'all' && p.district !== filterDistrict) return false;
      if (filterLandType !== 'all' && p.landType !== filterLandType) return false;
      if (filterBudgetMax) {
        // Price per bigha from property
        const pricePerBigha = p.area > 0 ? p.askingPrice / p.area : 0;
        const budgetVal = Number(filterBudgetMax);
        if (budgetUnit === 'acre') {
          // Convert entered per-acre budget to per-bigha for comparison
          const perBigha = budgetVal / BIGHA_PER_ACRE;
          if (pricePerBigha > perBigha) return false;
        } else {
          if (pricePerBigha > budgetVal) return false;
        }
      }
      return true;
    });
  }, [filterState, filterDistrict, filterLandType, filterBudgetMax, budgetUnit]);

  const clearFilters = () => {
    setFilterState('all');
    setFilterDistrict('all');
    setFilterLandType('all');
    setFilterBudgetMax('');
    setBudgetUnit('bigha');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: t('कृपया नाम और फ़ोन भरें', 'Please fill name and phone'), variant: 'destructive' });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast({ title: t('सही फ़ोन नंबर डालें', 'Enter a valid phone number'), variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    // Convert to bigha for storage if user selected acre
    const areaVal = form.areaMin ? Number(form.areaMin) : 0;
    const budgetMinVal = form.budgetMin ? Number(form.budgetMin) : 0;
    const budgetMaxVal = form.budgetMax ? Number(form.budgetMax) : 0;
    const { error } = await supabase.from('buyer_queries').insert({
      name: form.name.trim().slice(0, 100),
      phone: form.phone.trim(),
      preferred_state: form.state || '',
      budget_min: formUnit === 'acre' ? Math.round(budgetMinVal / BIGHA_PER_ACRE) : budgetMinVal,
      budget_max: formUnit === 'acre' ? Math.round(budgetMaxVal / BIGHA_PER_ACRE) : budgetMaxVal,
      area_min: formUnit === 'acre' ? Math.round(areaVal * BIGHA_PER_ACRE) : areaVal,
      message: form.message.trim().slice(0, 500),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: t('क्वेरी भेजने में समस्या', 'Failed to submit query'), variant: 'destructive' });
      return;
    }
    toast({ title: t('आपकी क्वेरी भेज दी गई!', 'Your query has been submitted!'), description: t('हम जल्द संपर्क करेंगे', 'We will contact you soon') });
    setForm({ name: '', phone: '', state: '', budgetMin: '', budgetMax: '', areaMin: '', message: '' });
  };

  const startWith = (tab: string) => {
    setActiveTab(tab);
    setStarted(true);
  };

  // ─── Initial Choice Screen ───
  if (!started) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-10 md:py-20">
          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('खरीदार पोर्टल', 'Buyer Portal')}</h1>
            <p className="text-muted-foreground">{t('अपनी ज़रूरत चुनें', 'Choose what you need')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-0 shadow-md overflow-hidden" onClick={() => startWith('browse')}>
              <div className="bg-primary p-4">
                <div className="flex items-center gap-2 text-primary-foreground">
                  <Building2 className="h-6 w-6" />
                  <h2 className="text-xl font-bold">{t('उपलब्ध भूमि', 'Available Properties')}</h2>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-3">{t('सत्यापित भूमि खोजें, मालिक से सीधे बात करें', 'Find verified land, talk directly to owners')}</p>
                <span className="text-primary font-semibold text-sm inline-flex items-center gap-1">{t('शुरू करें', 'Get Started')} →</span>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 border-0 shadow-md overflow-hidden" onClick={() => startWith('custom')}>
              <div className="bg-accent p-4">
                <div className="flex items-center gap-2 text-accent-foreground">
                  <ClipboardList className="h-6 w-6" />
                  <h2 className="text-xl font-bold">{t('अपनी ज़रूरत बताएं', 'Custom Requirement')}</h2>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-3">{t('फ़ॉर्म भरें, हम आपके लिए ढूंढेंगे', 'Fill form, we find for you')}</p>
                <span className="text-primary font-semibold text-sm inline-flex items-center gap-1">{t('शुरू करें', 'Get Started')} →</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ─── Tabs View ───
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6 h-12">
            <TabsTrigger value="browse" className="gap-2 text-sm font-semibold">
              <Building2 className="h-4 w-4" />
              {t('उपलब्ध भूमि', 'Available Properties')}
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4" />
              {t('अपनी ज़रूरत बताएं', 'Custom Requirement')}
            </TabsTrigger>
          </TabsList>

          {/* ─── Browse Tab ─── */}
          <TabsContent value="browse">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Filters Sidebar */}
              <aside className="w-full md:w-1/4 md:sticky md:top-20 md:self-start">
                <Card className="border-0 shadow-lg">
                  <div className="bg-muted p-3 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold">{t('फ़िल्टर', 'Filters')}</h3>
                  </div>
                  <CardContent className="p-3 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('राज्य', 'State')}</label>
                      <Select value={filterState} onValueChange={(v) => { setFilterState(v); setFilterDistrict('all'); }}>
                        <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('सभी राज्य', 'All States')}</SelectItem>
                          {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('जिला', 'District')}</label>
                      <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                        <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('सभी जिले', 'All Districts')}</SelectItem>
                          {availableDistricts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('भूमि प्रकार', 'Land Type')}</label>
                      <Select value={filterLandType} onValueChange={setFilterLandType}>
                        <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('सभी प्रकार', 'All Types')}</SelectItem>
                          <SelectItem value="irrigated"><span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{t('सिंचित', 'Irrigated')}</span></SelectItem>
                          <SelectItem value="non-irrigated"><span className="flex items-center gap-1"><Sun className="h-3 w-3" />{t('गैर-सिंचित', 'Non-Irrigated')}</span></SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">
                        {t('अधिकतम बजट ₹', 'Max Budget ₹')} / {budgetUnit === 'bigha' ? t('बीघा', 'Bigha') : t('एकड़', 'Acre')}
                      </label>
                      <Input type="number" placeholder={budgetUnit === 'bigha' ? '500000' : '2500000'} value={filterBudgetMax} onChange={(e) => setFilterBudgetMax(e.target.value)} className="bg-card" min={0} />
                      <div className="flex items-center gap-3 mt-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="budgetUnit"
                            checked={budgetUnit === 'bigha'}
                            onChange={() => {
                              if (budgetUnit === 'acre' && filterBudgetMax) {
                                setFilterBudgetMax(String(Math.round(Number(filterBudgetMax) / BIGHA_PER_ACRE)));
                              }
                              setBudgetUnit('bigha');
                            }}
                            className="accent-primary"
                          />
                          {t('प्रति बीघा', 'Per Bigha')}
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="budgetUnit"
                            checked={budgetUnit === 'acre'}
                            onChange={() => {
                              if (budgetUnit === 'bigha' && filterBudgetMax) {
                                setFilterBudgetMax(String(Math.round(Number(filterBudgetMax) * BIGHA_PER_ACRE)));
                              }
                              setBudgetUnit('acre');
                            }}
                            className="accent-primary"
                          />
                          {t('प्रति एकड़', 'Per Acre')}
                        </label>
                      </div>
                    </div>
                    {(filterState !== 'all' || filterDistrict !== 'all' || filterLandType !== 'all' || filterBudgetMax) && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-destructive">{t('फ़िल्टर हटाएं', 'Clear Filters')}</Button>
                    )}
                    <div className="text-center text-xs text-muted-foreground pt-1 border-t border-border">
                      {filteredProperties.length} {t('भूमि मिली', 'properties found')}
                    </div>
                  </CardContent>
                </Card>
              </aside>

              {/* Property Grid */}
              <main className="w-full md:w-3/4">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {t('उपलब्ध भूमि', 'Available Properties')}
                  <Badge variant="outline" className="ml-auto text-xs">{filteredProperties.length} {t('परिणाम', 'results')}</Badge>
                </h2>
                {filteredProperties.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg font-medium">{t('कोई भूमि नहीं मिली', 'No properties found')}</p>
                    <p className="text-sm mt-1">{t('फ़िल्टर बदलकर देखें', 'Try changing your filters')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredProperties.map((property) => (
                      <Link key={property.id} to={`/property/${property.id}`}>
                        <Card className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer border-0 shadow-md hover:-translate-y-1">
                          <div className="relative h-40 overflow-hidden">
                            <img src={property.images[0]} alt={lang === 'hi' ? property.title : property.titleEn} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                            {property.verified && (
                              <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />{t('सत्यापित', 'Verified')}
                              </Badge>
                            )}
                            <Badge variant="outline" className="absolute top-2 right-2 bg-card/80 text-xs">
                              {property.landType === 'irrigated'
                                ? <span className="flex items-center gap-1"><Droplets className="h-3 w-3 text-primary" />{t('सिंचित', 'Irrigated')}</span>
                                : <span className="flex items-center gap-1"><Sun className="h-3 w-3 text-accent" />{t('गैर-सिंचित', 'Non-Irrigated')}</span>
                              }
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-sm mb-1 line-clamp-1">{lang === 'hi' ? property.title : property.titleEn}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2"><MapPin className="h-3 w-3" />{property.district}, {property.state}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-primary">
                                {priceFmt(Math.round(property.askingPrice / property.area))}
                                <span className="text-xs font-normal text-muted-foreground">/{t('बीघा', 'Bigha')}</span>
                              </span>
                              <span className="text-xs text-muted-foreground">{property.area} {property.areaUnit === 'bigha' ? t('बीघा', 'Bigha') : t('एकड़', 'Acre')}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </main>
            </div>
          </TabsContent>

          {/* ─── Custom Requirement Tab ─── */}
          <TabsContent value="custom">
            <div className="max-w-2xl mx-auto animate-fade-in">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 md:p-8 mb-6">
                <h2 className="text-xl md:text-2xl font-extrabold text-primary-foreground mb-1">
                  {t('अपनी ज़रूरत बताएं', 'Tell Us Your Requirement')}
                </h2>
                <p className="text-primary-foreground/80 text-sm mb-6">
                  {t('फ़ॉर्म भरें, हम आपके लिए सही भूमि ढूंढेंगे', 'Fill the form, we will find the right land for you')}
                </p>
                <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" />{t('नाम', 'Name')} *</label>
                    <Input placeholder={t('आपका नाम', 'Your name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{t('फ़ोन', 'Phone')} *</label>
                    <Input placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} maxLength={10} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{t('राज्य', 'Preferred State')}</label>
                    <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                      <SelectTrigger><SelectValue placeholder={t('राज्य चुनें', 'Select state')} /></SelectTrigger>
                      <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">{t('इकाई चुनें', 'Select Unit')}</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="formUnit"
                          checked={formUnit === 'bigha'}
                          onChange={() => {
                            if (formUnit === 'acre') {
                              setForm(f => ({
                                ...f,
                                areaMin: f.areaMin ? String(Math.round(Number(f.areaMin) * BIGHA_PER_ACRE)) : '',
                                budgetMin: f.budgetMin ? String(Math.round(Number(f.budgetMin) / BIGHA_PER_ACRE)) : '',
                                budgetMax: f.budgetMax ? String(Math.round(Number(f.budgetMax) / BIGHA_PER_ACRE)) : '',
                              }));
                            }
                            setFormUnit('bigha');
                          }}
                          className="accent-primary"
                        />
                        {t('बीघा', 'Bigha')}
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="formUnit"
                          checked={formUnit === 'acre'}
                          onChange={() => {
                            if (formUnit === 'bigha') {
                              setForm(f => ({
                                ...f,
                                areaMin: f.areaMin ? String(Math.round(Number(f.areaMin) / BIGHA_PER_ACRE)) : '',
                                budgetMin: f.budgetMin ? String(Math.round(Number(f.budgetMin) * BIGHA_PER_ACRE)) : '',
                                budgetMax: f.budgetMax ? String(Math.round(Number(f.budgetMax) * BIGHA_PER_ACRE)) : '',
                              }));
                            }
                            setFormUnit('acre');
                          }}
                          className="accent-primary"
                        />
                        {t('एकड़', 'Acre')}
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      {formUnit === 'bigha' ? t('न्यूनतम क्षेत्रफल (बीघा)', 'Min Area (Bigha)') : t('न्यूनतम क्षेत्रफल (एकड़)', 'Min Area (Acre)')}
                    </label>
                    <Input type="number" placeholder={formUnit === 'bigha' ? '5' : '1'} value={form.areaMin} onChange={(e) => setForm({ ...form, areaMin: e.target.value })} min={0} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {formUnit === 'bigha' ? t('न्यूनतम बजट (₹/बीघा)', 'Min Budget (₹/Bigha)') : t('न्यूनतम बजट (₹/एकड़)', 'Min Budget (₹/Acre)')}
                    </label>
                    <Input type="number" placeholder={formUnit === 'bigha' ? '500000' : '2500000'} value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} min={0} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      {formUnit === 'bigha' ? t('अधिकतम बजट (₹/बीघा)', 'Max Budget (₹/Bigha)') : t('अधिकतम बजट (₹/एकड़)', 'Max Budget (₹/Acre)')}
                    </label>
                    <Input type="number" placeholder={formUnit === 'bigha' ? '5000000' : '25000000'} value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} min={0} />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{t('अतिरिक्त जानकारी', 'Additional Details')}</label>
                    <Textarea placeholder={t('कोई विशेष ज़रूरत...', 'Any specific requirements...')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={500} rows={3} />
                  </div>
                  <div className="sm:col-span-2">
                    <Button type="submit" disabled={submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-semibold">
                      <Send className="h-4 w-4 mr-2" />
                      {submitting ? t('भेज रहे हैं...', 'Submitting...') : t('क्वेरी भेजें', 'Submit Query')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default BuyerLanding;
