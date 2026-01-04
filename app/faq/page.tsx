'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Produtos' | 'Pedidos' | 'Envio' | 'Conta' | 'Devoluções';
}

const faqs: FAQItem[] = [
  // Produtos
  {
    id: '1',
    category: 'Produtos',
    question: 'Todos os produtos da Caiçara Mix são 100% naturais?',
    answer:
      'Sim! Todos os nossos produtos são formulados com ingredientes naturais de origem sustentável. Não usamos parabenos, sulfatos ou componentes químicos agressivos. Cada fórmula é desenvolvida por especialistas em cosmetologia natural.',
  },
  {
    id: '2',
    category: 'Produtos',
    question: 'Os produtos são testados em animais?',
    answer:
      'Não! A Caiçara Mix é uma marca 100% cruelty-free. Nenhum de nossos produtos ou ingredientes é testado em animais. Nossos testes de qualidade e segurança são realizados através de métodos alternativos e in vitro.',
  },
  {
    id: '3',
    category: 'Produtos',
    question: 'Posso usar os produtos se tenho alergia de pele?',
    answer:
      'Apesar dos produtos serem naturais, algumas pessoas podem ter sensibilidade a certos ingredientes. Recomendamos fazer um teste de alergia antes de usar o produto completo. Consulte a lista de ingredientes ou entre em contato conosco para recomendações específicas.',
  },
  {
    id: '4',
    category: 'Produtos',
    question: 'Qual é a validade dos produtos?',
    answer:
      'Todos os produtos possuem validade de 24 a 36 meses a partir da data de fabricação, dependendo do tipo. A data está impressa na embalagem. Armazene em local fresco e seco, longe da luz solar direta.',
  },
  {
    id: '5',
    category: 'Produtos',
    question: 'Os produtos contêm fragrância artificial?',
    answer:
      'Não. Usamos apenas óleos essenciais naturais e extratos botanicamente puros para aromatizar nossos produtos. A fragrância é uma característica natural dos ingredientes.',
  },

  // Pedidos
  {
    id: '6',
    category: 'Pedidos',
    question: 'Como faço para fazer um pedido?',
    answer:
      'É simples! Navegue pelo nosso catálogo, adicione os produtos desejados ao carrinho e siga para o checkout. Você pode pagar com cartão de crédito, débito ou PIX. Após a confirmação, receberá um email com os detalhes do seu pedido.',
  },
  {
    id: '7',
    category: 'Pedidos',
    question: 'Posso comprar sem criar uma conta?',
    answer:
      'Sim! Você pode fazer uma compra sem criar conta, mas recomendamos criar uma para acompanhar seus pedidos, acessar histórico de compras e receber ofertas exclusivas.',
  },
  {
    id: '8',
    category: 'Pedidos',
    question: 'Qual é o valor mínimo de compra?',
    answer:
      'Não há valor mínimo de compra. Você pode comprar um único produto se desejar. Aproveitamos para oferecer frete grátis em compras acima de R$ 100 e 5% de desconto em compras acima de R$ 200.',
  },
  {
    id: '9',
    category: 'Pedidos',
    question: 'Como faço para usar um cupom de desconto?',
    answer:
      'Ao ir para o checkout, você encontrará um campo para inserir o código do cupom. Digite o código e clique em aplicar. O desconto será refletido automaticamente no total da sua compra.',
  },

  // Envio
  {
    id: '10',
    category: 'Envio',
    question: 'Qual é o prazo de entrega?',
    answer:
      'Os prazos de entrega variam conforme a sua localização: São Paulo e região metropolitana: 1-2 dias úteis. Demais regiões do Brasil: 3-7 dias úteis. O prazo começa a ser contado após a confirmação do pagamento.',
  },
  {
    id: '11',
    category: 'Envio',
    question: 'O frete é cobrado?',
    answer:
      'O frete é cobrado conforme o peso e destino. No entanto, oferecemos frete grátis para compras acima de R$ 100. Você visualizará o valor do frete antes de confirmar a compra.',
  },
  {
    id: '12',
    category: 'Envio',
    question: 'Como rastrear meu pedido?',
    answer:
      'Após o envio, você receberá um email com o código de rastreamento. Use este código no site dos Correios ou Melhor Envio para acompanhar a entrega em tempo real.',
  },
  {
    id: '13',
    category: 'Envio',
    question: 'Entregam para fora do Brasil?',
    answer:
      'Atualmente, apenas entregamos para todo o território brasileiro. Estamos expandindo para entregas internacionais. Fique atento às novidades!',
  },

  // Conta
  {
    id: '14',
    category: 'Conta',
    question: 'Como faço para redefinir minha senha?',
    answer:
      "Clique em 'Esqueci minha senha' na página de login. Você receberá um email com um link para redefinir sua senha. Siga as instruções no email.",
  },
  {
    id: '15',
    category: 'Conta',
    question: 'Como posso atualizar meus dados cadastrais?',
    answer:
      "Faça login em sua conta, vá para 'Minha Conta' e clique em 'Editar Perfil'. Atualize as informações desejadas e salve as alterações.",
  },
  {
    id: '16',
    category: 'Conta',
    question: 'Como posso apagar minha conta?',
    answer:
      'Para apagar sua conta, entre em contato conosco através do formulário de contato ou envie um email para contato@caicaramix.com.br com a solicitação. Processaremos sua solicitação em até 5 dias úteis.',
  },

  // Devoluções
  {
    id: '17',
    category: 'Devoluções',
    question: 'Qual é a política de devolução?',
    answer:
      'Aceitamos devoluções de produtos não abertos em até 30 dias da compra. O produto deve estar em perfeito estado e com a embalagem original. Para solicitar uma devolução, entre em contato conosco.',
  },
  {
    id: '18',
    category: 'Devoluções',
    question: 'Posso devolver um produto aberto?',
    answer:
      'Produtos abertos podem ser devolvidos se houver defeito de fabricação ou se não corresponder à descrição. Avalie o estado do produto e descreva o problema ao solicitar a devolução.',
  },
  {
    id: '19',
    category: 'Devoluções',
    question: 'Quem paga o frete da devolução?',
    answer:
      'Para devoluções por defeito de fabricação, nós pagamos o frete. Para devoluções por arrependimento, o cliente arca com o custo do retorno.',
  },
  {
    id: '20',
    category: 'Devoluções',
    question: 'Quanto tempo leva para receber o reembolso?',
    answer:
      'Após recebermos e inspecionarmos o produto devolvido, o reembolso é processado em até 10 dias úteis. O prazo para a quantia aparecer em sua conta bancária varia conforme o banco (geralmente 2-5 dias).',
  },
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', ...Array.from(new Set(faqs.map((faq) => faq.category)))];
  const filteredFaqs =
    selectedCategory === 'Todos' ? faqs : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#F7FAF7] py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-8 w-8 text-[#2F7A3E]" />
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#374151]">
              Dúvidas Frequentes
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre respostas para as perguntas mais comuns sobre nossos produtos, pedidos e
            serviços.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setExpandedId(null);
                  }}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-[#2F7A3E] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full flex items-start justify-between gap-4 p-5 sm:p-6 hover:bg-[#F7FAF7] transition-colors text-left"
                  >
                    <span className="font-medium text-[#374151] flex-1 text-base sm:text-lg">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-[#2F7A3E] flex-shrink-0 transition-transform duration-300 ${
                        expandedId === faq.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedId === faq.id && (
                    <div className="border-t border-gray-200 px-5 sm:px-6 py-4 bg-[#F7FAF7]/30 animate-in fade-in slide-in-from-top-2 duration-300">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  Nenhuma pergunta encontrada para esta categoria.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still have questions */}
      <section className="bg-[#F7FAF7] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#374151] mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Não encontrou a resposta que procura? Nossa equipe está pronta para ajudar.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-[#2F7A3E] px-8 py-3 text-base font-bold text-white hover:bg-[#266332] transition-all hover:shadow-lg"
          >
            Entre em Contato Conosco
          </Link>
        </div>
      </section>
    </div>
  );
}
