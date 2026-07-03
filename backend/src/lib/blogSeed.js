import BlogPost from "../models/BlogPost.js";

const seedPosts = [
  {
    title: { en: "How to Prepare for a Technical Interview", ar: "كيف تستعد للمقابلة التقنية" },
    slug: "how-to-prepare-for-a-technical-interview",
    excerpt: {
      en: "Build a repeatable practice routine that balances algorithms, communication, system thinking, and review.",
      ar: "ابن روتين تدريب متكرر يوازن بين الخوارزميات والتواصل والتفكير المنهجي والمراجعة.",
    },
    category: { en: "Preparation", ar: "الاستعداد" },
    readTime: { en: "6 min read", ar: "قراءة 6 دقائق" },
    author: { en: "ProveIt Team", ar: "فريق ProveIt" },
    published: true,
    publishedAt: new Date("2026-07-01T00:00:00.000Z"),
    content: [
      {
        heading: { en: "Start with a repeatable routine", ar: "ابدأ بروتين قابل للتكرار" },
        body: {
          en: "Strong interview preparation is less about cramming and more about building a loop you can repeat. Pick a small set of problems, solve them under light time pressure, and review where your reasoning slowed down.",
          ar: "الاستعداد القوي للمقابلة لا يعتمد على الحفظ السريع بقدر ما يعتمد على بناء دورة تدريب يمكنك تكرارها. اختر مجموعة صغيرة من المسائل، حلها بضغط وقت بسيط، ثم راجع أين تباطأ تفكيرك.",
        },
      },
      {
        heading: { en: "Practice communication early", ar: "تدرّب على الشرح مبكرًا" },
        body: {
          en: "Do not wait until the final week to speak through your work. Explain constraints, trade-offs, and edge cases as you code so the habit feels natural during a real interview.",
          ar: "لا تنتظر الأسبوع الأخير حتى تبدأ بشرح عملك بصوت واضح. اشرح القيود والمفاضلات والحالات الطرفية أثناء كتابة الكود حتى تصبح عادة طبيعية في المقابلة.",
        },
      },
    ],
  },
  {
    title: { en: "Why Live Coding Practice Matters", ar: "لماذا يهم التدريب على البرمجة المباشرة" },
    slug: "why-live-coding-practice-matters",
    excerpt: {
      en: "Real interviews are interactive. Practicing with another person helps you explain choices under realistic pressure.",
      ar: "المقابلات الحقيقية تفاعلية. التدريب مع شخص آخر يساعدك على شرح قراراتك تحت ضغط واقعي.",
    },
    category: { en: "Live Practice", ar: "تدريب مباشر" },
    readTime: { en: "5 min read", ar: "قراءة 5 دقائق" },
    author: { en: "ProveIt Team", ar: "فريق ProveIt" },
    published: true,
    publishedAt: new Date("2026-06-24T00:00:00.000Z"),
    content: [
      {
        heading: { en: "Live practice reveals hidden habits", ar: "التدريب المباشر يكشف العادات الخفية" },
        body: {
          en: "Silent problem solving can hide uncertainty. Live coding makes your assumptions, naming choices, debugging style, and collaboration habits visible enough to improve.",
          ar: "حل المسائل بصمت قد يخفي التردد. البرمجة المباشرة تجعل افتراضاتك وأسلوب التسمية والتصحيح والتعاون واضحة بما يكفي لتحسينها.",
        },
      },
      {
        heading: { en: "Pressure becomes familiar", ar: "يصبح الضغط مألوفًا" },
        body: {
          en: "Repeated live sessions make the interview environment less surprising. You learn how to recover from mistakes, ask useful questions, and keep moving.",
          ar: "الجلسات المباشرة المتكررة تجعل بيئة المقابلة أقل غرابة. تتعلم كيف تتعافى من الأخطاء، وتسأل أسئلة مفيدة، وتواصل التقدم.",
        },
      },
    ],
  },
  {
    title: { en: "How AI Interviewers Improve Readiness", ar: "كيف تحسن مقابلات الذكاء الاصطناعي جاهزيتك" },
    slug: "how-ai-interviewers-improve-readiness",
    excerpt: {
      en: "A structured AI recruiter can help candidates rehearse background, behavioral, and technical answers consistently.",
      ar: "يمكن لمحاور ذكي ومنظم أن يساعد المرشحين على تدريب إجاباتهم التقنية والسلوكية بشكل ثابت.",
    },
    category: { en: "AI Interview", ar: "مقابلة ذكية" },
    readTime: { en: "7 min read", ar: "قراءة 7 دقائق" },
    author: { en: "ProveIt Team", ar: "فريق ProveIt" },
    published: true,
    publishedAt: new Date("2026-06-18T00:00:00.000Z"),
    content: [
      {
        heading: { en: "Consistency makes practice measurable", ar: "الثبات يجعل التدريب قابلًا للقياس" },
        body: {
          en: "An AI interviewer can ask structured questions, keep the session moving, and help you compare answers across repeated attempts.",
          ar: "يمكن للمحاور الذكي طرح أسئلة منظمة، والحفاظ على إيقاع الجلسة، ومساعدتك على مقارنة إجاباتك عبر محاولات متكررة.",
        },
      },
    ],
  },
];

export async function ensureBlogSeed() {
  const count = await BlogPost.estimatedDocumentCount();
  if (count > 0) return;

  await BlogPost.insertMany(seedPosts, { ordered: false });
}
