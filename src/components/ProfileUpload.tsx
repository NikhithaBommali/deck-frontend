interface ProfileUploadProps {
  picture: string;
  onPictureChange: (dataUrl: string) => void;
  disabled?: boolean;
}

export function ProfileUpload({
  picture,
  onPictureChange,
  disabled = false,
}: ProfileUploadProps) {
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 400_000) {
      alert('Image too large. Please use an image under 400KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onPictureChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <label
        className={`relative cursor-pointer group ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gold-500/40 bg-black/30 flex items-center justify-center">
          {picture ? (
            <img src={picture} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl text-white/30">📷</span>
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <span className="text-white text-xs font-medium">Upload</span>
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
          disabled={disabled}
        />
      </label>
      <span className="text-white/40 text-xs">Profile picture (optional)</span>
    </div>
  );
}
