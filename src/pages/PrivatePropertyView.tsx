import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, formatPriceEn } from '@/data/mockProperties';
import {
  MapPin, CheckCircle2, Clock, Phone, User, Ruler, Tag,
  FileText, CalendarDays, Loader2, Lock, Shield, Image,
  Video, File, Eye
} from 'lucide-react';
import { toast } from 'sonner';

const PrivatePropertyView = () => {
  const { token } = useParams();
  const { t, lang } = useLanguage();
  const priceFmt = lang === 'hi' ? formatPrice : formatPriceEn;

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'view'>('phone');
  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState<any>(null);

  const sendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error(t('सही मोबाइल नंबर दर्ज करें', 'Enter a valid mobile number'));
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { action: 'send', phone },
    });
    setLoading(false);
    if (error) {
      toast.error(t('OTP भेजने में विफल', 'Failed to send OTP'));
    } else {
      toast.success(t('OTP भेजा गया (टेस्ट: 123456)', 'OTP sent (test: 123456)'));
      setStep('otp');
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error(t('6 अंकों का OTP दर्ज करें', 'Enter 6-digit OTP'));
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { action: 'verify', phone, otp, token },
    });
    setLoading(false);

    if (error || !data?.success) {
      const errMsg = data?.error || error?.message || 'Verification failed';
      toast.error(t('सत्यापन विफल', 'Verification failed'), { description: errMsg });
      return;
    }

    setProperty(data.property);
    setStep('view');
  };

  if (step === 'phone' || step === 'otp') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('प्राइवेट प्रॉपर्टी लिंक', 'Private Property Link')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {t('इस लिंक को देखने के लिए अपने मोबाइल नंबर से सत्यापित करें', 'Verify with your mobile number to view this link')}
            </p>
          </CardHeader>
          <CardContent>
            {step === 'phone' ? (
              <div className="space-y-4">
                <div>
                  <Label>{t('मोबाइल नंबर', 'Mobile Number')}</Label>
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                  />
                </div>
                <Button className="w-full bg-primary text-primary-foreground" onClick={sendOtp} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Phone className="h-4 w-4 mr-2" />}
                  {t('OTP भेजें', 'Send OTP')}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground">
                  {t(`${phone} पर OTP भेजा गया`, `OTP sent to ${phone}`)}
                </p>
                <div>
                  <Label>{t('OTP दर्ज करें', 'Enter OTP')}</Label>
                  <Input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <Button className="w-full bg-primary text-primary-foreground" onClick={verifyOtp} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                  {t('सत्यापित करें', 'Verify')}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep('phone')}>
                  {t('नंबर बदलें', 'Change Number')}
                </Button>
              </div>
            )}
            <div className="mt-6 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                {t('यह लिंक केवल सब्सक्रिप्शन धारक के मोबाइल नंबर से ही खुलेगा', 'This link only works with the subscription holder\'s mobile number')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Property view after OTP verification
  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">{t('प्राइवेट प्रॉपर्टी व्यू', 'Private Property View')}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            {t('ट्रैक किया जा रहा है', 'Tracked')}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Images gallery */}
        {property.images && property.images.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              {t('तस्वीरें', 'Photos')} ({property.images.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.images.map((img: string, i: number) => (
                <div key={i} className="rounded-xl overflow-hidden h-48">
                  <img src={img} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Title & badge */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {lang === 'hi' ? property.title : (property.title_en || property.title)}
            </h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {property.village}, {property.tehsil}, {property.district}, {property.state}
            </p>
          </div>
          <Badge className={`text-sm px-3 py-1 ${property.verified ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
            {property.verified
              ? <><CheckCircle2 className="h-4 w-4 mr-1" />{t('सत्यापित', 'Verified')}</>
              : <><Clock className="h-4 w-4 mr-1" />{t('लंबित', 'Pending')}</>}
          </Badge>
        </div>

        {/* Price */}
        <div className="text-3xl font-bold text-primary mb-6">
          {priceFmt(property.asking_price)}
          {property.negotiable && <span className="text-sm font-normal text-muted-foreground ml-2">({t('मोलभाव योग्य', 'Negotiable')})</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Land Details */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <h2 className="font-bold text-lg mb-4">{t('भूमि विवरण', 'Land Details')}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { icon: Ruler, label: t('क्षेत्रफल', 'Area'), value: `${property.area} ${property.area_unit === 'bigha' ? t('बीघा', 'Bigha') : t('एकड़', 'Acre')}` },
                  { icon: Tag, label: t('भूमि प्रकार', 'Land Type'), value: property.land_type === 'irrigated' ? t('सिंचित', 'Irrigated') : t('गैर-सिंचित', 'Non-Irrigated') },
                  { icon: FileText, label: t('खसरा नंबर', 'Khasra'), value: property.khasra_number },
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

          {/* Media & Documents */}
          <div className="space-y-4">
            {/* Video */}
            {property.video_url && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-5">
                  <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    {t('वीडियो', 'Video')}
                  </h2>
                  <video controls className="w-full rounded-lg" src={property.video_url}>
                    Your browser does not support the video tag.
                  </video>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {property.document_url && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-5">
                  <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <File className="h-5 w-5 text-primary" />
                    {t('दस्तावेज़', 'Documents')}
                  </h2>
                  <a
                    href={property.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80 transition"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    {t('दस्तावेज़ देखें / डाउनलोड करें', 'View / Download Document')}
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Team remarks */}
            {property.team_remarks && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-5">
                  <h2 className="font-bold text-lg mb-2">{t('टीम रिमार्क्स', 'Team Remarks')}</h2>
                  <p className="text-sm bg-muted p-3 rounded">{property.team_remarks}</p>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-5">
                <h2 className="font-bold text-lg mb-3">{t('स्थान', 'Location')}</h2>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  <MapPin className="h-6 w-6 mr-2" /> {property.village}, {property.district}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security notice */}
        <div className="mt-8 p-4 bg-muted rounded-xl text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" />
            {t(
              'यह एक प्राइवेट लिंक है। इसे शेयर करने पर दूसरा व्यक्ति इसे नहीं खोल पाएगा।',
              'This is a private link. Sharing it will not grant access to others.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivatePropertyView;
