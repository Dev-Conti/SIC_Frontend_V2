import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";

const useFolhaPagamentoAberta = (initialParams = {}) => {
  const [folha, setFolha] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchFolhaPagamento = useCallback(async () => {
    setLoading(true);
    setError(null);

    const dataInicial = params.data_inicial || dayjs().startOf('month').format('YYYY-MM-DD');
    const dataFinal = params.data_final || dayjs().format('YYYY-MM-DD');

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/folha/folha-pagamento`, {
        params: { data_inicial: dataInicial, data_final: dataFinal }
      });
      setFolha(response.data.data.folha);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchFolhaPagamento();
  }, [fetchFolhaPagamento]);

  const refresh = () => {
    fetchFolhaPagamento();
  };

  return { folha, loading, error, setParams, refresh };
};

export default useFolhaPagamentoAberta;