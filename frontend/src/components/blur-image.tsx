"use client";
import { cn } from "@/lib/utils";
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

export function BlurImage(props: ImageProps) {
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState(props.src);

  // Atualiza o `src` quando o valor de `prop.src` mudar
  useEffect(() => setSrc(props.src), [props.src]);

  // Função chamada quando a imagem carregar com sucesso
  const handleLoad = (e: React.SyntheticEvent) => {
    setLoading(false);
  };

  // Função chamada quando a imagem falhar ao carregar
  const handleError = () => {
    // Define um avatar padrão caso a imagem falhe
    setSrc(`https://avatar.vercel.sh/${encodeURIComponent(props.alt)}`);
  };

  return (
    <Image
      {...props}
      src={src} // Usa o src dinâmico, que pode ser atualizado no erro
      className={cn(
        "duration-700 ease-in-out",
        loading ? "blur-sm grayscale" : "blur-0 grayscale-0"
      )}
      onError={handleError}
      onLoad={handleLoad}
      unoptimized // Desabilita otimização, útil para desenvolvimento
      priority
    />
  );
}
