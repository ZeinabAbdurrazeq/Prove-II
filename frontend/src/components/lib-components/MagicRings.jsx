function MagicRings() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {Array.from({ length: 8 }).map((_, index) => (
        <span
          key={index}
          className="absolute aspect-square rounded-full border border-primary/25"
          style={{
            width: `${18 + index * 12}rem`,
            animation: `proveit-ring-pulse ${7 + index}s ease-in-out infinite`,
            animationDelay: `${index * 0.3}s`,
          }}
        />
      ))}
      <span className="absolute h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <style>
        {`
          @keyframes proveit-ring-pulse {
            0%, 100% { transform: scale(0.96) rotate(0deg); opacity: 0.28; }
            50% { transform: scale(1.04) rotate(8deg); opacity: 0.58; }
          }
        `}
      </style>
    </div>
  );
}

export default MagicRings;
