"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value: (string | File)[]; // Agora aceita URL ou Arquivo Bruto
  onChange: (value: (string | File)[]) => void;
  onRemove: (value: (string | File)) => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Converte FileList para Array e adiciona ao estado existente
    const newFiles = Array.from(files);
    onChange([...value, ...newFiles]);
  };

  const handleRemove = (itemToRemove: string | File) => {
    // Filtra removendo o item específico
    const updatedList = value.filter((item) => item !== itemToRemove);
    onChange(updatedList);
  };

  // Função auxiliar para gerar URL de preview
  const getPreviewUrl = (item: string | File) => {
    if (item instanceof File) {
      return URL.createObjectURL(item);
    }
    return item;
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((item, index) => (
          <div 
            key={index} 
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-gray-200 bg-white"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => handleRemove(item)}
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
              alt="Imagem do produto"
              src={getPreviewUrl(item)}
            />
          </div>
        ))}
      </div>
      
      <div>
        <label className="cursor-pointer">
            <input 
                type="file" 
                accept="image/*" 
                multiple // Permite selecionar várias fotos
                className="hidden" 
                onChange={onUpload}
            />
            <div className="w-full sm:w-auto border-dashed border-2 border-gray-300 bg-gray-50 h-32 flex flex-col gap-2 items-center justify-center hover:bg-gray-100 rounded-md transition-colors">
                <ImagePlus className="h-6 w-6 text-gray-500" />
                <span className="text-sm text-gray-500">
                    Clique para adicionar imagens
                </span>
            </div>
        </label>
      </div>
    </div>
  );
}