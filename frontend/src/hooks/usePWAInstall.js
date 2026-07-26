import { useState, useEffect } from "react";

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Standalone check (Android + iOS)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone
    ) {
      setIsInstalled(true);
      return;
    }

    // 2. iOS & iPadOS detection
    const isIosDevice =
      (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
      !window.MSStream;
    
    setIsIOS(isIosDevice);

    // 3. Capture event (Android / Chromium)
    function onBeforeInstall(e) {
      e.preventDefault();
      setInstallPrompt(e);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // 4. App installed listener
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function triggerInstall() {
    if (!installPrompt) return false;

    // Show native prompt
    await installPrompt.prompt();
    
    // Wait for user interaction
    const choiceResult = await installPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      setInstallPrompt(null);
      setIsInstalled(true);
      return true;
    }

    return false;
  }

  const canInstall = !isInstalled && (!!installPrompt || isIOS);

  return { canInstall, isInstalled, isIOS, triggerInstall };
}