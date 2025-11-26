// CAMINHO DO ARQUIVO: app/api/shipping/calculate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { calculateMelhorEnvioShipping } from '@/lib/melhor-envio';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cep, items } = body;

    // 1. Validação Básica
    if (!cep) {
      return NextResponse.json({ error: 'CEP obrigatório' }, { status: 400 });
    }
    if (!items || !items.length) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    }

    // 2. Buscar detalhes físicos dos produtos no Supabase
    // Usamos getSupabaseAdmin para garantir acesso (bypass RLS se necessário)
    const supabase = getSupabaseAdmin();
    const productIds = items.map((item: any) => item.id);
    
    // Busca apenas as colunas necessárias para o frete
    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('id, weight, width, height, length, price')
      .in('id', productIds);

    if (error) {
      console.error('Erro ao buscar produtos no DB:', error);
      throw new Error('Falha ao recuperar dados dos produtos.');
    }

    // 3. Montar lista para o Melhor Envio combinando Cart + DB
    const itemsForCalculation = items.map((cartItem: any) => {
      // Encontra o produto correspondente vindo do banco
      const product = dbProducts?.find((p) => p.id === cartItem.id);

      // Se o produto não tiver dimensões cadastradas no banco, usa um padrão seguro
      // (Isso evita que o cálculo falhe se esquecer de preencher um produto)
      return {
        id: cartItem.id,
        width: product?.width || 15,  // Padrão do seu schema
        height: product?.height || 5, // Padrão do seu schema
        length: product?.length || 20,// Padrão do seu schema
        weight: Number(product?.weight) || 0.3, // Garante número
        insurance_value: Number(product?.price || cartItem.price || 10),
        quantity: Number(cartItem.quantity)
      };
    });

    // 4. Calcular Frete Real via Melhor Envio
    const shippingOptions = await calculateMelhorEnvioShipping({
      to: cep.replace(/\D/g, ''), // Remove não-números
      items: itemsForCalculation
    });

    return NextResponse.json(shippingOptions);

  } catch (error: any) {
    console.error('❌ Erro no Cálculo de Frete:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao calcular frete', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}