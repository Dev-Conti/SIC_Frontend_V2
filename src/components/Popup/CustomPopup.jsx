import React, { useEffect } from 'react';
import { Alert } from '@material-tailwind/react';

const CustomPopup = ({ open, message, severity, onClose, isSidebarCollapsed }) => {
    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                onClose();
            }, Math.min(5000, message.length * 100)); // Define o tempo com base na quantidade de caracteres da mensagem

            return () => clearTimeout(timer);
        }
    }, [open, onClose, message.length]);

    if (!open) return null;

    const getIcon = () => {
        if (severity === 'success') {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6"
                >
                    <path
                        fillRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        } else {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6"
                >
                    <path
                        fillRule="evenodd"
                        d="M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5zM11.25 7.5a.75.75 0 011.5 0v5.25a.75.75 0 01-1.5 0V7.5zm.75 9a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        }
    };

    const getAlertStyles = () => {
        if (severity === 'success') {
            return {
                border: 'border-[#2ec946]',
                background: 'bg-[#2ec946]/85', // Diminui ainda mais a transparência
                text: 'text-white' // Define a cor do texto como branca
            };
        } else {
            return {
                border: 'border-red-500',
                background: 'bg-red-500/85', // Diminui ainda mais a transparência
                text: 'text-white' // Define a cor do texto como branca
            };
        }
    };

    const styles = getAlertStyles();

    return (
        <div className={`fixed top-4 right-4 z-50 w-[40%]`}>
            <Alert
                icon={getIcon()}
                className={`border ${styles.border} ${styles.background} ${styles.text}`}
            >
                {message}
            </Alert>
        </div>
    );
};

export default CustomPopup;