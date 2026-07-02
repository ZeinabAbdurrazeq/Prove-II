import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useUser, UserButton } from "@clerk/react";
import {
  BookOpenIcon,
  CalendarClockIcon,
  CalendarPlusIcon,
  CreditCardIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LanguagesIcon,
  MailIcon,
  MenuIcon,
  MicIcon,
  XIcon,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import ThemeSwitcher from "./ThemeSwitcher";
import BrandLogo from "./BrandLogo";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function Navbar() {
  const location = useLocation();
  const { isLoaded, isSignedIn, user } = useUser();
  const { language, toggle } = useLanguage();
  const t = getTranslator(language);
  const [mobileOpen, setMobileOpen] = useState(false);
  const adminDashboardUrl =
    import.meta.env.VITE_ADMIN_DASHBOARD_URL ||
    "https://proveit-dashboard-qq9q6.sevalla.page";
  const adminEmail =
    import.meta.env.VITE_ADMIN_EMAIL || "provelt.administrator@gmail.com";
  const isAdminUser =
    isLoaded &&
    isSignedIn &&
    user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ===
      adminEmail.trim().toLowerCase();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { to: "/problems", label: t("nav.problems"), icon: BookOpenIcon },
    {
      to: "/availability/settings",
      label: t("nav.availability"),
      icon: CalendarClockIcon,
    },
    { to: "/ai-interview", label: t("nav.aiInterview"), icon: MicIcon },
    { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboardIcon },
    { to: "/schedule", label: t("nav.schedule"), icon: CalendarPlusIcon },
    { to: "/invitations", label: t("nav.invitations"), icon: MailIcon },
    { to: "/subscription", label: t("nav.subscription"), icon: CreditCardIcon },
  ];

  const publicLinks = [
    { to: "/", label: t("marketing.home") },
    { to: "/blog", label: t("marketing.blog") },
    { to: "/pricing", label: t("marketing.pricing") },
    { to: "/contact", label: t("marketing.contact") },
    { to: "/about", label: t("marketing.about") },
  ];

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b border-base-300/60 bg-base-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl">
      <div className="flex w-full items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <BrandLogo />

        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <div className="flex w-full min-w-0 items-center justify-center gap-1 rounded-2xl border border-base-300/70 bg-base-200/30 p-1 shadow-sm">
            {navItems.map((item) => {
              const NavIcon = item.icon;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-all duration-200 sm:text-[11px] lg:text-[12px] xl:text-sm ${
                    isActive(item.to)
                      ? "bg-primary text-primary-content shadow-sm"
                      : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                  }`}
                >
                  <NavIcon className="size-3 shrink-0 lg:size-4" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="ms-auto hidden items-center gap-1.5 lg:flex">
          <button
            onClick={toggle}
            className="btn btn-ghost btn-sm gap-1.5 rounded-xl px-2 text-base-content/70 hover:text-base-content md:px-2.5"
            title={t("nav.toggleLanguage")}
          >
            <LanguagesIcon className="size-4" />
            <span className="text-sm font-semibold">
              {language === "en" ? "AR" : "EN"}
            </span>
          </button>

          <ThemeSwitcher />
          <NotificationBell />

          <details className="dropdown dropdown-end">
            <summary
              className="btn btn-ghost btn-sm size-8 rounded-xl p-0 text-base-content/70 hover:text-base-content"
              aria-label="Public pages"
              title="Public pages"
            >
              <HomeIcon className="size-4" />
            </summary>
            <ul className="menu dropdown-content z-[1000] mt-3 w-48 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl">
              {publicLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </details>

          {isAdminUser ? (
            <a
              href={adminDashboardUrl}
              className="btn btn-primary btn-sm gap-1 rounded-xl px-2 text-[11px] text-primary-content shadow-sm transition-transform duration-200 hover:scale-[1.02] md:w-7 md:justify-center md:px-0 lg:w-8 xl:w-auto xl:px-3"
            >
              <LayoutDashboardIcon className="size-4" />
              <span className="hidden xl:inline">
                {t("nav.adminDashboard")}
              </span>
            </a>
          ) : null}

          <div className="flex items-center rounded-full border border-base-300 bg-base-100 p-1 shadow-sm">
            <UserButton />
          </div>
        </div>

        <div className="ms-auto flex items-center gap-1.5 lg:hidden">
          <button
            onClick={toggle}
            className="btn btn-ghost btn-sm gap-1 rounded-xl px-2 text-base-content/70 hover:text-base-content"
            title={t("nav.toggleLanguage")}
          >
            <LanguagesIcon className="size-4" />
            <span className="text-sm font-semibold">
              {language === "en" ? "AR" : "EN"}
            </span>
          </button>

          <ThemeSwitcher />
          <NotificationBell />

          <div className="flex items-center rounded-full border border-base-300 bg-base-100 p-1 shadow-sm">
            <UserButton />
          </div>

          <button
            className="btn btn-ghost btn-sm rounded-xl px-2"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <XIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed right-4 top-20 z-[999] w-[55vw] max-w-[20rem] rounded-3xl border border-base-300/70 bg-base-100/98 shadow-2xl backdrop-blur-xl lg:hidden">
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-1 gap-2">
              {navItems.map((item) => {
                const NavIcon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition-all ${
                      isActive(item.to)
                        ? "border-primary bg-primary text-primary-content shadow-sm"
                        : "border-base-300 bg-base-200/40 text-base-content/80 hover:bg-base-200"
                    }`}
                  >
                    <NavIcon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div>
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/45">
                Public pages
              </p>
              <div className="grid grid-cols-1 gap-2">
                {publicLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-all ${
                      isActive(link.to)
                        ? "border-primary bg-primary text-primary-content shadow-sm"
                        : "border-base-300 bg-base-200/40 text-base-content/80 hover:bg-base-200"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {isAdminUser ? (
              <a
                href={adminDashboardUrl}
                className="btn btn-primary btn-sm gap-1 rounded-xl px-2 text-[11px] text-primary-content shadow-sm w-full justify-center"
              >
                <LayoutDashboardIcon className="size-4" />
                <span>{t("nav.adminDashboard")}</span>
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
export default Navbar;
