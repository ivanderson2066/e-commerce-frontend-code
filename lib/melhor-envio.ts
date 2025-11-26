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

export async function calculateMelhorEnvioShipping({ to, items }: CalculateShippingParams) {
  // Usa as variáveis de ambiente. Se não existirem, lança erro.
  const ME_URL = process.env.MELHOR_ENVIO_URL;
  const ME_TOKEN = process.env.MELHOR_ENVIO_API_TOKEN;
  const FROM_CEP = process.env.MELHOR_ENVIO_FROM_POSTAL_CODE;
  const USER_EMAIL = process.env.MELHOR_ENVIO_EMAIL || 'suporte@loja.com';

  // Validação estrita das variáveis
  if (!ME_TOKEN || !FROM_CEP || !ME_URL) {
    console.error("ERRO DE CONFIGURAÇÃO: Variáveis de ambiente do Melhor Envio ausentes.");
    throw new Error("Configuração do Melhor Envio incompleta no servidor (verifique as Environment Variables na Vercel)");
  }

  // Tratamento da URL para garantir formato correto
  let baseUrl = ME_URL.replace(/\/$/, ''); // Remove barra final se houver
  if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
  }
  
  const endpoint = `${baseUrl}/api/v2/me/shipment/calculate`;

  console.log(`📡 [Melhor Envio] Request para: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ME_TOKEN}`,
        'User-Agent': `Aplicação (${USER_EMAIL})`
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
          // Garante que as dimensões sejam números válidos (inteiros > 0)
          width: Math.max(1, Math.round(item.width)),   
          height: Math.max(1, Math.round(item.height)),
          length: Math.max(1, Math.round(item.length)),
          weight: item.weight,
          insurance_value: item.insurance_value,
          quantity: item.quantity
        }))
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      try {
        const errorJson = JSON.parse(errorText);
        const msg = errorJson.message || errorJson.error || `Erro na API: ${response.status}`;
        throw new Error(msg);
      } catch (e) {
        console.error(`❌ [Melhor Envio] Erro bruto (${response.status}):`, errorText);
        throw new Error(`Erro na API do Melhor Envio (${response.status}): ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    const options = (Array.isArray(data) ? data : [data]).filter((opt: any) => !opt.error);

    return options.map((opt: MelhorEnvioOption) => ({
      id: `me-${opt.company.name}-${opt.name}`,
      name: `${opt.company.name} ${opt.name}`,
      price: parseFloat(opt.custom_price),
      daysToDeliver: opt.custom_delivery_time,
      estimatedDate: calculateEstimatedDate(opt.custom_delivery_time),
      companyPicture: opt.company.picture
    }));

  } catch (error: any) {
    console.error("🚨 [Melhor Envio] Exception:", error.message);
    throw error;
  }
}

function calculateEstimatedDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('pt-BR');
}