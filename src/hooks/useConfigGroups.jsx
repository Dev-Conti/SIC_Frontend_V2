const configGroups = [
    {
        base_route:'/comercial',
        group_id:'df5919f9-37fd-4725-9aab-8ecc154789a8',
        channel_id:'19:b3da72357c7b499094aa6313bc5b37a5@thread.tacv2'
    },
    {
        base_route:'/servicos',
        group_id:'df5919f9-37fd-4725-9aab-8ecc154789a8',
        channel_id:'19:f826e90af9f741319cf021cf04aa19a4@thread.tacv2'
    },
    {
        base_route:'/financeiro',
        group_id:'df5919f9-37fd-4725-9aab-8ecc154789a8',
        channel_id:'19:6322f957e1884aa595b0e10e6a5b11c8@thread.tacv2'
    },
    {
        base_route:'/admin',
        group_id:'df5919f9-37fd-4725-9aab-8ecc154789a8',
        channel_id:'19:ac5914cd3b194829b862274136015e89@thread.tacv2'
    }
];

const useConfigGroups = (baseRoute) => {
    const config = configGroups.find(group => group.base_route === baseRoute);
    return config ? { group_id: config.group_id, channel_id: config.channel_id } : null;
};

export default useConfigGroups;