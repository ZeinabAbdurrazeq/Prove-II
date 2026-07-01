import { Link, useLocation } from "react-router";
import { ArrowRightIcon, LanguagesIcon } from "lucide-react";
import { SignInButton, useUser } from "@clerk/react";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";
import Navbar from "./Navbar";
import ThemeSwitcher from "./ThemeSwitcher";
import BrandLogo from "./BrandLogo";

// Shared top navigation for the public marketing pages (Home, About, Contact,
// Pricing). Includes the EN/AR language toggle so visitors can switch language
// before signing in, matching the rest of the app.
function MarketingNav() {
  const location = useLocation();
  const { isSignedIn } = useUser();
  const { language, toggle } = useLanguage();
  const t = getTranslator(language);

  if (isSignedIn) {
    return <Navbar />;
  }

  const isActive = (path) => location.pathname === path;

  const links = [
    { to: "/", label: t("marketing.home") },
    { to: "/about", label: t("marketing.about") },
    { to: "/blog", label: t("marketing.blog") },
    { to: "/pricing", label: t("marketing.pricing") },
    { to: "/contact", label: t("marketing.contact") },
  ];

  return (
    <nav className="bg-base-100/80 backdrop-blur-md border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto p-4 flex items-center gap-4 rtl:flex-row-reverse">
        <BrandLogo className="rtl:flex-row-reverse" />

        {/* LINKS (centered, fills the space between logo and actions) */}
        <div className="hidden md:flex items-center justify-center gap-1 flex-1 rtl:flex-row-reverse">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                isActive(link.to)
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ACTIONS (far end) */}
        <div className="flex items-center gap-2 ms-auto md:ms-0 rtl:flex-row-reverse">
          <button
            onClick={toggle}
            className="px-3 py-2.5 rounded-lg hover:bg-base-200 text-base-content/70 hover:text-base-content transition-all duration-200"
            title={t("nav.toggleLanguage")}
          >
            <div className="flex items-center gap-x-1.5">
              <LanguagesIcon className="size-4" />
              <span className="font-bold text-sm">
                {language === "en" ? "AR" : "EN"}
              </span>
            </div>
          </button>

          <ThemeSwitcher />

          <SignInButton mode="modal">
            <button className="group px-5 py-2.5 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 rtl:flex-row-reverse">
              <span>{t("marketing.getStarted")}</span>
              <ArrowRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
            </button>
          </SignInButton>
        </div>
      </div>
    </nav>
  );
}

export default MarketingNav;
