import { useEffect, useState } from "react";

function RotatingText({ texts, className = "" }) {
  const safeTexts = texts.filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (safeTexts.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % safeTexts.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [safeTexts.length]);

  return (
    <span className={`inline-flex max-w-full overflow-hidden ${className}`}>
      <span className="block max-w-full break-words transition-opacity duration-300">
        {safeTexts[index] || ""}
      </span>
    </span>
  );
}

export default RotatingText;
