// src/modules/racks/hooks/useRacks.ts
import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/core/services/api"; // Verifique se o alias @ está configurado

export const useRacks = () => { // <--- PRECISA DESTA LINHA
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRacks = useCallback(async () => {
    try {
      setLoading(true);
      // O fetcher já adiciona o /hardware, então passamos apenas /racks
      const data = await apiService.get('/racks'); 
      setRacks(data);
    } catch (error) {
      console.error("Erro ao buscar racks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRacks();
  }, [fetchRacks]);

  // Retornamos os dados para a página usar
  return { racks, loading, refresh: fetchRacks };
};