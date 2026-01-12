'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
  Tags,
  Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentUser = user as any;

  useEffect(() => {
    if (
      !isLoading &&
      (!user || (currentUser?.role !== 'admin' && currentUser?.user_metadata?.role !== 'admin'))
    ) {
      // Lógica de proteção
    }
  }, [user, isLoading, currentUser]);

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Produtos', icon: Package },
    { href: '/admin/promotions', label: 'Promoções', icon: Zap },
    { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
    { href: '/admin/categories', label: 'Categorias', icon: Tags },
    { href: '/admin/users', label: 'Usuários', icon: Users },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-[#FCFCFC] font-sans text-[#333333]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[#EAEAEA] bg-white p-6 justify-between fixed h-full z-20 shadow-[2px_0_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-10">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="bg-[#4A6B53]/10 p-2 rounded-full">
              <Leaf className="text-[#4A6B53] w-6 h-6 fill-current" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[#1A1A1A] text-lg font-bold font-serif leading-none">
                Caiçara Mix
              </h1>
              <p className="text-[#4A6B53] text-xs font-medium leading-normal mt-0.5">
                Painel Admin
              </p>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-[#4A6B53] text-white shadow-md shadow-[#4A6B53]/20 font-medium'
                    : 'text-[#555555] hover:bg-[#F5F7F5] hover:text-[#4A6B53]'
                }`}
              >
                <item.icon
                  className={`h-5 w-5 ${isActive(item.href) ? 'text-white' : 'text-current'}`}
                  strokeWidth={2}
                />
                <p className="text-sm">{item.label}</p>
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="flex flex-col gap-1 pt-6 border-t border-gray-100 mt-auto">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#555555] hover:bg-[#F5F7F5] hover:text-[#4A6B53] transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Configurações</span>
          </Link>

          <button
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#555555] hover:bg-[#FEF2F2] hover:text-red-600 transition-colors text-left w-full group mt-1"
            onClick={() => {
              logout();
              router.push('/');
            }}
          >
            <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white/90 backdrop-blur-md border-b z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="text-[#4A6B53] w-6 h-6" />
          <div className="font-serif font-bold text-[#4A6B53]">Caiçara Mix</div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-white pt-20 px-6 lg:hidden">
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive(item.href) ? 'bg-[#4A6B53] text-white' : 'bg-gray-50 text-[#333333]'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-gray-100 my-2" />
            <button
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 bg-red-50 w-full text-left"
              onClick={() => {
                logout();
                router.push('/');
              }}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* Main Content Area - SEM HEADER GLOBAL */}
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0 bg-[#FCFCFC]">
        <div className="p-4 lg:p-10 mt-14 lg:mt-0 overflow-auto min-h-[calc(100vh-80px)]">
          {children}
        </div>
      </main>
    </div>
  );
}
