import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockProperties, formatPrice, formatPriceEn } from '@/data/mockProperties';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, CheckCircle2, Clock, Phone, User, Ruler, Tag, FileText, Heart, Eye, CalendarDays, Loader2, Crown, Link as LinkIcon, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const PropertyDetail = () => {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const priceFmt = lang === 'hi' ? formatPrice : formatPriceEn;

  const [dbProperty, setDbProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interestLoading, setInterestLoading] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [hasActivePayment, setHasActivePayment] = useState(false);
  const [privateLink, setPrivateLink] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [priceUnit, setPriceUnit] = useState<'bigha' | 'acre'>('bigha');
  const BIGHA_PER_ACRE = 5;

  const mockProperty = mockProperties.find((p) => p.id === id);

  useEffect(() => {
    if (mockProperty) {
      setLoading(false);
    } else {
      const fetchProperty = async () => {
        const { data } = await supabase.from('properties').select('*').eq('id', id!).maybeSingle();
        setDbProperty(data);
        setLoading(false);
      };
      fetchProperty();
    }
  }, [id, mockProperty]);

  // Check if user has active payment for this property
  useEffect(() => {
    const checkPayment = async () => {
      if (!user || !id) return;
      const propertyId = mockProperty ? mockProperty.id : id;
      const { data } = await supabase
        .from('property_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .eq('status', 'active');

      const active = data && data.some(p => new Date(p.expires_at) > new Date());
      setHasActivePayment(!!active);
    };
    checkPayment();
  }, [user, id, mockProperty]);

  const handleShowInterest = async () => {
    if (!user) {
      toast.error(t('पहले लॉगिन करें', 'Please login first'));
      navigate('/login');
      return;
    }
    setShowPaymentPrompt(true);
  };

  const handlePayment = async () => {
    if (!user) return;
    setPaymentProcessing(true);

    const propertyId = mockProperty ? mockProperty.id : dbProperty?.id;
    if (!propertyId) {
      setPaymentProcessing(false);
      toast.error(t('प्रॉपर्टी नहीं मिली', 'Property not found'));
      return;
    }

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { error } = await supabase.from('property_payments').insert({
      user_id: user.id,
      property_id: propertyId,
      amount: 1000,
    });

    if (error) {
      setPaymentProcessing(false);
      toast.error(t('भुगतान विफल', 'Payment failed'), { description: error.message });
      return;
    }

    // Also record interest
    try {
      await supabase.from('interests').insert({
        property_id: propertyId,
        buyer_id: user.id,
        type: 'interest',
      });
    } catch {}

    // Generate private link
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: existingLink } = await supabase
      .from('private_links')
      .select('token')
      .eq('property_id', propertyId)
      .eq('user_id', user.id)
      .maybeSingle();

    let link: string;
    if (existingLink) {
      link = `${window.location.origin}/p/${existingLink.token}`;
    } else {
      const { data: newLink } = await supabase
        .from('private_links')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          phone_number: profile?.phone || '',
        })
        .select('token')
        .single();
      link = newLink ? `${window.location.origin}/p/${newLink.token}` : '';
    }

    setPaymentProcessing(false);
    setShowPaymentPrompt(false);
    setHasActivePayment(true);
    setPrivateLink(link);
    setShowLinkDialog(true);
    toast.success(t('✅ भुगतान सफल!', '✅ Payment successful!'));
  };

  const handleView = async () => {
    if (!user) return;
    const propertyId = mockProperty ? mockProperty.id : dbProperty?.id;
    if (!propertyId) return;

    const { data: existingLink } = await supabase
      .from('private_links')
      .select('token')
      .eq('property_id', propertyId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingLink) {
      const link = `${window.location.origin}/p/${existingLink.token}`;
      setPrivateLink(link);
      setShowLinkDialog(true);
    }
  };

  const copyLink = () => {
    if (privateLink) {
      navigator.clipboard.writeText(privateLink);
      toast.success(t('लिंक कॉपी हो गया!', 'Link copied!'));
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      </AppLayout>
    );
  }

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
              <MapPin className="h-4 w-4" /> {property.tehsil}, {property.district}, {property.state}
            </p>
          </div>
          {property.verified ? null : (
            <Badge className="text-sm px-3 py-1 bg-accent text-accent-foreground">
              <Clock className="h-4 w-4 mr-1" />{t('सत्यापन लंबित', 'Verification Pending')}
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="mb-6">
          {property.area > 0 && (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="text-3xl font-bold text-primary">
                {priceUnit === 'acre'
                  ? priceFmt(Math.round((property.askingPrice / property.area) * BIGHA_PER_ACRE))
                  : priceFmt(Math.round(property.askingPrice / property.area))}
                <span className="text-3xl font-bold"> / {priceUnit === 'acre' ? t('एकड़', 'Acre') : t('बीघा', 'Bigha')}</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setPriceUnit('bigha')}
                  className={`px-2.5 py-1 rounded ${priceUnit === 'bigha' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {t('बीघा', 'Bigha')}
                </button>
                <button
                  onClick={() => setPriceUnit('acre')}
                  className={`px-2.5 py-1 rounded ${priceUnit === 'acre' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {t('एकड़', 'Acre')}
                </button>
              </div>
            </div>
          )}
          {property.negotiable && <span className="text-sm font-normal text-muted-foreground">({t('मोलभाव योग्य', 'Negotiable')})</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Details */}
          <div className="md:col-span-2 space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-5">
                <h2 className="font-bold text-lg mb-4">{t('भूमि विवरण', 'Land Details')}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { icon: Tag, label: t('भूमि प्रकार', 'Land Type'), value: property.landType === 'irrigated' ? t('सिंचित', 'Irrigated') : t('गैर-सिंचित', 'Non-Irrigated') },
                    { icon: Tag, label: t('श्रेणी', 'Category'), value: property.category },
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

            {'teamRemarks' in property && property.teamRemarks && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-5">
                  <h2 className="font-bold text-lg mb-2">{t('टीम रिमार्क्स', 'Team Remarks')}</h2>
                  <p className="text-sm bg-muted p-3 rounded">{property.teamRemarks}</p>
                </CardContent>
              </Card>
            )}

            <Card className="border-0 shadow-md">
              <CardContent className="p-5">
                <h2 className="font-bold text-lg mb-3">{t('स्थान', 'Location')}</h2>
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  <MapPin className="h-8 w-8 mr-2" /> {t('मानचित्र जल्द उपलब्ध होगा', 'Map coming soon')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-5">
                <div className="space-y-2">
                  {hasActivePayment ? (
                    <Button
                      className="w-full bg-primary text-primary-foreground"
                      onClick={handleView}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('देखें', 'View')}
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-primary text-primary-foreground"
                      onClick={handleShowInterest}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {t('रुचि दिखाएँ', 'Show Interest')}
                    </Button>
                  )}
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

      {/* Payment Prompt Dialog */}
      <Dialog open={showPaymentPrompt} onOpenChange={setShowPaymentPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              {t('प्रॉपर्टी अनलॉक करें', 'Unlock Property')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t(
                'इस प्रॉपर्टी की पूरी जानकारी देखने के लिए ₹1,000 का भुगतान करें। यह 1 महीने के लिए वैध होगा।',
                'Pay ₹1,000 to unlock full details of this property. Valid for 1 month.'
              )}
            </p>
            <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{t('पूरी संपर्क जानकारी', 'Full contact details')}</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{t('प्राइवेट प्रॉपर्टी लिंक', 'Private property link')}</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{t('1 महीने की वैधता', '1 month validity')}</div>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">₹1,000</span>
              <span className="text-sm text-muted-foreground ml-2">/ {t('1 महीना', '1 month')}</span>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground"
              onClick={handlePayment}
              disabled={paymentProcessing}
            >
              {paymentProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Crown className="h-4 w-4 mr-2" />
              )}
              {paymentProcessing ? t('भुगतान हो रहा है...', 'Processing...') : t('अभी भुगतान करें', 'Pay Now')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Private Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              {t('आपका प्राइवेट लिंक', 'Your Private Link')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t(
                'यह लिंक केवल आपके रजिस्टर्ड मोबाइल नंबर से OTP वेरिफिकेशन के बाद खुलेगा। इसमें प्रॉपर्टी की पूरी जानकारी, फोटो, वीडियो और दस्तावेज़ होंगे।',
                'This link will only open after OTP verification with your registered mobile number. It contains full property details, photos, videos and documents.'
              )}
            </p>
            <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary shrink-0" />
              <code className="text-xs break-all flex-1">{privateLink}</code>
              <Button size="sm" variant="ghost" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground"
              onClick={() => window.open(privateLink!, '_blank')}
            >
              {t('लिंक खोलें', 'Open Link')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default PropertyDetail;
