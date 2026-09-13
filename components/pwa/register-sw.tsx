"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const mode =
      process.env.NODE_ENV === "production" ? "production" : "development";
    const scriptUrl = `/sw.js?mode=${mode}`;

    const register = () => {
      navigator.serviceWorker
        .register(scriptUrl, { scope: "/", updateViaCache: "none" })
        .catch((error) => {
          console.error("No se pudo registrar el service worker:", error);
        });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
