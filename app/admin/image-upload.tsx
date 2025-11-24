"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (url: string) => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload para o Bucket 'products'
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Obter URL Pública
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      // Atualiza a lista de imagens
      onChange([...value, data.publicUrl]);
      toast.success("Imagem enviada com sucesso!");
      
    } catch (error: any) {
      console.error(error);
      toast.error("Erro no upload da imagem.", {
        description: error.message
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-gray-200">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Product Image"
              src={url}
            />
          </div>
        ))}
      </div>
      
      <div>
        <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={onUpload}
            disabled={isUploading}
        />
        <Button
          type="button"
          disabled={isUploading}
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto border-dashed border-2 border-gray-300 bg-gray-50 h-32 flex flex-col gap-2 hover:bg-gray-100"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          ) : (
            <ImagePlus className="h-6 w-6 text-gray-500" />
          )}
          <span className="text-sm text-gray-500">
            {isUploading ? "Enviando..." : "Clique para fazer upload de imagem"}
          </span>
        </Button>
      </div>
    </div>
  );
}