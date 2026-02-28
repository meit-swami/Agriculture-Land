import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, LogIn, Phone, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { t } = useLanguage();
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      toast.error(t('सही फ़ोन नंबर डालें', 'Enter a valid 10-digit phone number'));
      return;
    }
    setLoading(true);
    const { error } = await sendOtp(phone.trim());
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
    const { error } = await verifyOtp(phone.trim(), otp.trim());
    setLoading(false);
    if (error) {
      toast.error(t('OTP गलत है', 'Invalid OTP'), { description: error.message });
    } else {
      toast.success(t('सफलतापूर्वक लॉगिन हुआ!', 'Logged in successfully!'));
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
            <CardTitle className="text-2xl">{t('लॉगिन करें', 'Login')}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {t('अपने मोबाइल नंबर से लॉगिन करें', 'Login with your mobile number')}
            </p>
          </CardHeader>
          <CardContent>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {t('मोबाइल नंबर', 'Mobile Number')}
                  </Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    placeholder="9876543210"
                    maxLength={10}
                    className="mt-1.5"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {loading ? t('भेज रहे हैं...', 'Sending...') : t('OTP भेजें', 'Send OTP')}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-sm text-muted-foreground">
                    {t('OTP भेजा गया:', 'OTP sent to:')} <span className="font-semibold text-foreground">+91 {phone}</span>
                  </p>
                  <button type="button" onClick={() => { setOtpSent(false); setOtp(''); }} className="text-xs text-primary hover:underline mt-1">
                    {t('नंबर बदलें', 'Change number')}
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
                  <LogIn className="h-4 w-4 mr-2" />
                  {loading ? t('सत्यापन हो रहा है...', 'Verifying...') : t('लॉगिन करें', 'Login')}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={handleSendOtp} disabled={loading}>
                  {t('OTP दोबारा भेजें', 'Resend OTP')}
                </Button>
              </form>
            )}
            <p className="text-center text-sm text-muted-foreground mt-4">
              {t('खाता नहीं है?', "Don't have an account?")}{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                {t('रजिस्टर करें', 'Register')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Login;
