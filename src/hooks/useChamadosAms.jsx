import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useChamadosAms = (initialParams = {}) => {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchChamados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/deskmanager/chamados-suporte`);
      setChamados(response.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChamados();
  }, [fetchChamados]);

  const refresh = () => {
    fetchChamados();
  };

  return { chamados, loading, error, setParams, refresh };
};

export default useChamadosAms;
