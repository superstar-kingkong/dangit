import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ContentContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <ContentContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </ContentContext.Provider>
  );
}

export const useContentRefresh = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContentRefresh must be used within a ContentProvider');
  }
  return context;
};