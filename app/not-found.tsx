import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <div className="text-center px-4 space-y-8">
        <div>
          <h1 className="text-6xl md:text-8xl font-black text-emerald-700">404</h1>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-4">
            Página Não Encontrada
          </p>
          <p className="text-gray-600 text-sm md:text-base mt-2 max-w-md mx-auto">
            Desculpe, a página que você está procurando não existe. Verifique o URL ou retorne à homepage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Button className="bg-emerald-700 hover:bg-emerald-800">
              <Home className="h-4 w-4 mr-2" />
              Ir para Home
            </Button>
          </Link>
          <Button variant="outline" asChild>
            <Link href="/category/cuidados-pele" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continuar Comprando
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
