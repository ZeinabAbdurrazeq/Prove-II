import React, { useEffect, useRef, useState } from "react";
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from "lucide-react";

export default function CandidateCamera({ triggerWarning }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const faceDetectorRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const suspiciousCountRef = useRef(0);

  // Initialize camera
  useEffect(() => {
    let activeStream = null;

    async function setupCamera() {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }

        // Initialize FaceDetector if supported
        if (window.FaceDetector) {
          try {
            faceDetectorRef.current = new window.FaceDetector({
              fastMode: true,
              maxDetectedFaces: 5,
            });
            startFaceDetection();
          } catch (e) {
            console.warn("FaceDetector initialization failed:", e);
          }
        }
      } catch (err) {
        console.error("Camera access denied or failed:", err);
      }
    }

    setupCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  const startFaceDetection = () => {
    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !faceDetectorRef.current || isVideoMuted) return;

      try {
        const faces = await faceDetectorRef.current.detect(videoRef.current);
        
        // If 0 faces or more than 1 face, count as suspicious
        if (faces.length !== 1) {
          suspiciousCountRef.current += 1;
          
          // Trigger a warning if this happens multiple times in a row (e.g. 5 times = 5 seconds)
          if (suspiciousCountRef.current >= 5) {
            triggerWarning(
              faces.length === 0
                ? "No face detected in the camera."
                : "Multiple faces detected in the camera."
            );
            suspiciousCountRef.current = 0; // Reset after warning
          }
        } else {
          // Reset count if everything is fine
          suspiciousCountRef.current = 0;
        }
      } catch (e) {
        // Face detection error, ignore safely
      }
    }, 1000);
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoMuted((prev) => !prev);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted((prev) => !prev);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 overflow-hidden rounded-2xl border border-base-300/50 bg-base-100/30 p-1 shadow-2xl backdrop-blur-md transition-all hover:bg-base-100/50">
      <div className="relative h-32 w-48 overflow-hidden rounded-xl bg-black sm:h-40 sm:w-56">
        {isVideoMuted ? (
          <div className="flex h-full items-center justify-center bg-base-300 text-base-content/50">
            <VideoOffIcon className="size-8" />
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // We always mute the video element locally so we don't hear ourselves
            className="h-full w-full object-cover mirror-mode"
            style={{ transform: "scaleX(-1)" }} // Mirror effect
          />
        )}

        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-3">
          <button
            onClick={toggleAudio}
            className={`flex size-8 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
              isAudioMuted
                ? "bg-red-500/80 text-white"
                : "bg-black/40 text-white hover:bg-black/60"
            }`}
          >
            {isAudioMuted ? (
              <MicOffIcon className="size-4" />
            ) : (
              <MicIcon className="size-4" />
            )}
          </button>
          <button
            onClick={toggleVideo}
            className={`flex size-8 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
              isVideoMuted
                ? "bg-red-500/80 text-white"
                : "bg-black/40 text-white hover:bg-black/60"
            }`}
          >
            {isVideoMuted ? (
              <VideoOffIcon className="size-4" />
            ) : (
              <VideoIcon className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
