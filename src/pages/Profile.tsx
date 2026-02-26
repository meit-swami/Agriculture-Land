import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Phone, Mail, LogOut, ShieldCheck, Crown, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Profile = () => {
  const { t } = useLanguage();
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <Card className="max-w-md w-full border-0 shadow-xl text-center">
            <CardContent className="p-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-4">{t('प्रोफाइल देखने के लिए लॉगिन करें', 'Login to view profile')}</h2>
              <div className="flex gap-3 justify-center">
                <Link to="/login"><Button className="bg-primary text-primary-foreground">{t('लॉगिन', 'Login')}</Button></Link>
                <Link to="/register"><Button variant="outline">{t('रजिस्टर', 'Register')}</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const roleLabels: Record<string, { hi: string; en: string }> = {
    buyer: { hi: 'खरीदार', en: 'Buyer' },
    seller: { hi: 'विक्रेता', en: 'Seller' },
    agent: { hi: 'एजेंट', en: 'Agent' },
    admin: { hi: 'एडमिन', en: 'Admin' },
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">{t('मेरी प्रोफाइल', 'My Profile')}</h1>

        <Card className="border-0 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile?.full_name || user.email}</h2>
                <Badge className="bg-primary/10 text-primary mt-1">
                  {role ? t(roleLabels[role]?.hi || role, roleLabels[role]?.en || role) : t('खरीदार', 'Buyer')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>{user.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile?.state && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{profile.district && `${profile.district}, `}{profile.state}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link to="/post">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center"><Settings className="h-5 w-5 text-accent-foreground" /></div>
                <span className="font-semibold">{t('भूमि पोस्ट करें', 'Post Property')}</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/subscriptions">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Crown className="h-5 w-5 text-primary" /></div>
                <span className="font-semibold">{t('सदस्यता प्लान', 'Subscription Plans')}</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          {t('लॉगआउट', 'Logout')}
        </Button>
      </div>
    </AppLayout>
  );
};

export default Profile;
