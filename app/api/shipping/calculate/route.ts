import { NextRequest, NextResponse } from 'next/server';
import { calculateMelhorEnvioShipping } from '@/lib/melhor-envio';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cep, items } = body;

    if (!cep) return NextResponse.json({ error: 'CEP obrigatório' }, { status: 400 });
    if (!items || !items.length) return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });

    // 1. Buscar detalhes físicos dos produtos no Supabase
    const supabase = getSupabaseAdmin();
    const productIds = items.map((item: any) => item.id);
    
    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('id, weight, width, height, length, price')
      .in('id', productIds);

    if (error) console.error('Erro DB Frete:', error);

    // 2. Montar lista para o Melhor Envio
    const itemsForCalculation = items.map((cartItem: any) => {
      const product = dbProducts?.find((p) => p.id === cartItem.id);
      return {
        id: cartItem.id,
        width: product?.width || 15,
        height: product?.height || 5,
        length: product?.length || 20,
        weight: Number(product?.weight) || 0.3,
        insurance_value: Number(product?.price || cartItem.price || 10),
        quantity: Number(cartItem.quantity)
      };
    });

    // 3. Calcular Frete Real via Melhor Envio
    let shippingOptions: any[] = [];
    try {
        shippingOptions = await calculateMelhorEnvioShipping({
            to: cep.replace(/\D/g, ''),
            items: itemsForCalculation
        });
    } catch (meError) {
        console.error("Erro Melhor Envio:", meError);
        // Não falha tudo se o ME cair, apenas retorna vazio para adicionar o fallback
    }

    // 4. ADICIONAR OPÇÃO DE "RETIRADA / TESTE" (Custo Zero)
    // Isso permite que você teste pagamentos sem pagar frete
    const pickupOption = {
        id: 'local-pickup',
        name: 'Retirada na Loja / Teste',
        price: 0, // GRÁTIS
        daysToDeliver: 0,
        company: { 
            name: 'Loja Física', 
            picture: 'https://cdn-icons-png.flaticon.com/512/75/75836.png' // Ícone genérico opcional
        }
    };

    // Retorna as opções do Melhor Envio + a opção Grátis no início
    return NextResponse.json([pickupOption, ...shippingOptions]);

  } catch (error: any) {
    console.error('❌ Erro Geral Frete:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular frete', details: error.message },
      { status: 500 }
    );
  }
}