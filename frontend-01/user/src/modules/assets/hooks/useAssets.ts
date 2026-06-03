import { useState, useEffect } from 'react';
import { Asset } from '../types/asset.types';
import * as assetsService from '../services/assets.service';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assetsService.getAssets().then(data => {
      setAssets(data);
      setLoading(false);
    });
  }, []);

  return { assets, loading };
};
