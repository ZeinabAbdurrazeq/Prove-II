import { Link } from "react-router";
import { useUser } from "@clerk/react";
import {
  ArrowLeftIcon,
  CompassIcon,
  HomeIcon,
  SearchXIcon,
  ShieldAlertIcon,
} from "lucide-react";

function NotFoundPage() {
  const { isSignedIn } = useUser();
  const secondaryLink = isSignedIn ? "/problems" : "/about";
  const secondaryText = isSignedIn ? "Explore problems" : "Learn about ProveIt";

  return (
    <div className="min-h-screen overflow-hidden bg-base-200 px-4 py-12 text-base-content">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-lg border border-base-300 bg-base-100 shadow-2xl">
          <div className="relative grid gap-10 p-8 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:p-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-lg bg-error/10 text-error shadow-sm">
                  <ShieldAlertIcon className="size-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-error">404</p>
                  <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Page not found</h1>
                </div>
              </div>

              <div className="max-w-2xl space-y-4">
                <p className="text-lg leading-8 text-base-content/70">
                  The route you opened is missing, moved, or no longer available. Head back to a trusted page and keep building from there.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to={isSignedIn ? "/dashboard" : "/"} className="btn btn-primary gap-2 rounded-full">
                    <HomeIcon className="size-4" />
                    {isSignedIn ? "Go to dashboard" : "Go home"}
                  </Link>
                  <Link to={secondaryLink} className="btn btn-outline gap-2 rounded-full">
                    <CompassIcon className="size-4" />
                    {secondaryText}
                  </Link>
                  <Link to="/pricing" className="btn btn-ghost gap-2 rounded-full">
                    <ArrowLeftIcon className="size-4" />
                    View pricing
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-base-300 bg-base-200/70 p-4">
                  <p className="text-sm font-semibold text-base-content">Check the URL</p>
                  <p className="mt-1 text-sm text-base-content/60">A small typo can send you off route.</p>
                </div>
                <div className="rounded-lg border border-base-300 bg-base-200/70 p-4">
                  <p className="text-sm font-semibold text-base-content">Return safely</p>
                  <p className="mt-1 text-sm text-base-content/60">Use dashboard or home to continue.</p>
                </div>
                <div className="rounded-lg border border-base-300 bg-base-200/70 p-4">
                  <p className="text-sm font-semibold text-base-content">Browse tasks</p>
                  <p className="mt-1 text-sm text-base-content/60">Jump back into practice problems.</p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center rounded-lg border border-error/20 bg-error/5 p-6">
              <div className="absolute inset-6 rounded-lg border border-dashed border-error/30" />
              <div className="relative text-center">
                <SearchXIcon className="mx-auto size-16 text-error" />
                <p className="mt-5 text-8xl font-black leading-none tracking-tight text-red-600 sm:text-9xl">404</p>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.28em] text-error">Route unavailable</p>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-base-content/65">
                  This address does not match a supported ProveIt page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
