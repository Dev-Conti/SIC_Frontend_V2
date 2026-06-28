import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useWarmup = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWarmupData = useCallback(async (etapa) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/warmup/listar`, { params: { etapa } });
      setData(response.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWarmupById = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/warmup/listar/${id}`);
      setData(response.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const processWarmupData = async (dados) => {
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/warmup/processar_dados`, dados);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWarmupData = async (negocio_id, dados) => {
    setLoading(true);
    try {
      const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_API_URL}/warmup/atualizar/${negocio_id}`, dados);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchWarmupData,
    fetchWarmupById,
    processWarmupData,
    updateWarmupData, // Add the new function to the return object
  };
};

export default useWarmup;
