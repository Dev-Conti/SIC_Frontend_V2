import { useState, useEffect } from 'react';
import axios from 'axios';

const useChannels = (groupId) => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/m365/group_channels`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        group_id: groupId
                    }
                });
                setChannels(response.data.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (groupId) {
            fetchChannels();
        }
    }, [groupId]);

    return { channels, loading, error };
};

export default useChannels;
