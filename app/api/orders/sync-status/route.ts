import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Cliente MP local para velocidade máxima
const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });
const paymentClient = new Payment(client);

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId } = await request.json();
    
    if (!orderId) {
        return NextResponse.json({ error: 'Falta Order ID' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // 1. Busca Pedido (Tenta por order_number OU id para ser robusto)
    // Usamos 'as any' para evitar erro de tipagem no .eq()
    let query = supabaseAdmin
      .from('orders')
      .select('id, status, payment_id, order_number') as any;
    
    // Verifica se parece um UUID ou um Order Number
    if (orderId.includes('ord_')) {
        query = query.eq('order_number', orderId);
    } else {
        query = query.eq('id', orderId); // Assume UUID se não tiver prefixo
    }

    // Finaliza a query
    const { data: order, error: findError } = await query.single();

    if (findError || !order) {
        console.error('[Sync] Pedido não encontrado:', orderId, findError);
        return NextResponse.json({ error: '404 - Pedido não encontrado' }, { status: 404 });
    }

    // Se já pagou, retorna rápido (traduzido para o frontend)
    if (order.status === 'paid' || order.status === 'approved' || order.status === 'Pago') {
       return NextResponse.json({ status: 'Pago', orderId }); // AQUI ESTÁ A TRADUÇÃO
    }

    // 2. Decide qual ID verificar (do banco ou do frontend)
    const targetPaymentId = paymentId || order.payment_id;

    if (targetPaymentId) {
        try {
            // Consulta Direta no MP (Muito mais rápido que webhook)
            const payment = await paymentClient.get({ id: targetPaymentId });
            
            const mpStatus = payment.status;
            let newStatus = order.status;

            console.log(`[Sync] Checando Pedido ${order.order_number}: MP diz '${mpStatus}'`);

            // Mapeia status do MP para o nosso sistema (Mantém 'paid' no banco para compatibilidade)
            if (mpStatus === 'approved') newStatus = 'paid'; 
            if (mpStatus === 'cancelled' || mpStatus === 'rejected') newStatus = 'cancelled';

            // 3. Atualiza se mudou
            if (newStatus !== order.status) {
                console.log(`[Sync] Atualizando status: ${order.status} -> ${newStatus}`);
                
                const { error: updateError } = await supabaseAdmin
                  .from('orders')
                  .update({ 
                      status: newStatus, 
                      payment_id: String(targetPaymentId),
                      updated_at: new Date().toISOString()
                  })
                  .eq('id', order.id);
                
                if (updateError) {
                    console.error('❌ [Sync] FALHA AO GRAVAR NO BANCO:', updateError);
                    // Retorna sucesso VISUAL para o cliente ver "Pago", mas avisa do erro no backend
                    // Traduz o status na resposta de erro também
                    return NextResponse.json({ 
                        status: newStatus === 'paid' ? 'Pago' : newStatus, 
                        updated: false, 
                        warning: 'Erro de permissão no banco' 
                    });
                }

                // SUCESSO: Retorna o status traduzido para o frontend
                // Se for 'paid', envia 'Pago'. Se for outro, envia original.
                return NextResponse.json({ 
                    status: newStatus === 'paid' ? 'Pago' : newStatus, 
                    updated: true 
                });
            }
        } catch (e) {
            console.error('[Sync] Falha ao consultar MP:', e);
        }
    } else {
        console.log('[Sync] Sem ID de pagamento para verificar.');
    }

    // Retorno padrão se nada mudou (traduzido)
    return NextResponse.json({ status: order.status === 'paid' ? 'Pago' : order.status });

  } catch (e: any) {
    console.error('[Sync] Erro interno:', e);
    return NextResponse.json({ error: 'Erro interno: ' + e.message }, { status: 500 });
  }
}