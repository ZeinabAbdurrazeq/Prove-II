import { Link } from "react-router";

function LogoMark({ compact }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#F3E4C9] text-[#0A2947] ${
        compact ? "size-10" : "size-12"
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 128 128"
        className={compact ? "size-8" : "size-10"}
        fill="none"
      >
        <path
          d="M55 15A50 50 0 0 0 23 100"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M73 15A50 50 0 0 1 105 100"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M50 108A50 50 0 0 0 56 111"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M78 111A50 50 0 0 0 84 108"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <circle cx="64" cy="16" r="6" fill="currentColor" />
        <circle cx="56" cy="111" r="4" fill="currentColor" />
        <circle cx="64" cy="111" r="4" fill="currentColor" />
        <circle cx="72" cy="111" r="4" fill="currentColor" />
        <path
          d="M48 48 32 64l16 16"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M80 48 96 64 80 80"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M70 39 58 89"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function BrandLogo({ compact = false, className = "" }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-3 transition-transform duration-200 hover:scale-[1.03] ${className}`}
      aria-label="ProveIt home"
    >
      <LogoMark compact={compact} />
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-extrabold tracking-wider text-base-content">
            ProveIt
          </span>
          <span className="mt-1 text-xs font-medium text-base-content/60">
            Code Together
          </span>
        </div>
      )}
    </Link>
  );
}

export default BrandLogo;
