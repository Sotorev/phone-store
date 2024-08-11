'use client';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthContext from '@/hooks/auth-context';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLogged, setIsLogged] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLogged) {
      const token = localStorage.getItem('token');
      if (token) {

        setIsLogged(true);
      } else
      router.push('/login'); // Redirect to the login page
    }
  }, [isLogged, router]);

  const login = () => {
    setIsLogged(true);
  };

  const logout = () => {
    const response = fetch('http://localhost:3001/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    setIsLogged(false);
    // Remove token from localStorage
    localStorage.removeItem('token');
  };
  return (

    <AuthContext.Provider value={{ isLogged, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;