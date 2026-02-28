import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, UserPlus, Phone, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { states } from '@/data/mockProperties';

const Register = () => {
  const { t } = useLanguage();
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [form, setForm] = useState({
    fullName: '', phone: '', state: '', district: '', role: 'buyer' as string,
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error(t('कृपया नाम भरें', 'Please enter your name'));
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast.error(t('सही फ़ोन नंबर डालें', 'Enter a valid 10-digit phone number'));
      return;
    }
    if (!form.state) {
      toast.error(t('कृपया राज्य चुनें', 'Please select state'));
      return;
    }
    setLoading(true);
    const { error } = await sendOtp(form.phone.trim());
    setLoading(false);
    if (error) {
      toast.error(t('OTP भेजने में समस्या', 'Failed to send OTP'), { description: error.message });
    } else {
      setOtpSent(true);
      toast.success(t('OTP भेज दिया गया! (टेस्ट: 123456)', 'OTP sent! (Test: 123456)'));
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error(t('OTP डालें', 'Enter OTP'));
      return;
    }
    setLoading(true);
    const { error } = await verifyOtp(form.phone.trim(), otp.trim(), {
      full_name: form.fullName.trim(),
      phone: form.phone.trim(),
      state: form.state,
      district: form.district.trim(),
      role: form.role,
    });
    setLoading(false);
    if (error) {
      toast.error(t('OTP गलत है', 'Invalid OTP'), { description: error.message });
    } else {
      toast.success(t('खाता बन गया! स्वागत है!', 'Account created! Welcome!'));
      navigate('/');
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sprout className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('रजिस्टर करें', 'Register')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t('मोबाइल नंबर से रजिस्टर करें', 'Register with your mobile number')}
            </p>
          </CardHeader>
          <CardContent>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <Label>{t('पूरा नाम', 'Full Name')}</Label>
                  <Input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required placeholder={t('अपना नाम लिखें', 'Enter your name')} />
                </div>
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {t('मोबाइल नंबर', 'Mobile Number')}
                  </Label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label>{t('राज्य', 'State')}</Label>
                  <Select value={form.state} onValueChange={(v) => update('state', v)}>
                    <SelectTrigger><SelectValue placeholder={t('राज्य चुनें', 'Select State')} /></SelectTrigger>
                    <SelectContent>
                      {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('जिला', 'District')}</Label>
                  <Input value={form.district} onChange={(e) => update('district', e.target.value)} required placeholder={t('जिला लिखें', 'Enter district')} />
                </div>
                <div>
                  <Label>{t('भूमिका', 'Role')}</Label>
                  <Select value={form.role} onValueChange={(v) => update('role', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">{t('खरीदार', 'Buyer')}</SelectItem>
                      <SelectItem value="seller">{t('विक्रेता', 'Seller')}</SelectItem>
                      <SelectItem value="agent">{t('एजेंट', 'Agent')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {loading ? t('भेज रहे हैं...', 'Sending...') : t('OTP भेजें', 'Send OTP')}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-sm text-muted-foreground">
                    {t('OTP भेजा गया:', 'OTP sent to:')} <span className="font-semibold text-foreground">+91 {form.phone}</span>
                  </p>
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }} className="text-xs text-primary hover:underline mt-1">
                    {t('वापस जाएं', 'Go back')}
                  </button>
                </div>
                <div>
                  <Label className="flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4" />
                    {t('OTP दर्ज करें', 'Enter OTP')}
                  </Label>
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="123456"
                    maxLength={6}
                    className="mt-1.5 text-center text-2xl tracking-[0.5em] font-mono"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {loading ? t('सत्यापन हो रहा है...', 'Verifying...') : t('रजिस्टर करें', 'Register')}
                </Button>
              </form>
            )}
            <p className="text-center text-sm text-muted-foreground mt-4">
              {t('पहले से खाता है?', 'Already have an account?')}{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                {t('लॉगिन करें', 'Login')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Register;
