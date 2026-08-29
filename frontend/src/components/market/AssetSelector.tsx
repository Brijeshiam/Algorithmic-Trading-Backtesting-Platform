import React from 'react';
import { Asset } from '../../services/market.service';

interface AssetSelectorProps {
  assets: Asset[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  isLoading?: boolean;
}

export function AssetSelector({ assets, selectedSymbol, onSelect, isLoading = false }: AssetSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Asset</label>
      <select
        value={selectedSymbol}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isLoading}
        className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <option value="" disabled>Select asset...</option>
        {assets.map((asset) => (
          <option key={asset.symbol} value={asset.symbol}>
            {asset.symbol} — {asset.name}
          </option>
        ))}
      </select>
      {isLoading && (
        <p className="text-xs text-gray-400 mt-1">Loading assets...</p>
      )}
    </div>
  );
}
