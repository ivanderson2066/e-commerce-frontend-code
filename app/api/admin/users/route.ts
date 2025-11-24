import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// Esta rota roda no servidor e usa a chave admin para listar usuários
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Lista usuários da autenticação (auth.users)
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error("Erro Supabase Auth:", error);
      throw error;
    }

    // Mapeia para retornar apenas dados seguros
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'Sem nome',
      role: user.user_metadata?.role || 'cliente',
      created_at: user.created_at,
      last_sign_in: user.last_sign_in_at
    }));

    return NextResponse.json(safeUsers);
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}