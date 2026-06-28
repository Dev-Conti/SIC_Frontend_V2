'use client';

import withAuth from "@/hoc/withAuth";
import routePermissions from "@/data/routePermissions";
import { useAuth } from "@/context/AuthContext";
import useConfigGroups from "@/hooks/useConfigGroups";
import useMembers from "@/hooks/useMembers";
import { useState, useEffect } from "react";

function Home() {
  const { user } = useAuth();
  const configGroups = useConfigGroups;
  const [selectedBaseRoute, setSelectedBaseRoute] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleBaseRouteChange = (e) => {
    const baseRoute = e.target.value;
    setSelectedBaseRoute(baseRoute);
    const group = configGroups.find(group => group.base_route === baseRoute);
    setSelectedGroup(group);
  };

  const { members, loading, error } = useMembers(selectedGroup?.group_id, selectedGroup?.channel_id);

  return (
    <div>
      Bem vindo
      <div>
        <label htmlFor="baseRouteSelect">Selecione a Base Route:</label>
        <select id="baseRouteSelect" onChange={handleBaseRouteChange}>
          <option value="">Selecione...</option>
          {configGroups.map(group => (
            <option key={group.base_route} value={group.base_route}>
              {group.base_route}
            </option>
          ))}
        </select>
      </div>
      {selectedGroup && (
        <div>
          <p>Group ID: {selectedGroup.group_id}</p>
          <p>Channel ID: {selectedGroup.channel_id}</p>
        </div>
      )}
      {selectedGroup && (
        <div>
          <h2>Membros do Canal</h2>
          {loading && <p>Carregando...</p>}
          {error && <p>Erro ao carregar membros: {error.response?.data?.message || error.message}</p>}
          {!loading && !error && (
            <ul>
              {members.map(member => (
                <li key={member.id}>
                  {member.displayName} ({member.email}) {member.isOwner && <strong>(Owner)</strong>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default withAuth(Home, routePermissions);