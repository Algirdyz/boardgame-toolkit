import { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface NavbarContextType {
  setNavbarContent: (content: ReactNode | null) => void;
  navbarContent: ReactNode | null;
}

const NavbarContentContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarContentProvider({ children }: { children: ReactNode }) {
  const [navbarContent, setNavbarContent] = useState<ReactNode | null>(null);

  const memoizedSetNavbarContent = useCallback((content: ReactNode | null) => {
    setNavbarContent(content);
  }, []);

  return (
    <NavbarContentContext.Provider value={{ navbarContent, setNavbarContent: memoizedSetNavbarContent }}>
      {children}
    </NavbarContentContext.Provider>
  );
}

export function useNavbarContent() {
  const context = useContext(NavbarContentContext);
  if (context === undefined) {
    throw new Error('useNavbarContent must be used within a NavbarContentProvider');
  }
  return context;
}