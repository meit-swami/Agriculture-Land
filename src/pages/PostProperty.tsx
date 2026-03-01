import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { states } from '@/data/mockProperties';
import { getRajasthanDistricts, getTehsilsForDistrict } from '@/data/rajasthanData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import FileUpload from '@/components/FileUpload';

const steps = [
  { hi: 'स्थान', en: 'Location' },
  { hi: 'भूमि विवरण', en: 'Land Details' },
  { hi: 'मीडिया', en: 'Media' },
  { hi: 'मालिक जानकारी', en: 'Owner Info' },
];

const PostProperty = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [form, setForm] = useState({
    state: '', district: '', tehsil: '', village: '',
    landType: 'irrigated', category: 'General', area: '', areaUnit: 'bigha',
    khasraNumber: '', askingPrice: '', negotiable: false,
    title: '', titleEn: '',
    ownerType: 'owner', ownerName: '', ownerPhone: '',
  });

  const update = (key: string, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'state') { next.district = ''; next.tehsil = ''; }
      if (key === 'district') { next.tehsil = ''; }
      return next;
    });
  };

  const isRajasthan = form.state === 'राजस्थान';
  const districtOptions = useMemo(() => isRajasthan ? getRajasthanDistricts() : [], [isRajasthan]);
  const tehsilOptions = useMemo(() => (isRajasthan && form.district) ? getTehsilsForDistrict(form.district) : [], [isRajasthan, form.district]);

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <Card className="max-w-md w-full border-0 shadow-xl text-center">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold mb-4">{t('पहले लॉगिन करें', 'Please login first')}</h2>
              <Link to="/login"><Button className="bg-primary text-primary-foreground">{t('लॉगिन', 'Login')}</Button></Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (submitted) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <Card className="max-w-md w-full border-0 shadow-xl text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-xl font-bold mb-2">{t('भूमि सफलतापूर्वक पोस्ट हुई!', 'Property Posted Successfully!')}</h2>
              <p className="text-muted-foreground mb-4">{t('सत्यापन लंबित — हमारी टीम जल्द समीक्षा करेगी', 'Verification pending — our team will review soon')}</p>
              <Button onClick={() => navigate('/profile')} className="bg-primary text-primary-foreground">{t('मेरी लिस्टिंग देखें', 'View My Listings')}</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from('properties').insert({
      user_id: user.id,
      title: form.title || `${form.area} ${form.areaUnit} ${form.landType === 'irrigated' ? 'सिंचित' : 'गैर-सिंचित'} भूमि — ${form.district}`,
      title_en: form.titleEn || `${form.area} ${form.areaUnit} ${form.landType} land — ${form.district}`,
      state: form.state, district: form.district, tehsil: form.tehsil, village: form.village,
      land_type: form.landType, category: form.category,
      area: parseFloat(form.area) || 0, area_unit: form.areaUnit,
      khasra_number: form.khasraNumber, asking_price: parseFloat(form.askingPrice) || 0,
      negotiable: form.negotiable, owner_type: form.ownerType,
      owner_name: form.ownerName, owner_phone: form.ownerPhone,
      images: photoUrls.length > 0 ? photoUrls : null,
      video_url: videoUrls[0] || null,
      document_url: documentUrls[0] || null,
    });
    setLoading(false);
    if (error) {
      toast.error(t('पोस्ट विफल', 'Post failed'), { description: error.message });
    } else {
      setSubmitted(true);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">{t('भूमि पोस्ट करें', 'Post Property')}</h1>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {steps.map((s, i) => (
            <div key={i} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {i + 1}. {t(s.hi, s.en)}
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            {step === 0 && (
              <div className="space-y-4">
                <div><Label>{t('राज्य', 'State')}</Label>
                  <Select value={form.state} onValueChange={(v) => update('state', v)}>
                    <SelectTrigger><SelectValue placeholder={t('राज्य चुनें', 'Select State')} /></SelectTrigger>
                    <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>{t('जिला', 'District')}</Label>
                  {isRajasthan ? (
                    <Select value={form.district} onValueChange={(v) => update('district', v)}>
                      <SelectTrigger><SelectValue placeholder={t('जिला चुनें', 'Select District')} /></SelectTrigger>
                      <SelectContent>{districtOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Input value={form.district} onChange={(e) => update('district', e.target.value)} placeholder={t('जिला दर्ज करें', 'Enter district')} />
                  )}
                </div>
                <div><Label>{t('तहसील', 'Tehsil')}</Label>
                  {isRajasthan && tehsilOptions.length > 0 ? (
                    <Select value={form.tehsil} onValueChange={(v) => update('tehsil', v)}>
                      <SelectTrigger><SelectValue placeholder={t('तहसील चुनें', 'Select Tehsil')} /></SelectTrigger>
                      <SelectContent>{tehsilOptions.map((th) => <SelectItem key={th} value={th}>{th}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Input value={form.tehsil} onChange={(e) => update('tehsil', e.target.value)} placeholder={t('तहसील दर्ज करें', 'Enter tehsil')} />
                  )}
                </div>
                <div><Label>{t('गाँव', 'Village')}</Label><Input value={form.village} onChange={(e) => update('village', e.target.value)} /></div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div><Label>{t('भूमि प्रकार', 'Land Type')}</Label>
                  <Select value={form.landType} onValueChange={(v) => update('landType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="irrigated">{t('सिंचित', 'Irrigated')}</SelectItem>
                      <SelectItem value="non-irrigated">{t('गैर-सिंचित', 'Non-Irrigated')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>{t('श्रेणी', 'Category')}</Label>
                  <Select value={form.category} onValueChange={(v) => update('category', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="ST">ST</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{t('क्षेत्रफल', 'Area')}</Label><Input type="number" value={form.area} onChange={(e) => update('area', e.target.value)} /></div>
                  <div><Label>{t('इकाई', 'Unit')}</Label>
                    <Select value={form.areaUnit} onValueChange={(v) => update('areaUnit', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bigha">{t('बीघा', 'Bigha')}</SelectItem>
                        <SelectItem value="acre">{t('एकड़', 'Acre')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>{t('खसरा नंबर', 'Khasra Number')}</Label><Input value={form.khasraNumber} onChange={(e) => update('khasraNumber', e.target.value)} /></div>
                <div><Label>{t('माँगी गई कीमत (₹)', 'Asking Price (₹)')}</Label><Input type="number" value={form.askingPrice} onChange={(e) => update('askingPrice', e.target.value)} /></div>
                <div className="flex items-center gap-3">
                  <Label>{t('मोलभाव योग्य', 'Negotiable')}</Label>
                  <Switch checked={form.negotiable} onCheckedChange={(v) => update('negotiable', v)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FileUpload type="image" maxFiles={10} uploadedUrls={photoUrls} onUrlsChange={setPhotoUrls} />
                <FileUpload type="video" maxFiles={1} uploadedUrls={videoUrls} onUrlsChange={setVideoUrls} />
                <FileUpload type="document" maxFiles={1} uploadedUrls={documentUrls} onUrlsChange={setDocumentUrls} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div><Label>{t('मालिक प्रकार', 'Owner Type')}</Label>
                  <Select value={form.ownerType} onValueChange={(v) => update('ownerType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">{t('मालिक', 'Owner')}</SelectItem>
                      <SelectItem value="broker">{t('ब्रोकर', 'Broker')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>{t('नाम', 'Name')}</Label><Input value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} /></div>
                <div><Label>{t('फ़ोन नंबर', 'Phone Number')}</Label><Input type="tel" value={form.ownerPhone} onChange={(e) => update('ownerPhone', e.target.value)} /></div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
                {t('पीछे', 'Back')}
              </Button>
              {step < steps.length - 1 ? (
                <Button className="bg-primary text-primary-foreground" onClick={() => setStep(step + 1)}>
                  {t('आगे', 'Next')}
                </Button>
              ) : (
                <Button className="bg-primary text-primary-foreground" onClick={handleSubmit} disabled={loading}>
                  {loading ? t('पोस्ट हो रही है...', 'Posting...') : t('पोस्ट करें', 'Submit')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PostProperty;
