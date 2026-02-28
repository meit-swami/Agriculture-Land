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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { MapPin, Edit, Eye, CheckCircle2, Clock, XCircle, AlertTriangle, Loader2, Image, Video, FileText, ExternalLink, X } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { states } from '@/data/mockProperties';

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
      state: p.state,
      district: p.district,
      tehsil: p.tehsil,
      village: p.village,
      land_type: p.land_type,
      category: p.category,
      area: p.area,
      area_unit: p.area_unit,
      khasra_number: p.khasra_number,
      asking_price: p.asking_price,
      negotiable: p.negotiable,
      owner_type: p.owner_type,
      owner_name: p.owner_name,
      owner_phone: p.owner_phone,
      images: p.images || [],
      video_url: p.video_url,
      document_url: p.document_url,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await supabase.from('properties').update({
      title: editForm.title,
      title_en: editForm.title_en,
      state: editForm.state,
      district: editForm.district,
      tehsil: editForm.tehsil,
      village: editForm.village,
      land_type: editForm.land_type,
      category: editForm.category,
      area: editForm.area,
      area_unit: editForm.area_unit,
      khasra_number: editForm.khasra_number,
      asking_price: editForm.asking_price,
      negotiable: editForm.negotiable,
      owner_type: editForm.owner_type,
      owner_name: editForm.owner_name,
      owner_phone: editForm.owner_phone,
      images: editForm.images?.length > 0 ? editForm.images : null,
      video_url: editForm.video_url || null,
      document_url: editForm.document_url || null,
    }).eq('id', editingId);
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
                          <DialogContent className="max-w-2xl max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>{t('भूमि संपादित करें', 'Edit Property')}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[70vh] pr-4">
                              <div className="space-y-4">
                                {/* Titles */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div><Label>{t('शीर्षक (हिंदी)', 'Title (Hindi)')}</Label><Input value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
                                  <div><Label>{t('शीर्षक (English)', 'Title (English)')}</Label><Input value={editForm.title_en || ''} onChange={(e) => setEditForm({ ...editForm, title_en: e.target.value })} /></div>
                                </div>

                                {/* Location */}
                                <h3 className="font-semibold text-sm text-muted-foreground pt-2">{t('स्थान', 'Location')}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label>{t('राज्य', 'State')}</Label>
                                    <Select value={editForm.state || ''} onValueChange={(v) => setEditForm({ ...editForm, state: v })}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                  </div>
                                  <div><Label>{t('जिला', 'District')}</Label><Input value={editForm.district || ''} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })} /></div>
                                  <div><Label>{t('तहसील', 'Tehsil')}</Label><Input value={editForm.tehsil || ''} onChange={(e) => setEditForm({ ...editForm, tehsil: e.target.value })} /></div>
                                  <div><Label>{t('गाँव', 'Village')}</Label><Input value={editForm.village || ''} onChange={(e) => setEditForm({ ...editForm, village: e.target.value })} /></div>
                                </div>

                                {/* Land Details */}
                                <h3 className="font-semibold text-sm text-muted-foreground pt-2">{t('भूमि विवरण', 'Land Details')}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label>{t('भूमि प्रकार', 'Land Type')}</Label>
                                    <Select value={editForm.land_type || 'irrigated'} onValueChange={(v) => setEditForm({ ...editForm, land_type: v })}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="irrigated">{t('सिंचित', 'Irrigated')}</SelectItem>
                                        <SelectItem value="non-irrigated">{t('गैर-सिंचित', 'Non-Irrigated')}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>{t('श्रेणी', 'Category')}</Label>
                                    <Select value={editForm.category || 'General'} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="SC">SC</SelectItem>
                                        <SelectItem value="ST">ST</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div><Label>{t('क्षेत्रफल', 'Area')}</Label><Input type="number" value={editForm.area || ''} onChange={(e) => setEditForm({ ...editForm, area: parseFloat(e.target.value) })} /></div>
                                  <div>
                                    <Label>{t('इकाई', 'Unit')}</Label>
                                    <Select value={editForm.area_unit || 'bigha'} onValueChange={(v) => setEditForm({ ...editForm, area_unit: v })}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="bigha">{t('बीघा', 'Bigha')}</SelectItem>
                                        <SelectItem value="acre">{t('एकड़', 'Acre')}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div><Label>{t('खसरा नंबर', 'Khasra Number')}</Label><Input value={editForm.khasra_number || ''} onChange={(e) => setEditForm({ ...editForm, khasra_number: e.target.value })} /></div>

                                {/* Price */}
                                <h3 className="font-semibold text-sm text-muted-foreground pt-2">{t('कीमत', 'Pricing')}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                  <div><Label>{t('माँगी गई कीमत (₹)', 'Asking Price (₹)')}</Label><Input type="number" value={editForm.asking_price || ''} onChange={(e) => setEditForm({ ...editForm, asking_price: parseFloat(e.target.value) })} /></div>
                                  <div className="flex items-center gap-3 pt-6">
                                    <Label>{t('मोलभाव योग्य', 'Negotiable')}</Label>
                                    <Switch checked={editForm.negotiable || false} onCheckedChange={(v) => setEditForm({ ...editForm, negotiable: v })} />
                                  </div>
                                </div>

                                {/* Owner Info */}
                                <h3 className="font-semibold text-sm text-muted-foreground pt-2">{t('मालिक जानकारी', 'Owner Info')}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label>{t('मालिक प्रकार', 'Owner Type')}</Label>
                                    <Select value={editForm.owner_type || 'owner'} onValueChange={(v) => setEditForm({ ...editForm, owner_type: v })}>
                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="owner">{t('मालिक', 'Owner')}</SelectItem>
                                        <SelectItem value="broker">{t('ब्रोकर', 'Broker')}</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div><Label>{t('मालिक नाम', 'Owner Name')}</Label><Input value={editForm.owner_name || ''} onChange={(e) => setEditForm({ ...editForm, owner_name: e.target.value })} /></div>
                                </div>
                                <div><Label>{t('मालिक फ़ोन', 'Owner Phone')}</Label><Input value={editForm.owner_phone || ''} onChange={(e) => setEditForm({ ...editForm, owner_phone: e.target.value })} /></div>

                                {/* Media - editable with FileUpload */}
                                <h3 className="font-semibold text-sm text-muted-foreground pt-2">{t('मीडिया फ़ाइलें', 'Media Files')}</h3>

                                {/* Photos - show existing with remove + upload more */}
                                <div>
                                  <Label className="flex items-center gap-1 mb-2"><Image className="h-4 w-4" />{t('फ़ोटो', 'Photos')} ({editForm.images?.length || 0})</Label>
                                  {editForm.images?.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                                      {editForm.images.map((url: string, i: number) => (
                                        <div key={i} className="relative group rounded-lg overflow-hidden aspect-square">
                                          <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                                          <button
                                            type="button"
                                            onClick={() => setEditForm({ ...editForm, images: editForm.images.filter((_: string, idx: number) => idx !== i) })}
                                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <FileUpload
                                    type="image"
                                    maxFiles={10}
                                    uploadedUrls={editForm.images || []}
                                    onUrlsChange={(urls) => setEditForm({ ...editForm, images: urls })}
                                  />
                                </div>

                                {/* Video */}
                                <div>
                                  <Label className="flex items-center gap-1 mb-2"><Video className="h-4 w-4" />{t('वीडियो', 'Video')}</Label>
                                  {editForm.video_url && (
                                    <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-sm mb-2">
                                      <a href={editForm.video_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate flex items-center gap-1">
                                        <Video className="h-4 w-4 shrink-0" />
                                        {t('वीडियो देखें', 'View Video')}
                                        <ExternalLink className="h-3 w-3 shrink-0" />
                                      </a>
                                      <button type="button" onClick={() => setEditForm({ ...editForm, video_url: null })} className="text-destructive ml-2">
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                  {!editForm.video_url && (
                                    <FileUpload
                                      type="video"
                                      maxFiles={1}
                                      uploadedUrls={editForm.video_url ? [editForm.video_url] : []}
                                      onUrlsChange={(urls) => setEditForm({ ...editForm, video_url: urls[0] || null })}
                                    />
                                  )}
                                </div>

                                {/* Document */}
                                <div>
                                  <Label className="flex items-center gap-1 mb-2"><FileText className="h-4 w-4" />{t('दस्तावेज़', 'Document')}</Label>
                                  {editForm.document_url && (
                                    <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-sm mb-2">
                                      <a href={editForm.document_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate flex items-center gap-1">
                                        <FileText className="h-4 w-4 shrink-0" />
                                        {t('दस्तावेज़ देखें', 'View Document')}
                                        <ExternalLink className="h-3 w-3 shrink-0" />
                                      </a>
                                      <button type="button" onClick={() => setEditForm({ ...editForm, document_url: null })} className="text-destructive ml-2">
                                        <X className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )}
                                  {!editForm.document_url && (
                                    <FileUpload
                                      type="document"
                                      maxFiles={1}
                                      uploadedUrls={editForm.document_url ? [editForm.document_url] : []}
                                      onUrlsChange={(urls) => setEditForm({ ...editForm, document_url: urls[0] || null })}
                                    />
                                  )}
                                </div>

                                <Button className="w-full bg-primary text-primary-foreground mt-4" onClick={saveEdit} disabled={saving}>
                                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                  {t('अपडेट करें', 'Update')}
                                </Button>
                              </div>
                            </ScrollArea>
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
