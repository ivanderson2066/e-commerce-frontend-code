"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  LogOut 
} from "lucide-react";
import { useEffect } from "react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">Carregando...</div>;
  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  // Itens do Menu
  const menuItems = [
    { href: "/account", label: "Meu Perfil", icon: User },
    { href: "/account/orders", label: "Meus Pedidos", icon: Package },
    { href: "/account/favorites", label: "Favoritos", icon: Heart },
    { href: "/account/addresses", label: "Endereços", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans text-[#333333]">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* BARRA LATERAL (SIDEBAR) */}
          <aside className="w-full md:w-1/4 flex-shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#EAEAEA] sticky top-24">
              <nav className="flex flex-col space-y-1">
                {menuItems.map((item) => (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                      isActive(item.href) 
                        ? "bg-[#E8F5E9] text-[#2F4F4F] font-semibold" 
                        : "text-gray-700 font-medium hover:bg-[#E8F5E9] hover:text-[#2F4F4F]"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                <button 
                  onClick={() => { logout(); router.push("/"); }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors duration-300 text-left mt-4 border-t border-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sair</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* ÁREA DE CONTEÚDO (Onde aparecem Perfil, Pedidos, etc.) */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}