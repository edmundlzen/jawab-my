import React, { createContext, useContext, useEffect, useState } from "react";

const LoadingContext: any = createContext({
  loading: false,
  setLoading: null,
});

export function LoadingProvider({ children }: { children: any }) {
  const [loading, setLoading] = useState(false);
  const value = { loading, setLoading };
  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}

export function useLoading() {
  const context: {
    loading: boolean;
    setLoading: (loading: boolean) => void | null;
  } = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}

export default useLoading;
