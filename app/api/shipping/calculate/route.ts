// CAMINHO DO ARQUIVO: app/api/shipping/calculate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { calculateMelhorEnvioShipping } from '@/lib/melhor-envio';
import { products } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cep, items } = body;

    if (!cep || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'CEP e itens são obrigatórios' },
        { status: 400 }
      );
    }

    // Mapear produtos para incluir dimensões (simulando busca no DB)
    const itemsForCalculation = items.map((cartItem: any) => {
      const product = products.find(p => p.id === cartItem.id);
      
      // Fallback para evitar erro se produto não for encontrado
      return {
        id: cartItem.id,
        width: product?.width || 10,
        height: product?.height || 10,
        length: product?.length || 10,
        weight: product?.weight || 0.5,
        insurance_value: product?.price || cartItem.price,
        quantity: cartItem.quantity
      };
    });

    const shippingOptions = await calculateMelhorEnvioShipping({
      to: cep.replace(/\D/g, ''),
      items: itemsForCalculation
    });

    return NextResponse.json(shippingOptions);

  } catch (error: any) {
    console.error('❌ Erro Detalhado no Cálculo de Frete:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Falha ao calcular frete', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}