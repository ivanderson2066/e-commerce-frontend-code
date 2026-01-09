'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Geral',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Here you would typically send the form data to your backend
      console.log('Form submitted:', formData);

      toast.success('Mensagem enviada com sucesso! Responderemos em breve.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'Geral',
        message: '',
      });
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#F7FAF7] py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#374151] mb-4">
            Fale Conosco
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Temos o prazer em ajudar. Entre em contato conosco para dúvidas, sugestões ou feedback
            sobre nossos produtos.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Email */}
            <div className="rounded-lg border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow bg-white">
              <Mail className="h-10 w-10 text-[#2F7A3E] mx-auto mb-3" />
              <h3 className="font-bold text-[#374151] mb-2">Email</h3>
              <a
                href="mailto:contato@caicaramix.com.br"
                className="text-gray-600 hover:text-[#2F7A3E] transition-colors"
              >
                contato@caicaramix.com.br
              </a>
            </div>

            {/* Phone */}
            <div className="rounded-lg border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow bg-white">
              <Phone className="h-10 w-10 text-[#2F7A3E] mx-auto mb-3" />
              <h3 className="font-bold text-[#374151] mb-2">Telefone</h3>
              <a
                href="tel:+5511999999999"
                className="text-gray-600 hover:text-[#2F7A3E] transition-colors"
              >
                (11) 99999-9999
              </a>
            </div>

            {/* Address */}
            <div className="rounded-lg border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow bg-white">
              <MapPin className="h-10 w-10 text-[#2F7A3E] mx-auto mb-3" />
              <h3 className="font-bold text-[#374151] mb-2">Localização</h3>
              <p className="text-gray-600 text-sm">
                São Paulo, SP
                <br />
                Brasil
              </p>
            </div>

            {/* Hours */}
            <div className="rounded-lg border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow bg-white">
              <Clock className="h-10 w-10 text-[#2F7A3E] mx-auto mb-3" />
              <h3 className="font-bold text-[#374151] mb-2">Horários</h3>
              <p className="text-gray-600 text-sm">
                Seg-Sex: 9h-18h
                <br />
                Sab: 10h-14h
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 sm:py-20 bg-[#F7FAF7]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#374151] mb-4">
              Envie uma Mensagem
            </h2>
            <p className="text-lg text-gray-600">
              Preencha o formulário abaixo e responderemos assim que possível.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#374151] mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#374151] placeholder-gray-500 focus:border-[#2F7A3E] focus:ring-2 focus:ring-[#2F7A3E]/20 outline-none transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu.email@exemplo.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#374151] placeholder-gray-500 focus:border-[#2F7A3E] focus:ring-2 focus:ring-[#2F7A3E]/20 outline-none transition-all"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#374151] mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#374151] placeholder-gray-500 focus:border-[#2F7A3E] focus:ring-2 focus:ring-[#2F7A3E]/20 outline-none transition-all"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[#374151] mb-2">
                  Assunto
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#374151] focus:border-[#2F7A3E] focus:ring-2 focus:ring-[#2F7A3E]/20 outline-none transition-all"
                >
                  <option value="Geral">Geral</option>
                  <option value="Dúvida sobre Produto">Dúvida sobre Produto</option>
                  <option value="Pedido">Pedido</option>
                  <option value="Devoluções">Devoluções</option>
                  <option value="Sugestão">Sugestão</option>
                  <option value="Parceria">Parceria</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-[#374151] mb-2">
                Mensagem *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Descreva sua mensagem aqui..."
                rows={6}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[#374151] placeholder-gray-500 focus:border-[#2F7A3E] focus:ring-2 focus:ring-[#2F7A3E]/20 outline-none transition-all resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#2F7A3E] px-8 py-3 text-base font-bold text-white hover:bg-[#266332] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
              {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-[#2F7A3E]/10 border border-[#2F7A3E]/20 rounded-lg text-sm text-gray-700">
            <p className="font-medium text-[#2F7A3E] mb-2">Tempo de resposta:</p>
            <p>
              Nossas equipes trabalham para responder todos os emails em até 24 horas úteis. Caso
              precise de suporte urgente, ligue para (11) 99999-9999.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#374151] mb-4">
              Dúvidas Frequentes
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Encontre respostas para as perguntas mais comuns
            </p>
            <a
              href="/faq"
              className="inline-flex items-center justify-center rounded-full bg-[#2F7A3E] px-8 py-3 text-base font-bold text-white hover:bg-[#266332] transition-all hover:shadow-lg"
            >
              Ver Todas as Perguntas
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
