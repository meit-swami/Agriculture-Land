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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { MapPin, Edit, Eye, CheckCircle2, Clock, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

const MyProperties = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [propRes, intRes] = await Promise.all([
      supabase.from('properties').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      supabase.from('interests').select('*, properties(title)').eq('properties.user_id', user!.id),
    ]);
    setProperties(propRes.data || []);
    setInterests(intRes.data || []);
    setLoading(false);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({
      title: p.title,
      title_en: p.title_en,
      asking_price: p.asking_price,
      area: p.area,
      owner_name: p.owner_name,
      owner_phone: p.owner_phone,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase.from('properties').update(editForm).eq('id', editingId);
    setSaving(false);
    if (error) {
      toast.error(t('अपडेट विफल', 'Update failed'));
    } else {
      toast.success(t('भूमि अपडेट हुई', 'Property updated'));
      setEditingId(null);
      fetchData();
    }
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

  const statusConfig: Record<string, { icon: any; class: string; hi: string; en: string }> = {
    pending: { icon: Clock, class: 'bg-accent/20 text-accent-foreground', hi: 'सत्यापन लंबित', en: 'Verification Pending' },
    approved: { icon: CheckCircle2, class: 'bg-primary/20 text-primary', hi: 'स्वीकृत', en: 'Approved' },
    rejected: { icon: XCircle, class: 'bg-destructive/20 text-destructive', hi: 'अस्वीकृत', en: 'Rejected' },
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('मेरी भूमि', 'My Properties')}</h1>
          <Link to="/post"><Button className="bg-primary text-primary-foreground">{t('नई भूमि पोस्ट करें', '+ Post New')}</Button></Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : properties.length === 0 ? (
          <Card className="border-0 shadow-xl text-center">
            <CardContent className="p-10">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-lg font-bold mb-2">{t('कोई भूमि नहीं पोस्ट की गई', 'No Properties Posted Yet')}</h2>
              <p className="text-muted-foreground mb-4">{t('अपनी पहली भूमि पोस्ट करें', 'Post your first property')}</p>
              <Link to="/post"><Button className="bg-primary text-primary-foreground">{t('भूमि पोस्ट करें', 'Post Property')}</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {properties.map((p) => {
              const sc = statusConfig[p.verification_status] || statusConfig.pending;
              const Icon = sc.icon;
              return (
                <Card key={p.id} className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Image */}
                      {p.images?.[0] && (
                        <img src={p.images[0]} alt={p.title} className="w-full md:w-32 h-24 object-cover rounded-lg" loading="lazy" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold">{lang === 'hi' ? p.title : p.title_en}</h3>
                          <Badge className={sc.class}>
                            <Icon className="h-3 w-3 mr-1" />{t(sc.hi, sc.en)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{p.district}, {p.state}
                        </p>
                        <p className="text-sm mt-1">
                          ₹{p.asking_price?.toLocaleString()} • {p.area} {p.area_unit}
                        </p>
                        {p.team_remarks && (
                          <p className="text-xs mt-2 bg-muted p-2 rounded">
                            <span className="font-medium">{t('टीम रिमार्क्स', 'Team Remarks')}:</span> {p.team_remarks}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link to={`/property/${p.id}`}>
                          <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" />{t('देखें', 'View')}</Button>
                        </Link>
                        <Dialog open={editingId === p.id} onOpenChange={(open) => { if (!open) setEditingId(null); }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                              <Edit className="h-4 w-4 mr-1" />{t('बदलें', 'Edit')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('भूमि संपादित करें', 'Edit Property')}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                              <div><Label>{t('शीर्षक (हिंदी)', 'Title (Hindi)')}</Label><Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                              <div><Label>{t('शीर्षक (English)', 'Title (English)')}</Label><Input value={editForm.title_en || ''} onChange={(e) => setEditForm({ ...editForm, title_en: e.target.value })} /></div>
                              <div><Label>{t('कीमत (₹)', 'Price (₹)')}</Label><Input type="number" value={editForm.asking_price || ''} onChange={(e) => setEditForm({ ...editForm, asking_price: parseFloat(e.target.value) })} /></div>
                              <div><Label>{t('क्षेत्रफल', 'Area')}</Label><Input type="number" value={editForm.area || ''} onChange={(e) => setEditForm({ ...editForm, area: parseFloat(e.target.value) })} /></div>
                              <div><Label>{t('मालिक नाम', 'Owner Name')}</Label><Input value={editForm.owner_name || ''} onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })} /></div>
                              <div><Label>{t('मालिक फ़ोन', 'Owner Phone')}</Label><Input value={editForm.owner_phone || ''} onChange={(e) => setEditForm({ ...editForm, owner_phone: e.target.value })} /></div>
                              <Button className="w-full bg-primary text-primary-foreground" onClick={saveEdit} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                {t('सेव करें', 'Save Changes')}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </AppLayout>
  );
};

export default MyProperties;
