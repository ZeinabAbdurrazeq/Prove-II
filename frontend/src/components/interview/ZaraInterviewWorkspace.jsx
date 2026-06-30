import {
  BotIcon,
  BriefcaseIcon,
  FileTextIcon,
  Loader2Icon,
  MicIcon,
  SparklesIcon,
} from "lucide-react";
import InterviewControls from "./InterviewControls";
import InterviewProgress from "./InterviewProgress";
import MicIndicator from "./MicIndicator";
import QuestionTimer from "./QuestionTimer";
import StatusBadge from "./StatusBadge";
import TranscriptArea from "./TranscriptArea";

function ZaraInterviewWorkspace({
  currentQuestion,
  disabled,
  interviewerName,
  isFollowUp,
  isListening,
  isSpeaking,
  isSupported,
  isTypingMode,
  onDoneSpeaking,
  onSkip,
  onTick,
  onToggleTypingMode,
  onTypedChange,
  questionIndex,
  resetKey,
  stageLabel,
  status,
  t,
  totalQuestions,
  transcript,
  transitionMessage,
}) {
  return (
    <div className="min-h-screen bg-base-300 pb-56">
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-content">
              <BotIcon className="size-7" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-base-content/50">
                {t("aiInterview.interviewer")}
              </p>
              <h1 className="text-2xl font-black">{interviewerName}</h1>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-base-200 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <BriefcaseIcon className="size-4 text-primary" />
                {stageLabel}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-base-content/70">
                {transitionMessage}
              </p>
            </div>

            <div className="rounded-lg bg-base-200 p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {t("aiInterview.progress")}
                </span>
                <span className="text-base-content/60">
                  {Math.min(questionIndex + 1, totalQuestions || questionIndex + 1)}
                  {totalQuestions ? ` / ${totalQuestions}` : ""}
                </span>
              </div>
              <InterviewProgress current={questionIndex + 1} total={totalQuestions} />
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={status} t={t} />
              <div className="badge badge-outline badge-lg gap-2">
                <FileTextIcon className="size-4" />
                {isFollowUp ? t("aiInterview.followUp") : t("aiInterview.oneQuestion")}
              </div>
            </div>
          </div>
        </aside>

        <section className="min-h-[520px] rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="badge badge-primary badge-outline gap-2">
              <SparklesIcon className="size-4" />
              {stageLabel}
            </div>
            <QuestionTimer
              resetKey={resetKey}
              running={!disabled}
              onTick={onTick}
            />
          </div>

          <div className="mt-10 max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-base-content/50">
              {t("aiInterview.currentQuestion")}
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight text-base-content md:text-4xl">
              {currentQuestion}
            </h2>
          </div>

          {!isTypingMode && (
            <div className="mt-12 flex justify-center">
              <MicIndicator isListening={isListening} isSpeaking={isSpeaking} />
            </div>
          )}

          {disabled && (
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-base-content/60">
              <Loader2Icon className="size-4 animate-spin" />
              {t("aiInterview.feedbackGenerating")}
            </div>
          )}
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-base-300 bg-base-100/95 px-4 py-4 shadow-2xl backdrop-blur">
        <div className="mx-auto max-w-7xl">
          <TranscriptArea
            transcript={transcript}
            isTypingMode={isTypingMode}
            onTypedChange={onTypedChange}
            disabled={disabled}
            t={t}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <MicIcon className="size-4" />
              {isSupported
                ? t("aiInterview.voiceReady")
                : t("aiInterview.typedFallback")}
            </div>
            <InterviewControls
              isTypingMode={isTypingMode}
              onToggleTypingMode={onToggleTypingMode}
              onDoneSpeaking={onDoneSpeaking}
              onSkip={onSkip}
              canSubmit={!!transcript.trim()}
              disabled={disabled || isSpeaking}
              t={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ZaraInterviewWorkspace;
