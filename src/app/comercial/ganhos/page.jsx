'use client';

import { BreadcrumbsDefault } from "@/components/Breadcrumbs/BreadcrumbsDefault";
import { BacklogGanhos } from "@/components/Tabelas/BacklogGanhos";

const BASE_ROUTE = "/comercial";

export default function GanhosPage() {
    const breadcrumbItems = [
        { name: "Comercial", path: BASE_ROUTE },
        { name: "Ganhos", path: `${BASE_ROUTE}/ganhos` },
    ];

    return (
        <div>
            <BreadcrumbsDefault items={breadcrumbItems} />
            <BacklogGanhos baseRoute={BASE_ROUTE} />
        </div>
    );
}