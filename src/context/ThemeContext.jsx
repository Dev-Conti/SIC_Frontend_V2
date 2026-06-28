"use client";

import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    sidebarBg: "bg-gray-800", // Cor de fundo padrão
  });

  const toggleTheme = () => {
    setTheme((prev) => ({
      sidebarBg: prev.sidebarBg === "bg-gray-800" ? "bg-blue-800" : "bg-gray-800",
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
