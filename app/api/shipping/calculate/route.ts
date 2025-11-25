// CAMINHO DO ARQUIVO: app/api/shipping/calculate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { calculateMelhorEnvioShipping } from '@/lib/melhor-envio';
import { products } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cep, items } = body;

    // 1. Validação Básica
    if (!cep) {
      return NextResponse.json(
        { error: 'CEP de destino é obrigatório' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'A lista de itens é obrigatória' },
        { status: 400 }
      );
    }

    // 2. Preparação dos Dados (Hidratação)
    const itemsForCalculation = items.map((cartItem: any) => {
      const product = products.find(p => p.id === cartItem.id);
      
      if (!product) {
        console.warn(`Produto ID ${cartItem.id} não encontrado na base de dados mock.`);
      }

      // Fallback: Se o produto não for encontrado ou não tiver dados de envio, usa valores padrão seguros
      return {
        id: cartItem.id,
        width: product?.width || 10,
        height: product?.height || 10,
        length: product?.length || 10,
        weight: product?.weight || 0.5, // 500g
        insurance_value: product?.price || cartItem.price || 50, // Seguro mínimo
        quantity: cartItem.quantity
      };
    });

    // 3. Chamada ao Serviço Externo
    const shippingOptions = await calculateMelhorEnvioShipping({
      to: cep.replace(/\D/g, ''), // Garante apenas números
      items: itemsForCalculation
    });

    return NextResponse.json(shippingOptions);

  } catch (error: any) {
    // Log detalhado no terminal do servidor para debug
    console.error('❌ [API ROUTE] Erro no Cálculo de Frete:', error);

    // Retorna o erro detalhado para o frontend (ajuda a entender se é token, cep, etc)
    return NextResponse.json(
      { 
        error: 'Falha ao calcular frete', 
        details: error.message || 'Erro desconhecido no servidor',
        // Se for um erro vindo do fetch do Melhor Envio que foi relançado
        originalError: error.cause ? JSON.stringify(error.cause) : undefined
      },
      { status: 500 }
    );
  }
}