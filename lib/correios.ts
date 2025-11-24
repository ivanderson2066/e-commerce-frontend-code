// lib/correios.ts

const SERVICES = {
  SEDEX: '04014',
  PAC: '04510'
};

const CEP_ORIGEM = "01001000"; // Mude para o seu CEP de origem real

export interface ShippingQuote {
  id: number;
  name: string;
  price: number;
  daysToDeliver: number;
  company: {
    name: string;
    picture: string;
  };
}

interface CartItem {
    weight?: number;
    quantity: number;
    width?: number;
    height?: number;
    length?: number;
    [key: string]: any;
}

export async function calculateCorreiosShipping(
  cepDestino: string,
  items: CartItem[]
): Promise<ShippingQuote[]> {
  
  const cleanCepDestino = cepDestino.replace(/\D/g, '');
  const cleanCepOrigem = CEP_ORIGEM.replace(/\D/g, '');

  // Validação de CEP
  if (cleanCepDestino.length !== 8) {
      console.warn("CEP de destino inválido:", cleanCepDestino);
      return [];
  }

  // Cálculo de peso (mínimo 0.3kg)
  const totalWeight = Math.max(
    0.3,
    items.reduce((acc, item) => acc + (Number(item.weight) || 0.5) * Number(item.quantity), 0)
  );
  
  // Dimensões mínimas
  const totalHeight = Math.max(2, items.reduce((acc, item) => acc + (Number(item.height) || 5) * Number(item.quantity), 0));
  const maxWidth = Math.max(11, ...items.map(i => Number(i.width) || 15));
  const maxLength = Math.max(16, ...items.map(i => Number(i.length) || 20));

  const params = new URLSearchParams({
    nCdEmpresa: '', 
    sDsSenha: '',   
    nCdServico: `${SERVICES.SEDEX},${SERVICES.PAC}`,
    sCepOrigem: cleanCepOrigem,
    sCepDestino: cleanCepDestino,
    nVlPeso: totalWeight.toString(),
    nCdFormato: '1', 
    nVlComprimento: maxLength.toString(),
    nVlAltura: totalHeight.toString(),
    nVlLargura: maxWidth.toString(),
    nVlDiametro: '0',
    sCdMaoPropria: 'N',
    nVlValorDeclarado: '0', 
    sCdAvisoRecebimento: 'N',
    StrRetorno: 'xml'
  });

  try {
    const url = `http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${params.toString()}`;
    console.log("Consultando URL Correios:", url);

    // Timeout de 5 segundos para não travar o checkout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Erro HTTP Correios: ${response.status}`);
    }

    const xmlText = await response.text();
    // console.log("Resposta XML Correios:", xmlText.substring(0, 200) + "..."); // Debug se precisar

    const quotes: ShippingQuote[] = [];

    const sedex = extractServiceData(xmlText, SERVICES.SEDEX);
    if (sedex && !sedex.error) {
      quotes.push({
        id: 1,
        name: "SEDEX",
        price: sedex.price,
        daysToDeliver: sedex.days,
        company: { name: "Correios", picture: "" }
      });
    }

    const pac = extractServiceData(xmlText, SERVICES.PAC);
    if (pac && !pac.error) {
      quotes.push({
        id: 2,
        name: "PAC",
        price: pac.price,
        daysToDeliver: pac.days,
        company: { name: "Correios", picture: "" }
      });
    }

    return quotes;

  } catch (error: any) {
    console.error("Erro ao calcular frete (lib/correios):", error.message);
    // Retorna array vazio para que o route.ts use o fallback
    return [];
  }
}

function extractServiceData(xml: string, code: string) {
  const regexBlock = new RegExp(`<cServico>.*?<Codigo>${code}</Codigo>.*?</cServico>`, 's');
  const match = xml.match(regexBlock);
  
  if (!match) return null;
  
  const block = match[0];

  const valor = block.match(/<Valor>(.*?)<\/Valor>/)?.[1]?.replace(',', '.');
  const prazo = block.match(/<PrazoEntrega>(.*?)<\/PrazoEntrega>/)?.[1];
  const erro = block.match(/<Erro>(.*?)<\/Erro>/)?.[1];
  
  // Se erro for diferente de 0, 010, 011, consideramos falha
  if (erro && erro !== '0' && erro !== '010' && erro !== '011') {
      return { error: true, price: 0, days: 0 };
  }

  return {
      price: Number(valor) || 0,
      days: Number(prazo) || 0,
      error: false
  };
}