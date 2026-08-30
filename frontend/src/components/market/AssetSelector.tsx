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
    <div style={{ width: '100%' }}>
      <select
        value={selectedSymbol}
        onChange={(e) => onSelect(e.target.value)}
        disabled={isLoading}
        className="form-input"
        style={{ width: '100%', cursor: 'pointer' }}
      >
        <option value="" disabled>Select an asset to test...</option>
        {assets.map((asset) => (
          <option key={asset.symbol} value={asset.symbol}>
            {asset.symbol} — {asset.name} ({asset.exchange || 'NASDAQ'})
          </option>
        ))}
      </select>
      {isLoading && (
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginTop: '4px' }}>
          Loading asset catalog...
        </p>
      )}
    </div>
  );
}
