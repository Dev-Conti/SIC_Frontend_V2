import { useState, useEffect } from 'react';
import axios from 'axios';

const useBacklogGanhos = () => {
    const [ganhos, setGanhos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchGanhos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/comercial/ganhos`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setGanhos(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const updateBacklog = async () => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/comercial/atualizar-negociacoes`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (err) {
            setError(err);
        } finally {
            setUpdating(false);
            fetchGanhos();
        }
    };

    useEffect(() => {
        fetchGanhos();
    }, []);

    const refresh = () => {
        setLoading(true);
        fetchGanhos();
    };

    return { ganhos, loading, error, refresh, updateBacklog, updating, fetchGanhos };
};

export default useBacklogGanhos;
