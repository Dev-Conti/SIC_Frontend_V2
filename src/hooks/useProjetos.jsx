import { useState, useEffect } from 'react';
import axios from 'axios';

const useProjetos = (ams = false) => {
    const [projetos, setProjetos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjetos = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/psoffice/projetos`, {
                    params: { ams }
                });
                setProjetos(response.data.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjetos();
    }, [ams]);

    return { projetos, loading, error };
};

export default useProjetos;
