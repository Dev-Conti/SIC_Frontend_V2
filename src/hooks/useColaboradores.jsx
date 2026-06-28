import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useColaboradores = (initialParams = {}) => {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchColaboradores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/colaboradores`);
      setColaboradores(response.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColaboradores();
  }, [fetchColaboradores]);

  const refresh = () => {
    fetchColaboradores();
  };

  return { colaboradores, loading, error, setParams, refresh };
};

export default useColaboradores;