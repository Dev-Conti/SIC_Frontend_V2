'use client';

import React from 'react';
import { FaExclamationCircle, FaReact } from 'react-icons/fa';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import { motion } from 'framer-motion';

const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full mx-auto shadow-lg">
          <CardBody className="text-center">
            <FaExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <Typography variant="h4" color="red" className="mb-2">
              Acesso Negado
            </Typography>
            <Typography variant="body1" color="gray">
              Você não tem permissão para acessar esta página.
            </Typography>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default Unauthorized;