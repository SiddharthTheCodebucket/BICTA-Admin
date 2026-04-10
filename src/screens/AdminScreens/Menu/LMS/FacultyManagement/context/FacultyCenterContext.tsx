import React, {createContext, useContext, useMemo, useState} from 'react';

type Center = {id: string; name: string} | null;

type FacultyCenterContextValue = {
  center: Center;
  setCenter: (center: Center) => void;
};

const FacultyCenterContext = createContext<FacultyCenterContextValue | null>(
  null,
);

export const FacultyCenterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [center, setCenter] = useState<Center>(null);

  const value = useMemo(() => ({center, setCenter}), [center]);

  return (
    <FacultyCenterContext.Provider value={value}>
      {children}
    </FacultyCenterContext.Provider>
  );
};

export const useFacultyCenter = () => {
  const ctx = useContext(FacultyCenterContext);
  if (!ctx) {
    throw new Error('useFacultyCenter must be used within FacultyCenterProvider');
  }
  return ctx;
};

