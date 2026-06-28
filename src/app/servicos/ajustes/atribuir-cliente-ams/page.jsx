"use client";

import React from 'react';
import useProjetos from '../../../../hooks/useProjetos';

const AtribuirClientePage = () => {
    const { projetos, loading, error } = useProjetos(true);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h1>Atribuir Cliente AMS</h1>
            <table>
                <thead>
                    <tr>
                        <th>Projeto PSOffice</th>
                    </tr>
                </thead>
                <tbody>
                    {projetos.map((projeto, index) => (
                        <tr key={index}>
                            <td>{projeto.codigo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AtribuirClientePage;