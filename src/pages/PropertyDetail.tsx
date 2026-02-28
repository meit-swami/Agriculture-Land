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
import { MapPin, CheckCircle2, Clock, Phone, User, Ruler, Tag, FileText, Heart, CalendarDays, Loader2, Crown, Link as LinkIcon, Copy } from 'lucide-react';
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
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);
  const [privateLink, setPrivateLink] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);

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

  const handleShowInterest = async () => {
    if (!user) {
      toast.error(t('पहले लॉगिन करें', 'Please login first'));
      navigate('/login');
      return;
    }

    setInterestLoading(true);

    // Check if user has an active premium subscription (buyer premium)
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('plan_type', 'buyer')
      .eq('plan_tier', 'premium');

    const hasActivePremium = subs && subs.length > 0 && subs.some(s => {
      if (!s.expires_at) return true;
      return new Date(s.expires_at) > new Date();
    });

    if (!hasActivePremium) {
      setInterestLoading(false);
      setShowSubscriptionPrompt(true);
      return;
    }

    // Generate private link
    const propertyId = mockProperty ? mockProperty.id : dbProperty?.id;
    if (!propertyId) {
      setInterestLoading(false);
      toast.error(t('प्रॉपर्टी नहीं मिली', 'Property not found'));
      return;
    }

    // Check if link already exists
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
      setInterestLoading(false);
      return;
    }

    // Get user's phone from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: newLink, error } = await supabase
      .from('private_links')
      .insert({
        property_id: propertyId,
        user_id: user.id,
        phone_number: profile?.phone || '',
      })
      .select('token')
      .single();

    setInterestLoading(false);

    if (error) {
      toast.error(t('लिंक बनाने में विफल', 'Failed to create link'), { description: error.message });
      return;
    }

    // Also record interest
    await supabase.from('interests').insert({
      property_id: propertyId,
      buyer_id: user.id,
      type: 'interest',
    });

    const link = `${window.location.origin}/p/${newLink.token}`;
    setPrivateLink(link);
    setShowLinkDialog(true);
    toast.success(t('🔗 प्राइवेट लिंक बन गया!', '🔗 Private link created!'));
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
            <div className="text-3xl font-bold text-primary">
              {priceFmt(Math.round(property.askingPrice / property.area))} <span className="text-lg font-medium">/ {t('बीघा', 'Bigha')}</span>
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
                  <Button
                    className="w-full bg-primary text-primary-foreground"
                    onClick={handleShowInterest}
                    disabled={interestLoading}
                  >
                    {interestLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Heart className="h-4 w-4 mr-2" />
                    )}
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

      {/* Subscription Prompt Dialog */}
      <Dialog open={showSubscriptionPrompt} onOpenChange={setShowSubscriptionPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              {t('प्रीमियम सब्सक्रिप्शन आवश्यक', 'Premium Subscription Required')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t(
                'प्रॉपर्टी की पूरी जानकारी देखने के लिए Buyer Premium (₹99/माह) सब्सक्रिप्शन लें। इसमें आपको प्राइवेट लिंक मिलेगा जो केवल आपके मोबाइल नंबर से खुलेगा।',
                'Get a Buyer Premium subscription (₹99/mo) to view full property details. You\'ll get a private link that only works with your registered mobile number.'
              )}
            </p>
            <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{t('असीमित संपर्क', 'Unlimited contacts')}</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{t('प्राइवेट प्रॉपर्टी लिंक', 'Private property links')}</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{t('प्राथमिकता सहायता', 'Priority support')}</div>
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground"
              onClick={() => {
                setShowSubscriptionPrompt(false);
                navigate('/subscriptions');
              }}
            >
              <Crown className="h-4 w-4 mr-2" />
              {t('सब्सक्रिप्शन प्लान देखें', 'View Subscription Plans')}
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
