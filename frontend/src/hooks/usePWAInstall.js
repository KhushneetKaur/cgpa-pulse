import { useState, useEffect } from "react";

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Initial Standalone Check (Android + iOS)
    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        new URLSearchParams(window.location.search).get("mode") === "pwa";

      setIsInstalled(standalone);
    };

    checkStandalone();

    // 2. iOS & iPadOS detection
    const isIosDevice =
      (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
      !window.MSStream;

    setIsIOS(isIosDevice);

    // Mark initial checks complete
    setIsReady(true);

    // 3. Capture event (Android / Chromium)
    function onBeforeInstall(e) {
      e.preventDefault();
      console.log("✅ beforeinstallprompt fired and captured!");
      setInstallPrompt(e);
      setIsInstalled(false);
    }

    // 4. App installed listener
    function onAppInstalled() {
      console.log("🎉 App was successfully installed!");
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
    console.log("Trigger install clicked. Prompt object exists:", !!installPrompt);

    if (!installPrompt) {
      console.warn("⚠️ Cannot trigger native prompt: Chrome event not captured.");
      return false;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      console.log("User choice:", choiceResult.outcome);

      setInstallPrompt(null);

      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("❌ Error while triggering install prompt:", err);
      setInstallPrompt(null);
      return false;
    }
  }

  // Allow showing button if not installed (even before prompt fires, so button doesn't jump/hide)
  const canInstall = isReady && !isInstalled;

  return {
    canInstall,
    isInstalled,
    isIOS,
    triggerInstall,
    hasPrompt: !!installPrompt,
  };
}