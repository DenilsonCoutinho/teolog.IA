'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ResizeContextProps {
  setInnerWidth: React.Dispatch<React.SetStateAction<number>>;
  setInnerHeight: React.Dispatch<React.SetStateAction<number>>;
  innerHeight: number;
  innerWidth: number;
}

const ResizeContext = createContext<ResizeContextProps | undefined>(undefined);

export const ResizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [innerWidth, setInnerWidth] = useState<number>(0);
  const [innerHeight, setInnerHeight] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      setInnerWidth(window.innerWidth);
      setInnerHeight(window.innerHeight);
    };

    // set valores iniciais
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ResizeContext.Provider value={{ innerWidth, innerHeight, setInnerWidth, setInnerHeight }}>
      {children}
    </ResizeContext.Provider>
  );
};

export const useResize = () => {
  const context = useContext(ResizeContext);
  if (context === undefined) {
    throw new Error('useResize must be used within a ResizeProvider');
  }
  return context;
};
