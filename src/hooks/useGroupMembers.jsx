import { useState, useEffect, useRef } from "react";
import axios from "axios";

const useGroupMembers = (groupId, channelId = null) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const prevKey = useRef(null);

    useEffect(() => {
        if (!groupId) return;
        const key = `${groupId}-${channelId || "no-channel"}`;
        if (prevKey.current === key) return;
        prevKey.current = key;

        const fetchMembers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const endpoint = channelId
                    ? `${process.env.NEXT_PUBLIC_BASE_API_URL}/m365/channel_members`
                    : `${process.env.NEXT_PUBLIC_BASE_API_URL}/m365/group_members`;
                const params = channelId
                    ? { group_id: groupId, channel_id: channelId }
                    : { group_id: groupId };
                const { data } = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                    params,
                });
                setMembers(data.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, [groupId, channelId]);

    return { members, loading, error };
};

export default useGroupMembers;
