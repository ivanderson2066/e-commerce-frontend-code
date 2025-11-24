import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getPaymentStatus, getMerchantOrder } from '@/lib/mercado-pago-config';

export async function GET(request: NextRequest) {
  try {
    const orderQuery = request.nextUrl.searchParams.get('order') || request.nextUrl.searchParams.get('orderId');

    if (!orderQuery) {
      return NextResponse.json({ error: 'Parâmetro order é obrigatório' }, { status: 400 });
    }

    // Buscar ordem no Supabase
    const supabaseAdmin = getSupabaseAdmin();
    const { data: orders, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', orderQuery)
      .limit(1);

    if (orderError) {
      console.error('[v0] Erro ao buscar ordem no Supabase:', orderError);
      return NextResponse.json({ error: 'Erro ao buscar ordem' }, { status: 500 });
    }

    const order = Array.isArray(orders) ? orders[0] : orders;

    // Se tivermos payment_id, consultar Mercado Pago para obter status atual
    let paymentInfo = null;
    if (order?.payment_id) {
      try {
        paymentInfo = await getPaymentStatus(String(order.payment_id));
      } catch (err) {
        console.warn('[v0] Não foi possível obter payment status:', err);
      }
    }

    return NextResponse.json({ order, paymentInfo });
  } catch (error) {
    console.error('[v0] Erro ao buscar status:', error);
    return NextResponse.json({ error: 'Erro ao buscar status do pedido' }, { status: 500 });
  }
}