import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Unauthorized from '@/components/Unauthorized/Unauthorized';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const { emails } = props;

    useEffect(() => {
      if (!loading && !isAuthenticated()) {
        router.push('/'); // Redireciona para a página de login se não autenticado
      }
    }, [loading, isAuthenticated, router]);

    if (loading) {
      return <p>Carregando...</p>;
    }

    if (!isAuthenticated()) {
      return null;
    }

    if (emails) {
      const userEmail = (user?.mail || user?.userPrincipalName)?.toLowerCase();
      const normalizedAuthorizedEmails = emails.map(email => email.toLowerCase());
      if (!normalizedAuthorizedEmails.includes(userEmail)) {
        return <Unauthorized />;
      }
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;