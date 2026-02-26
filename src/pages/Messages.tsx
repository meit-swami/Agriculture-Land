import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const mockConversations = [
  { id: '1', name: 'रामकुमार शर्मा', lastMsg: 'हाँ, भूमि अभी उपलब्ध है', time: '2 मिनट पहले', unread: 2 },
  { id: '2', name: 'सुरेश यादव', lastMsg: 'कीमत पर बात करते हैं', time: '1 घंटा पहले', unread: 0 },
  { id: '3', name: 'विजय मालवीय', lastMsg: 'मीटिंग कल सुबह 10 बजे', time: 'कल', unread: 1 },
];

const mockMessages = [
  { id: '1', sender: 'other', text: 'नमस्ते, आपकी भूमि में रुचि है', time: '10:00 AM' },
  { id: '2', sender: 'me', text: 'हाँ जी, बताइए', time: '10:02 AM' },
  { id: '3', sender: 'other', text: 'क्या कीमत में कोई छूट मिल सकती है?', time: '10:05 AM' },
  { id: '4', sender: 'me', text: 'हम मिलकर बात करते हैं', time: '10:08 AM' },
];

const Messages = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>('1');
  const [newMsg, setNewMsg] = useState('');

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <Card className="max-w-md w-full border-0 shadow-xl text-center">
            <CardContent className="p-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-4">{t('संदेश देखने के लिए लॉगिन करें', 'Login to view messages')}</h2>
              <Link to="/login"><Button className="bg-primary text-primary-foreground">{t('लॉगिन', 'Login')}</Button></Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">{t('संदेश', 'Messages')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[60vh]">
          {/* Conversation list */}
          <Card className="border-0 shadow-md overflow-auto">
            <CardContent className="p-0">
              {mockConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={`flex items-center gap-3 p-4 cursor-pointer border-b border-border hover:bg-muted/50 transition-colors ${selectedChat === conv.id ? 'bg-muted' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm truncate">{conv.name}</span>
                      <span className="text-xs text-muted-foreground">{conv.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMsg}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">{conv.unread}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chat area */}
          <Card className="border-0 shadow-md md:col-span-2 flex flex-col">
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {mockMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-3 flex gap-2">
              <Input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder={t('संदेश लिखें...', 'Type a message...')} className="flex-1" />
              <Button size="icon" className="bg-primary text-primary-foreground"><Send className="h-4 w-4" /></Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Messages;
