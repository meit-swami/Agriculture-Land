import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Users, BarChart3, CheckCircle2, Clock, XCircle, MapPin, Eye,
  Bell, Trash2, Edit, Crown, Home, Send, Image, Video, FileText, ExternalLink, Loader2
} from 'lucide-react';

const AdminDashboard = () => {
  const { t, lang } = useLanguage();
  const { user, role } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, users: 0, subs: 0 });
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [viewProperty, setViewProperty] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUserForm, setEditUserForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role === 'admin') fetchData();
  }, [role]);

  const fetchData = async () => {
    setLoading(true);
    const [propRes, profileRes, roleRes, subRes] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
      supabase.from('user_roles').select('*'),
      supabase.from('subscriptions' as any).select('*').order('created_at', { ascending: false }),
    ]);
    const props = propRes.data || [];
    const profs = profileRes.data || [];
    const rls = roleRes.data || [];
    const subs = (subRes.data || []) as any[];
    setProperties(props);
    setUsers(profs);
    setRoles(rls);
    setSubscriptions(subs);
    setStats({
      total: props.length,
      pending: props.filter((p) => p.verification_status === 'pending').length,
      approved: props.filter((p) => p.verification_status === 'approved').length,
      rejected: props.filter((p) => p.verification_status === 'rejected').length,
      users: profs.length,
      subs: subs.length,
    });
    setLoading(false);
  };

  const sendNotification = async (userId: string, title: string, message: string, propertyId?: string) => {
    await supabase.from('notifications' as any).insert({
      user_id: userId,
      title,
      message,
      property_id: propertyId || null,
    });
  };

  const updatePropertyStatus = async (id: string, status: string) => {
    const prop = properties.find((p) => p.id === id);
    const remarkText = remarks[id] || '';
    const updateData: any = {
      verification_status: status,
      verified: status === 'approved',
    };
    if (remarkText) updateData.team_remarks = remarkText;

    const { error } = await supabase.from('properties').update(updateData).eq('id', id);
    if (error) {
      toast.error(t('अपडेट विफल', 'Update failed'));
      return;
    }

    // Auto-send notification to property owner
    if (prop) {
      const statusLabel = status === 'approved' ? t('स्वीकृत', 'Approved') : t('अस्वीकृत', 'Rejected');
      const notifTitle = `${t('भूमि', 'Property')} ${statusLabel}`;
      const notifMsg = remarkText
        ? `${t('आपकी भूमि', 'Your property')} "${prop.title}" ${statusLabel}। ${t('रिमार्क्स', 'Remarks')}: ${remarkText}`
        : `${t('आपकी भूमि', 'Your property')} "${prop.title}" ${statusLabel}।`;
      await sendNotification(prop.user_id, notifTitle, notifMsg, id);
    }

    toast.success(t('स्थिति अपडेट + सूचना भेजी गई', 'Status updated + notification sent'));
    setRemarks((r) => ({ ...r, [id]: '' }));
    fetchData();
  };

  const getUserRole = (userId: string) => roles.find((r) => r.user_id === userId)?.role || 'buyer';
  const getUserName = (userId: string) => users.find((u) => u.user_id === userId)?.full_name || userId.slice(0, 8);

  const openEditUser = (u: any) => {
    setEditingUser(u);
    setEditUserForm({ full_name: u.full_name, phone: u.phone, state: u.state, district: u.district, role: getUserRole(u.user_id) });
  };

  const saveUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    const { role: newRole, ...profileData } = editUserForm;
    await supabase.from('profiles').update(profileData).eq('user_id', editingUser.user_id);
    const currentRole = getUserRole(editingUser.user_id);
    if (newRole !== currentRole) {
      await supabase.from('user_roles').update({ role: newRole }).eq('user_id', editingUser.user_id);
    }
    setSaving(false);
    toast.success(t('यूज़र अपडेट हुआ', 'User updated'));
    setEditingUser(null);
    fetchData();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm(t('क्या आप इस यूज़र को हटाना चाहते हैं?', 'Delete this user?'))) return;
    await supabase.from('user_roles').delete().eq('user_id', userId);
    await supabase.from('profiles').delete().eq('user_id', userId);
    toast.success(t('यूज़र हटाया गया', 'User deleted'));
    fetchData();
  };

  const deleteSubscription = async (id: string) => {
    if (!confirm(t('सदस्यता हटाएँ?', 'Delete subscription?'))) return;
    await supabase.from('subscriptions' as any).delete().eq('id', id);
    toast.success(t('सदस्यता हटाई गई', 'Subscription deleted'));
    fetchData();
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            {t('एडमिन डैशबोर्ड', 'Admin Dashboard')}
          </h1>
          <Link to="/my-properties">
            <Button variant="outline" size="sm"><Home className="h-4 w-4 mr-1" />{t('मेरी भूमि', 'My Properties')}</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          {[
            { label: t('कुल भूमि', 'Total'), value: stats.total, icon: BarChart3 },
            { label: t('लंबित', 'Pending'), value: stats.pending, icon: Clock },
            { label: t('स्वीकृत', 'Approved'), value: stats.approved, icon: CheckCircle2 },
            { label: t('अस्वीकृत', 'Rejected'), value: stats.rejected, icon: XCircle },
            { label: t('यूज़र', 'Users'), value: stats.users, icon: Users },
            { label: t('सदस्यता', 'Subs'), value: stats.subs, icon: Crown },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-md">
              <CardContent className="p-3 text-center">
                <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="properties">
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="properties">{t('भूमि सत्यापन', 'Verification')}</TabsTrigger>
            <TabsTrigger value="users">{t('यूज़र', 'Users')}</TabsTrigger>
            <TabsTrigger value="subscriptions">{t('सदस्यता', 'Subscriptions')}</TabsTrigger>
          </TabsList>

          {/* ─── Properties Tab ─── */}
          <TabsContent value="properties">
            <div className="space-y-4">
              {properties.map((p) => (
                <Card key={p.id} className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Thumbnail */}
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt={p.title} className="w-full md:w-28 h-20 object-cover rounded-lg shrink-0" loading="lazy" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-sm">{p.title}</h3>
                          {statusBadge(p.verification_status)}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{p.village}, {p.tehsil}, {p.district}, {p.state}
                        </p>
                        <p className="text-xs mt-1">
                          ₹{p.asking_price?.toLocaleString()} • {p.area} {p.area_unit} • {t('खसरा', 'Khasra')}: {p.khasra_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('मालिक', 'Owner')}: {p.owner_name} ({p.owner_phone})
                        </p>
                        {p.team_remarks && (
                          <p className="text-xs mt-1 bg-muted p-1.5 rounded">{t('रिमार्क्स', 'Remarks')}: {p.team_remarks}</p>
                        )}
                        <Textarea
                          className="mt-2 text-sm"
                          placeholder={t('रिमार्क्स लिखें (सूचना ऑटो भेजी जाएगी)...', 'Write remarks (notification auto-sent)...')}
                          value={remarks[p.id] || ''}
                          onChange={(e) => setRemarks((r) => ({ ...r, [p.id]: e.target.value }))}
                          rows={2}
                        />
                      </div>
                      <div className="flex flex-row md:flex-col gap-1.5 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => setViewProperty(p)}>
                          <Eye className="h-4 w-4 mr-1" />{t('देखें', 'View')}
                        </Button>
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
                <p className="text-center text-muted-foreground py-10">{t('कोई भूमि नहीं', 'No properties')}</p>
              )}
            </div>
          </TabsContent>

          {/* ─── Users Tab ─── */}
          <TabsContent value="users">
            <div className="space-y-3">
              {users.map((u) => {
                const uRole = getUserRole(u.user_id);
                return (
                  <Card key={u.id} className="border-0 shadow-md">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold">{u.full_name || t('नाम नहीं', 'No name')}</p>
                        <p className="text-xs text-muted-foreground">{u.phone || '-'} • {u.district || '-'}, {u.state || '-'}</p>
                        <p className="text-xs text-muted-foreground">{t('शामिल', 'Joined')}: {new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/10 text-primary">{uRole}</Badge>
                        <Button variant="outline" size="sm" onClick={() => openEditUser(u)}>
                          <Edit className="h-3 w-3 mr-1" />{t('बदलें', 'Edit')}
                        </Button>
                        {u.user_id !== user?.id && (
                          <Button variant="destructive" size="sm" onClick={() => deleteUser(u.user_id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ─── Subscriptions Tab ─── */}
          <TabsContent value="subscriptions">
            {subscriptions.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">{t('कोई सदस्यता नहीं', 'No subscriptions')}</p>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((s: any) => (
                  <Card key={s.id} className="border-0 shadow-md">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold capitalize">{s.plan_type} — {s.plan_tier}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('यूज़र', 'User')}: {getUserName(s.user_id)} • ₹{s.price} •
                          {t('स्थिति', 'Status')}: <span className={s.status === 'active' ? 'text-primary font-medium' : 'text-destructive'}>{s.status}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('शुरू', 'From')}: {new Date(s.starts_at).toLocaleDateString()} →
                          {s.expires_at ? new Date(s.expires_at).toLocaleDateString() : t('अनिश्चित', 'Indefinite')}
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteSubscription(s.id)}>
                        <Trash2 className="h-3 w-3 mr-1" />{t('हटाएँ', 'Delete')}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Property View Dialog ─── */}
      <Dialog open={!!viewProperty} onOpenChange={(open) => { if (!open) setViewProperty(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{t('भूमि विवरण', 'Property Details')}</DialogTitle>
          </DialogHeader>
          {viewProperty && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-4">
                {/* Images */}
                {viewProperty.images?.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {viewProperty.images.map((url: string, i: number) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-28 object-cover rounded-lg border border-border hover:ring-2 hover:ring-primary" loading="lazy" />
                      </a>
                    ))}
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-lg">{viewProperty.title}</h3>
                  <p className="text-sm text-muted-foreground">{viewProperty.title_en}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">{t('राज्य', 'State')}:</span> {viewProperty.state}</div>
                  <div><span className="text-muted-foreground">{t('जिला', 'District')}:</span> {viewProperty.district}</div>
                  <div><span className="text-muted-foreground">{t('तहसील', 'Tehsil')}:</span> {viewProperty.tehsil}</div>
                  <div><span className="text-muted-foreground">{t('गाँव', 'Village')}:</span> {viewProperty.village}</div>
                  <div><span className="text-muted-foreground">{t('भूमि प्रकार', 'Land Type')}:</span> {viewProperty.land_type}</div>
                  <div><span className="text-muted-foreground">{t('श्रेणी', 'Category')}:</span> {viewProperty.category}</div>
                  <div><span className="text-muted-foreground">{t('क्षेत्रफल', 'Area')}:</span> {viewProperty.area} {viewProperty.area_unit}</div>
                  <div><span className="text-muted-foreground">{t('खसरा', 'Khasra')}:</span> {viewProperty.khasra_number}</div>
                  <div><span className="text-muted-foreground">{t('कीमत', 'Price')}:</span> ₹{viewProperty.asking_price?.toLocaleString()}</div>
                  <div><span className="text-muted-foreground">{t('मोलभाव', 'Negotiable')}:</span> {viewProperty.negotiable ? t('हाँ', 'Yes') : t('नहीं', 'No')}</div>
                  <div><span className="text-muted-foreground">{t('मालिक', 'Owner')}:</span> {viewProperty.owner_name}</div>
                  <div><span className="text-muted-foreground">{t('फ़ोन', 'Phone')}:</span> {viewProperty.owner_phone}</div>
                  <div><span className="text-muted-foreground">{t('प्रकार', 'Type')}:</span> {viewProperty.owner_type}</div>
                  <div><span className="text-muted-foreground">{t('स्थिति', 'Status')}:</span> {statusBadge(viewProperty.verification_status)}</div>
                </div>

                {/* Video & Document links */}
                {viewProperty.video_url && (
                  <a href={viewProperty.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline bg-muted p-2 rounded">
                    <Video className="h-4 w-4" />{t('वीडियो देखें', 'View Video')}<ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {viewProperty.document_url && (
                  <a href={viewProperty.document_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline bg-muted p-2 rounded">
                    <FileText className="h-4 w-4" />{t('दस्तावेज़ देखें', 'View Document')}<ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {viewProperty.team_remarks && (
                  <div className="bg-muted p-3 rounded text-sm">
                    <span className="font-medium">{t('टीम रिमार्क्स', 'Team Remarks')}:</span> {viewProperty.team_remarks}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Edit User Dialog ─── */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('यूज़र संपादित करें', 'Edit User')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>{t('नाम', 'Name')}</Label><Input value={editUserForm.full_name || ''} onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })} /></div>
            <div><Label>{t('फ़ोन', 'Phone')}</Label><Input value={editUserForm.phone || ''} onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })} /></div>
            <div><Label>{t('राज्य', 'State')}</Label><Input value={editUserForm.state || ''} onChange={(e) => setEditUserForm({ ...editUserForm, state: e.target.value })} /></div>
            <div><Label>{t('जिला', 'District')}</Label><Input value={editUserForm.district || ''} onChange={(e) => setEditUserForm({ ...editUserForm, district: e.target.value })} /></div>
            <div>
              <Label>{t('भूमिका', 'Role')}</Label>
              <Select value={editUserForm.role || 'buyer'} onValueChange={(v) => setEditUserForm({ ...editUserForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">{t('खरीदार', 'Buyer')}</SelectItem>
                  <SelectItem value="seller">{t('विक्रेता', 'Seller')}</SelectItem>
                  <SelectItem value="agent">{t('एजेंट', 'Agent')}</SelectItem>
                  <SelectItem value="admin">{t('एडमिन', 'Admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-primary text-primary-foreground" onClick={saveUser} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t('अपडेट करें', 'Update')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </AppLayout>
  );
};

export default AdminDashboard;
