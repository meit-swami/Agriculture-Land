import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Image, Video, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  type: 'image' | 'video' | 'document';
  maxFiles: number;
  uploadedUrls: string[];
  onUrlsChange: (urls: string[]) => void;
}

const acceptMap = {
  image: 'image/jpeg,image/png,image/webp',
  video: 'video/mp4,video/webm',
  document: 'application/pdf',
};

const iconMap = {
  image: Image,
  video: Video,
  document: FileText,
};

const FileUpload = ({ type, maxFiles, uploadedUrls, onUrlsChange }: FileUploadProps) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const Icon = iconMap[type];

  const labels = {
    image: t('फ़ोटो अपलोड करें', 'Upload Photos'),
    video: t('वीडियो अपलोड करें', 'Upload Video'),
    document: t('दस्तावेज़ PDF अपलोड करें', 'Upload Document PDF'),
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', type);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error(t('पहले लॉगिन करें', 'Please login first'));
      return null;
    }

    const res = await supabase.functions.invoke('upload-media', {
      body: formData,
    });

    if (res.error || res.data?.error) {
      console.error('Upload error:', res.error || res.data?.error);
      return null;
    }

    return res.data?.url || null;
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (uploadedUrls.length + selected.length > maxFiles) {
      toast.error(t(`अधिकतम ${maxFiles} फ़ाइलें`, `Maximum ${maxFiles} files`));
      return;
    }

    // Show local previews for images immediately
    if (type === 'image') {
      const localPreviews = selected.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...localPreviews]);
    }

    setUploading(true);
    const newUrls: string[] = [];

    for (const file of selected) {
      const url = await uploadFile(file);
      if (url) {
        newUrls.push(url);
      } else {
        toast.error(t(`"${file.name}" अपलोड विफल`, `Failed to upload "${file.name}"`));
      }
    }

    if (newUrls.length > 0) {
      onUrlsChange([...uploadedUrls, ...newUrls]);
      toast.success(t(`${newUrls.length} फ़ाइल अपलोड हुई`, `${newUrls.length} file(s) uploaded`));
    }

    setUploading(false);
    // Reset input
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    onUrlsChange(uploadedUrls.filter((_, i) => i !== index));
    if (type === 'image' && previews[index]) {
      URL.revokeObjectURL(previews[index]);
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed border-border rounded-xl p-6 text-center transition-colors ${uploading ? 'opacity-60 cursor-wait' : 'cursor-pointer hover:border-primary/50 hover:bg-primary/5'}`}
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 text-primary mx-auto mb-2 animate-spin" />
        ) : (
          <Icon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        )}
        <p className="text-sm font-medium">
          {uploading ? t('अपलोड हो रहा है...', 'Uploading...') : labels[type]}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {type === 'image' && t(`अधिकतम ${maxFiles} फ़ोटो (JPG, PNG)`, `Max ${maxFiles} photos (JPG, PNG)`)}
          {type === 'video' && t('MP4, WebM (अधिकतम 20MB)', 'MP4, WebM (max 20MB)')}
          {type === 'document' && t('PDF फ़ाइल (अधिकतम 10MB)', 'PDF file (max 10MB)')}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={acceptMap[type]}
          multiple={maxFiles > 1}
          onChange={handleFiles}
          className="hidden"
        />
      </div>

      {/* Image Previews */}
      {type === 'image' && uploadedUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {uploadedUrls.map((src, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden aspect-square">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File list for video/document */}
      {type !== 'image' && uploadedUrls.length > 0 && (
        <div className="mt-2 space-y-1">
          {uploadedUrls.map((url, i) => (
            <div key={i} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-sm">
              <span className="truncate">{url.split('/').pop()}</span>
              <button type="button" onClick={() => removeFile(i)} className="text-destructive ml-2">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
