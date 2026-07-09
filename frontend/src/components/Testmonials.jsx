import { FaQuoteRight } from "react-icons/fa6";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

function TestimonialCard({ testimonial, isRtl }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-base-300 bg-base-200/70 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <span
        className="pointer-events-none absolute -top-1 end-2 select-none text-primary/10 rtl:end-auto rtl:left-2"
        aria-hidden="true"
      >
        <FaQuoteRight size={70} />
      </span>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-col gap-5">
        <div
          className={`flex items-center gap-4 ${
            isRtl ? "w-full flex-row-reverse justify-end text-right" : ""
          }`}
        >
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="size-14 rounded-full border-2 border-base-300 object-cover"
          />

          <div>
            <h3 className="text-lg font-semibold text-base-content">
              {testimonial.name}
            </h3>
            <p className="text-sm text-primary">{testimonial.role}</p>
          </div>
        </div>

        <p className="leading-7 text-base-content/70 italic">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </div>
    </article>
  );
}

function TestimonialsSection() {
  const { language } = useLanguage();
  const t = getTranslator(language);
  const isRtl = language === "ar";

  const testimonials = [
    {
      name: t("home.testimonials.nour.name"),
      role: t("home.testimonials.nour.role"),
      avatar: "/nour-new.jpg",
      quote: t("home.testimonials.nour.quote"),
    },
    {
      name: t("home.testimonials.mohamed.name"),
      role: t("home.testimonials.mohamed.role"),
      avatar: "/mohamed saad.jpeg",
      quote: t("home.testimonials.mohamed.quote"),
    },
  ];

  return (
    <section className="bg-base-100 px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            {t("home.testimonials.badge")}
          </span>

          <h2 className="mt-4 text-4xl font-bold text-base-content">
            {t("home.testimonials.title")}{" "}
            <span className="text-primary">{t("home.testimonials.span")}</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base-content/70">
            {t("home.testimonials.subtitle")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              isRtl={isRtl}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
