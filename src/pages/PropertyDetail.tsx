import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockProperties, formatPrice, formatPriceEn } from '@/data/mockProperties';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, CheckCircle2, Clock, Phone, User, Ruler, Tag, FileText, Heart, CalendarDays, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PropertyDetail = () => {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const priceFmt = lang === 'hi' ? formatPrice : formatPriceEn;

  const [dbProperty, setDbProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Try mock first, then DB
  const mockProperty = mockProperties.find((p) => p.id === id);

  useEffect(() => {
    if (mockProperty) {
      setLoading(false);
      return;
    }
    const fetchProperty = async () => {
      const { data } = await supabase.from('properties').select('*').eq('id', id!).maybeSingle();
      setDbProperty(data);
      setLoading(false);
    };
    fetchProperty();
  }, [id, mockProperty]);

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      </AppLayout>
    );
  }

  // Normalize property data from either source
  const property = mockProperty
    ? mockProperty
    : dbProperty
    ? {
        id: dbProperty.id,
        title: dbProperty.title,
        titleEn: dbProperty.title_en,
        state: dbProperty.state,
        district: dbProperty.district,
        tehsil: dbProperty.tehsil,
        village: dbProperty.village,
        landType: dbProperty.land_type,
        category: dbProperty.category,
        area: dbProperty.area,
        areaUnit: dbProperty.area_unit,
        khasraNumber: dbProperty.khasra_number,
        askingPrice: dbProperty.asking_price,
        negotiable: dbProperty.negotiable,
        ownerType: dbProperty.owner_type,
        ownerName: dbProperty.owner_name,
        ownerPhone: dbProperty.owner_phone,
        images: dbProperty.images || [],
        verified: dbProperty.verified,
        verificationStatus: dbProperty.verification_status,
        postedDate: new Date(dbProperty.created_at).toLocaleDateString(),
        teamRemarks: dbProperty.team_remarks,
      }
    : null;

  if (!property) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">{t('भूमि नहीं मिली', 'Property Not Found')}</h1>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Image */}
        {property.images?.[0] && (
          <div className="rounded-xl overflow-hidden mb-6 h-64 md:h-96">
            <img src={property.images[0]} alt={lang === 'hi' ? property.title : property.titleEn} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Title & badge */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{lang === 'hi' ? property.title : property.titleEn}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {property.village}, {property.tehsil}, {property.district}, {property.state}
            </p>
          </div>
          <Badge className={`text-sm px-3 py-1 ${property.verified ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
            {property.verified ? <><CheckCircle2 className="h-4 w-4 mr-1" />{t('टीम द्वारा सत्यापित', 'Team Verified')}</> : <><Clock className="h-4 w-4 mr-1" />{t('सत्यापन लंबित', 'Verification Pending')}</>}
          </Badge>
        </div>

        {/* Price */}
        <div className="text-3xl font-bold text-primary mb-6">
          {priceFmt(property.askingPrice)}
          {property.negotiable && <span className="text-sm font-normal text-muted-foreground ml-2">({t('मोलभाव योग्य', 'Negotiable')})</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Details */}
          <div className="md:col-span-2 space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-5">
                <h2 className="font-bold text-lg mb-4">{t('भूमि विवरण', 'Land Details')}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { icon: Ruler, label: t('क्षेत्रफल', 'Area'), value: `${property.area} ${property.areaUnit === 'bigha' ? t('बीघा', 'Bigha') : t('एकड़', 'Acre')}` },
                    { icon: Tag, label: t('भूमि प्रकार', 'Land Type'), value: property.landType === 'irrigated' ? t('सिंचित', 'Irrigated') : t('गैर-सिंचित', 'Non-Irrigated') },
                    { icon: FileText, label: t('खसरा नंबर', 'Khasra Number'), value: property.khasraNumber },
                    { icon: Tag, label: t('श्रेणी', 'Category'), value: property.category },
                    { icon: CalendarDays, label: t('पोस्ट तारीख', 'Posted'), value: property.postedDate },
                    { icon: User, label: t('प्रकार', 'Type'), value: property.ownerType === 'owner' ? t('मालिक', 'Owner') : t('ब्रोकर', 'Broker') },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-2">
                      <item.icon className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <div className="text-muted-foreground text-xs">{item.label}</div>
                        <div className="font-medium">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team remarks if any */}
            {'teamRemarks' in property && property.teamRemarks && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-5">
                  <h2 className="font-bold text-lg mb-2">{t('टीम रिमार्क्स', 'Team Remarks')}</h2>
                  <p className="text-sm bg-muted p-3 rounded">{property.teamRemarks}</p>
                </CardContent>
              </Card>
            )}

            {/* Map placeholder */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-5">
                <h2 className="font-bold text-lg mb-3">{t('स्थान', 'Location')}</h2>
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mr-2" /> {t('मानचित्र जल्द उपलब्ध होगा', 'Map coming soon')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Owner card & actions */}
          <div className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-5">
                <h2 className="font-bold text-lg mb-3">{t('संपर्क जानकारी', 'Contact Info')}</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{property.ownerName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />{property.ownerPhone}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button className="w-full bg-primary text-primary-foreground" onClick={() => toast.success(t('रुचि भेजी गई!', 'Interest sent!'))}>
                    <Heart className="h-4 w-4 mr-2" />
                    {t('रुचि दिखाएँ', 'Show Interest')}
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => toast.success(t('मीटिंग अनुरोध भेजा गया!', 'Meeting request sent!'))}>
                    <CalendarDays className="h-4 w-4 mr-2" />
                    {t('मालिक से मीटिंग अनुरोध करें', 'Request Meeting')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PropertyDetail;
