import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, X, Image, Video, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  type: 'image' | 'video' | 'document';
  maxFiles: number;
  files: File[];
  onFilesChange: (files: File[]) => void;
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

const FileUpload = ({ type, maxFiles, files, onFilesChange }: FileUploadProps) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const Icon = iconMap[type];

  const labels = {
    image: t('फ़ोटो अपलोड करें', 'Upload Photos'),
    video: t('वीडियो अपलोड करें', 'Upload Video'),
    document: t('दस्तावेज़ PDF अपलोड करें', 'Upload Document PDF'),
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (files.length + selected.length > maxFiles) {
      toast.error(t(`अधिकतम ${maxFiles} फ़ाइलें`, `Maximum ${maxFiles} files`));
      return;
    }
    const newFiles = [...files, ...selected];
    onFilesChange(newFiles);

    if (type === 'image') {
      const newPreviews = selected.map((f) => URL.createObjectURL(f));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    if (type === 'image') {
      URL.revokeObjectURL(previews[index]);
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <Icon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm font-medium">{labels[type]}</p>
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
      {type === 'image' && previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-3">
          {previews.map((src, i) => (
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
      {type !== 'image' && files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 text-sm">
              <span className="truncate">{f.name}</span>
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
