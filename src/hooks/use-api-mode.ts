import { useState, useEffect } from "react";

const EVENT_NAME = "zia-api-mode-change";

export function useApiMode() {
  const [isMockMode, setIsMockMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    
    const envMode = import.meta.env.VITE_API_MODE || "mock";
    const lastEnvMode = localStorage.getItem("zia_api_mode_env");
    
    // If VITE_API_MODE changed in .env, reset local storage to match the new env configuration
    if (lastEnvMode !== envMode) {
      localStorage.setItem("zia_api_mode_env", envMode);
      localStorage.setItem("zia_api_mode", envMode);
      return envMode === "mock";
    }

    const stored = localStorage.getItem("zia_api_mode");
    if (stored === "live") return false;
    if (stored === "mock") return true;
    return envMode === "mock";
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
