"use client";

import Link from "next/link";
import Image from "next/image";
import { Leaf, Heart, Sprout, Award, Users, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#F7FAF7] py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight text-[#374151]">
                Sobre Caiçara Mix
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Somos uma marca dedicada a trazer a beleza pura da natureza brasileira para sua vida. 
                Cada produto é cuidadosamente formulado com ingredientes naturais de origem sustentável, 
                respeitando o meio ambiente e celebrando a biodiversidade do Brasil.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Fundada com a missão de democratizar o acesso a cosméticos naturais de alta qualidade, 
                a Caiçara Mix acredita que beleza verdadeira vem da natureza, sem comprometer os valores éticos.
              </p>
              <div className="flex gap-4 pt-4">
                <Link
                  href="/category/todos"
                  className="inline-flex items-center justify-center rounded-full bg-[#2F7A3E] px-8 py-3 text-base font-bold text-white hover:bg-[#266332] transition-all hover:shadow-lg"
                >
                  Explorar Produtos
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-[#2F7A3E] px-8 py-3 text-base font-bold text-[#2F7A3E] hover:bg-[#2F7A3E]/5 transition-colors"
                >
                  Entrar em Contato
                </Link>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden bg-gradient-to-br from-[#2F7A3E]/20 to-[#A7E3B0]/20 flex items-center justify-center">
              <div className="text-center">
                <Leaf className="h-24 w-24 text-[#2F7A3E]/30 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Imagem de marca em desenvolvimento</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#374151] mb-4">
              Nossos Valores
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              O que nos guia em cada decisão e produto que criamos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow bg-white">
              <Leaf className="h-12 w-12 text-[#2F7A3E] mb-4" />
              <h3 className="font-serif text-xl font-bold text-[#374151] mb-3">
                100% Natural
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Todos os nossos produtos são formulados com ingredientes naturais, sem componentes químicos agressivos ou sintéticos prejudiciais à saúde.
              </p>
            </div>

            {/* Value 2 */}
            <div className="rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow bg-white">
              <Heart className="h-12 w-12 text-[#2F7A3E] mb-4" />
              <h3 className="font-serif text-xl font-bold text-[#374151] mb-3">
                Cruelty-Free
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Nunca testamos em animais. Acreditamos que beleza não deve custar a vida ou o bem-estar de nenhum ser vivo.
              </p>
            </div>

            {/* Value 3 */}
            <div className="rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow bg-white">
              <Sprout className="h-12 w-12 text-[#2F7A3E] mb-4" />
              <h3 className="font-serif text-xl font-bold text-[#374151] mb-3">
                Sustentabilidade
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Nossas embalagens são biodegradáveis e recicláveis. Nos comprometemos com a preservação da biodiversidade brasileira.
              </p>
            </div>

            {/* Value 4 */}
            <div className="rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow bg-white">
              <Award className="h-12 w-12 text-[#2F7A3E] mb-4" />
              <h3 className="font-serif text-xl font-bold text-[#374151] mb-3">
                Qualidade
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Cada produto passa por rigorosos testes de qualidade e certificações internacionais para garantir eficácia e segurança.
              </p>
            </div>

            {/* Value 5 */}
            <div className="rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow bg-white">
              <Users className="h-12 w-12 text-[#2F7A3E] mb-4" />
              <h3 className="font-serif text-xl font-bold text-[#374151] mb-3">
                Comunidade
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Apoiamos comunidades locais e pequenos agricultores que fornecem nossas matérias-primas naturais.
              </p>
            </div>

            {/* Value 6 */}
            <div className="rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow bg-white">
              <Target className="h-12 w-12 text-[#2F7A3E] mb-4" />
              <h3 className="font-serif text-xl font-bold text-[#374151] mb-3">
                Transparência
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Acreditamos na total transparência sobre ingredientes, processos de fabricação e origem de nossos produtos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-[#F7FAF7] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#374151] mb-4">
              Nossa História
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6 text-gray-700 leading-relaxed">
            <p>
              A Caiçara Mix nasceu de uma paixão profunda pela beleza natural e pela floresta tropical brasileira. 
              Tudo começou quando nossos fundadores se encontraram em uma pequena comunidade indígena, aprendendo 
              sobre o uso ancestral de plantas e ervas para cuidados com a pele e cabelos.
            </p>

            <p>
              Fascinados pela riqueza de conhecimentos tradicionais e pela biodiversidade do Brasil, decidiram criar 
              uma marca que pudesse compartilhar esses tesouros naturais com o mundo, mantendo o respeito ao meio ambiente 
              e às comunidades locais.
            </p>

            <p>
              Desde a primeira fórmula desenvolvida em um pequeno laboratório até hoje, a Caiçara Mix cresceu mantendo 
              seus valores fundamentais: qualidade premium, ingredientes 100% naturais, cruelty-free, e um impacto positivo 
              na sociedade e no meio ambiente.
            </p>

            <p>
              Hoje, somos orgulhosos de estar presente em milhares de casas, ajudando pessoas a descobrir a verdadeira 
              beleza que floresce da natureza. Cada compra contribui para preservar a floresta e apoiar as comunidades 
              que cuidam da terra.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="font-serif text-5xl font-bold text-[#2F7A3E] mb-2">50+</div>
              <p className="text-gray-600 font-medium">Produtos Naturais</p>
            </div>
            <div className="text-center">
              <div className="font-serif text-5xl font-bold text-[#2F7A3E] mb-2">15K+</div>
              <p className="text-gray-600 font-medium">Clientes Satisfeitos</p>
            </div>
            <div className="text-center">
              <div className="font-serif text-5xl font-bold text-[#2F7A3E] mb-2">100%</div>
              <p className="text-gray-600 font-medium">Ingredientes Puros</p>
            </div>
            <div className="text-center">
              <div className="font-serif text-5xl font-bold text-[#2F7A3E] mb-2">5+</div>
              <p className="text-gray-600 font-medium">Anos de Jornada</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2F7A3E] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para descobrir a beleza natural?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Explore nossa coleção completa de cosméticos naturais e transforme sua rotina de beleza.
          </p>
          <Link
            href="/category/todos"
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-bold text-[#2F7A3E] hover:bg-gray-100 transition-all hover:shadow-lg"
          >
            Ver Todos os Produtos
          </Link>
        </div>
      </section>
    </div>
  );
}
