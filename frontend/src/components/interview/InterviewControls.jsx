import { PauseIcon, PhoneOffIcon, SkipForwardIcon, KeyboardIcon, MicIcon } from "lucide-react";
import { useState } from "react";

function InterviewControls({
  isListening,
  onEndInterview,
  onSkip,
  onToggleTypingMode,
  isTypingMode,
  disabled,
  t = (key) => key,
}) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-6 rounded-full border border-base-300/30 bg-[#121216]/90 px-8 py-4 shadow-2xl backdrop-blur-xl">
      {/* Type Instead / Speak Instead Button */}
      <button
        onClick={onToggleTypingMode}
        className="flex flex-col items-center gap-2 text-base-content/70 hover:text-white transition-colors"
        disabled={disabled}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-base-300/30 hover:bg-base-300/50">
          {isTypingMode ? <MicIcon className="size-5" /> : <KeyboardIcon className="size-5" />}
        </div>
        <span className="text-[10px] font-medium tracking-wide">
          {isTypingMode ? "Speak Instead" : "Type Instead"}
        </span>
      </button>

      {/* Skip Button */}
      <button
        onClick={onSkip}
        className="flex flex-col items-center gap-2 text-base-content/70 hover:text-white transition-colors"
        disabled={disabled}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-base-300/30 hover:bg-base-300/50">
          <SkipForwardIcon className="size-5" />
        </div>
        <span className="text-[10px] font-medium tracking-wide">Skip</span>
      </button>

      {/* Pause Button */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="flex flex-col items-center gap-2 text-base-content/70 hover:text-white transition-colors"
        disabled={disabled}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-base-300/30 hover:bg-base-300/50">
          <PauseIcon className="size-5" />
        </div>
        <span className="text-[10px] font-medium tracking-wide">Pause</span>
      </button>

      {/* End Interview Button */}
      <button
        onClick={onEndInterview}
        className="flex flex-col items-center gap-2 text-base-content/70 hover:text-white transition-colors"
        disabled={disabled}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/40">
          <PhoneOffIcon className="size-4 text-red-500" />
        </div>
        <span className="text-[10px] font-medium tracking-wide">End Interview</span>
      </button>
    </div>
  );
}

export default InterviewControls;
