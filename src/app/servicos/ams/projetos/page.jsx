import React from 'react';
import { ConfigProjetosAmsTable } from '@/components/Tabelas/ConfigProjetosAmsTable';

const ProjetosPage = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Projetos AMS</h1>
            <ConfigProjetosAmsTable />
        </div>
    );
};

export default ProjetosPage;
