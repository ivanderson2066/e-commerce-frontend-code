'use client';

import { useAddresses, Address } from '@/lib/addresses-context';
import { useShipping } from '@/lib/shipping-context';
import { MapPin, Plus } from 'lucide-react';

interface SavedAddressSelectorProps {
  onAddressSelect: (address: Address | null) => void;
  selectedAddressId?: string | null;
}

export function SavedAddressSelector({
  onAddressSelect,
  selectedAddressId,
}: SavedAddressSelectorProps) {
  const { addresses, loading } = useAddresses();
  const { selectAddress } = useShipping();

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (addresses.length === 0) {
    return null;
  }

  const handleSelectAddress = (address: Address) => {
    onAddressSelect(address);
    selectAddress(address);
  };

  const handleNewAddress = () => {
    onAddressSelect(null);
    selectAddress(null);
  };

  return (
    <div className="space-y-4 mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
      <p className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-emerald-600" />
        Meus Endereços Salvos
      </p>

      <div className="space-y-2">
        {addresses.map((addr) => (
          <label
            key={addr.id}
            className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
              selectedAddressId === addr.id
                ? 'border-emerald-600 bg-white ring-1 ring-emerald-600'
                : 'border-emerald-200 bg-white hover:border-emerald-400'
            }`}
          >
            <input
              type="radio"
              name="savedAddress"
              checked={selectedAddressId === addr.id}
              onChange={() => handleSelectAddress(addr)}
              className="mr-3 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{addr.label || addr.name}</p>
              <p className="text-xs text-gray-600">
                {addr.address}, {addr.number}
                {addr.complement && ` - ${addr.complement}`}
              </p>
              <p className="text-xs text-gray-500">
                {addr.neighborhood && `${addr.neighborhood} - `}{addr.city}, {addr.state} - {addr.zip_code}
              </p>
            </div>
            {addr.is_primary && (
              <span className="ml-2 inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-semibold flex-shrink-0">
                Padrão
              </span>
            )}
          </label>
        ))}

        <label className="flex items-center p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all hover:border-emerald-400 hover:bg-emerald-50">
          <input
            type="radio"
            name="savedAddress"
            checked={selectedAddressId === null}
            onChange={handleNewAddress}
            className="mr-3"
          />
          <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
            <Plus className="h-4 w-4" />
            Usar novo endereço
          </div>
        </label>
      </div>
    </div>
  );
}
