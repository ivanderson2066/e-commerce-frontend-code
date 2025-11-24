import { NextRequest, NextResponse } from 'next/server';
import { createPaymentPreference, createPixPayment } from '@/lib/mercado-pago-config';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      shippingPrice,
      customerEmail,
      customerName,
      orderId,
      shippingAddress,
      userId, 
      paymentMethod // 'pix' ou 'card'
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Você precisa estar logado para finalizar a compra.' },
        { status: 400 }
      );
    }

    // Calcular totais
    const subtotal = items.reduce((sum: number, item: any) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      return sum + price * qty;
    }, 0);

    const total = subtotal + Number(shippingPrice || 0);
    const orderNumber = orderId || `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Cria o pedido no Banco como 'pending'
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          order_number: orderNumber,
          user_id: userId,
          items: items,
          subtotal: subtotal,
          shipping_price: shippingPrice || 0,
          total: total,
          shipping_address: shippingAddress || {},
          payment_method: paymentMethod, 
        },
      ])
      .select()
      .limit(1);

    if (insertError) {
      console.error('Erro ao salvar pedido:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const orderRecord = Array.isArray(inserted) ? inserted[0] : inserted;
    let responseData;

    // 2. Decide qual API do Mercado Pago chamar
    if (paymentMethod === 'pix') {
        // --- FLUXO PIX (QR Code direto) ---
        const pixResponse = await createPixPayment(
            total,
            customerEmail,
            customerName,
            orderNumber
            // Se tiver CPF no shippingAddress, passar aqui: shippingAddress.cpf
        );

        // O ID da transação no MP
        const paymentId = String(pixResponse.id);
        
        // Dados para o frontend exibir o QR Code
        const qrCode = pixResponse.point_of_interaction?.transaction_data?.qr_code;
        const qrCodeBase64 = pixResponse.point_of_interaction?.transaction_data?.qr_code_base64;

        // Atualiza o pedido com o ID do pagamento
        await supabaseAdmin
          .from('orders')
          .update({ payment_id: paymentId })
          .eq('order_number', orderNumber);

        responseData = {
            type: 'pix',
            order: orderRecord,
            payload: {
                qr_code: qrCode,
                qr_code_base64: qrCodeBase64,
                payment_id: paymentId,
                ticket_url: pixResponse.point_of_interaction?.transaction_data?.ticket_url
            }
        };

    } else {
        // --- FLUXO CARTÃO (Checkout Pro Redirect) ---
        const preference = await createPaymentPreference(
            items,
            shippingPrice,
            customerEmail,
            customerName,
            orderNumber,
            shippingAddress
        );

        responseData = {
            type: 'preference',
            order: orderRecord,
            payload: preference // contem o 'init_point'
        };
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("Erro Fatal na Rota de Pagamento:", error);
    return NextResponse.json(
      { error: `Erro interno: ${error.message}` },
      { status: 500 }
    );
  }
}