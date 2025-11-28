import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { createPixPayment } from '@/lib/mercado-pago-config';
import { getSupabaseAdmin } from '@/lib/supabase-server';

// Inicializa cliente
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' 
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items, shippingPrice, customerEmail, customerName,
      orderId, shippingAddress, userId, paymentMethod, cpf
    } = body;

    if (!userId) return NextResponse.json({ error: 'Login necessário.' }, { status: 400 });

    // 1. TRATAMENTO RIGOROSO DE DADOS (Para não bloquear o PIX)
    // CPF deve ser apenas números
    const cleanCpf = (cpf || shippingAddress?.cpf || '').replace(/\D/g, '');
    
    // Nome e Sobrenome separados (Obrigatório para MP)
    const nameParts = (customerName || 'Cliente').trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'sobrenome';

    // Totais
    const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.price)*Number(item.quantity)), 0);
    const total = subtotal + Number(shippingPrice || 0);
    const orderNumber = orderId || `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    const supabaseAdmin = getSupabaseAdmin();

    // 2. Salvar Pedido 'Pending'
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('orders')
      .insert([{
          order_number: orderNumber,
          user_id: userId,
          items: items,
          subtotal: subtotal,
          shipping_price: shippingPrice || 0,
          total: total,
          shipping_address: shippingAddress || {},
          payment_method: paymentMethod, 
          status: 'pending'
      }])
      .select()
      .single();

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    let responseData;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

    if (paymentMethod === 'pix') {
        // --- PIX TRANSPARENTE ---
        const pixResponse = await createPixPayment(
            total, customerEmail, customerName, orderNumber, cleanCpf
        );
        const paymentId = String(pixResponse.id);
        
        await supabaseAdmin.from('orders').update({ payment_id: paymentId }).eq('id', inserted.id);

        responseData = {
            type: 'pix',
            order: inserted,
            payload: {
                qr_code: pixResponse.point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: pixResponse.point_of_interaction?.transaction_data?.qr_code_base64,
                payment_id: paymentId
            }
        };
    } else {
        // --- CHECKOUT PRO (Onde estava o bloqueio) ---
        const preference = new Preference(client);
        
        // Configuração explícita para evitar bloqueios
        const prefResponse = await preference.create({
          body: {
            items: items.map((item: any) => ({
              id: item.id,
              title: item.title,
              quantity: Number(item.quantity),
              unit_price: Number(item.price),
              currency_id: 'BRL',
              picture_url: item.image
            })),
            payer: {
              name: firstName,   // Nome separado
              surname: lastName, // Sobrenome separado
              email: customerEmail,
              identification: { 
                  type: "CPF", 
                  number: cleanCpf // CPF limpo
              }
            },
            // Referência Externa é VITAL para o Webhook achar o pedido depois
            external_reference: orderNumber,
            
            back_urls: {
              success: `${baseUrl}/checkout/success`, // Aqui o polling vai funcionar se ele voltar
              pending: `${baseUrl}/checkout/success`,
              failure: `${baseUrl}/checkout/success`
            },
            auto_return: "approved",
            notification_url: `${baseUrl}/api/mercado-pago/webhook`, // Webhook configurado
            statement_descriptor: "LOJA VIRTUAL",
            payment_methods: {
              installments: 12,
              default_payment_method_id: undefined, // CORREÇÃO AQUI: usar undefined em vez de null
              excluded_payment_types: [{ id: "ticket" }] // Remove boleto se quiser focar em pix/cartão
            }
          }
        });

        responseData = {
            type: 'preference',
            order: inserted,
            payload: { id: prefResponse.id, init_point: prefResponse.init_point }
        };
    }

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error("Erro Create Preference:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}