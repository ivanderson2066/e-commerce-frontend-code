'use client';

import Link from 'next/link';
import { Scroll } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#F7FAF7] py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Scroll className="h-8 w-8 text-[#2F7A3E]" />
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#374151]">
              Termos de Serviço
            </h1>
          </div>
          <p className="text-lg text-gray-600">Última atualização: Janeiro de 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">Introdução</h2>
              <p>
                Bem-vindo à Caiçara Mix. Estes Termos de Serviço ("Termos") regulam seu uso de nosso
                site caicaramix.com.br e dos serviços oferecidos. Ao acessar ou usar nosso site,
                você concorda com estes Termos em sua totalidade.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">1. Uso do Site</h2>
              <p>
                Você concorda em usar o site apenas para fins legítimos e de acordo com estas
                condições. Você concorda em não:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Usar o site para qualquer atividade ilegal ou prejudicial</li>
                <li>Transmitir vírus, malware ou código malicioso</li>
                <li>Acessar ou tentar acessar contas de outros usuários</li>
                <li>Coletar ou rastrear informações pessoais de outros usuários</li>
                <li>Violar propriedade intelectual ou direitos de privacidade</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                2. Conta de Usuário
              </h2>
              <p>
                Quando você cria uma conta conosco, você concorda em fornecer informações precisas,
                atualizadas e completas. Você é responsável por:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Manter a confidencialidade de sua senha</li>
                <li>Todas as atividades que ocorrem em sua conta</li>
                <li>Notificar-nos imediatamente sobre uso não autorizado de sua conta</li>
              </ul>
              <p className="mt-3">
                Reservamos o direito de suspender ou encerrar contas que violem estas condições.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                3. Pedidos e Compras
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#374151] mb-2">Processo de Compra:</h3>
                  <p>
                    Ao fazer um pedido, você está oferecendo para comprar produtos por um preço
                    especificado. Aceitamos sua oferta e confirmamos a transação via email.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#374151] mb-2">Preços:</h3>
                  <p>
                    Os preços estão sujeitos a alterações sem aviso prévio. Os preços na hora da
                    compra são os que você pagará (exceto erros óbvios).
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#374151] mb-2">Disponibilidade:</h3>
                  <p>
                    Reservamos o direito de cancelar qualquer pedido se o produto não estiver
                    disponível ou se houver erro no preço ou descrição.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">4. Pagamento</h2>
              <p>
                Aceitamos várias formas de pagamento. Você concorda em fornecer informações precisas
                de pagamento e autoriza-nos a cobrar o valor total da sua compra.
              </p>
              <p className="mt-3">
                Você é responsável por qualquer taxa de processamento de pagamento ou despesa de
                juros incorrida em seu banco.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                5. Envio e Entrega
              </h2>
              <p>
                Fazemos o possível para entregar seus produtos dentro dos prazos estimados. No
                entanto, não garantimos datas exatas de entrega.
              </p>
              <p className="mt-3">
                O risco de perda ou dano aos produtos passa para você quando recebe os itens ou
                quando a transportadora toma posse deles.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                6. Devoluções e Reembolsos
              </h2>
              <p>
                Aceitamos devoluções de produtos não abertos em até 30 dias da compra. O produto
                deve estar em perfeito estado com embalagem original.
              </p>
              <p className="mt-3">
                Para iniciar uma devolução, entre em contato conosco. Os reembolsos são processados
                em até 10 dias úteis após recebermos e inspecionarmos o produto.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                7. Isenção de Garantias
              </h2>
              <p>
                Os produtos são fornecidos "no estado em que se encontram" e "conforme disponível".
                Na máxima extensão permitida pela lei, isentamos-nos de todas as garantias,
                expressas ou implícitas.
              </p>
              <p className="mt-3">
                Não garantimos que o site funcionará sem interrupção ou que os resultados atenderão
                às suas expectativas.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                8. Limitação de Responsabilidade
              </h2>
              <p>
                Na máxima extensão permitida pela lei, não seremos responsáveis por danos indiretos,
                incidentais, especiais, consequentes ou punitivos resultantes do uso ou
                impossibilidade de usar os produtos ou o site.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                9. Propriedade Intelectual
              </h2>
              <p>
                Todo conteúdo no site, incluindo texto, gráficos, logos, imagens e software, é
                propriedade da Caiçara Mix ou de nossos fornecedores de conteúdo e é protegido pelas
                leis de propriedade intelectual.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                10. Links de Terceiros
              </h2>
              <p>
                Nosso site pode conter links para sites de terceiros. Não somos responsáveis pelos
                conteúdos, precisão ou práticas desses sites. Sua uso desses sites está sujeito aos
                seus próprios termos e políticas.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                11. Modificações dos Termos
              </h2>
              <p>
                Reservamos o direito de modificar estes Termos a qualquer momento. Alterações
                significativas serão publicadas nesta página. Seu uso contínuo do site após as
                alterações constitui aceitação dos novos Termos.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                12. Lei e Jurisdição
              </h2>
              <p>
                Estes Termos são regidos pelas leis do Brasil. Qualquer disputa surgirá perante os
                tribunais de São Paulo, Brasil.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">13. Contato</h2>
              <p>Se tiver dúvidas sobre estes Termos, entre em contato:</p>
              <div className="mt-4 p-4 bg-[#F7FAF7] rounded-lg">
                <p className="font-semibold text-[#374151]">Caiçara Mix</p>
                <p>Email: contato@caicaramix.com.br</p>
                <p>Telefone: (11) 99999-9999</p>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex gap-4 justify-center text-sm">
            <Link href="/privacy" className="text-[#2F7A3E] hover:text-[#266332] font-medium">
              Política de Privacidade
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact" className="text-[#2F7A3E] hover:text-[#266332] font-medium">
              Contato
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
