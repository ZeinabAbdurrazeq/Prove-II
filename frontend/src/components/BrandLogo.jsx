import { Link } from "react-router";

function LogoMark({ compact, small }) {
  return (
    <img
      src="/proveit-logo.png"
      alt=""
      className={`shrink-0 rounded-2xl object-contain ${
        compact ? "size-10" : small ? "size-8" : "size-12"
      }`}
      aria-hidden="true"
    />
  );
}

function BrandLogo({
  compact = false,
  className = "",
  showTagline = true,
  small = false,
}) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2 transition-transform duration-200 hover:scale-[1.03] ${
        small ? "gap-1.5" : "gap-3"
      } ${className}`}
      aria-label="ProveIt home"
    >
      <LogoMark compact={compact} small={small} />
      {!compact && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-extrabold tracking-wider text-base-content ${
              small ? "text-base" : "text-xl"
            }`}
          >
            ProveIt
          </span>
          {showTagline ? (
            <span className="mt-1 text-xs font-medium text-base-content/60">
              Code Together
            </span>
          ) : null}
        </div>
      )}
    </Link>
  );
}

export default BrandLogo;
