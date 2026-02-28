import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Phone, Mail, LogOut, ShieldCheck, Crown, Settings, LayoutDashboard, Home as HomeIcon, Link as LinkIcon, Eye, Copy, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Profile = () => {
  const { t } = useLanguage();
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [privateLinks, setPrivateLinks] = useState<any[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);

  useEffect(() => {
    if (user) fetchPrivateLinks();
  }, [user]);

  const fetchPrivateLinks = async () => {
    if (!user) return;
    setLinksLoading(true);
    const { data: links } = await supabase
      .from('private_links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (links && links.length > 0) {
      // Fetch view counts for each link
      const linkIds = links.map((l: any) => l.id);
      const { data: views } = await supabase
        .from('link_views')
        .select('link_id')
        .in('link_id', linkIds);

      const viewCounts: Record<string, number> = {};
      (views || []).forEach((v: any) => {
        viewCounts[v.link_id] = (viewCounts[v.link_id] || 0) + 1;
      });

      // Fetch property titles
      const propIds = [...new Set(links.map((l: any) => l.property_id))];
      const { data: props } = await supabase
        .from('properties')
        .select('id, title, title_en')
        .in('id', propIds);

      const propMap: Record<string, any> = {};
      (props || []).forEach((p: any) => { propMap[p.id] = p; });

      setPrivateLinks(links.map((l: any) => ({
        ...l,
        viewCount: viewCounts[l.id] || 0,
        propertyTitle: propMap[l.property_id]?.title || '',
        propertyTitleEn: propMap[l.property_id]?.title_en || '',
      })));
    } else {
      setPrivateLinks([]);
    }
    setLinksLoading(false);
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/p/${token}`);
    toast.success(t('लिंक कॉपी हो गया!', 'Link copied!'));
  };

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

        {/* Private Links Section */}
        <Card className="border-0 shadow-xl mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              {t('मेरे प्राइवेट लिंक', 'My Private Links')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {linksLoading ? (
              <div className="py-6 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /></div>
            ) : privateLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t('कोई प्राइवेट लिंक नहीं। किसी भूमि पर "रुचि दिखाएँ" दबाएँ।', 'No private links yet. Click "Show Interest" on a property.')}
              </p>
            ) : (
              <div className="space-y-3">
                {privateLinks.map((link) => (
                  <div key={link.id} className="bg-muted rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{link.propertyTitle || link.propertyTitleEn}</p>
                        <p className="text-xs text-muted-foreground">{new Date(link.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary shrink-0">
                        <Eye className="h-3 w-3 mr-1" />
                        {link.viewCount} {t('व्यू', 'views')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] bg-background p-1.5 rounded flex-1 truncate">/p/{link.token.slice(0, 16)}...</code>
                      <Button size="sm" variant="ghost" onClick={() => copyLink(link.token)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(`/p/${link.token}`, '_blank')}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link to="/my-properties">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><HomeIcon className="h-5 w-5 text-primary" /></div>
                <span className="font-semibold">{t('मेरी भूमि', 'My Properties')}</span>
              </CardContent>
            </Card>
          </Link>
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
          {role === 'admin' && (
            <Link to="/admin">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer ring-2 ring-primary">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><LayoutDashboard className="h-5 w-5 text-primary" /></div>
                  <span className="font-semibold">{t('एडमिन डैशबोर्ड', 'Admin Dashboard')}</span>
                </CardContent>
              </Card>
            </Link>
          )}
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
