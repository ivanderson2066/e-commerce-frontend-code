import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { ShippingProvider } from "@/lib/shipping-context";
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
  title: "Caiçara Mix | Cosméticos Naturais",
  description: "Beleza que floresce da natureza. Produtos 100% naturais e sustentáveis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased flex flex-col min-h-screen w-full bg-[#F7FAF7] overflow-x-hidden overscroll-none">
        <Script src="https://sdk.mercadopago.com/js/v2" strategy="lazyOnload" />

        <AuthProvider>
          <CartProvider>
            <ShippingProvider>
              <Navbar />

              <main className="flex-grow w-full relative flex flex-col">
                {children}
              </main>

              <Footer />
              <Toaster />
            </ShippingProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
