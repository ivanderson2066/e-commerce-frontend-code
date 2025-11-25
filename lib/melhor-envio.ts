// CAMINHO DO ARQUIVO: lib/melhor-envio.ts

export interface ShippingItem {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
  quantity: number;
}

export interface CalculateShippingParams {
  to: string; // CEP destino
  items: ShippingItem[];
}

export interface MelhorEnvioOption {
  id: number;
  name: string;
  price: string;
  custom_price: string;
  discount: string;
  currency: string;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
  custom_delivery_time: number;
  custom_delivery_range: {
    min: number;
    max: number;
  };
  company: {
    id: number;
    name: string;
    picture: string;
  };
  error?: string;
}

// Pega a URL do .env.local ou usa sandbox como fallback
const ME_URL = process.env.MELHOR_ENVIO_URL || 'https://sandbox.melhorenvio.com.br';
const ME_TOKEN = process.env.MELHOR_ENVIO_API_TOKEN;
const FROM_CEP = process.env.MELHOR_ENVIO_FROM_POSTAL_CODE;
const USER_AGENT = process.env.MELHOR_ENVIO_EMAIL || 'suporte@loja.com';

export async function calculateMelhorEnvioShipping({ to, items }: CalculateShippingParams) {
  if (!ME_TOKEN || !FROM_CEP) {
    console.error("Melhor Envio: Token ou CEP de origem não configurados");
    throw new Error("Configuração do Melhor Envio incompleta (Token ou CEP de origem ausente)");
  }

  // Remove barra final se existir para evitar //api
  let baseUrl = ME_URL.endsWith('/') ? ME_URL.slice(0, -1) : ME_URL;
  
  // GARANTIA: Se a URL for a de produção, garante que é a correta.
  // A API de produção geralmente responde em https://melhorenvio.com.br
  // Mas vamos garantir que não há redirecionamentos estranhos.
  if (baseUrl.includes('melhorenvio.com.br') && !baseUrl.includes('sandbox')) {
      baseUrl = 'https://melhorenvio.com.br';
  }

  const endpoint = `${baseUrl}/api/v2/me/shipment/calculate`;
  
  // LOG DE DEBUG: Verificar ambiente
  console.log("🚀 Ambiente Melhor Envio:", baseUrl.includes('sandbox') ? 'SANDBOX' : 'PRODUÇÃO');
  console.log("📡 Endpoint:", endpoint);
  console.log("📍 De:", FROM_CEP, "Para:", to);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ME_TOKEN}`,
        'User-Agent': `Aplicação (${USER_AGENT})` // User-Agent é obrigatório na V2
      },
      body: JSON.stringify({
        from: {
          postal_code: FROM_CEP
        },
        to: {
          postal_code: to
        },
        products: items.map(item => ({
          id: item.id,
          width: item.width,
          height: item.height,
          length: item.length,
          weight: item.weight,
          insurance_value: item.insurance_value,
          quantity: item.quantity
        }))
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro API Melhor Envio (${response.status}):`, errorText);
      
      // Tratamento específico para erros comuns
      if (response.status === 401) {
        throw new Error("Token do Melhor Envio inválido ou expirado. Verifique o painel de integração.");
      }
      if (response.status === 405) {
        throw new Error(`Erro de Método (405). Verifique a URL: ${endpoint}`);
      }

      try {
          const errorJson = JSON.parse(errorText);
          // Tenta pegar mensagens de erro aninhadas que o ME costuma mandar
          const msg = errorJson.message || errorJson.error || (errorJson.errors ? JSON.stringify(errorJson.errors) : `Erro na API (${response.status})`);
          throw new Error(msg);
      } catch (e) {
          throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    // A API pode retornar um objeto único (erro) ou array (sucesso)
    const options = (Array.isArray(data) ? data : [data]).filter((opt: any) => !opt.error);

    return options.map((opt: MelhorEnvioOption) => ({
      id: `me-${opt.company.name}-${opt.name}`,
      name: `${opt.company.name} ${opt.name}`,
      price: parseFloat(opt.custom_price),
      daysToDeliver: opt.custom_delivery_time,
      estimatedDate: calculateEstimatedDate(opt.custom_delivery_time),
      companyPicture: opt.company.picture
    }));

  } catch (error) {
    console.error("Erro interno no serviço Melhor Envio:", error);
    throw error;
  }
}

function calculateEstimatedDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('pt-BR');
}