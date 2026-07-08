import React, { useEffect, useRef, useState } from "react";
import {
  Loader2Icon,
  MicIcon,
  SparklesIcon,
  SendIcon,
} from "lucide-react";
import InterviewControls from "./InterviewControls";
import CandidateCamera from "./CandidateCamera";

export default function SarahInterviewWorkspace({
  currentQuestion,
  disabled,
  interviewerName, // We can ignore this and hardcode Sarah, or use it
  isFollowUp,
  isListening,
  isSpeaking,
  isSupported,
  isTypingMode,
  onDoneSpeaking,
  onSkip,
  onTick, // Can still use it invisibly or omit from premium UI
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
  warnings,
  maxWarnings,
  triggerWarning,
}) {
  const [history, setHistory] = useState([]);
  const chatEndRef = useRef(null);

  // Sync current question to history
  useEffect(() => {
    if (currentQuestion) {
      setHistory((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "sarah" && last.content === currentQuestion) {
          return prev;
        }
        return [
          ...prev,
          { id: Date.now().toString(), role: "sarah", content: currentQuestion, time: new Date() },
        ];
      });
    }
  }, [currentQuestion]);

  // When processing starts, candidate answer is submitted, we should capture it.
  // We can capture the last transcript before it clears.
  const prevTranscriptRef = useRef(transcript);
  const prevStatusRef = useRef(status);

  useEffect(() => {
    if (status === "processing" && prevStatusRef.current !== "processing") {
      if (prevTranscriptRef.current.trim()) {
        setHistory((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "candidate", content: prevTranscriptRef.current, time: new Date() },
        ]);
      }
    }
    prevTranscriptRef.current = transcript;
    prevStatusRef.current = status;
  }, [status, transcript]);

  // Scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, transcript, isSpeaking]);

  const progressText = totalQuestions ? `${questionIndex + 1} / ${totalQuestions}` : `${questionIndex + 1}`;

  return (
    <div className="relative flex h-screen max-h-screen w-full flex-col overflow-hidden bg-base-300 font-sans lg:flex-row">
      {/* CANDIDATE CAMERA FLOATING */}
      <CandidateCamera triggerWarning={triggerWarning} />

      {/* LEFT: SARAH AI AREA */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-8">
        <div className="absolute left-6 top-6 flex items-center gap-4">
          <div className="badge badge-primary badge-outline gap-2 px-4 py-3 shadow-sm backdrop-blur">
            <SparklesIcon className="size-4" />
            {stageLabel} ({progressText})
          </div>
          {warnings > 0 && (
            <div className="badge badge-warning gap-2 px-4 py-3 font-semibold shadow-sm backdrop-blur">
              Warnings: {warnings} / {maxWarnings}
            </div>
          )}
        </div>

        {/* AI AVATAR */}
        <div className="relative flex items-center justify-center">
          {isSpeaking && (
            <>
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75" style={{ animationDuration: '3s' }}></div>
              <div className="absolute inset-[-20%] animate-pulse rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 blur-2xl"></div>
              <div className="absolute inset-[-40%] animate-pulse rounded-full bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 blur-3xl" style={{ animationDelay: '500ms' }}></div>
            </>
          )}
          <div className={`relative z-10 flex size-40 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl transition-transform duration-500 ${isSpeaking ? 'scale-105' : 'scale-100'}`}>
            <span className="text-4xl font-black tracking-widest text-white shadow-black drop-shadow-md">
              Sarah
            </span>
          </div>
        </div>
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-base-content/50">
          {isSpeaking ? "Speaking..." : status === "processing" ? "Analyzing..." : "Listening..."}
        </p>
      </div>

      {/* RIGHT: CONVERSATION PANEL */}
      <div className="flex h-full w-full flex-col border-l border-base-300/50 bg-base-100/50 shadow-2xl backdrop-blur-xl lg:w-[450px] xl:w-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-300/50 p-6 backdrop-blur">
          <div>
            <h2 className="text-lg font-bold text-base-content">Interview Transcript</h2>
            <p className="text-xs text-base-content/60">Live synced</p>
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

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-center">
            <span className="rounded-full bg-base-200 px-3 py-1 text-xs font-medium text-base-content/60 shadow-sm">
              Interview Started
            </span>
          </div>

          {history.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === "candidate" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                msg.role === "candidate" 
                  ? "bg-primary text-primary-content rounded-tr-sm" 
                  : "bg-base-200 text-base-content rounded-tl-sm"
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className="mt-2 text-[10px] opacity-60">
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Current Live Candidate Transcript */}
          {transcript.trim() && status !== "processing" && (
             <div className="flex w-full justify-end">
              <div className="max-w-[85%] rounded-2xl bg-primary/80 p-4 text-primary-content rounded-tr-sm shadow-sm">
                <p className="text-sm leading-relaxed">{transcript}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex size-2 rounded-full bg-white"></span>
                  </span>
                  <p className="text-[10px] opacity-80">Live transcription...</p>
                </div>
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {status === "processing" && (
            <div className="flex w-full justify-start">
              <div className="flex max-w-[85%] items-center gap-3 rounded-2xl bg-base-200 p-4 rounded-tl-sm shadow-sm text-base-content/70">
                <Loader2Icon className="size-4 animate-spin" />
                <p className="text-sm">Sarah is evaluating your answer...</p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-base-300/50 bg-base-100/50 p-4 backdrop-blur">
          {isTypingMode ? (
            <div className="relative flex items-center">
              <textarea
                value={transcript}
                onChange={(e) => onTypedChange(e.target.value)}
                disabled={disabled || isSpeaking}
                placeholder="Type your answer here..."
                className="textarea textarea-bordered w-full resize-none rounded-xl bg-base-100 pr-12 focus:border-primary focus:ring-1 focus:ring-primary shadow-inner"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (transcript.trim() && !disabled && !isSpeaking) {
                      onDoneSpeaking();
                    }
                  }
                }}
              />
              <button
                disabled={!transcript.trim() || disabled || isSpeaking}
                onClick={onDoneSpeaking}
                className="absolute right-3 bottom-3 rounded-lg bg-primary p-2 text-primary-content transition-transform hover:scale-105 disabled:opacity-50"
              >
                <SendIcon className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="flex items-center gap-3 text-sm text-base-content/70">
                <div className={`flex size-10 items-center justify-center rounded-full transition-colors ${isListening ? 'bg-error/20 text-error animate-pulse' : 'bg-base-200'}`}>
                  <MicIcon className="size-5" />
                </div>
                {isListening ? "Listening continuously..." : isSpeaking ? "Sarah is speaking..." : "Microphone paused"}
              </div>
              <button
                disabled={!transcript.trim() || disabled || isSpeaking}
                onClick={onDoneSpeaking}
                className="btn btn-primary btn-sm rounded-lg shadow-sm"
              >
                Send Answer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
