import useConfigGroups from './useConfigGroups';
import useMembers from './useMembers';

const useFetchAuthorizedEmails = (baseRoute) => {
    const config = useConfigGroups.find(group => group.base_route === baseRoute);
    const { members, loading, error } = useMembers(config?.group_id, config?.channel_id);

    const emails = members.map(member => member.email);

    return { emails, loading, error };
};

export default useFetchAuthorizedEmails;
