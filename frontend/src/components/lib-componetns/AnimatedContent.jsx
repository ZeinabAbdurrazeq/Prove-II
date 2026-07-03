import { useRef } from "react";
import { motion, useInView } from "motion/react";

const MotionDiv = motion.div;

/**
 * AnimatedContent – scroll-triggered fade-in / slide-up wrapper.
 * Uses Framer Motion's useInView to animate children when they enter the viewport.
 */
export default function AnimatedContent({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <MotionDiv
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </MotionDiv>
  );
}
