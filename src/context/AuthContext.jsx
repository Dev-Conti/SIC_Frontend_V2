"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { configGroups } from "@/hooks/useConfigGroups";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token"); // Token da API interna
    const storedUser = localStorage.getItem("user_data");

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
    } else {
      setLoading(false); // Finaliza o carregamento
    }
  }, []);

  const fetchFirstAccessibleRoute = async (userEmail, token) => {
    const email = userEmail?.toLowerCase();
    const results = await Promise.all(
      configGroups.map(async ({ base_route, group_id, channel_id }) => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/m365/channel_members?group_id=${group_id}&channel_id=${channel_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const json = await res.json();
          const emails = json.data.map(m => m.email?.toLowerCase());
          return emails.includes(email) ? base_route : null;
        } catch {
          return null;
        }
      })
    );
    return results.find(r => r !== null) ?? "/unauthorized";
  };

  const fetchUserData = async (token) => {
    try {
      console.log('Fetching user data with token:', token);
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/m365/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Fetch user response:', userResponse);

      if (!userResponse.ok) {
        console.error('Error fetching user data:', userResponse.statusText);
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }

      const responseData = await userResponse.json();
      console.log('User data:', responseData);

      const userData = responseData.data; // Acessa a propriedade 'data' que contém os dados do usuário

      setUser(userData);
      localStorage.setItem("user_data", JSON.stringify(userData));
      setLoading(false);
      const destination = await fetchFirstAccessibleRoute(userData.mail || userData.userPrincipalName, token);
      router.push(destination);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      setLoading(false);
    }
  };

  const login = (token) => {
    localStorage.setItem("token", token); // Armazena o token da API interna
    fetchUserData(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    setUser(null);
    router.push("/"); // Redireciona para a página de login
  };

  const isAuthenticated = () => !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};