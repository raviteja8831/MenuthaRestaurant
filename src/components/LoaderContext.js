import React, { createContext, useState, useContext } from 'react';

const LoaderContext = createContext({ loading: false, setLoading: () => {} });


let externalSetLoading = null;

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  // Expose setLoading for use outside React tree
  React.useEffect(() => {
    externalSetLoading = setLoading;
    return () => { externalSetLoading = null; };
  }, []);
  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const setGlobalLoading = (val) => {
  if (externalSetLoading) externalSetLoading(val);
};

export const useLoader = () => useContext(LoaderContext);
