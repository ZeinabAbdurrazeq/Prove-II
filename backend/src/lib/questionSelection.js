import InterviewQuestions from "../models/InterviewQuestions.js";

// Difficulty ordering used to progress an interview from easy -> hard.
const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 };

// Minimum / maximum number of questions to select for an interview.
const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 7;

/**
 * RAG retrieval: select personalized interview questions for a candidate.
 *
 * Logic:
 *  - filter InterviewQuestions whose fieldRelevance contains the candidate's
 *    primaryField
 *  - exclude any questions already asked to this candidate
 *    (profile.questionsAskedIds) so questions are never repeated
 *  - sort easy -> medium -> hard so the interview ramps up in difficulty
 *  - return between MIN_QUESTIONS and MAX_QUESTIONS questions
 *
 * @param {object} profile A CandidateProfile document.
 * @returns {Promise<Array>} The selected InterviewQuestions documents.
 */
export async function selectQuestionsForCandidate(profile) {
  const primaryField = profile?.primaryField || "fullstack";
  const askedIds = (profile?.questionsAskedIds || []).map((id) => id.toString());

  const sortByDifficulty = (list) =>
    list.sort(
      (a, b) =>
        (DIFFICULTY_ORDER[a.difficulty] ?? 99) -
        (DIFFICULTY_ORDER[b.difficulty] ?? 99),
    );

  // Primary RAG query: field-relevant questions not yet asked.
  let candidates = await InterviewQuestions.find({
    fieldRelevance: primaryField,
    _id: { $nin: askedIds },
  });
  sortByDifficulty(candidates);

  // Fallback: if we couldn't find enough field-relevant questions, drop the
  // fieldRelevance filter and pick from whatever is left (still excluding
  // already-asked questions, still easy -> medium -> hard).
  if (candidates.length < MIN_QUESTIONS) {
    const fallback = await InterviewQuestions.find({
      _id: { $nin: askedIds },
    });
    sortByDifficulty(fallback);
    if (fallback.length > candidates.length) {
      candidates = fallback;
    }
  }

  // The interview ramps up naturally because the list is difficulty-sorted.
  return candidates.slice(0, MAX_QUESTIONS);
}

export { MIN_QUESTIONS, MAX_QUESTIONS };
