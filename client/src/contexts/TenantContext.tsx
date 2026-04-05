import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TenantContextType {
  tenantId: string | null;
  setTenantId: (tenantId: string) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  // Recuperar tenant do localStorage ao inicializar
  useEffect(() => {
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      setTenantIdState(storedTenantId);
    }
  }, []);

  const setTenantId = (newTenantId: string) => {
    setTenantIdState(newTenantId);
    localStorage.setItem('tenantId', newTenantId);
  };

  const value: TenantContextType = {
    tenantId,
    setTenantId,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant deve ser usado dentro de um TenantProvider');
  }
  return context;
};
