import React, { createContext, useContext, useState, useEffect } from 'react';

const ExpertContext = createContext(null);

export const useExpert = () => useContext(ExpertContext);

export function ExpertProvider({ children }) {
  const [expert, setExpert] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const storedToken = localStorage.getItem('expert_token');
    const storedExpert = localStorage.getItem('expert_data');
    
    if (storedToken && storedExpert) {
      setToken(storedToken);
      try {
        setExpert(JSON.parse(storedExpert));
      } catch (e) {
        console.error('Failed to parse expert data');
      }
    }
    setLoading(false);
  }, []);

  const login = (tokenData, expertData) => {
    localStorage.setItem('expert_token', tokenData);
    localStorage.setItem('expert_data', JSON.stringify(expertData));
    setToken(tokenData);
    setExpert(expertData);
  };

  const logout = () => {
    localStorage.removeItem('expert_token');
    localStorage.removeItem('expert_data');
    setToken(null);
    setExpert(null);
  };

  const isAdmin = expert?.role === 'admin' || expert?.role === 'super_admin';
  const isSuperAdmin = expert?.role === 'super_admin';

  return (
    <ExpertContext.Provider value={{
      expert,
      token,
      loading,
      login,
      logout,
      isAdmin,
      isSuperAdmin,
      isAuthenticated: !!token
    }}>
      {children}
    </ExpertContext.Provider>
  );
}
