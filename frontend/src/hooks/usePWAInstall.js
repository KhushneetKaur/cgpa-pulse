import { useState, useEffect } from "react";
import { apiRecordAppInstall } from "../services/user.api.js";

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Helper to record install event safely 
  const recordInstall = (platformOverride) => {
    const alreadyRecorded = localStorage.getItem("pwa_install_recorded");
    if (alreadyRecorded) return;

    const ua = navigator.userAgent;
    let platform = platformOverride;

    if (!platform) {
      if (/iphone|ipad|ipod/i.test(ua)) platform = "ios";
      else if (/android/i.test(ua)) platform = "android";
      else platform = "desktop";
    }

    apiRecordAppInstall(platform)
      .then(() => {
        localStorage.setItem("pwa_install_recorded", "true");
        console.log(`📊 Recorded app install for platform: ${platform}`);
      })
      .catch((err) => {
        console.error("⚠️ Failed to record app install:", err);
      });
  };

  useEffect(() => {
    // 1. Standalone / Installed Check (Android + iOS)
    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        new URLSearchParams(window.location.search).get("mode") === "pwa";

      setIsInstalled(standalone);

      // If opened in standalone mode, record launch if not previously logged
      if (standalone) {
        recordInstall();
      } else {
    localStorage.removeItem("pwa_install_recorded");
  }
    };

    checkStandalone();

    // 2. iOS & iPadOS detection (Includes modern iPad Safari desktop mode)
    const isIosDevice =
      (/iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
      !window.MSStream;

    setIsIOS(isIosDevice);

    // Mark initial state as evaluated
    setIsReady(true);

    // 3. Capture event (Android / Chromium)
    function onBeforeInstall(e) {
      e.preventDefault();
      console.log("✅ beforeinstallprompt captured!");
      setInstallPrompt(e);
      setIsInstalled(false);
    }

    // 4. Native App Installed listener
    function onAppInstalled() {
      console.log("🎉 App was successfully installed!");
      setIsInstalled(true);
      setInstallPrompt(null);

      // Record native event installation
      const platform = /android/i.test(navigator.userAgent) ? "android" : "desktop";
      recordInstall(platform);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function triggerInstall() {
    console.log("Trigger install clicked. Prompt exists:", !!installPrompt);

    if (!installPrompt) {
      console.warn("⚠️ Cannot trigger native prompt: Chrome event not captured.");
      return false;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      console.log("User install choice outcome:", choiceResult.outcome);

      setInstallPrompt(null);

      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        // Note: 'appinstalled' listener will also fire and trigger recordInstall()
        return true;
      }
      return false;
    } catch (err) {
      console.error("❌ Error triggering install prompt:", err);
      setInstallPrompt(null);
      return false;
    }
  }

  // Show button UI once initial checks pass and app isn't running installed
  const canInstall = isReady && !isInstalled;

  return {
    canInstall,
    isInstalled,
    isIOS,
    triggerInstall,
    hasPrompt: !!installPrompt,
  };
}