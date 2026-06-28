"use client";

import Head from "next/head";
import LoginButton from "@/components/Buttons/LoginButton";

export default function Home() {
  return (
    <>
      <Head>
        <title>Página Inicial - ConTI</title>
        <meta
          name="description"
          content="Página inicial do sistema de gestão RH."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "#0098C9",
          backgroundImage: "url('/walpaper_home.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="p-6 bg-white bg-opacity-75 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold">Bem-vindo!</h1>
          <p className="mt-4 text-gray-700">
            Explore as funcionalidades do sistema integrado ConTI
          </p>

          {/* Botão de Login */}
          <div className="mt-6 flex justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
    </>
  );
}
