import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Cria uma resposta inicial que preserva os headers da requisição
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,

        set: (name: string, value: string, options?: any) => {
          // A modificação deve ocorrer na resposta, que será enviada ao navegador
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },

        remove: (name: string, options?: any) => {
          response.cookies.delete({
            name,
            ...options,
          });
        },
      },
    }
  );

  // Valida a sessão no servidor Supabase
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || "anon";
  const path = request.nextUrl.pathname;

  // --- ADMIN ---
  if (path.startsWith("/admin")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect_to", path);
      return NextResponse.redirect(url);
    }

    if (role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // --- ACCOUNT ---
  if (path.startsWith("/account")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect_to", path);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Otimização: Middleware roda apenas nas rotas protegidas para economizar recursos
  matcher: ["/admin/:path*", "/account/:path*"],
};