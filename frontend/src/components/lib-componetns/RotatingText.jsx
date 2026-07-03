import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const MotionSpan = motion.span;

/**
 * RotatingText – cycles through an array of words/phrases with per-character
 * staggered spring animations (enter from bottom, exit to top).
 */
export default function RotatingText({
  texts = [],
  mainClassName = "",
  splitLevelClassName = "overflow-hidden",
  staggerFrom = "last",
  staggerDuration = 0.02,
  initial = { y: "100%" },
  animate = { y: 0 },
  exit = { y: "-120%" },
  transition = { type: "spring", damping: 25, stiffness: 300 },
  rotationInterval = 2200,
  splitBy = "characters",
  auto = true,
  loop = true,
}) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  const advance = useCallback(() => {
    setIndex((prev) => {
      if (loop) return (prev + 1) % texts.length;
      return Math.min(prev + 1, texts.length - 1);
    });
  }, [texts.length, loop]);

  useEffect(() => {
    if (!auto || texts.length <= 1) return;
    intervalRef.current = setInterval(advance, rotationInterval);
    return () => clearInterval(intervalRef.current);
  }, [auto, advance, rotationInterval, texts.length]);

  const current = texts[index] || "";
  const chars = splitBy === "characters" ? current.split("") : current.split(" ");

  const getDelay = (i, total) => {
    if (staggerFrom === "last") return (total - 1 - i) * staggerDuration;
    if (staggerFrom === "first") return i * staggerDuration;
    const mid = Math.floor(total / 2);
    return Math.abs(i - mid) * staggerDuration;
  };

  return (
    <span className={mainClassName} aria-label={current}>
      <AnimatePresence mode="wait">
        <MotionSpan
          key={index}
          className="inline-flex"
          aria-hidden
        >
          {chars.map((char, i) => (
            <span key={`${index}-${i}`} className={splitLevelClassName}>
              <MotionSpan
                className="inline-block"
                initial={initial}
                animate={animate}
                exit={exit}
                transition={{
                  ...transition,
                  delay: getDelay(i, chars.length),
                }}
              >
                {char === " " ? "\u00A0" : char}
              </MotionSpan>
            </span>
          ))}
        </MotionSpan>
      </AnimatePresence>
    </span>
  );
}
