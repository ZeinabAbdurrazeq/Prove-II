import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

const testimonials = [
  {
    name: "Mohamed Saad",
    role: "home.testimonialMohamedRole",
    quote: "home.testimonialMohamedQuote",
    image: "/mohamed-saad.jpeg",
  },
  {
    name: "Nour",
    role: "home.testimonialNourRole",
    quote: "home.testimonialNourQuote",
    image: "/nour.jpg",
  },
];

function TestimonialsSection() {
  const { language } = useLanguage();
  const t = getTranslator(language);

  return (
    <section className="bg-base-200 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            {t("home.testimonialsEyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            {t("home.testimonialsTitle")}
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {testimonials.map((person) => (
            <article key={person.name} className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
              <div className="grid gap-0 sm:grid-cols-[220px_1fr]">
                <img
                  src={person.image}
                  alt={person.name}
                  className="h-64 w-full object-cover object-top sm:h-full"
                />
                <div className="p-6">
                  <p className="text-lg font-black">{person.name}</p>
                  <p className="mt-1 text-sm text-base-content/55">{t(person.role)}</p>
                  <p className="mt-5 leading-7 text-base-content/70">{t(person.quote)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
