import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { getPaymentStatus } from '@/lib/mercado-pago-config';

// Esta rota implementa a lógica da imagem IMG-20251118-WA0086.jpg
// Ela força uma verificação no Mercado Pago se o pedido local ainda estiver pendente.
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID é obrigatório' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Buscar o pedido no banco de dados
    // Equivalente a: const reg = await Registration.findByPk(id);
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('order_number', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Lógica da imagem: if (reg.paymentStatus !== 'paid' && reg.mpPaymentId)
    // Aqui usamos 'pending' ou diferente de 'paid'
    if (order.status !== 'paid' && order.payment_id) {
      console.log(`[Sync] Pedido ${orderId} está pendente localmente. Verificando no Mercado Pago...`);
      
      try {
        // 2. Consultar status real no Mercado Pago
        // Equivalente a: const payment = await getPaymentById(reg.mpPaymentId);
        const paymentMP = await getPaymentStatus(order.payment_id);

        if (paymentMP) {
            console.log(`[Sync] Status no Mercado Pago: ${paymentMP.status}`);

            // Equivalente a: if (payment?.status === 'approved')
            if (paymentMP.status === 'approved') {
                // 3. Atualizar banco se estiver aprovado
                // Equivalente a: reg.paymentStatus = 'paid'; await reg.save();
                const { error: updateError } = await supabaseAdmin
                .from('orders')
                .update({ 
                    status: 'paid',
                    updated_at: new Date().toISOString()
                })
                .eq('id', order.id);

                if (!updateError) {
                    order.status = 'paid'; // Atualiza objeto local para retorno
                    console.log(`[Sync] Pedido ${orderId} atualizado para PAGO com sucesso.`);
                }
            } else if (paymentMP.status === 'cancelled' || paymentMP.status === 'rejected') {
                // Opcional: Atualizar se foi cancelado
                await supabaseAdmin
                .from('orders')
                .update({ status: 'cancelled' })
                .eq('id', order.id);
                order.status = 'cancelled';
            }
        }
      } catch (err) {
        console.error('[Sync] Erro ao consultar MP:', err);
        // Não falhamos a requisição, apenas retornamos o status atual do banco
      }
    }

    // Retorna o status (atualizado ou não)
    return NextResponse.json({ 
      orderId: order.order_number, 
      status: order.status,
      paymentId: order.payment_id
    });

  } catch (error: any) {
    console.error('[Sync] Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}