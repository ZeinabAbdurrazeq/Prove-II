import { Link } from "react-router";
import { useUser } from "@clerk/react";
import { ArrowLeftIcon, HomeIcon, SparklesIcon } from "lucide-react";

function NotFoundPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-base-300 px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body gap-8 p-8 lg:p-12">
            <div className="flex items-center gap-3">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent shadow-lg">
                <SparklesIcon className="size-7 text-white" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-base-content/50">Provelt</p>
                <h1 className="text-3xl font-black tracking-tight">Page not found</h1>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-5">
                <p className="text-lg leading-8 text-base-content/70">
                  The page you opened does not exist or was moved. Use the links below to get back to a valid page.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link to={isSignedIn ? "/dashboard" : "/"} className="btn btn-primary gap-2 rounded-full">
                    {isSignedIn ? "Go to dashboard" : "Go home"}
                    <HomeIcon className="size-4" />
                  </Link>
                  <Link to="/pricing" className="btn btn-outline gap-2 rounded-full">
                    <ArrowLeftIcon className="size-4" />
                    Pricing
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl bg-base-200 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-base-content/50">404</p>
                <p className="mt-3 text-7xl font-black tracking-tight text-primary">404</p>
                <p className="mt-3 text-base-content/70">
                  If you expected this route to work, check the URL or return to a supported page.
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
