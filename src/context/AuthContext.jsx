"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";

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
      router.push("/comercial/ganhos");
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