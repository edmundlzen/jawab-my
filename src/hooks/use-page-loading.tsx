import React, { createContext, useContext, useEffect, useState } from "react";

const PageLoadingContext: any = createContext({
    pageLoading: false,
    setPageLoading: null,
});

export function PageLoadingProvider({ children }: { children: any }) {
    const [pageLoading, setPageLoading] = useState(false);
    const value = { pageLoading: pageLoading, setPageLoading: setPageLoading };
    return (
        <PageLoadingContext.Provider value={value}>
            {children}
        </PageLoadingContext.Provider>
    );
}

function usePageLoading() {
    const context: {
        pageLoading: boolean;
        setPageLoading: (pageLoading: boolean) => void | null;
    } = useContext(PageLoadingContext);
    if (!context) {
        throw new Error("usePageLoading must be used within pageLoadingProvider");
    }
    return context;
}

export default usePageLoading;
