import { Link } from "react-router";

function LogoMark({ compact }) {
  return (
    <img
      src="/proveit-logo.png"
      alt=""
      className={`shrink-0 rounded-2xl object-contain ${
        compact ? "size-10" : "size-12"
      }`}
      aria-hidden="true"
    />
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
