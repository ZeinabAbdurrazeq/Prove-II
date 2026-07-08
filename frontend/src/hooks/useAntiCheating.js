import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";

export default function useAntiCheating({ onTerminate }) {
  const [warnings, setWarnings] = useState(0);
  const maxWarnings = 3;

  // We use refs to avoid re-triggering effects if these values change
  const warningsRef = useRef(warnings);
  const onTerminateRef = useRef(onTerminate);
  // Prevent multiple warnings for the same event in quick succession
  const lastWarningTimeRef = useRef(0);

  useEffect(() => {
    warningsRef.current = warnings;
  }, [warnings]);

  useEffect(() => {
    onTerminateRef.current = onTerminate;
  }, [onTerminate]);

  const triggerWarning = useCallback((reason) => {
    const now = Date.now();
    // Debounce warnings by 2 seconds
    if (now - lastWarningTimeRef.current < 2000) return;
    lastWarningTimeRef.current = now;

    const newWarnings = warningsRef.current + 1;
    setWarnings(newWarnings);
    console.warn(`Anti-Cheating Warning (${newWarnings}/${maxWarnings}): ${reason}`);

    // Show professional toast for the warning
    toast.error(reason, {
      icon: "⚠️",
      duration: 4000,
      style: { border: "1px solid #ef4444", padding: "16px", color: "#fff", background: "#333" }
    });

    if (newWarnings >= maxWarnings) {
      if (onTerminateRef.current) {
        onTerminateRef.current("Maximum warnings reached. Interview terminated.");
      }
    }
  }, [maxWarnings]);

  const requestFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request denied or not supported:", err);
      });
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen().catch(() => {});
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerWarning("Tab switched or window minimized.");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        triggerWarning("Exited fullscreen mode.");
      }
    };

    // Attach event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, [triggerWarning]);

  return {
    warnings,
    maxWarnings,
    requestFullscreen,
    triggerWarning,
  };
}
