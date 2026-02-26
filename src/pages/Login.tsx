import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email.trim().toLowerCase(), password);
    setLoading(false);
    if (error) {
      toast.error(t('लॉगिन विफल', 'Login failed'), { description: error.message });
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
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('ईमेल', 'Email')}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com" />
              </div>
              <div>
                <Label>{t('पासवर्ड', 'Password')}</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={loading}>
                <LogIn className="h-4 w-4 mr-2" />
                {loading ? t('लॉगिन हो रहा है...', 'Logging in...') : t('लॉगिन', 'Login')}
              </Button>
            </form>
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
