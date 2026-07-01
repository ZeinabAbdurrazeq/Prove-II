import { Link } from "react-router";
import { useUser } from "@clerk/react";
import {
  ArrowRightIcon,
  GlobeIcon,
  LinkIcon,
  MailIcon,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";
import BrandLogo from "./BrandLogo";

function SiteFooter() {
  const { isSignedIn } = useUser();
  const { language } = useLanguage();
  const t = getTranslator(language);

  const publicLinks = [
    { label: t("marketing.home"), to: "/" },
    { label: t("marketing.pricing"), to: "/pricing" },
    { label: t("marketing.about"), to: "/about" },
    { label: t("marketing.blog"), to: "/blog" },
    { label: t("marketing.contact"), to: "/contact" },
  ];

  const appLinks = [
    { label: t("marketing.home"), to: "/" },
    { label: t("marketing.blog"), to: "/blog" },
    { label: t("marketing.pricing"), to: "/pricing" },
    { label: t("marketing.about"), to: "/about" },
    { label: t("marketing.contact"), to: "/contact" },
    { label: t("nav.dashboard"), to: "/dashboard" },
    { label: t("nav.problems"), to: "/problems" },
    { label: t("nav.availability"), to: "/availability/settings" },
    { label: t("nav.schedule"), to: "/schedule" },
    { label: t("nav.invitations"), to: "/invitations" },
    { label: t("nav.aiInterview"), to: "/ai-interview" },
    { label: t("nav.subscription"), to: "/subscription" },
  ];

  const sections = isSignedIn
    ? [
        {
          title: t("footer.workspace"),
          links: appLinks,
        },
        {
          title: t("footer.company"),
          links: [
            { label: t("marketing.about"), to: "/about" },
            { label: t("marketing.blog"), to: "/blog" },
            { label: t("marketing.contact"), to: "/contact" },
          ],
        },
      ]
    : [
        {
          title: t("footer.explore"),
          links: publicLinks,
        },
        {
          title: t("footer.company"),
          links: [
            { label: t("marketing.about"), to: "/about" },
            { label: t("marketing.blog"), to: "/blog" },
            { label: t("marketing.contact"), to: "/contact" },
          ],
        },
      ];

  return (
    <footer className="border-t border-base-300/80 bg-base-200">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand Section */}
          <div className="rounded-3xl border border-base-300/50 bg-base-100/40 p-6 text-center backdrop-blur-sm lg:text-left">
            <BrandLogo className="mx-auto lg:mx-0" />

            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-base-content/70 lg:mx-0 md:text-base">
              {t("footer.description")}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap justify-center lg:justify-start">
              <a
                href="mailto:hello@provelt.app"
                className="btn btn-primary btn-sm gap-2 rounded-full"
              >
                <MailIcon className="size-4" />
                hello@provelt.app
              </a>

              <Link
                to="/pricing"
                className="btn btn-outline btn-sm gap-2 rounded-full"
              >
                {t("marketing.pricing")}
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>

          {/* Navigation Sections */}
          {sections.map((section) => (
            <div
              key={section.title}
              className="space-y-4 text-center md:text-left"
            >
              <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-base-content/50">
                {section.title}
              </h3>

              <div className="grid grid-cols-2 gap-3 md:flex md:flex-col">
                {section.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-base-content/75 transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center gap-5 border-t border-base-300/70 pt-6 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-sm text-base-content/60">
            {t("footer.rights").replace(
              "{year}",
              String(new Date().getFullYear()),
            )}
          </p>

          <div className="flex items-center justify-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="flex size-11 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md"
            >
              <GlobeIcon className="size-4" />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="flex size-11 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md"
            >
              <LinkIcon className="size-4" />
            </a>

            <a
              href="mailto:hello@provelt.app"
              aria-label="Email"
              className="flex size-11 items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md"
            >
              <MailIcon className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
