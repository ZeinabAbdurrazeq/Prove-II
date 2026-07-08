import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, PauseIcon, PhoneOffIcon } from "lucide-react";
import useMicrophoneVolume from "../../hooks/useMicrophoneVolume";
import { useState } from "react";

function InterviewControls({
  isListening,
  onEndInterview,
  disabled,
  t = (key) => key,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Get real-time volume (0 to 1) only when listening and not manually muted
  const volume = useMicrophoneVolume(isListening && !isMuted);

  // Calculate inner green fill scale based on volume
  const scale = 1 + volume * 0.5; // Max 1.5x size

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-6 rounded-full border border-base-300/30 bg-[#121216]/90 px-8 py-4 shadow-2xl backdrop-blur-xl">
      {/* Mute Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="flex flex-col items-center gap-2 text-base-content/70 hover:text-white transition-colors"
        disabled={disabled}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-base-300/30 hover:bg-base-300/50">
          {isMuted ? <MicOffIcon className="size-5 text-red-500" /> : <MicIcon className="size-5" />}
        </div>
        <span className="text-[10px] font-medium tracking-wide">Mute</span>
      </button>

      {/* Stop Video Button */}
      <button
        onClick={() => setIsVideoOff(!isVideoOff)}
        className="flex flex-col items-center gap-2 text-base-content/70 hover:text-white transition-colors"
        disabled={disabled}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-base-300/30 hover:bg-base-300/50">
          {isVideoOff ? <VideoOffIcon className="size-5 text-red-500" /> : <VideoIcon className="size-5" />}
        </div>
        <span className="text-[10px] font-medium tracking-wide">Stop Video</span>
      </button>

      {/* Center Animated Microphone */}
      <div className="relative mx-4 flex flex-col items-center">
        <button
          className="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-b from-[#2a2a35] to-[#1a1a24] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-transform hover:scale-105"
          disabled={disabled}
        >
          {/* Animated green glow behind */}
          {isListening && !isMuted && (
            <div
              className="absolute inset-0 rounded-full bg-green-500/30 opacity-70 blur-xl transition-transform duration-75"
              style={{ transform: `scale(${scale})` }}
            />
          )}
          {/* Animated green fill circle */}
          {isListening && !isMuted && (
            <div
              className="absolute inset-1 rounded-full bg-green-500/20 transition-transform duration-75"
              style={{ transform: `scale(${scale * 0.9})` }}
            />
          )}
          {/* Outer stroke glowing ring */}
          {isListening && !isMuted && (
            <div className="absolute inset-0 rounded-full border-2 border-green-500/50"></div>
          )}
          
          <MicIcon className={`relative z-10 size-6 ${isListening && !isMuted ? "text-green-400" : "text-white"}`} />
        </button>
        {isListening && !isMuted && (
          <span className="absolute -bottom-6 text-[10px] font-bold text-green-400 tracking-wider">Listening...</span>
        )}
      </div>

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
