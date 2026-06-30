import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Loader2Icon } from "lucide-react";
import Navbar from "../components/Navbar";
import BrowserUnsupportedNotice from "../components/interview/BrowserUnsupportedNotice";
import ZaraInterviewWorkspace from "../components/interview/ZaraInterviewWorkspace";
import useSpeechRecognition from "../hooks/useSpeechRecognition";
import useSpeechSynthesis from "../hooks/useSpeechSynthesis";
import { useSubmitAnswer } from "../hooks/useAiInterview";
import { aiInterviewApi } from "../api/aiInterview";
import { useLanguage } from "../context/LanguageContext";
import { getTranslator } from "../lib/translations";

const STAGE_LABELS = {
  intro: "Interview setup",
  cv_review: "CV review",
  jd_review: "Role alignment",
  behavioral: "Behavioral screen",
  technical: "Technical depth",
  coding_challenge: "Problem solving",
  evaluation: "Answer evaluation",
  final_feedback: "Final feedback",
};

function getStageLabel(stage) {
  return STAGE_LABELS[stage] || "Interview";
}

// The interview is driven by a small state machine:
//   speaking  -> AI reads the question, mic is off
//   listening -> mic is on, transcript fills in live
//   processing-> answer is being evaluated by GPT
function InterviewPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { state } = useLocation();
  const { language: appLanguage } = useLanguage();

  const submitMutation = useSubmitAnswer();
  const [interviewLanguage, setInterviewLanguage] = useState(
    state?.language || appLanguage || "en",
  );
  const t = getTranslator(interviewLanguage || appLanguage);
  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis({
    language: interviewLanguage,
  });

  // Interview state.
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(
    state?.totalQuestions || 0,
  );
  const [currentQuestion, setCurrentQuestion] = useState(
    state?.firstQuestion || "",
  );
  const [status, setStatus] = useState("speaking");
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [loading, setLoading] = useState(!state?.firstQuestion);
  const [stage, setStage] = useState(state?.stage || "intro");
  const [stageLabel, setStageLabel] = useState(
    state?.stageLabel || getStageLabel(state?.stage || "intro"),
  );
  const [transitionMessage, setTransitionMessage] = useState(
    state?.transitionMessage || t("aiInterview.defaultTransition"),
  );
  const interviewerName = state?.interviewerName || "Zara";

  // Keep the latest elapsed seconds for the current question.
  const timeSpentRef = useRef(0);
  // Guards the initial question fetch so it runs once.
  const bootstrappedRef = useRef(false);
  // Prevents the same question from being submitted twice when the voice
  // auto-submit (onSilence) and the "Done" button race each other.
  const submittingRef = useRef(false);

  const finishInterview = useCallback(() => {
    cancelSpeech();
    navigate(`/ai-interview/results/${sessionId}`);
  }, [cancelSpeech, navigate, sessionId]);

  // Submit the current answer text. Shared by voice auto-submit, the
  // "Done" button, and typing mode.
  const submitAnswer = useCallback(
    (answerText, { skipped = false } = {}) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      setStatus("processing");

      submitMutation.mutate(
        {
          sessionId,
          questionIndex,
          answer: answerText || "",
          timeSpent: timeSpentRef.current,
          isFollowUp,
          skipped,
        },
        {
          onSuccess: (data) => {
            submittingRef.current = false;
            timeSpentRef.current = 0;
            resetTranscript();
            setTranscript("");

            if (data.askFollowUp && data.followUpQuestion) {
              setIsFollowUp(true);
              setCurrentQuestion(data.followUpQuestion);
              setStage(data.stage || stage);
              setStageLabel(data.stageLabel || stageLabel);
              setTransitionMessage(data.transitionMessage || transitionMessage);
              setStatus("speaking");
              return;
            }

            if (data.isComplete) {
              finishInterview();
              return;
            }

            setIsFollowUp(false);
            setQuestionIndex(data.questionIndex);
            setCurrentQuestion(data.nextQuestion);
            setStage(data.stage || stage);
            setStageLabel(data.stageLabel || stageLabel);
            setTransitionMessage(data.transitionMessage || transitionMessage);
            setStatus("speaking");
          },
          onError: () => {
            submittingRef.current = false;
            setStatus("listening");
          },
        },
      );
    },
    [
      finishInterview,
      isFollowUp,
      questionIndex,
      resetTranscript,
      sessionId,
      stage,
      stageLabel,
      setTranscript,
      submitMutation,
      transitionMessage,
    ],
  );

  // Voice recognition: auto-submit after the silence window.
  const {
    isSupported,
    isListening,
    transcript,
    setTranscript,
    start: startListening,
    stop: stopListening,
    reset: resetTranscript,
  } = useSpeechRecognition({
    silenceTimeout: 2500,
    language: interviewLanguage,
    onSilence: (finalText) => {
      if (finalText && finalText.trim()) submitAnswer(finalText);
    },
  });

  // If we didn't arrive with the first question in router state, fetch the
  // session once (read-only) so a page refresh still works.
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    if (currentQuestion) return;

    aiInterviewApi
      .getSession(sessionId)
      .then((data) => {
        const session = data?.session;
        if (!session) return;

        setInterviewLanguage(session.language || appLanguage || "en");

        if (session.status === "completed") {
          navigate(`/ai-interview/results/${sessionId}`, { replace: true });
          return;
        }

        const questions = session.questions || [];
        setTotalQuestions(questions.length);
        const resumeIndex = questions.findIndex((q) => !q.userAnswer);
        const index = resumeIndex === -1 ? 0 : resumeIndex;
        const current = questions[index];
        const resumedStage = current?.stage || session.currentStage || "intro";
        setQuestionIndex(index);
        setCurrentQuestion(current?.questionText || "");
        setStage(resumedStage);
        setStageLabel(getStageLabel(resumedStage));
        setTransitionMessage(
          session.currentStage
            ? t("aiInterview.resumeTransition")
            : t("aiInterview.defaultTransition"),
        );
        setStatus("speaking");
      })
      .catch(() => {
        /* handled below by the empty-question guard */
      })
      .finally(() => setLoading(false));
  }, [appLanguage, currentQuestion, navigate, sessionId, t]);

  // Speak each new question, then start listening (voice mode only).
  useEffect(() => {
    if (!currentQuestion || status !== "speaking") return;

    if (isTypingMode || !isSupported) {
      setStatus("listening");
      return;
    }

    resetTranscript();
    speak(currentQuestion, () => {
      setStatus("listening");
      startListening();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, status, isTypingMode, isSupported, speak, startListening]);

  const handleDoneSpeaking = () => {
    stopListening();
    submitAnswer(transcript);
  };

  const handleSkip = () => {
    stopListening();
    cancelSpeech();
    resetTranscript();
    setTranscript("");
    timeSpentRef.current = 0;
    submitAnswer("", { skipped: true });
  };

  const handleToggleTypingMode = () => {
    cancelSpeech();
    stopListening();
    setIsTypingMode((prev) => !prev);
    resetTranscript();
    setStatus("listening");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2Icon className="size-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!isSupported && !isTypingMode) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="mx-auto max-w-7xl px-6 py-12 space-y-6">
          <BrowserUnsupportedNotice t={t} />
          <div className="text-center">
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsTypingMode(true);
                setStatus("listening");
              }}
            >
              {t("aiInterview.continueByTyping")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const uiStatus = isSpeaking ? "speaking" : status;

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />
      <ZaraInterviewWorkspace
        currentQuestion={currentQuestion}
        disabled={status === "processing"}
        interviewerName={interviewerName}
        isFollowUp={isFollowUp}
        isListening={isListening}
        isSpeaking={isSpeaking}
        isSupported={isSupported}
        isTypingMode={isTypingMode}
        onDoneSpeaking={handleDoneSpeaking}
        onSkip={handleSkip}
        onTick={(seconds) => {
          timeSpentRef.current = seconds;
        }}
        onToggleTypingMode={handleToggleTypingMode}
        onTypedChange={setTranscript}
        questionIndex={questionIndex}
        resetKey={`${questionIndex}-${isFollowUp}`}
        stageLabel={stageLabel}
        status={uiStatus}
        t={t}
        totalQuestions={totalQuestions}
        transcript={transcript}
        transitionMessage={transitionMessage}
      />
    </div>
  );
}

export default InterviewPage;
