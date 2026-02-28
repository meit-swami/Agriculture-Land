import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProperties, formatPrice, formatPriceEn, states } from '@/data/mockProperties';
import { MapPin, CheckCircle2, Send, User, Phone, IndianRupee, Ruler, Filter, Droplets, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BuyerLanding = () => {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const priceFmt = lang === 'hi' ? formatPrice : formatPriceEn;

  // Query form state
  const [form, setForm] = useState({
    name: '',
    phone: '',
    state: '',
    budgetMin: '',
    budgetMax: '',
    areaMin: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter state
  const [filterState, setFilterState] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterLandType, setFilterLandType] = useState('all');
  const [filterBudgetMax, setFilterBudgetMax] = useState('');

  // Derive unique districts from properties (optionally filtered by state)
  const availableDistricts = useMemo(() => {
    const source = filterState !== 'all' ? mockProperties.filter((p) => p.state === filterState) : mockProperties;
    return [...new Set(source.map((p) => p.district))].sort();
  }, [filterState]);

  const filteredProperties = useMemo(() => {
    return mockProperties.filter((p) => {
      if (filterState !== 'all' && p.state !== filterState) return false;
      if (filterDistrict !== 'all' && p.district !== filterDistrict) return false;
      if (filterLandType !== 'all' && p.landType !== filterLandType) return false;
      if (filterBudgetMax && p.askingPrice > Number(filterBudgetMax)) return false;
      return true;
    });
  }, [filterState, filterDistrict, filterLandType, filterBudgetMax]);

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
    const { error } = await supabase.from('buyer_queries').insert({
      name: form.name.trim().slice(0, 100),
      phone: form.phone.trim(),
      preferred_state: form.state || '',
      budget_min: form.budgetMin ? Number(form.budgetMin) : 0,
      budget_max: form.budgetMax ? Number(form.budgetMax) : 0,
      area_min: form.areaMin ? Number(form.areaMin) : 0,
      message: form.message.trim().slice(0, 500),
    });
    setSubmitting(false);

    if (error) {
      toast({ title: t('क्वेरी भेजने में समस्या', 'Failed to submit query'), variant: 'destructive' });
      return;
    }

    toast({
      title: t('आपकी क्वेरी भेज दी गई!', 'Your query has been submitted!'),
      description: t('हम जल्द संपर्क करेंगे', 'We will contact you soon'),
    });
    setForm({ name: '', phone: '', state: '', budgetMin: '', budgetMax: '', areaMin: '', message: '' });
  };

  return (
    <AppLayout>
      {/* Quick Query Form */}
      <section className="bg-gradient-to-br from-primary to-secondary py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-primary-foreground text-center mb-2">
            {t('अपनी ज़रूरत बताएं', 'Tell Us Your Requirement')}
          </h1>
          <p className="text-primary-foreground/80 text-center mb-6 text-sm">
            {t('फ़ॉर्म भरें, हम आपके लिए सही भूमि ढूंढेंगे', 'Fill the form, we will find the right land for you')}
          </p>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-card rounded-2xl shadow-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />{t('नाम', 'Name')} *
              </label>
              <Input
                placeholder={t('आपका नाम', 'Your name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />{t('फ़ोन', 'Phone')} *
              </label>
              <Input
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                maxLength={10}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('राज्य', 'Preferred State')}</label>
              <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                <SelectTrigger><SelectValue placeholder={t('राज्य चुनें', 'Select state')} /></SelectTrigger>
                <SelectContent>
                  {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Ruler className="h-3 w-3" />{t('न्यूनतम क्षेत्रफल (बीघा)', 'Min Area (Bigha)')}
              </label>
              <Input
                type="number"
                placeholder="5"
                value={form.areaMin}
                onChange={(e) => setForm({ ...form, areaMin: e.target.value })}
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />{t('न्यूनतम बजट', 'Min Budget (₹)')}
              </label>
              <Input
                type="number"
                placeholder="500000"
                value={form.budgetMin}
                onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                min={0}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />{t('अधिकतम बजट', 'Max Budget (₹)')}
              </label>
              <Input
                type="number"
                placeholder="5000000"
                value={form.budgetMax}
                onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                min={0}
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('अतिरिक्त जानकारी', 'Additional Details')}</label>
              <Textarea
                placeholder={t('कोई विशेष ज़रूरत...', 'Any specific requirements...')}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-semibold"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? t('भेज रहे हैं...', 'Submitting...') : t('क्वेरी भेजें', 'Submit Query')}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Filters + Available Properties */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-2xl md:text-3xl font-bold">
            {t('उपलब्ध भूमि', 'Available Properties')}
          </h2>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-6 p-4 bg-muted rounded-xl">
          <Select value={filterState} onValueChange={(v) => { setFilterState(v); setFilterDistrict('all'); }}>
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue placeholder={t('राज्य', 'State')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('सभी राज्य', 'All States')}</SelectItem>
              {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterDistrict} onValueChange={setFilterDistrict}>
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue placeholder={t('जिला', 'District')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('सभी जिले', 'All Districts')}</SelectItem>
              {availableDistricts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterLandType} onValueChange={setFilterLandType}>
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue placeholder={t('भूमि प्रकार', 'Land Type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('सभी प्रकार', 'All Types')}</SelectItem>
              <SelectItem value="irrigated">
                <span className="flex items-center gap-1"><Droplets className="h-3 w-3" />{t('सिंचित', 'Irrigated')}</span>
              </SelectItem>
              <SelectItem value="non-irrigated">
                <span className="flex items-center gap-1"><Sun className="h-3 w-3" />{t('गैर-सिंचित', 'Non-Irrigated')}</span>
              </SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder={t('अधिकतम बजट ₹', 'Max Budget ₹')}
            value={filterBudgetMax}
            onChange={(e) => setFilterBudgetMax(e.target.value)}
            className="w-[160px] bg-card"
            min={0}
          />

          {(filterState !== 'all' || filterDistrict !== 'all' || filterLandType !== 'all' || filterBudgetMax) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFilterState('all'); setFilterDistrict('all'); setFilterLandType('all'); setFilterBudgetMax(''); }}
              className="text-destructive"
            >
              {t('फ़िल्टर हटाएं', 'Clear Filters')}
            </Button>
          )}
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">{t('कोई भूमि नहीं मिली', 'No properties found')}</p>
            <p className="text-sm mt-1">{t('फ़िल्टर बदलकर देखें', 'Try changing your filters')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProperties.map((property) => (
              <Link key={property.id} to={`/property/${property.id}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer border-0 shadow-md hover:-translate-y-1">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={property.images[0]}
                      alt={lang === 'hi' ? property.title : property.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {property.verified && (
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t('सत्यापित', 'Verified')}
                      </Badge>
                    )}
                    <Badge variant="outline" className="absolute top-2 right-2 bg-card/80 text-xs">
                      {property.landType === 'irrigated'
                        ? <span className="flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-500" />{t('सिंचित', 'Irrigated')}</span>
                        : <span className="flex items-center gap-1"><Sun className="h-3 w-3 text-amber-500" />{t('गैर-सिंचित', 'Non-Irrigated')}</span>
                      }
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                      {lang === 'hi' ? property.title : property.titleEn}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" />
                      {property.district}, {property.state}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {priceFmt(Math.round(property.askingPrice / property.area))}
                        <span className="text-xs font-normal text-muted-foreground">/{t('बीघा', 'Bigha')}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {property.area} {property.areaUnit === 'bigha' ? t('बीघा', 'Bigha') : t('एकड़', 'Acre')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
};

export default BuyerLanding;
