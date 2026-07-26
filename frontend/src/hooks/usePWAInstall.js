import { useState, useEffect } from "react";

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Initial Standalone Check (Android + iOS)
    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsInstalled(standalone);
    };

    checkStandalone();

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
      // If beforeinstallprompt fires, the app is NOT installed!
      setIsInstalled(false); 
    }

    // 4. App installed listener
    function onAppInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
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