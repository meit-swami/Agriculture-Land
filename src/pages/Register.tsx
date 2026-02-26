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
import { Sprout, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { states } from '@/data/mockProperties';

const Register = () => {
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', state: '', district: '', role: 'buyer' as string,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error(t('पासवर्ड कम से कम 6 अक्षर का होना चाहिए', 'Password must be at least 6 characters'));
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, {
      full_name: form.fullName,
      phone: form.phone,
      role: form.role,
    });
    setLoading(false);
    if (error) {
      toast.error(t('रजिस्ट्रेशन विफल', 'Registration failed'), { description: error.message });
    } else {
      toast.success(t('खाता बनाया गया! लॉगिन करें।', 'Account created! Please login.'));
      navigate('/login');
    }
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

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
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('पूरा नाम', 'Full Name')}</Label>
                <Input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} required placeholder={t('अपना नाम लिखें', 'Enter your name')} />
              </div>
              <div>
                <Label>{t('ईमेल', 'Email')}</Label>
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required placeholder="example@email.com" />
              </div>
              <div>
                <Label>{t('पासवर्ड', 'Password')}</Label>
                <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required placeholder="••••••••" />
              </div>
              <div>
                <Label>{t('मोबाइल नंबर', 'Mobile Number')}</Label>
                <Input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} required placeholder="+91 98765 43210" />
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
                <Input value={form.district} onChange={(e) => update('district', e.target.value)} placeholder={t('जिला लिखें', 'Enter district')} />
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
                {loading ? t('रजिस्टर हो रहा है...', 'Registering...') : t('रजिस्टर करें', 'Register')}
              </Button>
            </form>
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
