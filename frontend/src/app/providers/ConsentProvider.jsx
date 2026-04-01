import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "privacyConsentChoice";

const ConsentContext = createContext({
  consent: null,
  setConsent: () => {},
});

export const ConsentProvider = ({ children }) => {
  const [consent, setConsent] = useState(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "accepted" || stored === "declined" ? stored : null;
  });

  useEffect(() => {
    if (consent === null) return;
    window.localStorage.setItem(STORAGE_KEY, consent);
  }, [consent]);

  return (
    <ConsentContext.Provider value={{ consent, setConsent }}>
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = () => useContext(ConsentContext);
