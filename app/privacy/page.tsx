"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#F7FAF7] py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-[#2F7A3E]" />
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#374151]">
              Política de Privacidade
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
                A Caiçara Mix ("nós", "nosso" ou "empresa") opera o site caicaramix.com.br. 
                Esta página informa você sobre nossas políticas de coleta, uso e divulgação de dados pessoais 
                quando você usa nosso site e as escolhas associadas a esses dados.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                1. Coleta de Dados
              </h2>
              <p>
                Nós coletamos diferentes tipos de informações para fins diversos, a fim de fornecer e melhorar 
                nossos serviços para você.
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-[#374151] mb-2">Dados Pessoais:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Nome completo</li>
                    <li>Email</li>
                    <li>Número de telefone</li>
                    <li>Endereço de entrega</li>
                    <li>Informações de pagamento</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[#374151] mb-2">Dados de Uso:</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Histórico de navegação</li>
                    <li>Produtos visualizados</li>
                    <li>Compras realizadas</li>
                    <li>Cookies e identificadores similares</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                2. Uso dos Dados
              </h2>
              <p>Usamos os dados coletados para:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Processar suas transações e enviar informações relacionadas</li>
                <li>Responder a suas solicitações e perguntas</li>
                <li>Enviar atualizações de pedidos e informações de marketing (com seu consentimento)</li>
                <li>Melhorar nosso site e serviços</li>
                <li>Prevenir fraude e garantir segurança</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                3. Compartilhamento de Dados
              </h2>
              <p>
                Não compartilhamos seus dados pessoais com terceiros, exceto:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Com prestadores de serviço que nos ajudam a operar o site (pagamento, entrega)</li>
                <li>Quando obrigado por lei ou para proteger direitos</li>
                <li>Em caso de fusão ou venda da empresa (com aviso prévio)</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                4. Cookies
              </h2>
              <p>
                Usamos cookies para melhorar sua experiência no site. Cookies são pequenos arquivos armazenados 
                em seu dispositivo que nos ajudam a reconhecê-lo e a personalizar o conteúdo.
              </p>
              <p className="mt-3">
                Você pode controlar cookies através das configurações do seu navegador. No entanto, 
                desabilitar cookies pode afetar funcionalidades do site.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                5. Segurança dos Dados
              </h2>
              <p>
                Implementamos medidas de segurança apropriadas para proteger seus dados pessoais contra 
                acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de 
                transmissão pela Internet é 100% seguro.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                6. Seus Direitos
              </h2>
              <p>Você tem o direito de:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Acessar seus dados pessoais</li>
                <li>Solicitar correção de dados imprecisos</li>
                <li>Solicitar exclusão de seus dados</li>
                <li>Revogar consentimento para marketing</li>
                <li>Receber uma cópia de seus dados em formato portátil</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                7. Contato
              </h2>
              <p>
                Se tiver dúvidas sobre esta Política de Privacidade ou nossas práticas de dados, 
                entre em contato:
              </p>
              <div className="mt-4 p-4 bg-[#F7FAF7] rounded-lg">
                <p className="font-semibold text-[#374151]">Caiçara Mix</p>
                <p>Email: privacidade@caicaramix.com.br</p>
                <p>Telefone: (11) 99999-9999</p>
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-[#374151] mb-4">
                8. Alterações na Política
              </h2>
              <p>
                Podemos atualizar esta Política de Privacidade de tempos em tempos. Notificaremos você 
                sobre alterações significativas publicando a nova política nesta página com uma data atualizada.
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex gap-4 justify-center text-sm">
            <Link href="/terms" className="text-[#2F7A3E] hover:text-[#266332] font-medium">
              Termos de Serviço
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
