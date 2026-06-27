import { useState, useEffect } from "react";

const EVENT_NAME = "zia-api-mode-change";

export function useApiMode() {
  const [isMockMode, setIsMockMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("zia_api_mode") !== "live";
  });

  const setApiMode = (mode: "mock" | "live") => {
    localStorage.setItem("zia_api_mode", mode);
    setIsMockMode(mode === "mock");
    window.dispatchEvent(new Event(EVENT_NAME));
  };

  useEffect(() => {
    const handleEvent = () => {
      setIsMockMode(localStorage.getItem("zia_api_mode") !== "live");
    };
    window.addEventListener(EVENT_NAME, handleEvent);
    return () => {
      window.removeEventListener(EVENT_NAME, handleEvent);
    };
  }, []);

  return { isMockMode, setApiMode };
}
