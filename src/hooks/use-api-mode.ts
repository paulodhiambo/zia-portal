import { useState, useEffect } from "react";

const EVENT_NAME = "zia-api-mode-change";

export function useApiMode() {
  const [isMockMode, setIsMockMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("zia_api_mode");
    if (stored === "live") return false;
    if (stored === "mock") return true;
    return import.meta.env.VITE_API_MODE !== "live";
  });

  const setApiMode = (mode: "mock" | "live") => {
    localStorage.setItem("zia_api_mode", mode);
    setIsMockMode(mode === "mock");
    window.dispatchEvent(new Event(EVENT_NAME));
  };

  useEffect(() => {
    const handleEvent = () => {
      const stored = localStorage.getItem("zia_api_mode");
      if (stored === "live") {
        setIsMockMode(false);
      } else if (stored === "mock") {
        setIsMockMode(true);
      } else {
        setIsMockMode(import.meta.env.VITE_API_MODE !== "live");
      }
    };
    window.addEventListener(EVENT_NAME, handleEvent);
    return () => {
      window.removeEventListener(EVENT_NAME, handleEvent);
    };
  }, []);

  return { isMockMode, setApiMode };
}
