import { useState } from "react";
import toast from "react-hot-toast";
import {
  Building2Icon,
  HelpCircleIcon,
  MailIcon,
  MessageSquareIcon,
  SendIcon,
} from "lucide-react";
import MarketingNav from "../components/MarketingNav";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

const CONTACT_EMAIL = "hello@provelt.app";

const contactCards = [
  {
    title: "General inquiries",
    body: "Questions about ProveIt, pricing, or how the platform fits your preparation plan.",
    icon: MailIcon,
    action: "hello@provelt.app",
  },
  {
    title: "Technical support",
    body: "Help with sessions, browser permissions, AI interview flow, or account access.",
    icon: HelpCircleIcon,
    action: "support@provelt.app",
  },
  {
    title: "Partnership / companies",
    body: "For teams, training programs, hiring workflows, or collaboration opportunities.",
    icon: Building2Icon,
    action: "partners@provelt.app",
  },
];

function ContactPage() {
  const { language } = useLanguage();
  const t = getTranslator(language);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(t("contact.validation"));
      return;
    }

    const subject = encodeURIComponent(`ProveIt contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name} <${email}>`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-base-300">
      <MarketingNav />

      <main>
        <section className="bg-base-100">
          <div className="mx-auto max-w-7xl px-6 py-20 text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-sm">
              <MessageSquareIcon className="size-8" />
            </div>
            <h1 className="text-4xl font-black md:text-6xl">Contact ProveIt</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-base-content/70">
              Have a question, support request, or partnership idea? Send a
              clear note and we will route it to the right place.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-5 md:grid-cols-3">
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="card border border-base-300 bg-base-100 shadow-sm"
                >
                  <div className="card-body">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-black">{card.title}</h2>
                    <p className="text-sm leading-relaxed text-base-content/70">
                      {card.body}
                    </p>
                    <a
                      href={`mailto:${card.action}`}
                      className="mt-2 text-sm font-semibold text-primary"
                    >
                      {card.action}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
            <h2 className="text-2xl font-black">Helpful details</h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-base-content/70">
              <p>
                For the fastest response, include your browser, route/page,
                account email, and any screenshot or exact error text.
              </p>
              <p>
                The contact form opens your email client. No backend contact
                service is connected yet, so no new API logic is required.
              </p>
              <p>
                For voice interview issues, mention whether your browser
                supports microphone permissions and SpeechRecognition.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="card border border-base-300 bg-base-100 shadow-sm"
          >
            <div className="card-body space-y-4">
              <div>
                <h2 className="text-2xl font-black">Send a message</h2>
                <p className="mt-2 text-sm text-base-content/60">
                  Keep it short and specific. We will use your email app to send
                  the message.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="form-control">
                  <span className="label-text mb-2 font-semibold">
                    {t("contact.nameLabel")}
                  </span>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <label className="form-control">
                  <span className="label-text mb-2 font-semibold">
                    {t("contact.emailLabel")}
                  </span>
                  <input
                    type="email"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              </div>

              <label className="form-control">
                <span className="label-text mb-2 font-semibold">
                  {t("contact.messageLabel")}
                </span>
                <textarea
                  className="textarea textarea-bordered min-h-36 w-full"
                  placeholder={t("contact.messagePlaceholder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>

              <button type="submit" className="btn btn-primary w-fit gap-2">
                <SendIcon className="size-4" />
                {t("contact.send")}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default ContactPage;
