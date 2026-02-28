import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { states } from '@/data/mockProperties';
import { supabase } from '@/integrations/supabase/client';
import { User, Phone, MapPin, Send, Handshake } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const JoinTeam = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', state: '', district: '', experience: '', message: '', role: 'buyer',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({ title: t('कृपया नाम और फ़ोन भरें', 'Please fill name and phone'), variant: 'destructive' });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast({ title: t('सही फ़ोन नंबर डालें', 'Enter a valid phone number'), variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('team_applications' as any).insert({
      name: form.name.trim().slice(0, 100),
      phone: form.phone.trim(),
      state: form.state || '',
      district: form.district || '',
      experience: form.experience.trim().slice(0, 200),
      message: form.message.trim().slice(0, 500),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: t('फॉर्म भेजने में समस्या', 'Failed to submit'), variant: 'destructive' });
      return;
    }
    toast({ title: t('आवेदन भेज दिया गया!', 'Application submitted!'), description: t('हम जल्द संपर्क करेंगे', 'We will contact you soon') });
    setForm({ name: '', phone: '', state: '', district: '', experience: '', message: '', role: 'buyer' });
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <Handshake className="h-8 w-8 text-primary-foreground" />
            <h1 className="text-xl md:text-2xl font-extrabold text-primary-foreground">
              {t('हमारी टीम बनें', 'Become Our Team')}
            </h1>
          </div>
          <p className="text-primary-foreground/80 text-sm mb-6">
            {t('अपनी जानकारी भरें, हम आपसे जल्द संपर्क करेंगे', 'Fill your details, we will contact you soon')}
          </p>

          <form onSubmit={handleSubmit} className="bg-card rounded-xl shadow-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />{t('नाम', 'Name')} *
              </label>
              <Input placeholder={t('आपका नाम', 'Your name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />{t('फ़ोन', 'Phone')} *
              </label>
              <Input placeholder="9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} maxLength={10} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('राज्य', 'State')}</label>
              <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v, district: '' })}>
                <SelectTrigger><SelectValue placeholder={t('राज्य चुनें', 'Select state')} /></SelectTrigger>
                <SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('जिला', 'District')}</label>
              <Input placeholder={t('जिला लिखें', 'Enter district')} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} maxLength={100} />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('अनुभव', 'Experience')}</label>
              <Input placeholder={t('कृषि भूमि में अनुभव...', 'Experience in agri land...')} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} maxLength={200} />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-medium text-muted-foreground">{t('आप क्या बनना चाहते हैं?', 'What do you want to be?')}</label>
              <RadioGroup value={form.role} onValueChange={(v) => setForm({ ...form, role: v })} className="grid grid-cols-2 gap-2">
                {[
                  { value: 'buyer', label: t('खरीदार', 'Buyer') },
                  { value: 'seller', label: t('विक्रेता', 'Seller') },
                  { value: 'agent', label: t('एजेंट के रूप में', 'List as Agent') },
                  { value: 'team', label: t('टीम मेंबर बनें', 'Become Team Member') },
                ].map((opt) => (
                  <Label key={opt.value} className={`flex items-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors ${form.role === opt.value ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <RadioGroupItem value={opt.value} />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t('अतिरिक्त जानकारी', 'Additional Details')}</label>
              <Textarea placeholder={t('कोई विशेष बात...', 'Anything specific...')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={500} rows={3} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base font-semibold">
                <Send className="h-4 w-4 mr-2" />
                {submitting ? t('भेज रहे हैं...', 'Submitting...') : t('आवेदन भेजें', 'Submit Application')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default JoinTeam;
