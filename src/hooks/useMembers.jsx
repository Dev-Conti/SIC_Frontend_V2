import { useState, useEffect } from 'react';
import axios from 'axios';

const useMembers = (groupId, channelId) => {
    const [emails, setEmails] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!groupId || !channelId) return;

        const fetchMembers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/m365/channel_members`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        group_id: groupId,
                        channel_id: channelId
                    }
                });
                const members = response.data.data;
                setMembers(members);
                const memberEmails = members.map(member => member.email);
                setEmails(memberEmails);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [groupId, channelId]);

    return { emails, members, loading, error };
};

export default useMembers;
