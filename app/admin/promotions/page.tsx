'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Loader2, Edit2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Promotion {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  discount_amount: number;
  image: string;
  active: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_percentage: 0,
    discount_amount: 0,
    image: '',
    active: true,
    start_date: '',
    end_date: '',
  });

  // Load promotions
  const loadPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPromotions(data || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
      toast.error('Erro ao carregar promoções');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || (!formData.discount_percentage && !formData.discount_amount)) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      if (editingId) {
        // Update
        const { error } = await supabase.from('promotions').update(formData).eq('id', editingId);

        if (error) throw error;
        toast.success('Promoção atualizada!');
      } else {
        // Create
        const { error } = await supabase.from('promotions').insert([formData]);

        if (error) throw error;
        toast.success('Promoção criada!');
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        discount_percentage: 0,
        discount_amount: 0,
        image: '',
        active: true,
        start_date: '',
        end_date: '',
      });

      loadPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('Erro ao salvar promoção');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta promoção?')) return;

    try {
      const { error } = await supabase.from('promotions').delete().eq('id', id);

      if (error) throw error;

      toast.success('Promoção deletada!');
      loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Erro ao deletar promoção');
    }
  };

  const handleEdit = (promo: Promotion) => {
    setEditingId(promo.id);
    setFormData({
      name: promo.name,
      description: promo.description,
      discount_percentage: promo.discount_percentage,
      discount_amount: promo.discount_amount,
      image: promo.image,
      active: promo.active,
      start_date: promo.start_date ? promo.start_date.slice(0, 16) : '',
      end_date: promo.end_date ? promo.end_date.slice(0, 16) : '',
    });
    setIsFormOpen(true);
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      toast.success(currentActive ? 'Promoção desativada' : 'Promoção ativada');
      loadPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      toast.error('Erro ao atualizar promoção');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#374151]">Gerenciar Promoções</h1>
          <p className="text-gray-600 mt-1">Crie e gerencie as promoções que aparecem na home</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({
              name: '',
              description: '',
              discount_percentage: 0,
              discount_amount: 0,
              image: '',
              active: true,
              start_date: '',
              end_date: '',
            });
            setIsFormOpen(true);
          }}
          className="bg-[#2F7A3E] hover:bg-[#266332] text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Promoção
        </Button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-bold text-xl text-[#374151] mb-4">
            {editingId ? 'Editar Promoção' : 'Nova Promoção'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Nome *</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Promoção PIX"
                  className="border-gray-300 focus:border-[#2F7A3E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Desconto (%)
                </label>
                <Input
                  type="number"
                  value={formData.discount_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_percentage: parseFloat(e.target.value),
                    })
                  }
                  placeholder="Ex: 15"
                  min="0"
                  max="100"
                  className="border-gray-300 focus:border-[#2F7A3E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Desconto (Valor Fixo)
                </label>
                <Input
                  type="number"
                  value={formData.discount_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_amount: parseFloat(e.target.value),
                    })
                  }
                  placeholder="Ex: 50"
                  min="0"
                  step="0.01"
                  className="border-gray-300 focus:border-[#2F7A3E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Data Início</label>
                <Input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="border-gray-300 focus:border-[#2F7A3E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Data Fim</label>
                <Input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="border-gray-300 focus:border-[#2F7A3E]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  URL da Imagem
                </label>
                <Input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="border-gray-300 focus:border-[#2F7A3E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição da promoção"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F7A3E] focus:ring-1 focus:ring-[#2F7A3E]"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-[#2F7A3E]"
                />
                <span className="text-sm font-medium text-[#374151]">Ativa</span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-[#2F7A3E] hover:bg-[#266332] text-white">
                {editingId ? 'Atualizar' : 'Criar'}
              </Button>
              <Button type="button" onClick={() => setIsFormOpen(false)} variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2F7A3E]" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            <p>Nenhuma promoção criada ainda.</p>
            <p className="text-sm mt-2">Clique em "Nova Promoção" para criar uma.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2F7A3E]/5 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#374151]">Nome</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#374151]">
                    Desconto
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#374151]">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#374151]">
                    Validade
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#374151]">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-[#F7FAF7] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[#374151]">{promo.name}</p>
                        <p className="text-sm text-gray-600 line-clamp-1">{promo.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#374151]">
                      {promo.discount_percentage > 0 && (
                        <span className="font-semibold text-[#2F7A3E]">
                          {promo.discount_percentage}%
                        </span>
                      )}
                      {promo.discount_percentage > 0 && promo.discount_amount > 0 && (
                        <span> + </span>
                      )}
                      {promo.discount_amount > 0 && (
                        <span className="font-semibold text-[#2F7A3E]">
                          R$ {promo.discount_amount.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(promo.id, promo.active)}
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          promo.active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {promo.active ? (
                          <>
                            <Eye className="h-4 w-4" />
                            Ativa
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Inativa
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {promo.end_date
                        ? new Date(promo.end_date).toLocaleDateString('pt-BR')
                        : 'Sem data'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(promo)}
                          className="p-2 rounded-lg hover:bg-[#2F7A3E]/10 text-[#2F7A3E] transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help */}
      <div className="bg-[#2F7A3E]/5 border border-[#2F7A3E]/20 rounded-lg p-4">
        <h3 className="font-semibold text-[#2F7A3E] mb-2">💡 Dica:</h3>
        <p className="text-sm text-gray-700">
          As promoções ativas aparecem na seção de destaque da home. Você pode usar tanto desconto
          percentual quanto valor fixo, ou ambos.
        </p>
      </div>
    </div>
  );
}
