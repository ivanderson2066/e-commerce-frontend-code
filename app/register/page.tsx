"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para a página de login unificada
    // Opcional: Você poderia passar um parâmetro ?tab=register para abrir na aba certa
    router.replace("/login");
  }, [router]);

  return null; // Não renderiza nada, apenas redireciona
}