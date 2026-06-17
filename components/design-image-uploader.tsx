"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DesignImageUploader({
  initialImages = [],
}: {
  initialImages?: string[];
}) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("design-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError(`Yükleme hatası: ${uploadError.message}`);
        continue;
      }

      const { data } = supabase.storage.from("design-images").getPublicUrl(path);
      if (data?.publicUrl) uploaded.push(data.publicUrl);
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  return (
    <div>
      <input type="hidden" name="design_images" value={JSON.stringify(images)} />

      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-border">
            <Image src={url} alt="Tasarım görseli" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Görseli kaldır"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-black/[0.02] text-muted transition-colors hover:border-brand-300 hover:text-brand-600">
          {uploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <ImagePlus size={20} />
              <span className="text-[11px]">Görsel Ekle</span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {error && <p className="mt-2 text-sm text-danger-600">{error}</p>}
      <p className="mt-2 text-xs text-muted">
        Tasarım görsellerini yükleyin. Birden fazla görsel seçebilirsiniz.
      </p>
    </div>
  );
}
