"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Home } from 'lucide-react';
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[v0] Error caught:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="text-center px-4 space-y-8">
        <div>
          <h1 className="text-6xl md:text-8xl font-black text-red-600">Erro!</h1>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-4">
            Algo deu errado
          </p>
          <p className="text-gray-600 text-sm md:text-base mt-2 max-w-md mx-auto">
            Ocorreu um erro inesperado. Tente recarregar a página ou entre em contato com suporte.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={reset}
            className="bg-red-600 hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Ir para Home
            </Link>
          </Button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 rounded text-left">
            <p className="font-mono text-xs text-red-600 mb-2">Erro (desenvolvimento):</p>
            <pre className="text-xs overflow-auto">{error.message}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
