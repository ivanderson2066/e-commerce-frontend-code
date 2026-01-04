import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { ShippingProvider } from "@/lib/shipping-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    template: '%s | Caiçara Mix',
    default: 'Caiçara Mix | Cosméticos Naturais & Sustentáveis',
  },
  description: "Beleza que floresce da natureza. Produtos 100% naturais, veganos e sustentáveis feitos com ingredientes da flora brasileira.",
  // --- CONFIGURAÇÃO DO FAVICON (Logo na aba) ---
  icons: {
    // Usando sua logo 'nova-logo.png' como ícone principal
    icon: [
      { url: '/nova-logo.png', type: 'image/png' }
    ],
    // Atalho também aponta para sua logo
    shortcut: '/nova-logo.png',
    // Ícone Apple (mantive o apple-icon.png se você não tiver gerado um específico para Apple, caso contrário troque também)
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  // ---------------------------------------------
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased flex flex-col min-h-screen w-full bg-white overflow-x-hidden overscroll-none">
        <AuthProvider>
          <CartProvider>
            <ShippingProvider>
              <FavoritesProvider>
                <Navbar />

                <main className="flex-grow w-full relative flex flex-col">
                  {children}
                </main>

                <Footer />
                <Toaster />
              </FavoritesProvider>
            </ShippingProvider>
          </CartProvider>
        </AuthProvider>
        {/* Script movido para o final para evitar erros de carregamento */}
        <Script src="https://sdk.mercadopago.com/js/v2" strategy="lazyOnload" />
      </body>
    </html>
  );
}
