import { useState, useEffect } from 'react';

const useAuthorizedEmails = () => {
  const [authorizedEmails, setAuthorizedEmails] = useState([]);

  useEffect(() => {
    // Buscar os emails autorizados de uma API ou defini-los estaticamente
    const fetchAuthorizedEmails = async () => {
      // Exemplo de emails estáticos
      const emails = ['authorized@example.com', 'user@example.com'];
      setAuthorizedEmails(emails);

      // Descomente e modifique as linhas abaixo para buscar de uma API
      // const response = await fetch('/api/authorized-emails');
      // const data = await response.json();
      // setAuthorizedEmails(data);
    };

    fetchAuthorizedEmails();
  }, []);

  return authorizedEmails;
};

export default useAuthorizedEmails;