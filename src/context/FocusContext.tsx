'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FocusContextType {
  isFocusMode: boolean;
  setFocusMode: (focus: boolean) => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [isFocusMode, setFocusMode] = useState(false);

  return (
    <FocusContext.Provider value={{ isFocusMode, setFocusMode }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocus must be used within a FocusProvider');
  }
  return context;
}
