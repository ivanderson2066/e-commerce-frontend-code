// ==============================================
//  lib/melhor-envio.ts
// ==============================================

const ME_URL = process.env.MELHOR_ENVIO_URL || "https://sandbox.melhorenvio.com";
const ME_TOKEN = process.env.MELHOR_ENVIO_TOKEN || "";
const FROM_CEP = process.env.MELHOR_ENVIO_CEP || "";

// Tipos usados pela função
export interface ShippingItem {
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
  quantity: number;
}

export interface CalculateShippingParams {
  to: string;
  items: ShippingItem[];
}

export interface MelhorEnvioOption {
  id: string;
  company: {
    name: string;
    picture: string;
  };
  name: string;
  custom_price: string;
  price: string;
  custom_delivery_time: number;
}

function calculateEstimatedDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("pt-BR");
}

// ==============================================
// Função principal
// ==============================================
export async function calculateMelhorEnvioShipping({
  to,
  items,
}: CalculateShippingParams) {
  if (!ME_TOKEN || !FROM_CEP) {
    console.error("❌ Melhor Envio: Token ou CEP de origem não configurados");
    return [];
  }

  try {
    // Monta parâmetros para querystring
    const params = new URLSearchParams({
      from: FROM_CEP,
      to,
    });

    items.forEach((item, index) => {
      params.append(`products[${index}][width]`, String(item.width));
      params.append(`products[${index}][height]`, String(item.height));
      params.append(`products[${index}][length]`, String(item.length));
      params.append(`products[${index}][weight]`, String(item.weight));
      params.append(
        `products[${index}][insurance_value]`,
        String(item.insurance_value)
      );
      params.append(`products[${index}][quantity]`, String(item.quantity));
    });

    const url = `${ME_URL}/api/v2/me/shipment/calculate?${params.toString()}`;

    // Log da URL para debug
    console.log("📦 Melhor Envio - GET:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${ME_TOKEN}`,
        "User-Agent": `Caiçara (${process.env.MELHOR_ENVIO_EMAIL})`,
      },
    });

    const status = response.status;
    const contentType = response.headers.get("content-type") || "";
    console.log(`🚚 Melhor Envio - Status: ${status}, Content-Type: ${contentType}`);

    // Lemos o raw text SEM PARSE para inspeção
    const text = await response.text();

    // Se status não OK, mostrar corpo para entender o erro
    if (!response.ok) {
      console.error("❌ Melhor Envio respondeu erro HTTP:", status);
      console.error("📝 Body (raw):", text.slice(0, 4000));
      throw new Error(`HTTP ${status}`);
    }

    // Se não for JSON, não tente parsear
    if (!/application\/json/.test(contentType)) {
      console.error("❌ Melhor Envio retornou conteúdo NÃO JSON");
      console.error("📝 Body (raw):", text.slice(0, 4000));
      throw new Error("Conteúdo não JSON — consulte os logs");
    }

    // Agora sim tenta converter para JSON
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Falha ao fazer JSON.parse()");
      console.error("📝 Body (raw):", text.slice(0, 4000));
      throw err;
    }

    // Normaliza resposta
    const options = (Array.isArray(data) ? data : [data]).filter(
      (opt: any) => !opt.error
    );

    return options.map((opt: MelhorEnvioOption) => ({
      id: `me-${opt.company.name}-${opt.name}`,
      name: `${opt.company.name} ${opt.name}`,
      price: parseFloat(opt.custom_price || opt.price),
      daysToDeliver: opt.custom_delivery_time,
      estimatedDate: calculateEstimatedDate(opt.custom_delivery_time),
      companyPicture: opt.company.picture,
    }));
  } catch (error: any) {
    console.error(
      "❌ Erro Melhor Envio (detalhado):",
      error && error.message ? error.message : error
    );
    return [];
  }
}
