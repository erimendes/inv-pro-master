import { useEffect, useState } from 'react';

// import { Application } from '../types/application.types';

import { getAplicacoes } from '../services/app.service';
import type { Application } from '../types/application.types';

export function useApplications(
  categoria?: string,
  criticidade?: string
) {
  const [apps, setApps] = useState<Application[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const data = await getAplicacoes(
          categoria,
          criticidade
        );

        setApps(data);

        setError(null);
      } catch (err: any) {
        console.error(err);

        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [categoria, criticidade]);

  return {
    apps,
    loading,
    error,
  };
}
