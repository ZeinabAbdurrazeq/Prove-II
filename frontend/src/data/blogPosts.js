export const blogPosts = [
  {
    title: "How to Prepare for a Technical Interview",
    slug: "how-to-prepare-for-a-technical-interview",
    excerpt:
      "Build a repeatable practice routine that balances algorithms, communication, system thinking, and review.",
    category: "Preparation",
    date: "Jul 1, 2026",
    readTime: "6 min read",
    author: "ProveIt Team",
    content: [
      {
        heading: "Start with a repeatable routine",
        body:
          "Strong interview preparation is less about cramming and more about building a loop you can repeat. Pick a small set of problems, solve them under light time pressure, and review where your reasoning slowed down.",
      },
      {
        heading: "Practice communication early",
        body:
          "Do not wait until the final week to speak through your work. Explain constraints, trade-offs, and edge cases as you code so the habit feels natural during a real interview.",
      },
      {
        heading: "Review evidence, not vibes",
        body:
          "After each session, capture what happened: the missed edge case, the unclear assumption, the slow implementation detail, or the answer that needed a stronger example.",
      },
    ],
  },
  {
    title: "Why Live Coding Practice Matters",
    slug: "why-live-coding-practice-matters",
    excerpt:
      "Real interviews are interactive. Practicing with another person helps you explain choices under realistic pressure.",
    category: "Live Practice",
    date: "Jun 24, 2026",
    readTime: "5 min read",
    author: "ProveIt Team",
    content: [
      {
        heading: "Live practice reveals hidden habits",
        body:
          "Silent problem solving can hide uncertainty. Live coding makes your assumptions, naming choices, debugging style, and collaboration habits visible enough to improve.",
      },
      {
        heading: "The interviewer is part of the problem",
        body:
          "A good answer is not only correct. It is understandable. Practice checking in, clarifying constraints, and narrating decisions without turning the session into a monologue.",
      },
      {
        heading: "Pressure becomes familiar",
        body:
          "Repeated live sessions make the interview environment less surprising. You learn how to recover from mistakes, ask useful questions, and keep moving.",
      },
    ],
  },
  {
    title: "How AI Interviewers Improve Readiness",
    slug: "how-ai-interviewers-improve-readiness",
    excerpt:
      "A structured AI recruiter can help candidates rehearse background, behavioral, and technical answers consistently.",
    category: "AI Interview",
    date: "Jun 18, 2026",
    readTime: "7 min read",
    author: "ProveIt Team",
    content: [
      {
        heading: "Consistency makes practice measurable",
        body:
          "An AI interviewer can ask structured questions, keep the session moving, and help you compare answers across repeated attempts.",
      },
      {
        heading: "CV-aware questions feel closer to reality",
        body:
          "When the interview is grounded in your own experience, you practice explaining the projects, technologies, and trade-offs that are most likely to come up.",
      },
      {
        heading: "Feedback should become action",
        body:
          "The best AI feedback points to specific improvements: clearer examples, stronger technical depth, better trade-off language, or more concise answers.",
      },
    ],
  },
  {
    title: "Solo vs Pair Problem Solving",
    slug: "solo-vs-pair-problem-solving",
    excerpt:
      "Solo practice builds fluency, while pair sessions reveal how clearly you collaborate and communicate.",
    category: "Practice Modes",
    date: "Jun 10, 2026",
    readTime: "4 min read",
    author: "ProveIt Team",
    content: [
      {
        heading: "Solo practice builds speed",
        body:
          "Working alone is useful for repetition. You can focus on patterns, syntax, and implementation without the overhead of conversation.",
      },
      {
        heading: "Pair practice builds clarity",
        body:
          "Working with someone else exposes whether your reasoning is easy to follow. It also trains the feedback loop of proposing, listening, adjusting, and validating.",
      },
      {
        heading: "Use both modes deliberately",
        body:
          "A balanced routine might use solo sessions for fundamentals and pair sessions for interview realism. Each mode strengthens a different part of readiness.",
      },
    ],
  },
  {
    title: "What Makes a Strong Candidate Profile",
    slug: "what-makes-a-strong-candidate-profile",
    excerpt:
      "Strong profiles connect projects, ownership, trade-offs, and measurable outcomes into one clear story.",
    category: "Profile",
    date: "Jun 3, 2026",
    readTime: "5 min read",
    author: "ProveIt Team",
    content: [
      {
        heading: "Ownership is more memorable than task lists",
        body:
          "Interviewers want to know what you owned, why it mattered, and how you made decisions. Replace vague participation with concrete responsibility.",
      },
      {
        heading: "Trade-offs show engineering judgment",
        body:
          "A strong profile includes the constraints you faced and the options you considered. This turns a project summary into evidence of judgment.",
      },
      {
        heading: "Outcomes anchor the story",
        body:
          "Metrics, user impact, reliability improvements, delivery speed, or learning outcomes help the interviewer understand the value of your work.",
      },
    ],
  },
  {
    title: "Common Mistakes in Coding Interviews",
    slug: "common-mistakes-in-coding-interviews",
    excerpt:
      "Avoid silent problem solving, unclear assumptions, overengineering, and skipping edge-case discussion.",
    category: "Interview Tips",
    date: "May 28, 2026",
    readTime: "6 min read",
    author: "ProveIt Team",
    content: [
      {
        heading: "Solving silently",
        body:
          "A correct solution can still feel weak if the interviewer cannot follow your thinking. Share your plan before you code and explain pivots as they happen.",
      },
      {
        heading: "Skipping assumptions",
        body:
          "Clarifying input size, empty values, duplicates, ordering, and error cases often changes the solution. Ask early so your approach matches the real problem.",
      },
      {
        heading: "Overengineering the first version",
        body:
          "Start with the simplest correct approach you can explain. Improve it when the constraints demand it, not before you have established correctness.",
      },
    ],
  },
];

export function getBlogPost(slug) {
  return blogPosts.find((post) => post.slug === slug);
}
