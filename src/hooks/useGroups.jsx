import { useState, useEffect } from 'react';
import axios from 'axios';

const useGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/m365/groups`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setGroups(response.data.data.map(group => ({
                    name: group.displayName,
                    id: group.id
                })));
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroups();
    }, []);

    return { groups, loading, error };
};

export default useGroups;
