"use client";

import "./globals.css";
import Head from "next/head";
import { AuthProvider } from "@/context/AuthContext"; // Ajuste o caminho conforme sua estrutura

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <Head>
        <link rel="icon" href="/img/favicon.png" type="image/png" />
      </Head>
      <body className="">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
