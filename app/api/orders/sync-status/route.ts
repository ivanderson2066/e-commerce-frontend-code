import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Cliente MP local para velocidade máxima
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });
const paymentClient = new Payment(client);

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId } = await request.json();
    if (!orderId) return NextResponse.json({ error: 'Falta Order ID' }, { status: 400 });

    const supabaseAdmin = getSupabaseAdmin();
    
    // 1. Busca Pedido
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, status, payment_id, order_number')
      .eq('order_number', orderId)
      .single();

    if (!order) return NextResponse.json({ error: '404' }, { status: 404 });

    // Se já pagou, retorna rápido
    if (order.status === 'paid' || order.status === 'approved') {
       return NextResponse.json({ status: 'paid', orderId });
    }

    // 2. Decide qual ID verificar (do banco ou do frontend)
    const targetPaymentId = order.payment_id || paymentId;

    if (targetPaymentId) {
        try {
            // Consulta Direta no MP (Muito mais rápido que webhook)
            const payment = await paymentClient.get({ id: targetPaymentId });
            
            const mpStatus = payment.status;
            let newStatus = order.status;

            if (mpStatus === 'approved') newStatus = 'paid';
            if (mpStatus === 'cancelled' || mpStatus === 'rejected') newStatus = 'cancelled';

            // 3. Atualiza se mudou
            if (newStatus !== order.status) {
                await supabaseAdmin
                  .from('orders')
                  .update({ 
                      status: newStatus, 
                      payment_id: String(targetPaymentId),
                      updated_at: new Date().toISOString()
                  })
                  .eq('id', order.id);
                
                return NextResponse.json({ status: newStatus, updated: true });
            }
        } catch (e) {
            console.error('[Sync] Falha MP:', e);
        }
    }

    return NextResponse.json({ status: order.status });
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}