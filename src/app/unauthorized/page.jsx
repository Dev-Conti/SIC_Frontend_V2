'use client';
import { FaLock } from 'react-icons/fa';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import 'tailwindcss/tailwind.css';

export default function UnauthorizedPage() {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <Card className="w-96">
                <CardBody className="text-center">
                    <FaLock className="text-6xl text-red-500 mb-4" />
                    <Typography variant="h4" color="blue-gray" className="mb-2">
                        Acesso Negado
                    </Typography>
                    <Typography>
                        Você não tem permissão para acessar esta página.
                    </Typography>
                </CardBody>
            </Card>
        </div>
    );
}
