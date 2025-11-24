import { NextRequest, NextResponse } from 'next/server';
import { calculateCorreiosShipping } from '@/lib/correios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cep, items } = body;

    // Validação básica
    if (!cep || !items || items.length === 0) {
      return NextResponse.json({ error: "CEP e itens são obrigatórios" }, { status: 400 });
    }

    console.log(`[Shipping API] Calculando frete para CEP: ${cep}`);

    // Chama a função dos Correios
    const options = await calculateCorreiosShipping(cep, items);

    // Se não retornou opções (array vazio), pode ser CEP inválido ou erro na API
    if (!options || options.length === 0) {
         console.warn("[Shipping API] Nenhuma opção de frete encontrada. Usando fallback.");
         // Retorna um fallback simples se a API falhar, para não travar o usuário
         return NextResponse.json([
            {
                id: 1,
                name: "PAC (Estimado)",
                price: 25.00,
                daysToDeliver: 7,
                company: { name: "Correios", picture: "" }
            },
            {
                id: 2,
                name: "SEDEX (Estimado)",
                price: 45.00,
                daysToDeliver: 3,
                company: { name: "Correios", picture: "" }
            }
         ]);
    }

    return NextResponse.json(options);

  } catch (error: any) {
    console.error("Erro crítico na rota de shipping:", error);
    return NextResponse.json(
        { error: error.message || "Erro interno ao calcular frete" }, 
        { status: 500 }
    );
  }
}