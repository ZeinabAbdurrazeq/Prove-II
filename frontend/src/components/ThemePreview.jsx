import React from "react";

export function ThemePreview({ themeId }) {
  return (
    <div
      data-theme={themeId}
      className="inline-flex items-center gap-1 rounded bg-base-100 p-1 border border-base-300/40 shadow-xs"
    >
      <span className="h-3 w-1.5 rounded-xs bg-primary" title="Primary"></span>
      <span className="h-3 w-1.5 rounded-xs bg-secondary" title="Secondary"></span>
      <span className="h-3 w-1.5 rounded-xs bg-accent" title="Accent"></span>
      <span className="h-3 w-1.5 rounded-xs bg-neutral" title="Neutral"></span>
    </div>
  );
}

export default ThemePreview;
