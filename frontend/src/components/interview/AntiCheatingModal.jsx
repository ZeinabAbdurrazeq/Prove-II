import React, { useEffect, useState } from "react";
import { AlertTriangleIcon } from "lucide-react";

export default function AntiCheatingModal({ warnings, maxWarnings }) {
  const [show, setShow] = useState(false);
  const [prevWarnings, setPrevWarnings] = useState(warnings);

  useEffect(() => {
    if (warnings > prevWarnings && warnings < maxWarnings) {
      setShow(true);
      setPrevWarnings(warnings);
    }
  }, [warnings, prevWarnings, maxWarnings]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-base-300/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-warning/20 bg-base-100 shadow-2xl">
        <div className="flex items-center gap-4 border-b border-base-200 bg-warning/10 p-5">
          <div className="flex size-12 items-center justify-center rounded-full bg-warning/20 text-warning">
            <AlertTriangleIcon className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Suspicious Activity Detected</h2>
            <p className="text-sm text-base-content/60">
              Warning {warnings} of {maxWarnings}
            </p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm leading-relaxed text-base-content/80">
            Please remain in fullscreen mode and avoid switching tabs or minimizing the window. Repeated violations will result in the immediate termination of this interview.
          </p>
          <div className="mt-6 flex justify-end">
            <button
              className="btn btn-warning"
              onClick={() => {
                setShow(false);
                // Optionally request fullscreen again
                if (typeof document !== "undefined" && !document.fullscreenElement) {
                  const elem = document.documentElement;
                  if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
                }
              }}
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
