import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, BarChart3, CheckCircle2, Clock, XCircle, MapPin, Eye } from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role !== 'admin') return;
    fetchData();
  }, [role]);

  const fetchData = async () => {
    setLoading(true);
    const [propRes, profileRes, roleRes] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
      supabase.from('user_roles').select('*'),
    ]);

    const props = propRes.data || [];
    setProperties(props);
    setUsers(profileRes.data || []);
    setRoles(roleRes.data || []);
    setStats({
      total: props.length,
      pending: props.filter((p) => p.verification_status === 'pending').length,
      approved: props.filter((p) => p.verification_status === 'approved').length,
      rejected: props.filter((p) => p.verification_status === 'rejected').length,
      users: (profileRes.data || []).length,
    });
    setLoading(false);
  };

  const updatePropertyStatus = async (id: string, status: string) => {
    const updateData: any = {
      verification_status: status,
      verified: status === 'approved',
    };
    if (remarks[id]) updateData.team_remarks = remarks[id];

    const { error } = await supabase.from('properties').update(updateData).eq('id', id);
    if (error) {
      toast.error(t('अपडेट विफल', 'Update failed'));
    } else {
      toast.success(t('स्थिति अपडेट हुई', 'Status updated'));
      fetchData();
    }
  };

  const getUserRole = (userId: string) => {
    return roles.find((r) => r.user_id === userId)?.role || 'buyer';
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="border-0 shadow-xl text-center max-w-md">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold mb-4">{t('लॉगिन आवश्यक', 'Login Required')}</h2>
              <Link to="/login"><Button className="bg-primary text-primary-foreground">{t('लॉगिन', 'Login')}</Button></Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (role !== 'admin') {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="border-0 shadow-xl text-center max-w-md">
            <CardContent className="p-8">
              <ShieldCheck className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">{t('पहुँच अस्वीकृत', 'Access Denied')}</h2>
              <p className="text-muted-foreground">{t('केवल एडमिन ही इस पेज को देख सकते हैं', 'Only admins can view this page')}</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { class: string; hi: string; en: string }> = {
      pending: { class: 'bg-accent/20 text-accent-foreground', hi: 'लंबित', en: 'Pending' },
      approved: { class: 'bg-primary/20 text-primary', hi: 'स्वीकृत', en: 'Approved' },
      rejected: { class: 'bg-destructive/20 text-destructive', hi: 'अस्वीकृत', en: 'Rejected' },
    };
    const s = map[status] || map.pending;
    return <Badge className={s.class}>{t(s.hi, s.en)}</Badge>;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          {t('एडमिन डैशबोर्ड', 'Admin Dashboard')}
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: t('कुल भूमि', 'Total Properties'), value: stats.total, icon: BarChart3 },
            { label: t('लंबित', 'Pending'), value: stats.pending, icon: Clock },
            { label: t('स्वीकृत', 'Approved'), value: stats.approved, icon: CheckCircle2 },
            { label: t('अस्वीकृत', 'Rejected'), value: stats.rejected, icon: XCircle },
            { label: t('कुल यूज़र', 'Total Users'), value: stats.users, icon: Users },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-md">
              <CardContent className="p-4 text-center">
                <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="properties">
          <TabsList className="mb-4">
            <TabsTrigger value="properties">{t('भूमि सत्यापन', 'Property Verification')}</TabsTrigger>
            <TabsTrigger value="users">{t('यूज़र प्रबंधन', 'User Management')}</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <div className="space-y-4">
              {properties.map((p) => (
                <Card key={p.id} className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{p.title}</h3>
                          {statusBadge(p.verification_status)}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{p.village}, {p.tehsil}, {p.district}, {p.state}
                        </p>
                        <p className="text-sm mt-1">
                          {t('क्षेत्रफल', 'Area')}: {p.area} {p.area_unit} | {t('कीमत', 'Price')}: ₹{p.asking_price?.toLocaleString()} | {t('खसरा', 'Khasra')}: {p.khasra_number}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('मालिक', 'Owner')}: {p.owner_name} ({p.owner_phone}) | {t('प्रकार', 'Type')}: {p.owner_type}
                        </p>
                        {p.team_remarks && (
                          <p className="text-xs mt-1 bg-muted p-2 rounded">{t('टीम रिमार्क्स', 'Team Remarks')}: {p.team_remarks}</p>
                        )}
                        <Textarea
                          className="mt-2"
                          placeholder={t('टीम रिमार्क्स दर्ज करें...', 'Enter team remarks...')}
                          value={remarks[p.id] || ''}
                          onChange={(e) => setRemarks((r) => ({ ...r, [p.id]: e.target.value }))}
                          rows={2}
                        />
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 shrink-0">
                        <Link to={`/property/${p.id}`}>
                          <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />{t('देखें', 'View')}</Button>
                        </Link>
                        <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => updatePropertyStatus(p.id, 'approved')}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />{t('स्वीकृत', 'Approve')}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updatePropertyStatus(p.id, 'rejected')}>
                          <XCircle className="h-4 w-4 mr-1" />{t('अस्वीकृत', 'Reject')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {properties.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-10">{t('कोई भूमि नहीं मिली', 'No properties found')}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-3">
              {users.map((u) => (
                <Card key={u.id} className="border-0 shadow-md">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{u.full_name || t('नाम नहीं', 'No name')}</p>
                      <p className="text-sm text-muted-foreground">{u.phone} | {u.district}, {u.state}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">{getUserRole(u.user_id)}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
